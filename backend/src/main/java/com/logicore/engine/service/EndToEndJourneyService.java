package com.logicore.engine.service;

import com.logicore.engine.graph.*;
import com.logicore.engine.model.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * End-To-End Journey Service: Orchestrates complete order fulfillment
 * combining macro (inter-city) and micro (intra-city) routing.
 *
 * Flow:
 * 1. Macro Phase: Order placed in Delhi → Package routes to Pune warehouse using Bellman-Ford/Floyd-Warshall
 * 2. Transition: At Pune warehouse, calculate local delivery route to customer address
 * 3. Micro Phase: Local delivery using Dijkstra/A* and TSP optimization
 * 4. Delivery: Final drop-off at customer doorstep
 */
@Service
public class EndToEndJourneyService {
    private final DijkstraService dijkstraService;
    private final AStarService aStarService;
    private final BellmanFordService bellmanFordService;
    private final FloydWarshallService floydWarshallService;
    private final LocalDeliveryService localDeliveryService;
    private final LogisticsGraph logisticsGraph;

    public EndToEndJourneyService(DijkstraService dijkstraService,
                                   AStarService aStarService,
                                   BellmanFordService bellmanFordService,
                                   FloydWarshallService floydWarshallService,
                                   LocalDeliveryService localDeliveryService,
                                   LogisticsGraph logisticsGraph) {
        this.dijkstraService = dijkstraService;
        this.aStarService = aStarService;
        this.bellmanFordService = bellmanFordService;
        this.floydWarshallService = floydWarshallService;
        this.localDeliveryService = localDeliveryService;
        this.logisticsGraph = logisticsGraph;
    }

    /**
     * Initiates end-to-end journey combining macro and micro routing
     *
     * @param originCityId Delhi warehouse (city network node ID)
     * @param destinationCityId Pune warehouse (city network node ID)
     * @param deliveryAddresses 3-4 customer addresses in Pune
     * @param primaryAlgorithmMacro "BELLMAN_FORD" or "FLOYD_WARSHALL"
     * @param secondaryAlgorithmMicro "DIJKSTRA" or "A_STAR"
     * @return Complete journey state with both macro and micro phases
     */
    public EndToEndJourneyState initiateJourney(
            int originCityId,
            int destinationCityId,
            List<LocalDeliveryStop> deliveryAddresses,
            String primaryAlgorithmMacro,
            String secondaryAlgorithmMicro) {

        String journeyId = "JRN-" + System.currentTimeMillis();
        EndToEndJourneyState journey = new EndToEndJourneyState(journeyId, null);

        // ============== PHASE 1: MACRO ROUTING (INTER-CITY) ==============
        journey.setMacroOriginCityId(originCityId);
        journey.setMacroDestinationCityId(destinationCityId);

        RouteTrace macroTrace = null;
        long macroStartTime = System.currentTimeMillis();

        if ("FLOYD_WARSHALL".equalsIgnoreCase(primaryAlgorithmMacro)) {
            macroTrace = floydWarshallService.computeAllPairs(logisticsGraph, originCityId, destinationCityId);
            journey.setMacroAlgorithmUsed("FLOYD_WARSHALL");
        } else {
            macroTrace = bellmanFordService.compute(logisticsGraph, originCityId, destinationCityId);
            journey.setMacroAlgorithmUsed("BELLMAN_FORD");
        }

        journey.setMacroComputationTimeMs(System.currentTimeMillis() - macroStartTime);
        journey.setMacroRoute(macroTrace.getPath());
        journey.setMacroTotalDistance(macroTrace.getTotalDistance());
        journey.setMacroNodesExplored(macroTrace.getPath().size());
        journey.setCurrentPhase(EndToEndJourneyState.JourneyPhase.IN_MACRO_TRANSIT);
        journey.setStatusMessage("📦 Inter-city transit: " + primaryAlgorithmMacro + " route calculated");

        // ============== PHASE 2: MICRO ROUTING (INTRA-CITY) ==============
        // Create warehouse node for Pune (destination city)
        LocalDeliveryStop puneWarehouse = new LocalDeliveryStop();
        puneWarehouse.setId("warehouse-" + destinationCityId);
        puneWarehouse.setName("Pune Central Warehouse (Node " + destinationCityId + ")");
        puneWarehouse.setLatitude(18.5204);
        puneWarehouse.setLongitude(73.8567);
        puneWarehouse.setType("warehouse");

        journey.setMicroWarehouse(puneWarehouse);
        journey.setMicroDeliveryAddresses(deliveryAddresses);

        // Calculate optimal route for local delivery
        long microStartTime = System.currentTimeMillis();

        List<LocalDeliveryStop> optimalRoute = localDeliveryService.calculateOptimalRoute(
                "PUNE",
                puneWarehouse,
                deliveryAddresses,
                secondaryAlgorithmMicro
        );

        journey.setMicroComputationTimeMs(System.currentTimeMillis() - microStartTime);
        journey.setMicroOptimalRoute(optimalRoute);
        journey.setMicroTotalDistance(localDeliveryService.calculateTotalDistance(optimalRoute));
        journey.setMicroAlgorithmUsed(secondaryAlgorithmMicro);
        journey.setMicroNodesExplored(optimalRoute.size());

        // Calculate initial progress (50% macro + 50% micro split)
        double macroProgress = 0.0; // Starting at origin
        double microProgress = 0.0; // Destination not yet reached
        journey.setOverallProgressPercentage((macroProgress + microProgress) * 100 / 2);

        journey.setUpdatedAtMs(System.currentTimeMillis());

        return journey;
    }

