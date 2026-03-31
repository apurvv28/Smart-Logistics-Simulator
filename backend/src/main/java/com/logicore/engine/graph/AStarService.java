package com.logicore.engine.graph;

import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.RouteTrace;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AStarService {

    public RouteTrace compute(LogisticsGraph graph, int source, int target) {
        Map<Integer, Double> gScore = new HashMap<>();
        Map<Integer, Double> fScore = new HashMap<>();
        Map<Integer, Integer> parent = new HashMap<>();
        PriorityQueue<Integer> openSet = new PriorityQueue<>(Comparator.comparingDouble(fScore::get));
        List<RouteTrace.Step> steps = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        int nodesExplored = 0;

        for (LogisticsNode node : graph.getAllNodes()) {
            gScore.put(node.getId(), Double.POSITIVE_INFINITY);
            fScore.put(node.getId(), Double.POSITIVE_INFINITY);
        }

        gScore.put(source, 0.0);
        fScore.put(source, heuristic(graph.getNode(source), graph.getNode(target)));
        openSet.add(source);

        while (!openSet.isEmpty()) {
            int u = openSet.poll();
            nodesExplored++;
            steps.add(new RouteTrace.Step(u, "SETTLED", new HashMap<>(fScore)));

            if (u == target) break;

            for (LogisticsEdge edge : graph.getNeighbors(u)) {
                int v = edge.getTo();
                double tentativeGScore = gScore.get(u) + edge.getTravelTimeMin();

                if (tentativeGScore < gScore.get(v)) {
                    parent.put(v, u);
                    gScore.put(v, tentativeGScore);
                    fScore.put(v, gScore.get(v) + heuristic(graph.getNode(v), graph.getNode(target)));
                    if (!openSet.contains(v)) {
                        openSet.add(v);
                    }
                    steps.add(new RouteTrace.Step(v, "RELAXING", new HashMap<>(fScore)));
                }
            }
        }

        List<Integer> path = new ArrayList<>();
        if (gScore.get(target) != Double.POSITIVE_INFINITY) {
            int curr = target;
            while (curr != source) {
                path.add(curr);
                curr = parent.get(curr);
            }
            path.add(source);
            Collections.reverse(path);
        }

        long executionTime = System.currentTimeMillis() - startTime;
        RouteTrace trace = new RouteTrace();
        trace.setSourceId(source);
        trace.setTargetId(target);
        trace.setPath(path);
        trace.setTotalDistance(gScore.get(target));
        trace.setSteps(steps);
        trace.setAlgorithmName("A*");
        trace.setExecutionTimeMs(executionTime);
        trace.setNodesExplored(nodesExplored);
        return trace;
    }

    private double heuristic(LogisticsNode a, LogisticsNode b) {
        // Haversine distance or simple Euclidean for simulator
        double dx = a.getLat() - b.getLat();
        double dy = a.getLng() - b.getLng();
        return Math.sqrt(dx * dx + dy * dy) * 111.0; // approx distance in kms
    }
}
