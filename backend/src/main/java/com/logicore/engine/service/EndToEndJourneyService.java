package com.logicore.engine.service;

import com.logicore.engine.graph.*;
import com.logicore.engine.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EndToEndJourneyService {
    private final DijkstraService dijkstraService;
    private final AStarService aStarService;
    private final BellmanFordService bellmanFordService;
    private final FloydWarshallService floydWarshallService;
    private final LocalDeliveryService localDeliveryService;
    private final LogisticsGraph logisticsGraph;

    private final Map<String, EndToEndJourneyState> journeyStore = new HashMap<>();

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

    public EndToEndJourneyState initiateJourney(int originId, int destId, String macroAlgo, String microAlgo, List<LocalDeliveryStop> deliveryAddresses) {
        String journeyId = "JRN-" + System.currentTimeMillis();
        EndToEndJourneyState state = new EndToEndJourneyState();
        state.setJourneyId(journeyId);
        state.setMacroOriginCityId(originId);
        state.setMacroDestinationCityId(destId);
        state.setMacroAlgorithmUsed(macroAlgo);
        state.setMicroAlgorithmUsed(microAlgo);
        state.setMicroDeliveryAddresses(deliveryAddresses);
        state.setCurrentPhase(EndToEndJourneyState.JourneyPhase.INITIATED);

        // Macro Phase Calculation
        long macroStart = System.currentTimeMillis();
        RouteTrace macroTrace;
        if ("FLOYD_WARSHALL".equalsIgnoreCase(macroAlgo)) {
            macroTrace = floydWarshallService.computeAllPairs(logisticsGraph, originId, destId);
        } else {
            macroTrace = bellmanFordService.compute(logisticsGraph, originId, destId);
        }
        state.setMacroComputationTimeMs(System.currentTimeMillis() - macroStart);
        state.setMacroRoute(macroTrace.getPath());
        state.setMacroTotalDistance(macroTrace.getTotalDistance());
        state.setMacroNodesExplored(macroTrace.getNodesExplored());
        state.setMacroCurrentStepIndex(0);
        state.setMacroDistanceTraveled(0.0);

        // Micro Phase Setup
        String cityCode = getCityCode(destId);
        LocalDeliveryStop warehouse = localDeliveryService.getWarehouseForCity(cityCode);
        state.setMicroWarehouse(warehouse);

        long microStart = System.currentTimeMillis();
        List<LocalDeliveryStop> optimalMicroRoute = localDeliveryService.calculateOptimalRoute(
                cityCode, warehouse, deliveryAddresses, microAlgo
        );
        state.setMicroComputationTimeMs(System.currentTimeMillis() - microStart);
        state.setMicroOptimalRoute(optimalMicroRoute);
        state.setMicroTotalDistance(localDeliveryService.calculateTotalDistance(optimalMicroRoute));
        state.setMicroNodesExplored(optimalMicroRoute.size());
        state.setMicroCurrentStepIndex(0);
        state.setMicroDistanceTraveled(0.0);

        state.setCurrentPhase(EndToEndJourneyState.JourneyPhase.IN_MACRO_TRANSIT);
        state.setStatusMessage("Inter-city transit: " + macroAlgo + " route calculated. " + state.getMacroRoute().size() + " cities en route.");
        
        recalculateOverallProgress(state);
        journeyStore.put(journeyId, state);
        return state;
    }

    public EndToEndJourneyState advanceStep(String journeyId) {
        EndToEndJourneyState state = journeyStore.get(journeyId);
        if (state == null) return null;

        if (state.getCurrentPhase() == EndToEndJourneyState.JourneyPhase.IN_MACRO_TRANSIT) {
            state.setMacroCurrentStepIndex(state.getMacroCurrentStepIndex() + 1);
            
            // Simplified distance increment
            double progress = (double) state.getMacroCurrentStepIndex() / (state.getMacroRoute().size() - 1);
            state.setMacroDistanceTraveled(state.getMacroTotalDistance() * Math.min(1.0, progress));

            if (state.getMacroCurrentStepIndex() >= state.getMacroRoute().size() - 1) {
                state.setCurrentPhase(EndToEndJourneyState.JourneyPhase.ARRIVED_AT_HUB);
                state.setStatusMessage("Package arrived at destination hub. Starting local delivery.");
            } else {
                int currentCityId = state.getMacroRoute().get(state.getMacroCurrentStepIndex());
                state.setStatusMessage("In transit: Arrived at city node " + currentCityId);
            }
        } else if (state.getCurrentPhase() == EndToEndJourneyState.JourneyPhase.ARRIVED_AT_HUB) {
            state.setCurrentPhase(EndToEndJourneyState.JourneyPhase.IN_MICRO_TRANSIT);
            state.setMicroCurrentStepIndex(0);
            state.setMicroDistanceTraveled(0.0);
            state.setStatusMessage("Local delivery initiated in destination city.");
        } else if (state.getCurrentPhase() == EndToEndJourneyState.JourneyPhase.IN_MICRO_TRANSIT) {
            state.setMicroCurrentStepIndex(state.getMicroCurrentStepIndex() + 1);
            
            double progress = (double) state.getMicroCurrentStepIndex() / (state.getMicroOptimalRoute().size() - 1);
            state.setMicroDistanceTraveled(state.getMicroTotalDistance() * Math.min(1.0, progress));

            if (state.getMicroCurrentStepIndex() >= state.getMicroOptimalRoute().size() - 1) {
                state.setCurrentPhase(EndToEndJourneyState.JourneyPhase.DELIVERED);
                state.setStatusMessage("✅ All deliveries complete. Van returned to warehouse.");
            } else {
                state.setStatusMessage("Delivering: Stop " + state.getMicroCurrentStepIndex() + " of " + (state.getMicroOptimalRoute().size() - 1));
            }
        }

        recalculateOverallProgress(state);
        state.setUpdatedAtMs(System.currentTimeMillis());
        journeyStore.put(journeyId, state);
        return state;
    }

    public void recalculateOverallProgress(EndToEndJourneyState state) {
        double macroContrib = ((double) state.getMacroCurrentStepIndex() / (state.getMacroRoute().size() - 1 + 1)) * 40; // Adjusted for 1-based index roughly
        if (state.getMacroCurrentStepIndex() >= state.getMacroRoute().size() - 1) macroContrib = 40.0;

        double microContrib = 0;
        if (state.getMicroOptimalRoute() != null && !state.getMicroOptimalRoute().isEmpty()) {
            microContrib = ((double) state.getMicroCurrentStepIndex() / (state.getMicroOptimalRoute().size() - 1)) * 60;
        }
        double total = macroContrib + microContrib;
        state.setOverallProgressPercentage(Math.min(100.0, total));
    }

    public Map<String, Object> getAuditData(String journeyId) {
        EndToEndJourneyState journey = journeyStore.get(journeyId);
        if (journey == null) return null;

        Map<String, Object> audit = new LinkedHashMap<>();
        audit.put("currentPhase", journey.getCurrentPhase().name());
        audit.put("statusMessage", journey.getStatusMessage());
        
        Map<String, Object> macro = new LinkedHashMap<>();
        macro.put("algorithm", journey.getMacroAlgorithmUsed());
        macro.put("distance", journey.getMacroTotalDistance());
        macro.put("macroDistanceTraveled", journey.getMacroDistanceTraveled());
        macro.put("macroTotalDistance", journey.getMacroTotalDistance());
        macro.put("computationMs", journey.getMacroComputationTimeMs());
        macro.put("nodesExplored", journey.getMacroNodesExplored());
        macro.put("stepIndex", journey.getMacroCurrentStepIndex());
        macro.put("totalSteps", journey.getMacroRoute().size());
        audit.put("macro", macro);

        Map<String, Object> micro = new LinkedHashMap<>();
        micro.put("algorithm", journey.getMicroAlgorithmUsed());
        micro.put("distance", journey.getMicroTotalDistance());
        micro.put("microDistanceTraveled", journey.getMicroDistanceTraveled());
        micro.put("microTotalDistance", journey.getMicroTotalDistance());
        micro.put("computationMs", journey.getMicroComputationTimeMs());
        micro.put("stopsCompleted", journey.getMicroCurrentStepIndex());
        micro.put("totalStops", journey.getMicroOptimalRoute().size());
        audit.put("micro", micro);

        audit.put("overallProgress", journey.getOverallProgressPercentage());
        return audit;
    }

    public EndToEndJourneyState getJourney(String journeyId) {
        EndToEndJourneyState state = journeyStore.get(journeyId);
        if (state == null) {
            throw new NoSuchElementException("Journey not found: " + journeyId);
        }
        return state;
    }

    public int getCurrentMacroNodeId(String journeyId) {
        EndToEndJourneyState state = getJourney(journeyId);
        return state.getMacroRoute().get(state.getMacroCurrentStepIndex());
    }

    public LocalDeliveryStop getCurrentMicroLocation(String journeyId) {
        EndToEndJourneyState state = getJourney(journeyId);
        return state.getMicroOptimalRoute().get(state.getMicroCurrentStepIndex());
    }

    private String getCityCode(int nodeId) {
        return switch (nodeId) {
            case 0 -> "DEL";
            case 1 -> "AGR";
            case 2 -> "JAI";
            case 3 -> "MUM";
            case 4 -> "PUN";
            case 5 -> "BLR";
            case 6 -> "HYD";
            case 7 -> "CHN";
            case 8 -> "KOL";
            default -> "NAG";
        };
    }
}