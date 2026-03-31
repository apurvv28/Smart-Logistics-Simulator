package com.logicore.engine.model;

import java.time.LocalDateTime;

@SuppressWarnings("unused")
public class SimulationEvent {
    private LocalDateTime timestamp;
    private String type;
    private String algorithmUsed;
    private Object inputSnapshot;
    private Object outputSnapshot;
    private String complexityNote;

    public SimulationEvent() {
    }

    public SimulationEvent(LocalDateTime timestamp, String type, String algorithmUsed, Object inputSnapshot,
                           Object outputSnapshot, String complexityNote) {
        this.timestamp = timestamp;
        this.type = type;
        this.algorithmUsed = algorithmUsed;
        this.inputSnapshot = inputSnapshot;
        this.outputSnapshot = outputSnapshot;
        this.complexityNote = complexityNote;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAlgorithmUsed() {
        return algorithmUsed;
    }

    public void setAlgorithmUsed(String algorithmUsed) {
        this.algorithmUsed = algorithmUsed;
    }

    public Object getInputSnapshot() {
        return inputSnapshot;
    }

    public void setInputSnapshot(Object inputSnapshot) {
        this.inputSnapshot = inputSnapshot;
    }

    public Object getOutputSnapshot() {
        return outputSnapshot;
    }

    public void setOutputSnapshot(Object outputSnapshot) {
        this.outputSnapshot = outputSnapshot;
    }

    public String getComplexityNote() {
        return complexityNote;
    }

    public void setComplexityNote(String complexityNote) {
        this.complexityNote = complexityNote;
    }
}
