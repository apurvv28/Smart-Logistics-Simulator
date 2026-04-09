package com.logicore.engine.controller;

import com.logicore.engine.model.EndToEndJourneyState;
import com.logicore.engine.model.LocalDeliveryStop;
import com.logicore.engine.service.EndToEndJourneyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/end-to-end")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class EndToEndJourneyController {
    private final EndToEndJourneyService journeyService;

    public EndToEndJourneyController(EndToEndJourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping("/initiate-journey")
    public ResponseEntity<Map<String, Object>> initiateJourney(@RequestBody Map<String, Object> request) {
        try {
            int originCityId = ((Number) request.get("originCityId")).intValue();
            int destinationCityId = ((Number) request.get("destinationCityId")).intValue();
            String macroAlgo = (String) request.get("primaryAlgorithmMacro");
            String microAlgo = (String) request.get("secondaryAlgorithmMicro");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> stopsData = (List<Map<String, Object>>) request.get("deliveryAddresses");
            List<LocalDeliveryStop> stops = stopsData.stream().map(data -> {
                LocalDeliveryStop stop = new LocalDeliveryStop();
                stop.setId((String) data.get("id"));
                stop.setName((String) data.get("name"));
                stop.setAddress((String) data.get("address"));
                stop.setLatitude(((Number) data.get("latitude")).doubleValue());
                stop.setLongitude(((Number) data.get("longitude")).doubleValue());
                stop.setType("delivery");
                return stop;
            }).toList();

            EndToEndJourneyState state = journeyService.initiateJourney(originCityId, destinationCityId, macroAlgo, microAlgo, stops);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("journeyId", state.getJourneyId());
            response.put("journey", state);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/advance-step/{journeyId}")
    public ResponseEntity<Map<String, Object>> advanceStep(@PathVariable String journeyId) {
        try {
            EndToEndJourneyState state = journeyService.advanceStep(journeyId);
            if (state == null) {
                throw new NoSuchElementException("Journey " + journeyId + " missing");
            }
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("journey", state);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/journey/{journeyId}")
    public ResponseEntity<Map<String, Object>> getJourney(@PathVariable String journeyId) {
        try {
            EndToEndJourneyState state = journeyService.getJourney(journeyId);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("journey", state);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/audit/{journeyId}")
    public ResponseEntity<Map<String, Object>> getAudit(@PathVariable String journeyId) {
        try {
            Map<String, Object> audit = journeyService.getAuditData(journeyId);
            if (audit == null) throw new NoSuchElementException("Audit data not found");
            return ResponseEntity.ok(audit);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/current-macro-node/{journeyId}")
    public ResponseEntity<Map<String, Object>> getCurrentMacroNode(@PathVariable String journeyId) {
        try {
            int nodeId = journeyService.getCurrentMacroNodeId(journeyId);
            Map<String, Object> response = new HashMap<>();
            response.put("nodeId", nodeId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/current-micro-location/{journeyId}")
    public ResponseEntity<Map<String, Object>> getCurrentMicroLocation(@PathVariable String journeyId) {
        try {
            LocalDeliveryStop stop = journeyService.getCurrentMicroLocation(journeyId);
            Map<String, Object> response = new HashMap<>();
            response.put("lat", stop.getLatitude());
            response.put("lon", stop.getLongitude());
            response.put("stopName", stop.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "EndToEndJourneyService");
        return ResponseEntity.ok(response);
    }
}