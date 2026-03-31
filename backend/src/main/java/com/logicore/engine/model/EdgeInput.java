package com.logicore.engine.model;

import jakarta.validation.constraints.Min;

public class EdgeInput {

    @Min(0)
    public int from;

    @Min(0)
    public int to;

    @Min(0)
    public int weight;

    public boolean bidirectional = true;
}
