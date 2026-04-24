package com.logicore.engine.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.logicore.engine.model.LocalDeliveryStop;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
public class OverpassRoadNetworkService {
    private static final String OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
    private static final double EARTH_RADIUS_KM = 6371.0;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    public double[][] buildRoadDistanceMatrix(List<LocalDeliveryStop> stops) {
        int n = stops.size();
        double[][] matrix = new double[n][n];
        if (n <= 1) return matrix;

        try {
            RoadGraph graph = fetchRoadGraph(stops);
            if (graph.nodes.isEmpty()) {
                return matrix;
            }

            List<Long> stopNodes = new ArrayList<>();
            for (LocalDeliveryStop stop : stops) {
                stopNodes.add(findNearestNode(stop.getLatitude(), stop.getLongitude(), graph.nodes));
            }

            for (int i = 0; i < n; i++) {
                Map<Long, Double> dijkstraDistances = dijkstra(stopNodes.get(i), graph.adjacency);
                for (int j = 0; j < n; j++) {
                    if (i == j) {
                        matrix[i][j] = 0.0;
                    } else {
                        double d = dijkstraDistances.getOrDefault(stopNodes.get(j), Double.POSITIVE_INFINITY);
                        matrix[i][j] = d;
                    }
                }
            }
        } catch (Exception ignored) {
            // Caller should fallback to haversine matrix when this matrix is unusable.
        }

        return matrix;
    }

    private RoadGraph fetchRoadGraph(List<LocalDeliveryStop> stops) throws IOException, InterruptedException {
        double minLat = Double.POSITIVE_INFINITY;
        double maxLat = Double.NEGATIVE_INFINITY;
        double minLon = Double.POSITIVE_INFINITY;
        double maxLon = Double.NEGATIVE_INFINITY;

        for (LocalDeliveryStop stop : stops) {
            minLat = Math.min(minLat, stop.getLatitude());
            maxLat = Math.max(maxLat, stop.getLatitude());
            minLon = Math.min(minLon, stop.getLongitude());
            maxLon = Math.max(maxLon, stop.getLongitude());
        }

        double pad = 0.04; // roughly 4-5 km padding
        String south = String.valueOf(minLat - pad);
        String west = String.valueOf(minLon - pad);
        String north = String.valueOf(maxLat + pad);
        String east = String.valueOf(maxLon + pad);

        String query = "[out:json][timeout:20];(" +
                "way[\"highway\"][\"access\"!=\"private\"](" + south + "," + west + "," + north + "," + east + ");" +
                ");(._;>;);out body;";

        String body = "data=" + URLEncoder.encode(query, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OVERPASS_ENDPOINT))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Overpass request failed with status " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode elements = root.get("elements");
        if (elements == null || !elements.isArray()) {
            throw new IOException("Invalid Overpass response");
        }

        Map<Long, LatLon> nodeMap = new HashMap<>();
        List<List<Long>> ways = new ArrayList<>();

        for (JsonNode element : elements) {
            String type = element.path("type").asText();
            if ("node".equals(type)) {
                long id = element.path("id").asLong();
                double lat = element.path("lat").asDouble();
                double lon = element.path("lon").asDouble();
                nodeMap.put(id, new LatLon(lat, lon));
            } else if ("way".equals(type)) {
                JsonNode nodes = element.get("nodes");
                if (nodes != null && nodes.isArray() && nodes.size() >= 2) {
                    List<Long> refs = new ArrayList<>();
                    for (JsonNode n : nodes) refs.add(n.asLong());
                    ways.add(refs);
                }
            }
        }

        Map<Long, Map<Long, Double>> adjacency = new HashMap<>();
        for (List<Long> way : ways) {
            for (int i = 0; i < way.size() - 1; i++) {
                long a = way.get(i);
                long b = way.get(i + 1);
                LatLon p1 = nodeMap.get(a);
                LatLon p2 = nodeMap.get(b);
                if (p1 == null || p2 == null) continue;
                double w = haversineKm(p1.lat, p1.lon, p2.lat, p2.lon);
                adjacency.computeIfAbsent(a, k -> new HashMap<>()).put(b, w);
                adjacency.computeIfAbsent(b, k -> new HashMap<>()).put(a, w);
            }
        }

        return new RoadGraph(nodeMap, adjacency);
    }

    private long findNearestNode(double lat, double lon, Map<Long, LatLon> nodes) {
        long bestId = -1L;
        double best = Double.POSITIVE_INFINITY;
        for (Map.Entry<Long, LatLon> entry : nodes.entrySet()) {
            double d = haversineKm(lat, lon, entry.getValue().lat, entry.getValue().lon);
            if (d < best) {
                best = d;
                bestId = entry.getKey();
            }
        }
        return bestId;
    }

    private Map<Long, Double> dijkstra(long source, Map<Long, Map<Long, Double>> graph) {
        Map<Long, Double> dist = new HashMap<>();
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingDouble(nd -> nd.distance));
        dist.put(source, 0.0);
        pq.add(new NodeDistance(source, 0.0));

        while (!pq.isEmpty()) {
            NodeDistance cur = pq.poll();
            if (cur.distance > dist.getOrDefault(cur.nodeId, Double.POSITIVE_INFINITY)) continue;

            Map<Long, Double> neighbors = graph.getOrDefault(cur.nodeId, Collections.emptyMap());
            for (Map.Entry<Long, Double> edge : neighbors.entrySet()) {
                long next = edge.getKey();
                double nd = cur.distance + edge.getValue();
                if (nd < dist.getOrDefault(next, Double.POSITIVE_INFINITY)) {
                    dist.put(next, nd);
                    pq.add(new NodeDistance(next, nd));
                }
            }
        }

        return dist;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private record LatLon(double lat, double lon) {}
    private record NodeDistance(long nodeId, double distance) {}
    private record RoadGraph(Map<Long, LatLon> nodes, Map<Long, Map<Long, Double>> adjacency) {}
}
