package com.logicore.engine.controller;

import com.logicore.engine.graph.*;
import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import com.logicore.engine.model.RouteTrace;
import com.logicore.engine.websocket.SimulationEventPublisher;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/simulation")
@CrossOrigin(origins = "*")
public class SimulationController {

    private final LogisticsGraph graph;
    private final DijkstraService dijkstraService;
    private final AStarService aStarService;
    private final FloydWarshallService floydWarshallService;
    private final BellmanFordService bellmanFordService;
    private final SimulationEventPublisher eventPublisher;

    public SimulationController(LogisticsGraph graph, 
                                DijkstraService dijkstraService, 
                                AStarService aStarService,
                                FloydWarshallService floydWarshallService,
                                BellmanFordService bellmanFordService,
                                SimulationEventPublisher eventPublisher) {
        this.graph = graph;
        this.dijkstraService = dijkstraService;
        this.aStarService = aStarService;
        this.floydWarshallService = floydWarshallService;
        this.bellmanFordService = bellmanFordService;
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/nodes")
    public void addNode(@RequestBody LogisticsNode node) {
        graph.addNode(node);
    }

    @PostMapping("/edges")
    public void addEdge(@RequestBody LogisticsEdge edge) {
        graph.addEdge(edge);
    }

    @GetMapping("/nodes")
    public Collection<LogisticsNode> getNodes() {
        return graph.getAllNodes();
    }

    @GetMapping("/edges")
    public Collection<LogisticsEdge> getEdges() {
        return graph.getAllEdges();
    }

    /**
     * Compare all 4 algorithms on same route
     * Returns detailed metrics for each algorithm
     */
    @PostMapping("/route/compare-all")
    public Map<String, Object> compareAllAlgorithms(@RequestParam int source, @RequestParam int target) {
        Map<String, Object> result = new HashMap<>();
        result.put("source", source);
        result.put("target", target);
        result.put("timestamp", System.currentTimeMillis());
        
        // Run all algorithms
        RouteTrace dijkstraTrace = dijkstraService.compute(graph, source, target);
        RouteTrace astarTrace = aStarService.compute(graph, source, target);
        RouteTrace floydTrace = floydWarshallService.computeAllPairs(graph, source, target);
        RouteTrace bellmanTrace = bellmanFordService.compute(graph, source, target);
        
        // Compile comparison
        Map<String, Map<String, Object>> algorithms = new HashMap<>();
        
        algorithms.put("Dijkstra", new HashMap<String, Object>() {{
            put("distance", dijkstraTrace.getTotalDistance());
            put("executionTimeMs", dijkstraTrace.getExecutionTimeMs());
            put("nodesExplored", dijkstraTrace.getNodesExplored());
            put("path", dijkstraTrace.getPath());
            put("steps", dijkstraTrace.getSteps().size());
            put("complexity", "O(E log V)");
            put("advantages", Arrays.asList("Efficient for weighted graphs", "False guaranteed optimal"));
            put("bestFor", "Most routing scenarios in production");
        }});
        
        algorithms.put("A*", new HashMap<String, Object>() {{
            put("distance", astarTrace.getTotalDistance());
            put("executionTimeMs", astarTrace.getExecutionTimeMs());
            put("nodesExplored", astarTrace.getNodesExplored());
            put("path", astarTrace.getPath());
            put("steps", astarTrace.getSteps().size());
            put("complexity", "O(E) with good heuristic");
            put("advantages", Arrays.asList("Uses geographic heuristic", "Fewer nodes explored"));
            put("bestFor", "Same-day delivery (time-critical)");
        }});
        
        algorithms.put("Floyd-Warshall", new HashMap<String, Object>() {{
            put("distance", floydTrace.getTotalDistance());
            put("executionTimeMs", floydTrace.getExecutionTimeMs());
            put("nodesExplored", floydTrace.getNodesExplored());
            put("path", floydTrace.getPath());
            put("steps", floydTrace.getSteps().size());
            put("complexity", "O(V³)");
            put("advantages", Arrays.asList("Computes all pairs", "Good for static networks"));
            put("bestFor", "Batch optimization, network analysis");
        }});
        
        algorithms.put("Bellman-Ford", new HashMap<String, Object>() {{
            put("distance", bellmanTrace.getTotalDistance());
            put("executionTimeMs", bellmanTrace.getExecutionTimeMs());
            put("nodesExplored", bellmanTrace.getNodesExplored());
            put("path", bellmanTrace.getPath());
            put("steps", bellmanTrace.getSteps().size());
            put("complexity", "O(V*E)");
            put("advantages", Arrays.asList("Handles negative weights", "Detects negative cycles"));
            put("bestFor", "Cost-based optimization, return routing");
        }});
        
        result.put("algorithms", algorithms);
        
        // Find fastest
        String fastest = dijkstraTrace.getExecutionTimeMs() <= astarTrace.getExecutionTimeMs() ? "Dijkstra" : "A*";
        result.put("fastestAlgorithm", fastest);
        
        return result;
    }

    @PostMapping("/route/dijkstra")
    public RouteTrace computeDijkstra(@RequestParam int source, @RequestParam int target) {
        RouteTrace trace = dijkstraService.compute(graph, source, target);
        eventPublisher.publishEvent("ROUTE_COMPUTED", "Dijkstra", "Nodes: " + source + " to " + target, trace.getPath(), "O(E log V)");
        return trace;
    }

    @PostMapping("/route/astar")
    public RouteTrace computeAStar(@RequestParam int source, @RequestParam int target) {
        RouteTrace trace = aStarService.compute(graph, source, target);
        eventPublisher.publishEvent("ROUTE_COMPUTED", "A*", "Nodes: " + source + " to " + target, trace.getPath(), "O(E) heuristic dependent");
        return trace;
    }

    @PostMapping("/route/floyd-warshall")
    public RouteTrace computeFloydWarshall(@RequestParam int source, @RequestParam int target) {
        RouteTrace trace = floydWarshallService.computeAllPairs(graph, source, target);
        eventPublisher.publishEvent("ROUTE_COMPUTED", "Floyd-Warshall", "Nodes: " + source + " to " + target, trace.getPath(), "O(V³)");
        return trace;
    }

    @PostMapping("/route/bellman-ford")
    public RouteTrace computeBellmanFord(@RequestParam int source, @RequestParam int target) {
        RouteTrace trace = bellmanFordService.compute(graph, source, target);
        eventPublisher.publishEvent("ROUTE_COMPUTED", "Bellman-Ford", "Nodes: " + source + " to " + target, trace.getPath(), "O(V*E)");
        return trace;
    }
}
