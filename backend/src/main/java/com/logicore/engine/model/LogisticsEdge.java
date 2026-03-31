package com.logicore.engine.model;

@SuppressWarnings("unused")
public class LogisticsEdge {
    private int from;
    private int to;
    private double distanceKm;
    private double trafficScore; // 1.0 = clear, >1.0 = heavy traffic

    public LogisticsEdge() {
    }

    public LogisticsEdge(int from, int to, double distanceKm, double trafficScore) {
        this.from = from;
        this.to = to;
        this.distanceKm = distanceKm;
        this.trafficScore = trafficScore;
    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getTo() {
        return to;
    }

    public void setTo(int to) {
        this.to = to;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getTrafficScore() {
        return trafficScore;
    }

    public void setTrafficScore(double trafficScore) {
        this.trafficScore = trafficScore;
    }
    
    public double getTravelTimeMin() {
        // Simple formula: distance * traffic factor
        return distanceKm * trafficScore * 1.2; 
    }
}
