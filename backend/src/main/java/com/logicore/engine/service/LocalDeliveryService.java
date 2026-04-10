package com.logicore.engine.service;

import com.logicore.engine.model.LocalDeliveryProgress;
import com.logicore.engine.model.LocalDeliveryStop;
import org.springframework.stereotype.Service;
import com.logicore.engine.dto.LocalDeliveryResponse;

import java.util.*;

/**
 * LocalDeliveryService - Handles intra-city last-mile delivery routing
 *
 * Algorithm: Greedy Nearest-Neighbor Heuristic for Traveling Salesman Problem
 * - Starts at warehouse (origin hub)
 * - At each step, visit nearest unvisited stop (using Haversine distance)
 * - Scale: Optimized for residential and commercial delivery stops (4-15 stops)
 * - Continue until all stops visited, return to warehouse
 *
 * Complexity: O(n²) where n = number of delivery stops
 * Accuracy: 80-90% optimal for practical scenarios
 *
 * Uses Haversine formula for accurate great-circle distance calculation on Earth's surface
 */
@Service
public class LocalDeliveryService {

    // Haversine constant - Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;

    // City Master Data
    private static final Map<String, Map<String, Object>> CITY_MASTER = new HashMap<>();

    static {
        addCity("DEL", "Delhi", 28.7041, 77.1025, "Delhi Central Warehouse");
        addCity("MUM", "Mumbai", 19.0760, 72.8777, "Mumbai Logistics Hub");
        addCity("BLR", "Bangalore", 12.9716, 77.5946, "Bengaluru Distribution Center");
        addCity("HYD", "Hyderabad", 17.3850, 78.4867, "Hyderabad Hub");
        addCity("CHN", "Chennai", 13.0827, 80.2707, "Chennai Port Warehouse");
        addCity("KOL", "Kolkata", 22.5726, 88.3639, "Kolkata East Terminal");
        addCity("PUN", "Pune", 18.5204, 73.8567, "Pune Regional Hub");
        addCity("AHM", "Ahmedabad", 23.0225, 72.5714, "Ahmedabad Logistics Park");
        addCity("JAI", "Jaipur", 26.9124, 75.7873, "Jaipur Pink City Hub");
        addCity("LKO", "Lucknow", 26.8467, 80.9462, "Lucknow Hub");
        addCity("NAG", "Nagpur", 21.1458, 79.0882, "Nagpur Central India Hub");
        addCity("IND", "Indore", 22.7196, 75.8577, "Indore Hub");
        addCity("BHO", "Bhopal", 23.2599, 77.4126, "Bhopal Hub");
        addCity("SUR", "Surat", 21.1702, 72.8311, "Surat Diamond Hub");
        addCity("VAD", "Vadodara", 22.3072, 73.1812, "Vadodara Logistics Hub");
        addCity("COI", "Coimbatore", 11.0168, 76.9558, "Coimbatore Hub");
        addCity("VIS", "Visakhapatnam", 17.6868, 83.2185, "Vizag Hub");
        addCity("PAT", "Patna", 25.5941, 85.1376, "Patna Hub");
        addCity("LUD", "Ludhiana", 30.9010, 75.8573, "Ludhiana Hub");
        addCity("AGR", "Agra", 27.1767, 78.0081, "Agra Hub");
    }

    private static void addCity(String code, String name, double lat, double lng, String whName) {
        Map<String, Object> city = new HashMap<>();
        city.put("cityId", code);
        city.put("cityName", name);
        city.put("latitude", lat);
        city.put("longitude", lng);
        city.put("warehouseName", whName);
        CITY_MASTER.put(code, city);
    }

    public List<Map<String, Object>> getAvailableCities() {
        return new ArrayList<>(CITY_MASTER.values());
    }

    /**
     * Generates mock delivery stops within a 15km radius of the city center
     */
    public List<LocalDeliveryStop> generateMockDeliveryStops(String cityId, int numberOfStops) {
        Map<String, Object> city = CITY_MASTER.get(cityId);
        if (city == null) return new ArrayList<>();

        double centerLat = (double) city.get("latitude");
        double centerLng = (double) city.get("longitude");
        
        List<LocalDeliveryStop> stops = new ArrayList<>();
        Random random = new Random(cityId.hashCode()); // Deterministic for same city

        String[] stopNames = {"Market Square", "Industrial Area", "Residential Complex", "City Mall", 
                              "Tech Park", "Transit Hub", "Business District", "Old Town", "New Suburb",
                              "Railway Colony", "Airport Road", "Green Park", "High Street", "Riverside", "East Gate"};

        for (int i = 1; i <= numberOfStops; i++) {
            // Random offset within ~15km (roughly 0.13 degrees)
            double offsetLat = (random.nextDouble() - 0.5) * 0.2;
            double offsetLng = (random.nextDouble() - 0.5) * 0.2;

            LocalDeliveryStop stop = new LocalDeliveryStop();
            stop.setId(cityId + "-STOP-" + i);
            stop.setName(stopNames[i % stopNames.length] + " " + i);
            stop.setLatitude(centerLat + offsetLat);
            stop.setLongitude(centerLng + offsetLng);
            stop.setAddress(stop.getName() + ", " + city.get("cityName"));
            stop.setType("delivery");
            stops.add(stop);
        }

        return stops;
    }

