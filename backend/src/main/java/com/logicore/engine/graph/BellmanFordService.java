package com.logicore.engine.graph;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.RouteTrace;

/**
 * Bellman-Ford Single-Source Shortest Paths with detailed trace
 * Time: O(V*E), Space: O(V)
 * Best for: Graphs with negative weights, detecting negative cycles
 * Can handle traffic delays or price-based optimization
 */
@Service
public class BellmanFordService {

    public RouteTrace compute(LogisticsGraph graph, int source, int target) {
        List<LogisticsNode> nodes = new ArrayList<>(graph.getAllNodes());
        
        int n = nodes.size();
        Map<Integer, Double> dist = new HashMap<>();
        Map<Integer, Integer> parent = new HashMap<>();
        List<RouteTrace.Step> steps = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        
        // Initialize distances
        for (LogisticsNode node : nodes) {
            dist.put(node.getId(), Double.POSITIVE_INFINITY);
        }
        dist.put(source, 0.0);
        parent.put(source, -1);
        
        int edgeRelaxed = 0;
        
        // Relax edges V-1 times
        for (int i = 0; i < n - 1; i++) {
            for (LogisticsEdge edge : graph.getAllEdges()) {
                int u = edge.getFrom();
                int v = edge.getTo();
                double weight = edge.getTravelTimeMin();
                
                if (dist.get(u) != Double.POSITIVE_INFINITY && 
                    dist.get(u) + weight < dist.get(v)) {
                    dist.put(v, dist.get(u) + weight);
                    parent.put(v, u);
                    edgeRelaxed++;
                    steps.add(new RouteTrace.Step(v, "RELAXED_FROM_" + u, new HashMap<>(dist)));
                }
            }
        }
        
        // Check for negative cycles
        boolean hasNegativeCycle = false;
        for (LogisticsEdge edge : graph.getAllEdges()) {
            int u = edge.getFrom();
            int v = edge.getTo();
            double weight = edge.getTravelTimeMin();
            if (dist.get(u) != Double.POSITIVE_INFINITY && 
                dist.get(u) + weight < dist.get(v)) {
                hasNegativeCycle = true;
                steps.add(new RouteTrace.Step(v, "NEGATIVE_CYCLE_DETECTED", new HashMap<>()));
            }
        }
        
        // Reconstruct path
        List<Integer> path = new ArrayList<>();
        if (!hasNegativeCycle && dist.get(target) != Double.POSITIVE_INFINITY) {
            int curr = target;
            while (curr != -1) {
                path.add(curr);
                curr = parent.get(curr);
            }
            Collections.reverse(path);
        }
        
        long executionTime = System.currentTimeMillis() - startTime;

        // UI metric: count unique nodes reachable from source for this query.
        int nodesExplored = (int) dist.values().stream()
            .filter(d -> d != Double.POSITIVE_INFINITY)
            .count();
        
        RouteTrace trace = new RouteTrace();
        trace.setSourceId(source);
        trace.setTargetId(target);
        trace.setPath(path);
        trace.setTotalDistance(dist.get(target));
        trace.setSteps(steps);
        trace.setAlgorithmName("Bellman-Ford");
        trace.setExecutionTimeMs(executionTime);
        trace.setNodesExplored(nodesExplored);
        
        return trace;
    }
}