    /**
     * Advances journey one step in macro phase
     *
     * @param journey Current journey state
     * @return Updated journey state with next macro position
     */
    public EndToEndJourneyState advanceMacroStep(EndToEndJourneyState journey) {
        List<Integer> macroRoute = journey.getMacroRoute();

        if (journey.getMacroCurrentStepIndex() >= macroRoute.size() - 1) {
            // Macro phase complete, transition to micro
            journey.setCurrentPhase(EndToEndJourneyState.JourneyPhase.ARRIVED_AT_HUB);
            journey.setStatusMessage("✓ Package arrived at Pune warehouse. Initiating local delivery.");
            journey.setMacroDistanceTraveled(journey.getMacroTotalDistance());
            journey.setMacroCurrentStepIndex(macroRoute.size() - 1);
        } else {
            journey.setMacroCurrentStepIndex(journey.getMacroCurrentStepIndex() + 1);
            // Calculate distance traveled
            double distancePerStep = journey.getMacroTotalDistance() / (macroRoute.size() - 1);
            journey.setMacroDistanceTraveled(distancePerStep * journey.getMacroCurrentStepIndex());
        }

        recalculateOverallProgress(journey);
        journey.setUpdatedAtMs(System.currentTimeMillis());
        return journey;
    }

    /**
     * Advances journey one step in micro phase
     *
     * @param journey Current journey state
     * @return Updated journey state with next micro position
     */
    public EndToEndJourneyState advanceMicroStep(EndToEndJourneyState journey) {
        List<LocalDeliveryStop> microRoute = journey.getMicroOptimalRoute();

        if (journey.getMicroCurrentStepIndex() >= microRoute.size() - 1) {
            // Micro phase complete
            journey.setCurrentPhase(EndToEndJourneyState.JourneyPhase.DELIVERED);
            journey.setStatusMessage("✓ Order delivered! Journey complete.");
            journey.setMicroDistanceTraveled(journey.getMicroTotalDistance());
            journey.setMicroCurrentStepIndex(microRoute.size() - 1);
            journey.setOverallProgressPercentage(100.0);
        } else {
            journey.setMicroCurrentStepIndex(journey.getMicroCurrentStepIndex() + 1);
            // Calculate distance traveled
            double distancePerStep = journey.getMicroTotalDistance() / (microRoute.size() - 1);
            journey.setMicroDistanceTraveled(distancePerStep * journey.getMicroCurrentStepIndex());

            if (journey.getMicroCurrentStepIndex() >= 1) {
                journey.setCurrentPhase(EndToEndJourneyState.JourneyPhase.IN_MICRO_TRANSIT);
            }
        }

        recalculateOverallProgress(journey);
        journey.setUpdatedAtMs(System.currentTimeMillis());
        return journey;
    }

