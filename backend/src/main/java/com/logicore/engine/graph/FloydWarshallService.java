package com.logicore.engine.graph;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.RouteTrace;

/**
 * Floyd-Warshall All-Pairs Shortest Paths with detailed trace
 * Time: O(V^3), Space: O(V^2)
 * Best for: Small graphs, all-pairs queries, dynamic graphs
 */
@Service
public class FloydWarshallService {

    public RouteTrace computeAllPairs(LogisticsGraph graph, int source, int target) {
        List<LogisticsNode> nodes = new ArrayList<>(graph.getAllNodes());
        int n = nodes.size();
        Map<Integer, Integer> nodeIndexMap = new HashMap<>();
        
        for (int i = 0; i < n; i++) {
            nodeIndexMap.put(nodes.get(i).getId(), i);
        }
        
        double[][] dist = new double[n][n];
        int[][] next = new int[n][n];
        long startTime = System.currentTimeMillis();
        List<RouteTrace.Step> steps = new ArrayList<>();
        
        // Initialize
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i == j) {
                    dist[i][j] = 0;
                    next[i][j] = -1;
                } else {
                    dist[i][j] = Double.POSITIVE_INFINITY;
                    next[i][j] = -1;
                }
            }
        }
        
        // Add edges
        for (LogisticsEdge edge : graph.getAllEdges()) {
            int u = nodeIndexMap.get(edge.getFrom());
            int v = nodeIndexMap.get(edge.getTo());
            dist[u][v] = edge.getTravelTimeMin();
            next[u][v] = v;
        }
        
        int sourceIdx = nodeIndexMap.get(source);
        int targetIdx = nodeIndexMap.get(target);
        
        // Floyd-Warshall iterations
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] != Double.POSITIVE_INFINITY &&
                        dist[k][j] != Double.POSITIVE_INFINITY &&
                        dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];
                        steps.add(new RouteTrace.Step(i, "RELAXED_VIA_" + k, new HashMap<>()));
                    }
                }
            }
        }
        
        // Reconstruct path
        List<Integer> path = new ArrayList<>();
        int curr = sourceIdx;
        int nodeIdSource = nodes.get(sourceIdx).getId();
        int nodeIdTarget = nodes.get(targetIdx).getId();
        
        path.add(nodeIdSource);
        while (curr != targetIdx && next[curr][targetIdx] != -1) {
            curr = next[curr][targetIdx];
            path.add(nodes.get(curr).getId());
        }
        
        long executionTime = System.currentTimeMillis() - startTime;

        // UI metric: count unique nodes reachable from source for this query.
        int nodesExplored = 0;
        for (int j = 0; j < n; j++) {
            if (dist[sourceIdx][j] != Double.POSITIVE_INFINITY) {
                nodesExplored++;
            }
        }
        
        RouteTrace trace = new RouteTrace();
        trace.setSourceId(source);
        trace.setTargetId(target);
        trace.setPath(path);
        trace.setTotalDistance(dist[sourceIdx][targetIdx]);
        trace.setSteps(steps);
        trace.setAlgorithmName("Floyd-Warshall");
        trace.setExecutionTimeMs(executionTime);
        trace.setNodesExplored(nodesExplored);
        
        return trace;
    }
}
