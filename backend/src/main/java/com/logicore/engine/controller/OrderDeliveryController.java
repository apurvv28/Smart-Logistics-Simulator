package com.logicore.engine.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logicore.engine.graph.LogisticsGraph;
import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.OrderFull;
import com.logicore.engine.model.SlaTier;
import com.logicore.engine.service.OrderDeliveryService;

/**
 * API endpoints for complete order-to-delivery simulation
 * Handles: Order creation, routing, delivery simulation, and returns
 */
@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderDeliveryController {
    
    private final OrderDeliveryService orderDeliveryService;
    private final LogisticsGraph graph;
    
    public OrderDeliveryController(OrderDeliveryService orderDeliveryService, LogisticsGraph graph) {
        this.orderDeliveryService = orderDeliveryService;
        this.graph = graph;
    }
    
    /**
     * STEP 1: Create order from product link (Amazon/Flipkart)
     * POST /api/v1/orders/create-from-link
     */
    @PostMapping("/create-from-link")
    public OrderFull createOrderFromProductLink(@RequestBody ProductOrderRequest request) {
        return orderDeliveryService.createOrderFromProductLink(
            request.productUrl,
            request.productSku,
            request.productName,
            request.weight,
            request.price,
            request.customerId,
            request.customerName,
            request.customerEmail,
            request.deliveryPincode,
            request.deliveryAddress,
            request.slaTier
        );
    }
    
    /**
     * STEP 2: Process order - warehouse pickup and route planning
     * POST /api/v1/orders/{orderId}/process-and-route
     */
    @PostMapping("/{orderId}/process-and-route")
    public OrderFull processOrderAndRoute(@PathVariable String orderId, @RequestBody OrderFull order) {
        return orderDeliveryService.processOrderPickupAndRoute(order);
    }
    
    /**
     * STEP 3: Simulate delivery
     * POST /api/v1/orders/{orderId}/simulate-delivery
     */
    @PostMapping("/{orderId}/simulate-delivery")
    public OrderFull simulateDelivery(@PathVariable String orderId, @RequestBody OrderFull order) {
        return orderDeliveryService.simulateDelivery(order);
    }
    
    /**
     * STEP 4: Initiate return if customer unsatisfied
     * POST /api/v1/orders/{orderId}/initiate-return
     */
    @PostMapping("/{orderId}/initiate-return")
    public OrderFull initiateReturn(@PathVariable String orderId, @RequestBody ReturnRequest request) {
        OrderFull order = orderDeliveryService.getOrderStatus(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        return orderDeliveryService.initiateReturn(order, request.returnReason);
    }
    
    /**
     * STEP 5: Process return journey
     * POST /api/v1/orders/{orderId}/process-return
     */
    @PostMapping("/{orderId}/process-return")
    public OrderFull processReturn(@PathVariable String orderId, @RequestBody OrderFull order) {
        return orderDeliveryService.processReturn(order);
    }
    
    /**
     * Get order status with complete history
     * GET /api/v1/orders/{orderId}/status
     */
    @GetMapping("/{orderId}/status")
    public OrderFull getOrderStatus(@PathVariable String orderId) {
        OrderFull order = orderDeliveryService.getOrderStatus(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found: " + orderId);
        }
        return order;
    }
    
    /**
     * Get all active orders
     * GET /api/v1/orders/active
     */
    @GetMapping("/active")
    public Map<String, OrderFull> getActiveOrders() {
        return orderDeliveryService.getActiveOrders();
    }
    
    /**
     * Get all completed orders
     * GET /api/v1/orders/completed
     */
    @GetMapping("/completed")
    public List<OrderFull> getCompletedOrders() {
        return orderDeliveryService.getCompletedOrders();
    }
    
    /**
     * Get network graph (all nodes and edges)
     * GET /api/v1/graph/network
     */
    @GetMapping("/graph/network")
    public Map<String, Object> getNetwork() {
        Map<String, Object> network = new HashMap<>();
        
        List<Map<String, Object>> nodes = new ArrayList<>();
        for (LogisticsNode node : graph.getAllNodes()) {
            Map<String, Object> nodeMap = new HashMap<>();
            nodeMap.put("id", node.getId());
            nodeMap.put("name", node.getName());
            nodeMap.put("type", node.getType());
            nodeMap.put("lat", node.getLat());
            nodeMap.put("lng", node.getLng());
            nodeMap.put("capacity", node.getCapacity());
            nodes.add(nodeMap);
        }
        
        List<Map<String, Object>> edges = new ArrayList<>();
        for (LogisticsEdge edge : graph.getAllEdges()) {
            Map<String, Object> edgeMap = new HashMap<>();
            edgeMap.put("from", edge.getFrom());
            edgeMap.put("to", edge.getTo());
            edgeMap.put("distance", edge.getDistanceKm());
            edgeMap.put("traffic", edge.getTrafficScore());
            edgeMap.put("travelTime", edge.getTravelTimeMin());
            edges.add(edgeMap);
        }
        
        network.put("nodes", nodes);
        network.put("edges", edges);
        network.put("nodeCount", nodes.size());
        network.put("edgeCount", edges.size());
        
        return network;
    }
    
    // =================== Request/Response DTOs ===================
    
    public static class ProductOrderRequest {
        public String productUrl;
        public String productSku;
        public String productName;
        public double weight;
        public double price;
        public String customerId;
        public String customerName;
        public String customerEmail;
        public String deliveryPincode;
        public String deliveryAddress;
        public SlaTier slaTier;
    }
    
    public static class ReturnRequest {
        public String returnReason;
    }
}
