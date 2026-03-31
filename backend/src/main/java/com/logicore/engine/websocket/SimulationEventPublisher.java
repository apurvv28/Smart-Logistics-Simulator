package com.logicore.engine.websocket;

import com.logicore.engine.model.SimulationEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SimulationEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public SimulationEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishEvent(String type, String algorithm, Object input, Object output, String complexity) {
        SimulationEvent event = new SimulationEvent(
                LocalDateTime.now(),
                type,
                algorithm,
                input,
                output,
                complexity
        );
        messagingTemplate.convertAndSend("/topic/events", event);
    }
}
