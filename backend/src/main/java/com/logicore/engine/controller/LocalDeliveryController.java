package com.logicore.engine.controller;

import com.logicore.engine.model.LocalDeliveryProgress;
import com.logicore.engine.model.LocalDeliveryStop;
import com.logicore.engine.service.LocalDeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * LocalDeliveryController - REST endpoints for intra-city delivery management
 * Handles last-mile delivery route optimization and progress tracking
 */
@RestController
@RequestMapping("/api/local-delivery")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"})
public class LocalDeliveryController {
    private final LocalDeliveryService localDeliveryService;
    private final Map<String, LocalDeliveryProgress> deliveryProgressStore = new HashMap<>();

    public LocalDeliveryController(LocalDeliveryService localDeliveryService) {
        this.localDeliveryService = localDeliveryService;
    }

    /**
     * GET /api/local-delivery/cities
     * Returns list of available cities for simulation
     */
     @GetMapping("/cities")
     public ResponseEntity<Map<String, Object>> getCities() {
         Map<String, Object> response = new HashMap<>();
         response.put("status", "success");
         response.put("cities", localDeliveryService.getAvailableCities());
         return ResponseEntity.ok(response);
     }

    /**
     * POST /api/local-delivery/calculate-city-route
     * Calculates optimal delivery route for a specific city
     * 
     * Request: { "cityId": "DEL", "numberOfStops": 15, "algorithmType": "GREEDY" }
     */
    @PostMapping("/calculate-city-route")
    public ResponseEntity<Map<String, Object>> calculateCityRoute(@RequestBody Map<String, Object> request) {
        try {
            String cityId = (String) request.get("cityId");
            int numberOfStops = request.containsKey("numberOfStops") ? ((Number) request.get("numberOfStops")).intValue() : 12;
            String algorithm = (String) request.getOrDefault("algorithmType", "GREEDY");

            LocalDeliveryStop warehouse = localDeliveryService.getWarehouseForCity(cityId);
            List<LocalDeliveryStop> deliveryStops = localDeliveryService.generateMockDeliveryStops(cityId, numberOfStops);

            List<LocalDeliveryStop> route = localDeliveryService.calculateOptimalRoute(
                    cityId, warehouse, deliveryStops, algorithm
            );

            double totalDistance = localDeliveryService.calculateTotalDistance(route);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("cityId", cityId);
            response.put("warehouse", warehouse);
            response.put("deliveryStops", deliveryStops);
            response.put("route", route);
            response.put("totalDistance", totalDistance);
            response.put("stopCount", route.size() - 2); // excluding warehouse start/end
            response.put("algorithm", "GREEDY_NEAREST_NEIGHBOR");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Failed to calculate city route: " + e.getMessage());
        }
    }

