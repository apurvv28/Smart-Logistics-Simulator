package com.logicore.engine.model;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
public class RouteTrace {
    private int sourceId;
    private int targetId;
    private List<Integer> path;
    private double totalDistance;
    private List<Step> steps;
    private String algorithmName;
    private long executionTimeMs;
    private int nodesExplored;

    public RouteTrace() {
    }

    public RouteTrace(int sourceId, int targetId, List<Integer> path, double totalDistance, List<Step> steps,
                      String algorithmName, long executionTimeMs, int nodesExplored) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.path = path;
        this.totalDistance = totalDistance;
        this.steps = steps;
        this.algorithmName = algorithmName;
        this.executionTimeMs = executionTimeMs;
        this.nodesExplored = nodesExplored;
    }

    public int getSourceId() {
        return sourceId;
    }

    public void setSourceId(int sourceId) {
        this.sourceId = sourceId;
    }

    public int getTargetId() {
        return targetId;
    }

    public void setTargetId(int targetId) {
        this.targetId = targetId;
    }

    public List<Integer> getPath() {
        return path;
    }

    public void setPath(List<Integer> path) {
        this.path = path;
    }

    public double getTotalDistance() {
        return totalDistance;
    }

    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public int getNodesExplored() {
        return nodesExplored;
    }

    public void setNodesExplored(int nodesExplored) {
        this.nodesExplored = nodesExplored;
    }

    @SuppressWarnings("unused")
    public static class Step {
        private int nodeId;
        private String action; // "VISITING", "RELAXING", "SETTLED"
        private Map<Integer, Double> currentDistances;

        public Step() {
        }

        public Step(int nodeId, String action, Map<Integer, Double> currentDistances) {
            this.nodeId = nodeId;
            this.action = action;
            this.currentDistances = currentDistances;
        }

        public int getNodeId() {
            return nodeId;
        }

        public void setNodeId(int nodeId) {
            this.nodeId = nodeId;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public Map<Integer, Double> getCurrentDistances() {
            return currentDistances;
        }

        public void setCurrentDistances(Map<Integer, Double> currentDistances) {
            this.currentDistances = currentDistances;
        }
    }
}
