
package com.logicore.engine.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.logicore.engine.graph.AStarService;
import com.logicore.engine.graph.BellmanFordService;
import com.logicore.engine.graph.DijkstraService;
import com.logicore.engine.graph.FloydWarshallService;
import com.logicore.engine.graph.LogisticsGraph;
import com.logicore.engine.inventory.InventoryHashMap;
import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.OrderFull;
import com.logicore.engine.model.OrderStatus;
import com.logicore.engine.model.RouteTrace;
import com.logicore.engine.model.SlaTier;
import com.logicore.engine.websocket.SimulationEventPublisher;

/**
 * Comprehensive Order-to-Delivery Simulation Engine
 * Handles the complete lifecycle: Order -> Warehouse -> Transport -> Delivery -> Returns
 */
@Service
public class OrderDeliveryService {
    
    private final DijkstraService dijkstraService;
    private final AStarService aStarService;
    private final FloydWarshallService floydWarshallService;
    private final BellmanFordService bellmanFordService;
    private final LogisticsGraph graph;
    private final InventoryHashMap inventory;
    private final SimulationEventPublisher eventPublisher;
    
    /**
     * Map of orders being processed with their current state
     * Key: OrderId, Value: OrderFull with complete tracking
     */
    private final Map<String, OrderFull> activeOrders = Collections.synchronizedMap(new LinkedHashMap<>());
    
    /**
     * Completed/returned orders archive
     */
    private final List<OrderFull> completedOrders = Collections.synchronizedList(new ArrayList<>());
    
    /**
     * Return requests waiting processing
     */
    private final Queue<OrderFull> returnQueue = new LinkedList<>();
    
    /**
     * Algorithm selection strategy for route optimization
     */
    private enum AlgorithmChoice {
        DIJKSTRA,         // O(E log V) - Fast for sparse graphs, weighted edges
        A_STAR,           // O(E log V) - Faster with heuristic, good for grids
        FLOYD_WARSHALL,   // O(V^3) - All pairs, use if many queries
        BELLMAN_FORD      // O(V*E) - Handles negative weights, detect cycles
    }
    
    public OrderDeliveryService(DijkstraService dijkstraService,
                                AStarService aStarService,
                                FloydWarshallService floydWarshallService,
                                BellmanFordService bellmanFordService,
                                LogisticsGraph graph,
                                InventoryHashMap inventory,
                                SimulationEventPublisher eventPublisher) {
        this.dijkstraService = dijkstraService;
        this.aStarService = aStarService;
        this.floydWarshallService = floydWarshallService;
        this.bellmanFordService = bellmanFordService;
        this.graph = graph;
        this.inventory = inventory;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * STEP 1: Ingest product from e-commerce API (Amazon/Flipkart)
     * Extract item details and find best warehouse
     */
    public OrderFull createOrderFromProductLink(String productUrl, String productSku, 
                                               String productName, double weight, double price,
                                               String customerId, String customerName, 
                                               String customerEmail, String deliveryPin,
                                               String deliveryAddress, SlaTier slaTier) {
        OrderFull order = new OrderFull();
        order.setOrderId(UUID.randomUUID().toString());
        order.setCustomerId(customerId);
        order.setCustomerName(customerName);
        order.setCustomerEmail(customerEmail);
        order.setProductUrl(productUrl);
        order.setProductName(productName);
        order.setWeight(weight);
        order.setProductPrice(price);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PLACED);
        
        // Calculate promised delivery based on SLA
        order.setSlaTier(slaTier);
        order.setPromisedDeliveryTime(calculatePromisedDelivery(slaTier));
        
        order.setDeliveryPincode(deliveryPin);
        order.setDeliveryAddress(deliveryAddress);
        
        // Assign delivery zone using address/pincode geography (not random hash).
        int deliveryZoneId = findNearestDeliveryZone(deliveryPin, deliveryAddress);
        order.setDeliveryNodeId(deliveryZoneId);

        // Pick a warehouse close to the destination region for realistic line-haul.
        int warehouseId = findBestWarehouse(productSku, slaTier, deliveryZoneId);
        order.setPickupNodeId(warehouseId);
        order.setProductSku(extractSellerCityName(warehouseId));
        
        order.setStatusHistory(new ArrayList<>());
        addStatusToHistory(order, OrderStatus.PLACED, "Order created from " + productUrl);
        
        return order;
    }
    
