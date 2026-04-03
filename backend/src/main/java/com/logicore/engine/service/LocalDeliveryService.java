package com.logicore.engine.service;

import com.logicore.engine.model.LocalDeliveryProgress;
import com.logicore.engine.model.LocalDeliveryStop;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * LocalDeliveryService - Handles intra-city last-mile delivery routing
 *
 * Algorithm: Greedy Nearest-Neighbor Heuristic for Traveling Salesman Problem
 * - Starts at warehouse (origin)
 * - At each step, visit nearest unvisited stop
 * - Continue until all stops visited, return to warehouse
 *
 * Complexity: O(n²) where n = number of delivery stops
 * Accuracy: 80-90% optimal for practical scenarios (vs true optimal: NP-hard)
 */
@Service
public class LocalDeliveryService {

    // Haversine constant - Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;

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
     * Calculates optimal delivery route using specified algorithm
     * Currently supports: Greedy (only)
     */
    public List<LocalDeliveryStop> calculateOptimalRoute(String city,
                                                        LocalDeliveryStop warehouse,
                                                        List<LocalDeliveryStop> deliveryAddresses,
                                                        String algorithm) {
        List<LocalDeliveryStop> route = new ArrayList<>();
        route.add(warehouse);

        if (deliveryAddresses != null && !deliveryAddresses.isEmpty()) {
            // Apply greedy TSP to delivery addresses (excluding warehouse)
            List<LocalDeliveryStop> orderedAddresses = greedyNearestNeighbor(deliveryAddresses);
            // Skip the last element (return to start) since we'll add warehouse separately
            if (orderedAddresses.size() > 1) {
                route.addAll(orderedAddresses.subList(0, orderedAddresses.size() - 1));
            } else if (orderedAddresses.size() == 1) {
                route.add(orderedAddresses.get(0));
            }

            // Return to warehouse
            route.add(warehouse);
        }

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
}