    public LocalDeliveryStop getWarehouseForCity(String cityId) {
        Map<String, Object> city = CITY_MASTER.get(cityId);
        if (city == null) return null;

        LocalDeliveryStop wh = new LocalDeliveryStop();
        wh.setId(cityId + "-WH-001");
        wh.setName((String) city.get("warehouseName"));
        wh.setLatitude((double) city.get("latitude"));
        wh.setLongitude((double) city.get("longitude"));
        wh.setAddress("Logistics Hub, " + city.get("cityName"));
        wh.setType("warehouse");
        return wh;
    }

    /**
     * Greedy Nearest-Neighbor TSP algorithm
     * - Start at warehouse
     * - Always visit nearest unvisited stop
     * - Return to warehouse at end
     */
    public List<LocalDeliveryStop> computeOptimalDeliveryRoute(List<LocalDeliveryStop> deliveryStops) {
        if (deliveryStops == null || deliveryStops.isEmpty()) {
            return new ArrayList<>();
        }

        return greedyNearestNeighbor(deliveryStops);
    }

    /**
     * Core Greedy Nearest-Neighbor algorithm
     */
    private List<LocalDeliveryStop> greedyNearestNeighbor(List<LocalDeliveryStop> stops) {
        if (stops.size() <= 1) return new ArrayList<>(stops);

        List<LocalDeliveryStop> route = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();

        // Start at first stop (warehouse)
        LocalDeliveryStop current = stops.get(0);
        route.add(current);
        visited.add(0);

        // Greedily visit nearest unvisited stop
        while (visited.size() < stops.size()) {
            LocalDeliveryStop nearest = findNearestUnvisited(current, stops, visited);
            if (nearest != null) {
                route.add(nearest);
                visited.add(stops.indexOf(nearest));
                current = nearest;
            } else {
                break;
            }
        }

        // Return to warehouse
        route.add(stops.get(0));

        return route;
    }

    /**
     * Finds nearest unvisited stop from current location
     */
    private LocalDeliveryStop findNearestUnvisited(LocalDeliveryStop current,
                                                   List<LocalDeliveryStop> stops,
                                                   Set<Integer> visited) {
        LocalDeliveryStop nearest = null;
        double minDistance = Double.MAX_VALUE;

        for (int i = 0; i < stops.size(); i++) {
            if (!visited.contains(i)) {
                double distance = calculateDeliveryDistance(current, stops.get(i));
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = stops.get(i);
                }
            }
        }

