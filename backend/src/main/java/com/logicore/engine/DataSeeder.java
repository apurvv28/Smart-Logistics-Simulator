package com.logicore.engine;

import com.logicore.engine.data.IndiaLogisticsNetwork;
import com.logicore.engine.graph.LogisticsGraph;
import com.logicore.engine.model.LogisticsEdge;
import com.logicore.engine.model.LogisticsNode;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initialize India logistics network with real cities and routes
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final LogisticsGraph graph;

    public DataSeeder(LogisticsGraph graph) {
        this.graph = graph;
    }

    @Override
    public void run(String... args) throws Exception {
        // Load all Indian cities
        for (IndiaLogisticsNetwork.CityNode city : IndiaLogisticsNetwork.getAllCities()) {
            graph.addNode(new LogisticsNode(
                city.id,
                city.name,
                city.type,
                city.latitude,
                city.longitude,
                city.capacity
            ));
        }
        
        // Load all routes with real distances and traffic factors
        for (IndiaLogisticsNetwork.RouteConnection route : IndiaLogisticsNetwork.getAllRoutes()) {
            graph.addEdge(new LogisticsEdge(
                route.from,
                route.to,
                route.distanceKm,
                route.trafficFactor
            ));
        }
        
        System.out.println("✓ Logistics Network initialized with " + 
            graph.getAllNodes().size() + " nodes and " + 
            graph.getAllEdges().size() + " routes");
    }
}