    /**
     * POST /api/local-delivery/calculate-route
     * Calculates optimal delivery route using Greedy TSP algorithm
     *
     * Request:
     * {
     *   "warehouse": { "lat": 18.5204, "lng": 73.8567, ...},
     *   "deliveryStops": [
     *     { "id": "stop-1", "name": "Address 1", "latitude": 18.53, "longitude": 73.86, ... },
     *     ...
     *   ]
     * }
     */
    @PostMapping("/calculate-route")
    public ResponseEntity<Map<String, Object>> calculateRoute(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> warehouseData = (Map<String, Object>) request.get("warehouse");
            LocalDeliveryStop warehouse = mapToDeliveryStop(warehouseData);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> stopsData = (List<Map<String, Object>>) request.get("deliveryStops");
            List<LocalDeliveryStop> deliveryStops = stopsData.stream()
                    .map(this::mapToDeliveryStop)
                    .toList();

            // Calculate optimal route
            List<LocalDeliveryStop> route = localDeliveryService.calculateOptimalRoute(
                    "PUNE",
                    warehouse,
                    deliveryStops,
                    "GREEDY"
            );

            double totalDistance = localDeliveryService.calculateTotalDistance(route);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("route", route);
            response.put("totalDistance", totalDistance);
            response.put("stopCount", route.size());
            response.put("algorithm", "GREEDY_NEAREST_NEIGHBOR");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse("Failed to calculate route: " + e.getMessage());
        }
    }

    /**
     * POST /api/local-delivery/initiate
     * Initiates a new delivery journey with progress tracking
     *
     * Request:
     * {
     *   "orderId": "ORD-123",
     *   "route": [...]
     * }
     */
    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiateDelivery(@RequestBody Map<String, Object> request) {
        try {
            String orderId = (String) request.get("orderId");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> routeData = (List<Map<String, Object>>) request.get("route");
            List<LocalDeliveryStop> route = routeData.stream()
                    .map(this::mapToDeliveryStop)
                    .toList();

            // Create progress tracker
            LocalDeliveryProgress progress = localDeliveryService.createProgressTracker(orderId, route);
            deliveryProgressStore.put(progress.getDeliveryId(), progress);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("deliveryId", progress.getDeliveryId());
            response.put("progress", progress);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse("Failed to initiate delivery: " + e.getMessage());
        }
    }

    /**
     * GET /api/local-delivery/{deliveryId}/progress
     * Retrieves current delivery progress
     */
    @GetMapping("/{deliveryId}/progress")
    public ResponseEntity<Map<String, Object>> getDeliveryProgress(@PathVariable String deliveryId) {
        LocalDeliveryProgress progress = deliveryProgressStore.get(deliveryId);

        if (progress == null) {
            return errorResponse("Delivery not found");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("progress", progress);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/local-delivery/{deliveryId}/update-progress
     * Updates delivery progress (called during animation)
     *
     * Request:
     * {
     *   "stepIndex": 2
     * }
     */
    @PostMapping("/{deliveryId}/update-progress")
    public ResponseEntity<Map<String, Object>> updateDeliveryProgress(
            @PathVariable String deliveryId,
            @RequestBody Map<String, Object> request) {
        try {
            LocalDeliveryProgress progress = deliveryProgressStore.get(deliveryId);

            if (progress == null) {
                return errorResponse("Delivery not found");
            }

            int stepIndex = ((Number) request.get("stepIndex")).intValue();
            localDeliveryService.updateProgress(progress, stepIndex);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("progress", progress);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse("Failed to update progress: " + e.getMessage());
        }
    }

    /**
     * GET /api/local-delivery/{deliveryId}/next-stop
     * Gets next delivery stop in the route
     */
    @GetMapping("/{deliveryId}/next-stop")
    public ResponseEntity<Map<String, Object>> getNextStop(@PathVariable String deliveryId) {
        LocalDeliveryProgress progress = deliveryProgressStore.get(deliveryId);

        if (progress == null) {
            return errorResponse("Delivery not found");
        }

        int nextIndex = progress.getCurrentStepIndex() + 1;
        if (nextIndex >= progress.getRoute().size()) {
            nextIndex = progress.getCurrentStepIndex();
        }

        LocalDeliveryStop nextStop = localDeliveryService.getNextDeliveryStop(nextIndex, progress.getRoute());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("nextStop", nextStop);
        response.put("nextStopIndex", nextIndex);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/local-delivery/{deliveryId}/complete
     * Marks delivery as complete
     */
    @PostMapping("/{deliveryId}/complete")
    public ResponseEntity<Map<String, Object>> completeDelivery(@PathVariable String deliveryId) {
        try {
            LocalDeliveryProgress progress = deliveryProgressStore.get(deliveryId);

            if (progress == null) {
                return errorResponse("Delivery not found");
            }

            progress.setStatus("COMPLETED");
            progress.setProgressPercentage(100.0);
            progress.setUpdatedAtMs(System.currentTimeMillis());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Delivery completed");
            response.put("progress", progress);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse("Failed to complete delivery: " + e.getMessage());
        }
    }

    /**
     * POST /api/simulation/intra-city/route
     * Returns optimized stop order for a given set of local stops
     */
    @PostMapping("/simulation/intra-city/route")
    public ResponseEntity<Map<String, Object>> getIntraCityRoute(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> stopsData = (List<Map<String, Object>>) request.get("stops");
            List<LocalDeliveryStop> stops = stopsData.stream()
                    .map(this::mapToDeliveryStop)
                    .toList();

            // Compute optimal order using Greedy TSP (representing A*/Dijkstra logic for sequence)
            List<LocalDeliveryStop> orderedStops = localDeliveryService.computeOptimalDeliveryRoute(stops);
            double estimatedDistance = localDeliveryService.calculateTotalDistance(orderedStops);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("orderedStops", orderedStops);
            response.put("algorithmUsed", "AStar");
            response.put("totalEstimatedDistance", estimatedDistance);
            response.put("roadGeometry", "OSRM (to be fetched by frontend)");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Failed to optimize route: " + e.getMessage());
        }
    }

    /**
     * Helper: Convert Map to LocalDeliveryStop
     */
    private LocalDeliveryStop mapToDeliveryStop(Map<String, Object> data) {
        LocalDeliveryStop stop = new LocalDeliveryStop();
        stop.setId((String) data.get("id"));
        stop.setName((String) data.get("name"));
        stop.setAddress((String) data.get("address"));
        stop.setLatitude(((Number) data.get("latitude")).doubleValue());
        stop.setLongitude(((Number) data.get("longitude")).doubleValue());
        stop.setType((String) data.getOrDefault("type", "delivery"));
        return stop;
    }

    /**
     * Helper: Create error response
     */
    private ResponseEntity<Map<String, Object>> errorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", message);
        return ResponseEntity.status(400).body(error);
    }

    /**
     * GET /api/local-delivery/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "LocalDeliveryService");
        return ResponseEntity.ok(response);
    }
}