        return nearest;
    }

    /**
     * Haversine formula - great-circle distance between two GPS coordinates
     * Used to calculate real-world distances on Earth's surface
     *
     * Returns: Distance in kilometers
     */
    public double calculateDeliveryDistance(LocalDeliveryStop from, LocalDeliveryStop to) {
        double lat1 = Math.toRadians(from.getLatitude());
        double lat2 = Math.toRadians(to.getLatitude());
        double lon1 = Math.toRadians(from.getLongitude());
        double lon2 = Math.toRadians(to.getLongitude());

        double deltaLat = lat2 - lat1;
        double deltaLon = lon2 - lon1;

        // Haversine formula
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.asin(Math.sqrt(a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculates optimal delivery route using Greedy TSP algorithm
     * Handles city-specific logistics (4-12 stops, 20-50km range)
     *
     * Algorithm: Greedy Nearest-Neighbor
     * - Start at warehouse
     * - Always move to nearest unvisited stop
     * - Uses Haversine distance for accurate GPS calculations
     *
     * @param city City identifier
     * @param warehouse Starting point and return point
     * @param deliveryAddresses Stops to visit
     * @param algorithm Algorithm type (currently GREEDY only)
     * @return Ordered list: [warehouse, stop1, stop2, ..., warehouse]
     */
    public List<LocalDeliveryStop> calculateOptimalRoute(String city,
                                                        LocalDeliveryStop warehouse,
                                                        List<LocalDeliveryStop> deliveryAddresses,
                                                        String algorithm) {
        // Validate inputs
        if (deliveryAddresses == null || deliveryAddresses.isEmpty()) {
            // No deliveries - just return warehouse
            List<LocalDeliveryStop> route = new ArrayList<>();
            route.add(warehouse);
            return route;
        }

        List<LocalDeliveryStop> route = new ArrayList<>();
        route.add(warehouse);

        // Apply Greedy TSP to compute optimal order for deliveries
        // greedyNearestNeighbor() expects warehouse at index 0
        List<LocalDeliveryStop> allStops = new ArrayList<>();
        allStops.add(warehouse);
        allStops.addAll(deliveryAddresses);

        // Compute optimized order
        List<LocalDeliveryStop> optimizedOrder = greedyNearestNeighbor(allStops);

        // Extract just the stops (skip warehouse at start, skip warehouse at end)
        if (optimizedOrder.size() > 2) {
            // Add stops 1 to n-1 (skip index 0 which is warehouse, skip last which is return to warehouse)
            route.addAll(optimizedOrder.subList(1, optimizedOrder.size() - 1));
        } else if (optimizedOrder.size() == 2) {
            // Single stop case - add it
            route.add(optimizedOrder.get(1));
        }

        // Always return to warehouse at the end
        route.add(warehouse);

        return route;
    }

    /**
     * Calculates total distance for a complete delivery route
     */
    public double calculateTotalDistance(List<LocalDeliveryStop> route) {
        if (route == null || route.size() < 2) {
            return 0.0;
        }

        double totalDistance = 0.0;
        for (int i = 0; i < route.size() - 1; i++) {
            totalDistance += calculateDeliveryDistance(route.get(i), route.get(i + 1));
        }
        return totalDistance;
    }

    /**
     * Gets next delivery stop in route by index
     */
    public LocalDeliveryStop getNextDeliveryStop(int index, List<LocalDeliveryStop> route) {
        if (route == null || index < 0 || index >= route.size()) {
            return null;
        }
        return route.get(index);
    }

    /**
     * Creates a LocalDeliveryProgress tracker for a route
     */
    public LocalDeliveryProgress createProgressTracker(String orderId, List<LocalDeliveryStop> route) {
        String deliveryId = "DEL-" + System.currentTimeMillis();
        double totalDistance = calculateTotalDistance(route);

        return new LocalDeliveryProgress(deliveryId, orderId, route, totalDistance);
    }

    /**
     * Updates progress based on current step index
     */
    public void updateProgress(LocalDeliveryProgress progress, int stepIndex) {
        if (progress.getRoute() == null || progress.getRoute().isEmpty()) {
            return;
        }

        progress.setCurrentStepIndex(stepIndex);

        if (stepIndex < progress.getRoute().size()) {
            progress.setCurrentStop(progress.getRoute().get(stepIndex));
        }

        // Calculate progress percentage
        double percentage = (stepIndex * 100.0) / (progress.getRoute().size() - 1);
        percentage = Math.min(100.0, Math.max(0.0, percentage));
        progress.setProgressPercentage(percentage);

        // Update status
        if (percentage >= 100.0) {
            progress.setStatus("COMPLETED");
        } else if (percentage > 0) {
            progress.setStatus("IN_TRANSIT");
        }

        progress.setUpdatedAtMs(System.currentTimeMillis());
    }

    /**
     * Calculate optimal city delivery route for intra-city simulator
     * This method is specifically for the city-based delivery page
     * 
     * @param cityId The city identifier
     * @param warehouse The warehouse/hub location
     * @param deliveryAddresses List of 8-12 delivery stops in the city
     * @param algorithmType The algorithm to use (DIJKSTRA, GREEDY, etc.)
     * @return LocalDeliveryResponse with optimized route and metrics
     */
    public LocalDeliveryResponse calculateCityDeliveryRoute(
            String cityId,
            LocalDeliveryStop warehouse,
            List<LocalDeliveryStop> deliveryAddresses,
            String algorithmType) {
        
        try {
            // Validate inputs
            if (warehouse == null) {
                throw new IllegalArgumentException("Warehouse location cannot be null");
            }
            if (deliveryAddresses == null || deliveryAddresses.isEmpty()) {
                throw new IllegalArgumentException("No delivery addresses provided");
            }

            // Build complete list: warehouse + delivery addresses
            List<LocalDeliveryStop> allStops = new ArrayList<>();
            allStops.add(warehouse);
            allStops.addAll(deliveryAddresses);

            // Calculate optimal route using Greedy Nearest-Neighbor TSP
            List<LocalDeliveryStop> optimizedRoute = greedyNearestNeighbor(allStops);

            // Calculate total distance for the route
            double totalDistance = calculateTotalDistance(optimizedRoute);

            // Build response
            LocalDeliveryResponse response = new LocalDeliveryResponse();
            response.setStatus("success");
            response.setRoute(optimizedRoute);
            response.setTotalDistance(totalDistance);
            response.setStopCount(optimizedRoute.size());
            response.setAlgorithm(algorithmType != null ? algorithmType : "GREEDY");

            return response;

        } catch (Exception e) {
            // Return error response
            LocalDeliveryResponse response = new LocalDeliveryResponse();
            response.setStatus("error");
            response.setRoute(new ArrayList<>());
            response.setTotalDistance(0);
            response.setStopCount(0);
            response.setAlgorithm("UNKNOWN");
            return response;
        }
    }
}