    /**
     * STEP 2: Warehouse picks the order and routes it to delivery
     * Uses multiple algorithms to find OPTIMAL route
     */
    public OrderFull processOrderPickupAndRoute(OrderFull order) {
        order.setStatus(OrderStatus.WAREHOUSE_PICKED);
        addStatusToHistory(order, OrderStatus.WAREHOUSE_PICKED, 
            "Order picked from warehouse: " + graph.getNode(order.getPickupNodeId()).getName());
        
        // Find optimal route using SELECT algorithm based on order characteristics
        AlgorithmChoice selectedAlgorithm = selectBestAlgorithm(order);
        RouteTrace routeTrace = computeOptimalRoute(order.getPickupNodeId(), 
                                                     order.getDeliveryNodeId(), 
                                                     selectedAlgorithm);
        
        order.setPlannedRoute(routeTrace.getPath());
        order.setEstimatedDistance(routeTrace.getTotalDistance());
        order.setRouteAlgorithm(selectedAlgorithm.name());
        order.setComputationTimeMs(routeTrace.getExecutionTimeMs());
        order.setNodesExplored(routeTrace.getNodesExplored());
        
        // Generate explanation WHY this algorithm and route was chosen
        order.setAlgorithmExplanation(generateAlgorithmExplanation(routeTrace, selectedAlgorithm, order));
        
        order.setStatus(OrderStatus.DISPATCHED);
        addStatusToHistory(order, OrderStatus.DISPATCHED,
            "Route calculated using " + selectedAlgorithm.name() + 
            ". Distance: " + String.format("%.2f km", routeTrace.getTotalDistance()));
        
        activeOrders.put(order.getOrderId(), order);
        return order;
    }
    
