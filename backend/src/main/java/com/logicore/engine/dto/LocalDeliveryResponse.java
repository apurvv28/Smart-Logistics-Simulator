package com.logicore.engine.dto;

import java.util.List;
import com.logicore.engine.model.LocalDeliveryStop;

/**
 * LocalDeliveryResponse - DTO for intra-city delivery route calculation responses
 */
public class LocalDeliveryResponse {
    private String status;
    private List<LocalDeliveryStop> route;
    private double totalDistance;
    private int stopCount;
    private String algorithm;

    // Constructors
    public LocalDeliveryResponse() {}

    public LocalDeliveryResponse(String status, List<LocalDeliveryStop> route,
                                double totalDistance, int stopCount, String algorithm) {
        this.status = status;
        this.route = route;
        this.totalDistance = totalDistance;
        this.stopCount = stopCount;
        this.algorithm = algorithm;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<LocalDeliveryStop> getRoute() {
        return route;
    }

    public void setRoute(List<LocalDeliveryStop> route) {
        this.route = route;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public int getStopCount() {
        return stopCount;
    }

    public void setStopCount(int stopCount) {
        this.stopCount = stopCount;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    @Override
    public String toString() {
        return "LocalDeliveryResponse{" +
                "status='" + status + '\'' +
                ", route=" + route +
                ", totalDistance=" + totalDistance +
                ", stopCount=" + stopCount +
                ", algorithm='" + algorithm + '\'' +
                '}';
    }
}
