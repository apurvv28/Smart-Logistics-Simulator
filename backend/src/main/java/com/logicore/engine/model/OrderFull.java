package com.logicore.engine.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced Order model with complete lifecycle tracking.
 */
@SuppressWarnings("unused")
public class OrderFull {
    private String orderId;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String productUrl;
    private String productSku;
    private String productName;
    private double weight;
    private double productPrice;
    private int pickupNodeId;
    private int deliveryNodeId;
    private String deliveryPincode;
    private String deliveryAddress;
    private SlaTier slaTier;
    private LocalDateTime orderTime;
    private LocalDateTime promisedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private OrderStatus status;
    private List<OrderStatusHistory> statusHistory;
    private String assignedVehicleId;
    private String routeAlgorithm;
    private List<Integer> plannedRoute;
    private double estimatedDistance;
    private double actualDistance;
    private boolean isReturn;
    private String returnReason;
    private LocalDateTime returnInitiatedTime;
    private int returnNodeId;
    private String returnStatus;
    private List<Integer> returnRoute;
    private String algorithmExplanation;
    private long computationTimeMs;
    private int nodesExplored;
    private double optimizationScore;

    public OrderFull() {
    }

    public OrderFull(String orderId, String customerId, String customerName, String customerEmail, String productUrl,
                     String productSku, String productName, double weight, double productPrice, int pickupNodeId,
                     int deliveryNodeId, String deliveryPincode, String deliveryAddress, SlaTier slaTier,
                     LocalDateTime orderTime, LocalDateTime promisedDeliveryTime, LocalDateTime actualDeliveryTime,
                     OrderStatus status, List<OrderStatusHistory> statusHistory, String assignedVehicleId,
                     String routeAlgorithm, List<Integer> plannedRoute, double estimatedDistance, double actualDistance,
                     boolean isReturn, String returnReason, LocalDateTime returnInitiatedTime, int returnNodeId,
                     String returnStatus, String algorithmExplanation, long computationTimeMs, int nodesExplored,
                     double optimizationScore) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.productUrl = productUrl;
        this.productSku = productSku;
        this.productName = productName;
        this.weight = weight;
        this.productPrice = productPrice;
        this.pickupNodeId = pickupNodeId;
        this.deliveryNodeId = deliveryNodeId;
        this.deliveryPincode = deliveryPincode;
        this.deliveryAddress = deliveryAddress;
        this.slaTier = slaTier;
        this.orderTime = orderTime;
        this.promisedDeliveryTime = promisedDeliveryTime;
        this.actualDeliveryTime = actualDeliveryTime;
        this.status = status;
        this.statusHistory = statusHistory;
        this.assignedVehicleId = assignedVehicleId;
        this.routeAlgorithm = routeAlgorithm;
        this.plannedRoute = plannedRoute;
        this.estimatedDistance = estimatedDistance;
        this.actualDistance = actualDistance;
        this.isReturn = isReturn;
        this.returnReason = returnReason;
        this.returnInitiatedTime = returnInitiatedTime;
        this.returnNodeId = returnNodeId;
        this.returnStatus = returnStatus;
        this.algorithmExplanation = algorithmExplanation;
        this.computationTimeMs = computationTimeMs;
        this.nodesExplored = nodesExplored;
        this.optimizationScore = optimizationScore;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getProductUrl() { return productUrl; }
    public void setProductUrl(String productUrl) { this.productUrl = productUrl; }
    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public double getProductPrice() { return productPrice; }
    public void setProductPrice(double productPrice) { this.productPrice = productPrice; }
    public int getPickupNodeId() { return pickupNodeId; }
    public void setPickupNodeId(int pickupNodeId) { this.pickupNodeId = pickupNodeId; }
    public int getDeliveryNodeId() { return deliveryNodeId; }
    public void setDeliveryNodeId(int deliveryNodeId) { this.deliveryNodeId = deliveryNodeId; }
    public String getDeliveryPincode() { return deliveryPincode; }
    public void setDeliveryPincode(String deliveryPincode) { this.deliveryPincode = deliveryPincode; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public SlaTier getSlaTier() { return slaTier; }
    public void setSlaTier(SlaTier slaTier) { this.slaTier = slaTier; }
    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    public LocalDateTime getPromisedDeliveryTime() { return promisedDeliveryTime; }
    public void setPromisedDeliveryTime(LocalDateTime promisedDeliveryTime) { this.promisedDeliveryTime = promisedDeliveryTime; }
    public LocalDateTime getActualDeliveryTime() { return actualDeliveryTime; }
    public void setActualDeliveryTime(LocalDateTime actualDeliveryTime) { this.actualDeliveryTime = actualDeliveryTime; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public List<OrderStatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<OrderStatusHistory> statusHistory) { this.statusHistory = statusHistory; }
    public String getAssignedVehicleId() { return assignedVehicleId; }
    public void setAssignedVehicleId(String assignedVehicleId) { this.assignedVehicleId = assignedVehicleId; }
    public String getRouteAlgorithm() { return routeAlgorithm; }
    public void setRouteAlgorithm(String routeAlgorithm) { this.routeAlgorithm = routeAlgorithm; }
    public List<Integer> getPlannedRoute() { return plannedRoute; }
    public void setPlannedRoute(List<Integer> plannedRoute) { this.plannedRoute = plannedRoute; }
    public double getEstimatedDistance() { return estimatedDistance; }
    public void setEstimatedDistance(double estimatedDistance) { this.estimatedDistance = estimatedDistance; }
    public double getActualDistance() { return actualDistance; }
    public void setActualDistance(double actualDistance) { this.actualDistance = actualDistance; }
    public boolean isReturn() { return isReturn; }
    public void setReturn(boolean aReturn) { isReturn = aReturn; }
    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }
    public LocalDateTime getReturnInitiatedTime() { return returnInitiatedTime; }
    public void setReturnInitiatedTime(LocalDateTime returnInitiatedTime) { this.returnInitiatedTime = returnInitiatedTime; }
    public int getReturnNodeId() { return returnNodeId; }
    public void setReturnNodeId(int returnNodeId) { this.returnNodeId = returnNodeId; }
    public String getReturnStatus() { return returnStatus; }
    public void setReturnStatus(String returnStatus) { this.returnStatus = returnStatus; }
    public List<Integer> getReturnRoute() { return returnRoute; }
    public void setReturnRoute(List<Integer> returnRoute) { this.returnRoute = returnRoute; }
    public String getAlgorithmExplanation() { return algorithmExplanation; }
    public void setAlgorithmExplanation(String algorithmExplanation) { this.algorithmExplanation = algorithmExplanation; }
    public long getComputationTimeMs() { return computationTimeMs; }
    public void setComputationTimeMs(long computationTimeMs) { this.computationTimeMs = computationTimeMs; }
    public int getNodesExplored() { return nodesExplored; }
    public void setNodesExplored(int nodesExplored) { this.nodesExplored = nodesExplored; }
    public double getOptimizationScore() { return optimizationScore; }
    public void setOptimizationScore(double optimizationScore) { this.optimizationScore = optimizationScore; }

    @SuppressWarnings("unused")
    public static class OrderStatusHistory {
        private LocalDateTime timestamp;
        private OrderStatus status;
        private String location;
        private String remarks;

        public OrderStatusHistory() {
        }

        public OrderStatusHistory(LocalDateTime timestamp, OrderStatus status, String location, String remarks) {
            this.timestamp = timestamp;
            this.status = status;
            this.location = location;
            this.remarks = remarks;
        }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