    /**
     * STEP 3: Simulate vehicle in transit with real-time tracking
     */
    public OrderFull simulateDelivery(OrderFull order) {
        // Simulate travel through planned route
        List<Integer> route = order.getPlannedRoute();
        double totalDistance = 0;
        
        for (int i = 0; i < route.size() - 1; i++) {
            int currentNode = route.get(i);
            int nextNode = route.get(i + 1);
            
            // Find edge distance
            double edgeDistance = 0;
            for (LogisticsEdge edge : graph.getNeighbors(currentNode)) {
                if (edge.getTo() == nextNode) {
                    edgeDistance = edge.getDistanceKm();
                    break;
                }
            }
            totalDistance += edgeDistance;
            
            order.setStatus(OrderStatus.IN_TRANSIT);
            addStatusToHistory(order, OrderStatus.IN_TRANSIT,
                "In transit from " + graph.getNode(currentNode).getName() + 
                " to " + graph.getNode(nextNode).getName() + 
                " (" + String.format("%.1f km", edgeDistance) + ")");
            
            // Simulate processing delay
            try {
                Thread.sleep(100); // Small delay for simulation
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        order.setActualDistance(totalDistance);
        
        // Final delivery
        order.setStatus(OrderStatus.DELIVERED);
        order.setActualDeliveryTime(LocalDateTime.now());
        addStatusToHistory(order, OrderStatus.DELIVERED,
            "Delivered to " + order.getDeliveryAddress() + 
            ". Actual distance: " + String.format("%.2f km", totalDistance));

        // Persist the updated state so return APIs read the latest lifecycle status.
        activeOrders.put(order.getOrderId(), order);
        
        return order;
    }
    
    /**
     * STEP 4: Handle Returns - Customer can initiate return if unsatisfied
     */
    public OrderFull initiateReturn(OrderFull order, String returnReason) {
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("Only delivered orders can be returned");
        }
        
        order.setReturn(true);
        order.setReturnReason(returnReason);
        order.setReturnInitiatedTime(LocalDateTime.now());
        order.setReturnStatus("INITIATED");
        
        // Find return warehouse (usually nearest warehouse, using HashMap hash)
        int returnWarehouseId = findReturnWarehouse(order);
        order.setReturnNodeId(returnWarehouseId);
        order.setStatus(OrderStatus.RETURN_INITIATED);
        String sellerNode = graph.getNode(returnWarehouseId) != null
            ? graph.getNode(returnWarehouseId).getName()
            : "seller warehouse";
        
        addStatusToHistory(order, OrderStatus.RETURN_INITIATED,
            "Return initiated: " + returnReason + ". Seller return destination: " + sellerNode);
        
        returnQueue.offer(order);
        activeOrders.put(order.getOrderId(), order);
        return order;
    }
    
    /**
     * STEP 5: Process return journey - route from delivery to warehouse
     */
    public OrderFull processReturn(OrderFull order) {
        // Use different algorithm for return route (might have different constraints)
        AlgorithmChoice returnAlgorithm = AlgorithmChoice.DIJKSTRA; // Simpler for returns
        RouteTrace returnRoute = computeOptimalRoute(order.getDeliveryNodeId(),
                                                      order.getReturnNodeId(),
                                                      returnAlgorithm);
        order.setReturnRoute(returnRoute.getPath());

        order.setStatus(OrderStatus.RETURN_PICKED);
        order.setReturnStatus("PARCEL_PICKED");
        addStatusToHistory(order, OrderStatus.RETURN_PICKED,
            "Parcel picked from customer address for return pickup.");

        List<Integer> reversePath = returnRoute.getPath();
        if (reversePath == null || reversePath.size() < 2) {
            throw new IllegalStateException("Unable to compute return route to seller");
        }
        
        order.setReturnStatus("IN_TRANSIT");
        order.setStatus(OrderStatus.RETURN_IN_TRANSIT);
        addStatusToHistory(order, OrderStatus.RETURN_IN_TRANSIT,
            "Return route planned using " + returnAlgorithm.name() +
            ". Estimated distance: " + String.format("%.2f km", returnRoute.getTotalDistance()));

        for (int i = 0; i < reversePath.size() - 1; i++) {
            int from = reversePath.get(i);
            int to = reversePath.get(i + 1);
            double edgeDistance = 0;

            for (LogisticsEdge edge : graph.getNeighbors(from)) {
                if (edge.getTo() == to) {
                    edgeDistance = edge.getDistanceKm();
                    break;
                }
            }

            addStatusToHistory(order, OrderStatus.RETURN_IN_TRANSIT,
                "Return in transit from " + graph.getNode(from).getName() +
                " to " + graph.getNode(to).getName() +
                " (" + String.format("%.1f km", edgeDistance) + ")");

            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        order.setReturnStatus("RECEIVED");
        order.setStatus(OrderStatus.RETURNED);
        addStatusToHistory(order, OrderStatus.RETURNED,
            "Return received at seller warehouse " +
            graph.getNode(order.getReturnNodeId()).getName() +
            ". Refund initiated.");

        activeOrders.put(order.getOrderId(), order);
        
        return order;
    }
    
    /**
     * ALGORITHM SELECTION STRATEGY
     * Chooses optimal algorithm based on order characteristics
     */
    private AlgorithmChoice selectBestAlgorithm(OrderFull order) {
        // If it's same-day delivery, use A* (fastest with heuristic)
        if (order.getSlaTier() == SlaTier.SAME_DAY) {
            return AlgorithmChoice.A_STAR;  // Greedy, heuristic-guided
        }
        
        // If delivery is express, use Dijkstra (balanced speed)
        if (order.getSlaTier() == SlaTier.EXPRESS) {
            return AlgorithmChoice.DIJKSTRA;  // O(E log V)
        }
        
        // Standard delivery - could use Floyd-Warshall if doing batch optimization
        // For single order, use Bellman-Ford to detect any route anomalies
        return AlgorithmChoice.BELLMAN_FORD;  // Can detect unusual patterns
    }
    
    /**
     * Compute route using selected algorithm
     */
    private RouteTrace computeOptimalRoute(int source, int target, AlgorithmChoice algorithm) {
        return switch (algorithm) {
            case DIJKSTRA -> dijkstraService.compute(graph, source, target);
            case A_STAR -> aStarService.compute(graph, source, target);
            case FLOYD_WARSHALL -> floydWarshallService.computeAllPairs(graph, source, target);
            case BELLMAN_FORD -> bellmanFordService.compute(graph, source, target);
        };
    }
    
    /**
     * Generate detailed explanation of why route was chosen
     */
    private String generateAlgorithmExplanation(RouteTrace trace, AlgorithmChoice algorithm, OrderFull order) {
        StringBuilder explanation = new StringBuilder();
        explanation.append("ALGORITHM: ").append(algorithm.name()).append("\n");
        explanation.append("WHY CHOSEN: ");
        
        switch (algorithm) {
            case DIJKSTRA:
                explanation.append("Optimal for express delivery. Uses priority queue to efficiently " +
                    "find shortest path. Time complexity O(E log V) ensures fast computation. " +
                    "Nodes explored: ").append(trace.getNodesExplored()).append(". ");
                break;
            case A_STAR:
                explanation.append("Greedy algorithm with geographical heuristic. Perfect for same-day delivery " +
                    "requiring immediate optimization. Uses straight-line distance estimate to prune unnecessary nodes. " +
                    "Time complexity: O(E log V) to O(1) depending on heuristic quality. ");
                break;
            case FLOYD_WARSHALL:
                explanation.append("All-pairs shortest path. Useful when multiple deliveries need optimization. " +
                    "Time complexity O(V³) is acceptable for small networks (21 nodes). " +
                    "Nodes explored: ").append(trace.getNodesExplored()).append(". ");
                break;
            case BELLMAN_FORD:
                explanation.append("Negative weight detection algorithm. Used for standard delivery to detect any " +
                    "unusual routing patterns or cost anomalies. Can handle negative weights (discounts/refunds). " +
                    "Time complexity O(V*E). ");
                break;
        }
        
        explanation.append("\nDISTANCE CALCULATION: Haversine formula for latitude/longitude. ");
        explanation.append("\nTRAFFIC ADJUSTMENT: Applied factor ").append(
            graph.getNeighbors(order.getPickupNodeId()).stream()
                .mapToDouble(LogisticsEdge::getTrafficScore)
                .average()
                .orElse(1.0)
        ).append(" based on region congestion. ");
        
        explanation.append("\nROUTE: ");
        for (int i = 0; i < trace.getPath().size(); i++) {
            if (i > 0) explanation.append(" -> ");
            LogisticsNode node = graph.getNode(trace.getPath().get(i));
            explanation.append(node.getName());
        }
        
        explanation.append("\nTOTAL DISTANCE: ").append(String.format("%.2f km", trace.getTotalDistance())).append("\n");
        explanation.append("COMPUTATION TIME: ").append(trace.getExecutionTimeMs()).append(" ms");
        
        return explanation.toString();
    }
    
    // =================== HELPER METHODS ===================
    
    private int findBestWarehouse(String productSku, SlaTier slaTier, int deliveryNodeId) {
        Integer sellerWarehouseId = findWarehouseBySellerCity(productSku);
        if (sellerWarehouseId != null) {
            return sellerWarehouseId;
        }

        LogisticsNode destination = graph.getNode(deliveryNodeId);
        if (destination == null) {
            return 0;
        }

        List<LogisticsNode> warehouses = graph.getAllNodes().stream()
            .filter(node -> node.getType() != null && node.getType().name().equals("WAREHOUSE"))
            .sorted(Comparator.comparingDouble(node -> geoDistanceKm(node, destination)))
            .toList();

        if (warehouses.isEmpty()) {
            return 0;
        }

        // Always use nearest warehouse for deterministic and logical routes.
        return warehouses.get(0).getId();
    }

    private Integer findWarehouseBySellerCity(String sellerCityInput) {
        if (sellerCityInput == null || sellerCityInput.isBlank()) {
            return null;
        }

        String normalizedSellerCity = normalizeCityName(sellerCityInput);

        return graph.getAllNodes().stream()
            .filter(node -> node.getType() != null && node.getType().name().equals("WAREHOUSE"))
            .filter(node -> normalizeCityName(node.getName()).contains(normalizedSellerCity))
            .map(LogisticsNode::getId)
            .findFirst()
            .orElse(null);
    }

    private String normalizeCityName(String value) {
        String normalized = value == null ? "" : value.toLowerCase().trim();
        normalized = normalized.replace("warehouse", "").trim();
        normalized = normalized.replaceAll("\\s+", " ");
        return normalized;
    }
    
    private int findNearestDeliveryZone(String pincode, String deliveryAddress) {
        Integer preferredZoneId = resolvePreferredDeliveryZoneId(pincode, deliveryAddress);
        if (preferredZoneId != null && graph.getNode(preferredZoneId) != null) {
            return preferredZoneId;
        }

        double[] target = approximateCustomerLocation(pincode, deliveryAddress);

        LogisticsNode nearestDeliveryZone = graph.getAllNodes().stream()
            .filter(node -> node.getType() != null && node.getType().name().equals("DELIVERY_ZONE"))
            .min(Comparator.comparingDouble(node -> geoDistanceKm(node.getLat(), node.getLng(), target[0], target[1])))
            .orElse(null);

        if (nearestDeliveryZone != null) {
            return nearestDeliveryZone.getId();
        }

        // Defensive fallback only.
        return 2;
    }

    private Integer resolvePreferredDeliveryZoneId(String pincode, String deliveryAddress) {
        String text = deliveryAddress == null ? "" : deliveryAddress.toLowerCase();

        if (text.contains("pune")) return 33;
        if (text.contains("navi mumbai") || text.contains("mumbai") || text.contains("thane")) return 5;
        if (text.contains("nashik")) return 36;
        if (text.contains("aurangabad")) return 38;
        if (text.contains("kolhapur")) return 39;
        if (text.contains("solapur")) return 41;
        if (text.contains("nagpur")) return 40;
        if (text.contains("hyderabad") || text.contains("secunderabad")) return 11;
        if (text.contains("chennai")) return 14;
        if (text.contains("delhi") || text.contains("noida") || text.contains("gurgaon")) return 2;

        String pin = pincode == null ? "" : pincode.trim();
        if (pin.length() >= 3) {
            String prefix3 = pin.substring(0, 3);
            switch (prefix3) {
                // Mumbai/Thane/Navi Mumbai belt
                case "400":
                case "401":
                case "402": return 5;
                // Pune belt
                case "410":
                case "411":
                case "412": return 33;
                // Nashik
                case "422": return 36;
                // Aurangabad/Marathwada
                case "431": return 38;
                // Kolhapur
                case "416": return 39;
                // Solapur
                case "413": return 41;
                // Nagpur/Vidarbha
                case "440":
                case "441": return 40;
                default: break;
            }
        }

        return null;
    }
    
    private int findReturnWarehouse(OrderFull order) {
        // Return to the nearest warehouse from customer's delivery-side node.
        return findBestWarehouse(order.getProductSku(), SlaTier.STANDARD, order.getDeliveryNodeId());
    }

    private double[] approximateCustomerLocation(String pincode, String deliveryAddress) {
        String text = deliveryAddress == null ? "" : deliveryAddress.toLowerCase();

        if (text.contains("navi mumbai")) return new double[]{19.0330, 73.0297};
        if (text.contains("pune")) return new double[]{18.5204, 73.8567};
        if (text.contains("mumbai")) return new double[]{19.0760, 72.8777};
        if (text.contains("thane")) return new double[]{19.2183, 72.9781};
        if (text.contains("nashik")) return new double[]{19.9975, 73.7898};
        if (text.contains("aurangabad")) return new double[]{19.8762, 75.3433};
        if (text.contains("kolhapur")) return new double[]{16.7050, 74.2433};
        if (text.contains("solapur")) return new double[]{17.6599, 75.9064};
        if (text.contains("nagpur")) return new double[]{21.1458, 79.0882};
        if (text.contains("bengaluru") || text.contains("bangalore")) return new double[]{12.9716, 77.5946};
        if (text.contains("hyderabad")) return new double[]{17.3850, 78.4867};
        if (text.contains("chennai")) return new double[]{13.0827, 80.2707};
        if (text.contains("delhi") || text.contains("noida") || text.contains("gurgaon")) return new double[]{28.6139, 77.2090};
        if (text.contains("kolkata")) return new double[]{22.5726, 88.3639};
        if (text.contains("ahmedabad")) return new double[]{23.0225, 72.5714};
        if (text.contains("jaipur")) return new double[]{26.9124, 75.7873};

        String pin = pincode == null ? "" : pincode.trim();
        if (pin.length() >= 2) {
            String prefix2 = pin.substring(0, 2);
            switch (prefix2) {
                case "40":
                case "41": return new double[]{18.95, 73.85};  // Maharashtra west (Mumbai/Pune/Navi Mumbai)
                case "42": return new double[]{20.0, 74.8};    // Maharashtra north (Nashik/Aurangabad)
                case "43":
                case "44": return new double[]{21.15, 79.1};   // Maharashtra east (Nagpur/Vidarbha)
                case "11":
                case "12": return new double[]{28.6, 77.2};   // Delhi NCR
                case "50": return new double[]{17.4, 78.5};   // Telangana (Hyderabad)
                case "56":
                case "57": return new double[]{12.9, 77.6};   // Karnataka
                case "60":
                case "61": return new double[]{13.0, 80.2};   // Tamil Nadu (Chennai region)
                case "70":
                case "71": return new double[]{22.6, 88.4};   // West Bengal
                case "38": return new double[]{23.0, 72.6};   // Gujarat
                case "30":
                case "31": return new double[]{26.9, 75.8};   // Rajasthan
                default: break;
            }
        }

        // Default center point if no signal from address or pincode.
        return new double[]{22.0, 79.0};
    }

    private double geoDistanceKm(LogisticsNode a, LogisticsNode b) {
        return geoDistanceKm(a.getLat(), a.getLng(), b.getLat(), b.getLng());
    }

    private double geoDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dx = lat1 - lat2;
        double dy = lon1 - lon2;
        return Math.sqrt(dx * dx + dy * dy) * 111.0;
    }

    private String extractSellerCityName(int warehouseId) {
        LogisticsNode warehouse = graph.getNode(warehouseId);
        if (warehouse == null || warehouse.getName() == null || warehouse.getName().isBlank()) {
            return "UNKNOWN_CITY";
        }

        String name = warehouse.getName().trim();
        name = name.replace(" Warehouse", "").trim();
        return name;
    }
    
    private LocalDateTime calculatePromisedDelivery(SlaTier slaTier) {
        LocalDateTime now = LocalDateTime.now();
        return switch (slaTier) {
            case SAME_DAY -> now.plusHours(12);
            case EXPRESS -> now.plusDays(2);
            case STANDARD -> now.plusDays(5);
        };
    }
    
    private void addStatusToHistory(OrderFull order, OrderStatus status, String remarks) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new ArrayList<>());
        }
        OrderFull.OrderStatusHistory history = new OrderFull.OrderStatusHistory(
            LocalDateTime.now(),
            status,
            "Location details",
            remarks
        );
        order.getStatusHistory().add(history);
    }
    
    // Public accessor methods
    public Map<String, OrderFull> getActiveOrders() {
        return activeOrders;
    }
    
    public List<OrderFull> getCompletedOrders() {
        return completedOrders;
    }
    
    public OrderFull getOrderStatus(String orderId) {
        return activeOrders.getOrDefault(orderId, 
            completedOrders.stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst()
                .orElse(null));
    }
}
