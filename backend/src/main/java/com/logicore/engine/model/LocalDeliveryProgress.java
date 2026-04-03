package com.logicore.engine.model;

import java.util.List;

/**
 * LocalDeliveryProgress - Represents progress state of a delivery route
 * Tracks current position, delivered parcels, and ETA
 */
public class LocalDeliveryProgress {
    private String deliveryId;
    private String orderId;
    private int currentStepIndex;
    private LocalDeliveryStop currentStop;
    private List<LocalDeliveryStop> route;
    private List<String> deliveredStopIds;
    private double progressPercentage;
    private double totalDistance;
    private double distanceCovered;
    private long estimatedTimeRemainingMs;
    private String status; // INITIATED, IN_TRANSIT, COMPLETED
    private long createdAtMs;
    private long updatedAtMs;

    public LocalDeliveryProgress() {
        this.createdAtMs = System.currentTimeMillis();
        this.updatedAtMs = System.currentTimeMillis();
        this.status = "INITIATED";
        this.currentStepIndex = 0;
        this.progressPercentage = 0.0;
    }

    public LocalDeliveryProgress(String deliveryId, String orderId, List<LocalDeliveryStop> route, double totalDistance) {
        this();
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.route = route;
        this.totalDistance = totalDistance;
        if (!route.isEmpty()) {
            this.currentStop = route.get(0);
        }
    }

    // Getters and Setters
    public String getDeliveryId() { return deliveryId; }
    public void setDeliveryId(String deliveryId) { this.deliveryId = deliveryId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public int getCurrentStepIndex() { return currentStepIndex; }
    public void setCurrentStepIndex(int currentStepIndex) { this.currentStepIndex = currentStepIndex; }

    public LocalDeliveryStop getCurrentStop() { return currentStop; }
    public void setCurrentStop(LocalDeliveryStop currentStop) { this.currentStop = currentStop; }

    public List<LocalDeliveryStop> getRoute() { return route; }
    public void setRoute(List<LocalDeliveryStop> route) { this.route = route; }

    public List<String> getDeliveredStopIds() { return deliveredStopIds; }
    public void setDeliveredStopIds(List<String> deliveredStopIds) { this.deliveredStopIds = deliveredStopIds; }

    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }

    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }

    public double getDistanceCovered() { return distanceCovered; }
    public void setDistanceCovered(double distanceCovered) { this.distanceCovered = distanceCovered; }

    public long getEstimatedTimeRemainingMs() { return estimatedTimeRemainingMs; }
    public void setEstimatedTimeRemainingMs(long estimatedTimeRemainingMs) { this.estimatedTimeRemainingMs = estimatedTimeRemainingMs; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getCreatedAtMs() { return createdAtMs; }
    public void setCreatedAtMs(long createdAtMs) { this.createdAtMs = createdAtMs; }

    public long getUpdatedAtMs() { return updatedAtMs; }
    public void setUpdatedAtMs(long updatedAtMs) { this.updatedAtMs = updatedAtMs; }

    @Override
    public String toString() {
        return "LocalDeliveryProgress{" +
                "deliveryId='" + deliveryId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", currentStepIndex=" + currentStepIndex +
                ", progressPercentage=" + progressPercentage +
                ", status='" + status + '\'' +
                '}';
    }
}
