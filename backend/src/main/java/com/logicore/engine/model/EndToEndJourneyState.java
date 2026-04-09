package com.logicore.engine.model;

import java.util.List;

/**
 * EndToEndJourneyState - Represents the full logistics lifecycle state
 */
public class EndToEndJourneyState {

    public enum JourneyPhase {
        INITIATED, IN_MACRO_TRANSIT, ARRIVED_AT_HUB, IN_MICRO_TRANSIT, DELIVERED
    }

    private String journeyId;
    private JourneyPhase currentPhase;

    // Macro phase fields
    private int macroOriginCityId;
    private int macroDestinationCityId;
    private List<Integer> macroRoute;
    private int macroCurrentStepIndex;
    private double macroTotalDistance;
    private double macroDistanceTraveled;
    private String macroAlgorithmUsed;
    private long macroComputationTimeMs;
    private int macroNodesExplored;

    // Micro phase fields
    private LocalDeliveryStop microWarehouse;
    private List<LocalDeliveryStop> microDeliveryAddresses;
    private List<LocalDeliveryStop> microOptimalRoute;
    private int microCurrentStepIndex;
    private double microTotalDistance;
    private double microDistanceTraveled;
    private String microAlgorithmUsed;
    private long microComputationTimeMs;
    private int microNodesExplored;

    // Progress
    private double overallProgressPercentage;
    private String statusMessage;
    private long createdAtMs;
    private long updatedAtMs;

    public EndToEndJourneyState() {
        this.createdAtMs = System.currentTimeMillis();
        this.updatedAtMs = this.createdAtMs;
    }

    // Getters and Setters
    public String getJourneyId() {
        return journeyId;
    }

    public void setJourneyId(String journeyId) {
        this.journeyId = journeyId;
    }

    public JourneyPhase getCurrentPhase() {
        return currentPhase;
    }

    public void setCurrentPhase(JourneyPhase currentPhase) {
        this.currentPhase = currentPhase;
    }

    public int getMacroOriginCityId() {
        return macroOriginCityId;
    }

    public void setMacroOriginCityId(int macroOriginCityId) {
        this.macroOriginCityId = macroOriginCityId;
    }

    public int getMacroDestinationCityId() {
        return macroDestinationCityId;
    }

    public void setMacroDestinationCityId(int macroDestinationCityId) {
        this.macroDestinationCityId = macroDestinationCityId;
    }

    public List<Integer> getMacroRoute() {
        return macroRoute;
    }

    public void setMacroRoute(List<Integer> macroRoute) {
        this.macroRoute = macroRoute;
    }

    public int getMacroCurrentStepIndex() {
        return macroCurrentStepIndex;
    }

    public void setMacroCurrentStepIndex(int macroCurrentStepIndex) {
        this.macroCurrentStepIndex = macroCurrentStepIndex;
    }

    public double getMacroTotalDistance() {
        return macroTotalDistance;
    }

    public void setMacroTotalDistance(double macroTotalDistance) {
        this.macroTotalDistance = macroTotalDistance;
    }

    public double getMacroDistanceTraveled() {
        return macroDistanceTraveled;
    }

    public void setMacroDistanceTraveled(double macroDistanceTraveled) {
        this.macroDistanceTraveled = macroDistanceTraveled;
    }

    public String getMacroAlgorithmUsed() {
        return macroAlgorithmUsed;
    }

    public void setMacroAlgorithmUsed(String macroAlgorithmUsed) {
        this.macroAlgorithmUsed = macroAlgorithmUsed;
    }

    public long getMacroComputationTimeMs() {
        return macroComputationTimeMs;
    }

    public void setMacroComputationTimeMs(long macroComputationTimeMs) {
        this.macroComputationTimeMs = macroComputationTimeMs;
    }

    public int getMacroNodesExplored() {
        return macroNodesExplored;
    }

    public void setMacroNodesExplored(int macroNodesExplored) {
        this.macroNodesExplored = macroNodesExplored;
    }

    public LocalDeliveryStop getMicroWarehouse() {
        return microWarehouse;
    }

    public void setMicroWarehouse(LocalDeliveryStop microWarehouse) {
        this.microWarehouse = microWarehouse;
    }

    public List<LocalDeliveryStop> getMicroDeliveryAddresses() {
        return microDeliveryAddresses;
    }

    public void setMicroDeliveryAddresses(List<LocalDeliveryStop> microDeliveryAddresses) {
        this.microDeliveryAddresses = microDeliveryAddresses;
    }

    public List<LocalDeliveryStop> getMicroOptimalRoute() {
        return microOptimalRoute;
    }

    public void setMicroOptimalRoute(List<LocalDeliveryStop> microOptimalRoute) {
        this.microOptimalRoute = microOptimalRoute;
    }

    public int getMicroCurrentStepIndex() {
        return microCurrentStepIndex;
    }

    public void setMicroCurrentStepIndex(int microCurrentStepIndex) {
        this.microCurrentStepIndex = microCurrentStepIndex;
    }

    public double getMicroTotalDistance() {
        return microTotalDistance;
    }

    public void setMicroTotalDistance(double microTotalDistance) {
        this.microTotalDistance = microTotalDistance;
    }

    public double getMicroDistanceTraveled() {
        return microDistanceTraveled;
    }

    public void setMicroDistanceTraveled(double microDistanceTraveled) {
        this.microDistanceTraveled = microDistanceTraveled;
    }

    public String getMicroAlgorithmUsed() {
        return microAlgorithmUsed;
    }

    public void setMicroAlgorithmUsed(String microAlgorithmUsed) {
        this.microAlgorithmUsed = microAlgorithmUsed;
    }

    public long getMicroComputationTimeMs() {
        return microComputationTimeMs;
    }

    public void setMicroComputationTimeMs(long microComputationTimeMs) {
        this.microComputationTimeMs = microComputationTimeMs;
    }

    public int getMicroNodesExplored() {
        return microNodesExplored;
    }

    public void setMicroNodesExplored(int microNodesExplored) {
        this.microNodesExplored = microNodesExplored;
    }

    public double getOverallProgressPercentage() {
        return overallProgressPercentage;
    }

    public void setOverallProgressPercentage(double overallProgressPercentage) {
        this.overallProgressPercentage = overallProgressPercentage;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public long getCreatedAtMs() {
        return createdAtMs;
    }

    public void setCreatedAtMs(long createdAtMs) {
        this.createdAtMs = createdAtMs;
    }

    public long getUpdatedAtMs() {
        return updatedAtMs;
    }

    public void setUpdatedAtMs(long updatedAtMs) {
        this.updatedAtMs = updatedAtMs;
    }
}
