package com.logicore.engine.graph;

import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.RouteTrace;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DijkstraService {

    public RouteTrace compute(LogisticsGraph graph, int source, int target) {
        Map<Integer, Double> dist = new HashMap<>();
        Map<Integer, Integer> parent = new HashMap<>();
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Double.compare(dist.get(a[0]), dist.get(b[0])));
        List<RouteTrace.Step> steps = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        int nodesExplored = 0;

        for (int nodeId : graph.getAllNodes().stream().map(n -> n.getId()).toList()) {
            dist.put(nodeId, Double.POSITIVE_INFINITY);
        }
        dist.put(source, 0.0);
        pq.offer(new int[]{source});

        while (!pq.isEmpty()) {
            int u = pq.poll()[0];
            nodesExplored++;
            steps.add(new RouteTrace.Step(u, "SETTLED", new HashMap<>(dist)));

            if (u == target) break;

            for (LogisticsEdge edge : graph.getNeighbors(u)) {
                int v = edge.getTo();
                double weight = edge.getTravelTimeMin();
                if (dist.get(u) + weight < dist.get(v)) {
                    dist.put(v, dist.get(u) + weight);
                    parent.put(v, u);
                    pq.offer(new int[]{v});
                    steps.add(new RouteTrace.Step(v, "RELAXING", new HashMap<>(dist)));
                }
            }
        }

        List<Integer> path = new ArrayList<>();
        if (dist.get(target) != Double.POSITIVE_INFINITY) {
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
        trace.setTotalDistance(dist.get(target));
        trace.setSteps(steps);
        trace.setAlgorithmName("Dijkstra");
        trace.setExecutionTimeMs(executionTime);
        trace.setNodesExplored(nodesExplored);
        return trace;
    }
}
