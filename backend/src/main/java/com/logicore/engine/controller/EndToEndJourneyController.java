package com.logicore.engine.controller;

import com.logicore.engine.model.EndToEndJourneyState;
import com.logicore.engine.model.LocalDeliveryStop;
import com.logicore.engine.service.EndToEndJourneyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * End-To-End Journey Controller
 * Handles REST endpoints for complete logistics journey combining macro and micro routing.
 */
@RestController
@RequestMapping("/api/end-to-end")
@CrossOrigin(origins = "http://localhost:5173")
public class EndToEndJourneyController {
    private final EndToEndJourneyService endToEndJourneyService;
    private final Map<String, EndToEndJourneyState> journeyStore = new HashMap<>(); // In-memory store

    public EndToEndJourneyController(EndToEndJourneyService endToEndJourneyService) {
        this.endToEndJourneyService = endToEndJourneyService;
    }

    /**
     * POST /api/end-to-end/initiate-journey
     * Initiates a new end-to-end journey combining macro and micro routing
     */
    @PostMapping("/initiate-journey")
    public ResponseEntity<Map<String, Object>> initiateJourney(@RequestBody Map<String, Object> request) {
        try {
            int originCityId = ((Number) request.get("originCityId")).intValue();
            int destinationCityId = ((Number) request.get("destinationCityId")).intValue();
            String primaryAlgorithmMacro = (String) request.get("primaryAlgorithmMacro"); // BELLMAN_FORD or FLOYD_WARSHALL
            String secondaryAlgorithmMicro = (String) request.get("secondaryAlgorithmMicro"); // DIJKSTRA or A_STAR

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> deliveryAddressesData = (List<Map<String, Object>>) request.get("deliveryAddresses");
            List<LocalDeliveryStop> deliveryAddresses = deliveryAddressesData.stream()
                    .map(item -> {
                        LocalDeliveryStop stop = new LocalDeliveryStop();
                        stop.setId((String) item.get("id"));
                        stop.setName((String) item.get("name"));
                        stop.setAddress((String) item.get("address"));
                        stop.setLatitude(((Number) item.get("latitude")).doubleValue());
                        stop.setLongitude(((Number) item.get("longitude")).doubleValue());
                        stop.setType("delivery");
                        return stop;
                    })
                    .toList();

            EndToEndJourneyState journey = endToEndJourneyService.initiateJourney(
                    originCityId,
                    destinationCityId,
                    deliveryAddresses,
                    primaryAlgorithmMacro,
                    secondaryAlgorithmMicro
            );

            journeyStore.put(journey.getJourneyId(), journey);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("journeyId", journey.getJourneyId());
            response.put("journey", journey);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * GET /api/end-to-end/journey/:journeyId
     * Retrieves current journey state
     */
    @GetMapping("/journey/{journeyId}")
    public ResponseEntity<Map<String, Object>> getJourneyState(@PathVariable String journeyId) {
        EndToEndJourneyState journey = journeyStore.get(journeyId);

        if (journey == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Journey not found");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("journey", journey);
        response.put("audit", endToEndJourneyService.getAuditData(journey));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/end-to-end/advance-step/:journeyId
     * Advances journey to next step (auto-selects macro or micro phase)
     */
    @PostMapping("/advance-step/{journeyId}")
    public ResponseEntity<Map<String, Object>> advanceStep(@PathVariable String journeyId) {
        try {
            EndToEndJourneyState journey = journeyStore.get(journeyId);

            if (journey == null) {
                throw new IllegalArgumentException("Journey not found");
            }

            // Auto-advance: macro phase → micro phase transition
            EndToEndJourneyState.JourneyPhase phase = journey.getCurrentPhase();

            if (phase == EndToEndJourneyState.JourneyPhase.INITIATED ||
                phase == EndToEndJourneyState.JourneyPhase.IN_MACRO_TRANSIT) {
                journey = endToEndJourneyService.advanceMacroStep(journey);
            } else if (phase == EndToEndJourneyState.JourneyPhase.ARRIVED_AT_HUB ||
                       phase == EndToEndJourneyState.JourneyPhase.IN_MICRO_TRANSIT) {
                journey = endToEndJourneyService.advanceMicroStep(journey);
            }

            journeyStore.put(journeyId, journey);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("journey", journey);
            response.put("audit", endToEndJourneyService.getAuditData(journey));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    /**
     * GET /api/end-to-end/audit/:journeyId
     * Returns audit data for AlgorithmAuditPanel
     */
    @GetMapping("/audit/{journeyId}")
    public ResponseEntity<Map<String, Object>> getAudit(@PathVariable String journeyId) {
        EndToEndJourneyState journey = journeyStore.get(journeyId);

        if (journey == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Journey not found");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("audit", endToEndJourneyService.getAuditData(journey));
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/end-to-end/current-macro-node/:journeyId
     * Returns current city node ID for macro phase animation
     */
    @GetMapping("/current-macro-node/{journeyId}")
    public ResponseEntity<Map<String, Object>> getCurrentMacroNode(@PathVariable String journeyId) {
        EndToEndJourneyState journey = journeyStore.get(journeyId);

        if (journey == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Journey not found");
            return ResponseEntity.status(404).body(error);
        }

        int nodeId = endToEndJourneyService.getCurrentMacroNodeId(journey);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("currentNodeId", nodeId);
        response.put("currentStepIndex", journey.getMacroCurrentStepIndex());
        response.put("totalSteps", journey.getMacroRoute().size());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/end-to-end/current-micro-location/:journeyId
     * Returns current GPS coordinates for micro phase animation
     */
    @GetMapping("/current-micro-location/{journeyId}")
    public ResponseEntity<Map<String, Object>> getCurrentMicroLocation(@PathVariable String journeyId) {
        EndToEndJourneyState journey = journeyStore.get(journeyId);

        if (journey == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Journey not found");
            return ResponseEntity.status(404).body(error);
        }

        LocalDeliveryStop location = endToEndJourneyService.getCurrentMicroLocation(journey);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("latitude", location.getLatitude());
        response.put("longitude", location.getLongitude());
        response.put("name", location.getName());
        response.put("currentStepIndex", journey.getMicroCurrentStepIndex());
        response.put("totalSteps", journey.getMicroOptimalRoute().size());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/end-to-end/health
     * Service health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "EndToEndJourneyService");
        return ResponseEntity.ok(response);
    }
}
