package com.logicore.engine.model;

import java.util.List;

/**
 * Represents the state of an End-to-End journey combining macro (inter-city) and micro (intra-city) phases.
 */
public class EndToEndJourneyState {
    public enum JourneyPhase {
        INITIATED,        // Macro routing initiated (Delhi → Pune)
        IN_MACRO_TRANSIT, // Package traveling through intermediate cities
        ARRIVED_AT_HUB,   // Package arrived at destination warehouse
        IN_MICRO_TRANSIT, // Local delivery in progress (Pune warehouse → customer address)
        DELIVERED         // Final delivery complete
    }

    private String journeyId;
    private String orderId;
    private JourneyPhase currentPhase;
    
    // Macro phase (Inter-city)
    private int macroOriginCityId;        // Delhi warehouse node ID
    private int macroDestinationCityId;   // Pune warehouse node ID
    private List<Integer> macroRoute;     // Full path: Delhi → intermediate cities → Pune
    private int macroCurrentStepIndex;    // Current position in macro route
    private double macroTotalDistance;    // Total inter-city distance (km)
    private double macroDistanceTraveled; // Distance completed so far
    private String macroAlgorithmUsed;    // "BELLMAN_FORD" or "FLOYD_WARSHALL"
    private long macroComputationTimeMs;  // Algorithm execution time
    private int macroNodesExplored;       // For audit panel
    
    // Micro phase (Intra-city)
    private LocalDeliveryStop microWarehouse;        // Destination city warehouse (Pune)
    private List<LocalDeliveryStop> microDeliveryAddresses;  // Customer addresses in Pune
    private List<LocalDeliveryStop> microOptimalRoute;       // TSP-optimized route
    private int microCurrentStepIndex;    // Current stop in intra-city route
    private double microTotalDistance;    // Intra-city delivery distance (km)
    private double microDistanceTraveled; // Distance completed in intra-city
    private String microAlgorithmUsed;    // "DIJKSTRA" or "A_STAR"
    private long microComputationTimeMs;  // Algorithm execution time
    private int microNodesExplored;       // For audit panel
    
    // Progress tracking
    private double overallProgressPercentage;  // 0-100%
    private String statusMessage;              // Current status for UI
    private long createdAtMs;
    private long updatedAtMs;

    // Constructors
    public EndToEndJourneyState() {
    }

    public EndToEndJourneyState(String journeyId, String orderId) {
        this.journeyId = journeyId;
        this.orderId = orderId;
        this.currentPhase = JourneyPhase.INITIATED;
        this.macroCurrentStepIndex = 0;
        this.microCurrentStepIndex = 0;
        this.overallProgressPercentage = 0;
        this.statusMessage = "Journey initiated";
        this.createdAtMs = System.currentTimeMillis();
        this.updatedAtMs = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getJourneyId() { return journeyId; }
    public void setJourneyId(String journeyId) { this.journeyId = journeyId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public JourneyPhase getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(JourneyPhase currentPhase) { this.currentPhase = currentPhase; }

    public int getMacroOriginCityId() { return macroOriginCityId; }
    public void setMacroOriginCityId(int macroOriginCityId) { this.macroOriginCityId = macroOriginCityId; }

    public int getMacroDestinationCityId() { return macroDestinationCityId; }
    public void setMacroDestinationCityId(int macroDestinationCityId) { this.macroDestinationCityId = macroDestinationCityId; }

    public List<Integer> getMacroRoute() { return macroRoute; }
    public void setMacroRoute(List<Integer> macroRoute) { this.macroRoute = macroRoute; }

    public int getMacroCurrentStepIndex() { return macroCurrentStepIndex; }
    public void setMacroCurrentStepIndex(int macroCurrentStepIndex) { this.macroCurrentStepIndex = macroCurrentStepIndex; }

    public double getMacroTotalDistance() { return macroTotalDistance; }
    public void setMacroTotalDistance(double macroTotalDistance) { this.macroTotalDistance = macroTotalDistance; }

    public double getMacroDistanceTraveled() { return macroDistanceTraveled; }
    public void setMacroDistanceTraveled(double macroDistanceTraveled) { this.macroDistanceTraveled = macroDistanceTraveled; }

    public String getMacroAlgorithmUsed() { return macroAlgorithmUsed; }
    public void setMacroAlgorithmUsed(String macroAlgorithmUsed) { this.macroAlgorithmUsed = macroAlgorithmUsed; }

    public long getMacroComputationTimeMs() { return macroComputationTimeMs; }
    public void setMacroComputationTimeMs(long macroComputationTimeMs) { this.macroComputationTimeMs = macroComputationTimeMs; }

    public int getMacroNodesExplored() { return macroNodesExplored; }
    public void setMacroNodesExplored(int macroNodesExplored) { this.macroNodesExplored = macroNodesExplored; }

    public LocalDeliveryStop getMicroWarehouse() { return microWarehouse; }
    public void setMicroWarehouse(LocalDeliveryStop microWarehouse) { this.microWarehouse = microWarehouse; }

    public List<LocalDeliveryStop> getMicroDeliveryAddresses() { return microDeliveryAddresses; }
    public void setMicroDeliveryAddresses(List<LocalDeliveryStop> microDeliveryAddresses) { this.microDeliveryAddresses = microDeliveryAddresses; }

    public List<LocalDeliveryStop> getMicroOptimalRoute() { return microOptimalRoute; }
    public void setMicroOptimalRoute(List<LocalDeliveryStop> microOptimalRoute) { this.microOptimalRoute = microOptimalRoute; }

    public int getMicroCurrentStepIndex() { return microCurrentStepIndex; }
    public void setMicroCurrentStepIndex(int microCurrentStepIndex) { this.microCurrentStepIndex = microCurrentStepIndex; }

    public double getMicroTotalDistance() { return microTotalDistance; }
    public void setMicroTotalDistance(double microTotalDistance) { this.microTotalDistance = microTotalDistance; }

    public double getMicroDistanceTraveled() { return microDistanceTraveled; }
    public void setMicroDistanceTraveled(double microDistanceTraveled) { this.microDistanceTraveled = microDistanceTraveled; }

    public String getMicroAlgorithmUsed() { return microAlgorithmUsed; }
    public void setMicroAlgorithmUsed(String microAlgorithmUsed) { this.microAlgorithmUsed = microAlgorithmUsed; }

    public long getMicroComputationTimeMs() { return microComputationTimeMs; }
    public void setMicroComputationTimeMs(long microComputationTimeMs) { this.microComputationTimeMs = microComputationTimeMs; }

    public int getMicroNodesExplored() { return microNodesExplored; }
    public void setMicroNodesExplored(int microNodesExplored) { this.microNodesExplored = microNodesExplored; }

    public double getOverallProgressPercentage() { return overallProgressPercentage; }
    public void setOverallProgressPercentage(double overallProgressPercentage) { this.overallProgressPercentage = overallProgressPercentage; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public long getCreatedAtMs() { return createdAtMs; }
    public void setCreatedAtMs(long createdAtMs) { this.createdAtMs = createdAtMs; }

    public long getUpdatedAtMs() { return updatedAtMs; }
    public void setUpdatedAtMs(long updatedAtMs) { this.updatedAtMs = updatedAtMs; }
}