    /**
     * Recalculates overall progress as weighted combination of macro and micro phases
     * Macro: 0-50% of overall progress
     * Micro: 50-100% of overall progress
     */
    private void recalculateOverallProgress(EndToEndJourneyState journey) {
        double macroPhaseProgress = 0.0;
        if (journey.getMacroTotalDistance() > 0) {
            macroPhaseProgress = Math.min(1.0, journey.getMacroDistanceTraveled() / journey.getMacroTotalDistance());
        }

        double microPhaseProgress = 0.0;
        if (journey.getCurrentPhase() != EndToEndJourneyState.JourneyPhase.IN_MACRO_TRANSIT &&
            journey.getCurrentPhase() != EndToEndJourneyState.JourneyPhase.INITIATED) {
            if (journey.getMicroTotalDistance() > 0) {
                microPhaseProgress = Math.min(1.0, journey.getMicroDistanceTraveled() / journey.getMicroTotalDistance());
            }
        }

        // Weighted: 40% macro + 60% micro
        double overallProgress = (macroPhaseProgress * 0.4) + (microPhaseProgress * 0.6);
        journey.setOverallProgressPercentage(Math.min(100.0, overallProgress * 100));
    }

    /**
     * Gets audit data for AlgorithmAuditPanel
     */
    public Map<String, Object> getAuditData(EndToEndJourneyState journey) {
        Map<String, Object> audit = new LinkedHashMap<>();

        audit.put("journeyPhase", journey.getCurrentPhase().name());
        audit.put("statusMessage", journey.getStatusMessage());

        // Macro phase audit
        Map<String, Object> macroAudit = new LinkedHashMap<>();
        macroAudit.put("algorithm", journey.getMacroAlgorithmUsed());
        macroAudit.put("type", "MACRO (Inter-City)");
        macroAudit.put("distanceTraveled", String.format("%.2f km", journey.getMacroDistanceTraveled()));
        macroAudit.put("totalDistance", String.format("%.2f km", journey.getMacroTotalDistance()));
        macroAudit.put("executionTimeMs", journey.getMacroComputationTimeMs());
        macroAudit.put("nodesExplored", journey.getMacroNodesExplored());
        audit.put("macroPhase", macroAudit);

        // Micro phase audit
        Map<String, Object> microAudit = new LinkedHashMap<>();
        microAudit.put("algorithm", journey.getMicroAlgorithmUsed());
        microAudit.put("type", "MICRO (Intra-City)");
        microAudit.put("distanceTraveled", String.format("%.2f km", journey.getMicroDistanceTraveled()));
        microAudit.put("totalDistance", String.format("%.2f km", journey.getMicroTotalDistance()));
        microAudit.put("executionTimeMs", journey.getMicroComputationTimeMs());
        microAudit.put("nodesExplored", journey.getMicroNodesExplored());
        audit.put("microPhase", microAudit);

        audit.put("overallProgress", String.format("%.1f%%", journey.getOverallProgressPercentage()));

        return audit;
    }

    /**
     * Gets current position for macro visualization (city node ID)
     */
    public int getCurrentMacroNodeId(EndToEndJourneyState journey) {
        List<Integer> route = journey.getMacroRoute();
        int index = journey.getMacroCurrentStepIndex();
        if (index >= 0 && index < route.size()) {
            return route.get(index);
        }
        return journey.getMacroDestinationCityId();
    }

    /**
     * Gets current position for micro visualization (coordinates)
     */
    public LocalDeliveryStop getCurrentMicroLocation(EndToEndJourneyState journey) {
        List<LocalDeliveryStop> route = journey.getMicroOptimalRoute();
        int index = journey.getMicroCurrentStepIndex();
        if (index >= 0 && index < route.size()) {
            return route.get(index);
        }
        return journey.getMicroWarehouse();
    }
}
