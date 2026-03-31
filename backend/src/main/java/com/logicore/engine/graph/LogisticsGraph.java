package com.logicore.engine.graph;

import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class LogisticsGraph {
    private final Map<Integer, LogisticsNode> nodes = new HashMap<>();
    private final Map<Integer, List<LogisticsEdge>> adjacencyList = new HashMap<>();

    public void addNode(LogisticsNode node) {
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    public void addEdge(LogisticsEdge edge) {
        adjacencyList.get(edge.getFrom()).add(edge);
        // Assuming bidirectional for this simulator's default roads
        adjacencyList.putIfAbsent(edge.getTo(), new ArrayList<>());
        adjacencyList.get(edge.getTo()).add(new LogisticsEdge(edge.getTo(), edge.getFrom(), edge.getDistanceKm(), edge.getTrafficScore()));
    }

    public LogisticsNode getNode(int id) {
        return nodes.get(id);
    }

    public List<LogisticsEdge> getNeighbors(int nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    public Collection<LogisticsNode> getAllNodes() {
        return nodes.values();
    }

    public List<LogisticsEdge> getAllEdges() {
        List<LogisticsEdge> allEdges = new ArrayList<>();
        adjacencyList.values().forEach(allEdges::addAll);
        return allEdges;
    }
    
    public void clear() {
        nodes.clear();
        adjacencyList.clear();
    }
}
