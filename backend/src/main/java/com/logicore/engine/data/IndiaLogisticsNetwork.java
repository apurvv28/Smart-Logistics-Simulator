package com.logicore.engine.data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.logicore.engine.model.NodeType;

/**
 * Comprehensive India Logistics Network with major cities
 * This includes warehouses, hubs, and delivery zones across India
 */
public class IndiaLogisticsNetwork {
    
    public static class CityNode {
        public int id;
        public String name;
        public NodeType type;       // WAREHOUSE, HUB, DELIVERY_ZONE
        public double latitude;
        public double longitude;
        public int capacity;
        
        public CityNode(int id, String name, NodeType type, double lat, double lng, int capacity) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.latitude = lat;
            this.longitude = lng;
            this.capacity = capacity;
        }
    }
    
    public static class RouteConnection {
        public int from;
        public int to;
        public double distanceKm;
        public double trafficFactor; // 1.0 = clear, >1.0 = congestion
        
        public RouteConnection(int from, int to, double distance, double traffic) {
            this.from = from;
            this.to = to;
            this.distanceKm = distance;
            this.trafficFactor = traffic;
        }
    }
    
    /**
     * Initialize all major Indian cities as logistics nodes
     * Warehouse: Regional distribution centers, high capacity
     * Hub: Intermediate processing centers
     * DeliveryZone: Last-mile delivery centers
     */
    public static List<CityNode> getAllCities() {
        List<CityNode> cities = new ArrayList<>();
        
        // North India
        cities.add(new CityNode(0, "Delhi Warehouse", NodeType.WAREHOUSE, 28.7041, 77.1025, 5000));
        cities.add(new CityNode(1, "Gurgaon Hub", NodeType.HUB, 28.4595, 77.0266, 2000));
        cities.add(new CityNode(2, "Noida DeliveryZone", NodeType.DELIVERY_ZONE, 28.5821, 77.3629, 500));
        
        // West India
        cities.add(new CityNode(3, "Mumbai Warehouse", NodeType.WAREHOUSE, 19.0760, 72.8777, 5000));
        cities.add(new CityNode(4, "Pune Hub", NodeType.HUB, 18.5204, 73.8567, 2000));
        cities.add(new CityNode(5, "Thane DeliveryZone", NodeType.DELIVERY_ZONE, 19.2183, 72.9781, 500));
        
        // East India
        cities.add(new CityNode(6, "Kolkata Warehouse", NodeType.WAREHOUSE, 22.5726, 88.3639, 4000));
        cities.add(new CityNode(7, "Howrah Hub", NodeType.HUB, 22.5958, 88.2636, 1500));
        cities.add(new CityNode(8, "Durgapur DeliveryZone", NodeType.DELIVERY_ZONE, 23.1815, 87.3129, 400));
        
        // South India
        cities.add(new CityNode(9, "Bengaluru Warehouse", NodeType.WAREHOUSE, 12.9716, 77.5946, 5000));
        cities.add(new CityNode(10, "Hyderabad Hub", NodeType.HUB, 17.3850, 78.4867, 2500));
        cities.add(new CityNode(11, "Secunderabad DeliveryZone", NodeType.DELIVERY_ZONE, 17.3710, 78.5122, 600));
        
        cities.add(new CityNode(12, "Chennai Warehouse", NodeType.WAREHOUSE, 13.0827, 80.2707, 4000));
        cities.add(new CityNode(13, "Coimbatore Hub", NodeType.HUB, 11.0081, 76.9124, 1500));
        cities.add(new CityNode(14, "Salem DeliveryZone", NodeType.DELIVERY_ZONE, 11.6643, 78.1460, 400));
        
        // Other Important Cities
        cities.add(new CityNode(15, "Ahmedabad Warehouse", NodeType.WAREHOUSE, 23.0225, 72.5714, 3500));
        cities.add(new CityNode(16, "Baroda Hub", NodeType.HUB, 22.3072, 73.1812, 1000));
        cities.add(new CityNode(17, "Rajkot DeliveryZone", NodeType.DELIVERY_ZONE, 22.3039, 70.8022, 300));
        
        cities.add(new CityNode(18, "Jaipur Warehouse", NodeType.WAREHOUSE, 26.9124, 75.7873, 3000));
        cities.add(new CityNode(19, "Udaipur Hub", NodeType.HUB, 24.5854, 73.7125, 800));
        cities.add(new CityNode(20, "Jodhpur DeliveryZone", NodeType.DELIVERY_ZONE, 26.2389, 73.0243, 250));

        // Central + North-East + Kerala + Andhra expansion
        cities.add(new CityNode(21, "Bhopal Warehouse", NodeType.WAREHOUSE, 23.2599, 77.4126, 3200));
        cities.add(new CityNode(22, "Nagpur Hub", NodeType.HUB, 21.1458, 79.0882, 1700));
        cities.add(new CityNode(23, "Raipur DeliveryZone", NodeType.DELIVERY_ZONE, 21.2514, 81.6296, 550));

        cities.add(new CityNode(24, "Guwahati Warehouse", NodeType.WAREHOUSE, 26.1445, 91.7362, 2800));
        cities.add(new CityNode(25, "Shillong Hub", NodeType.HUB, 25.5788, 91.8933, 900));
        cities.add(new CityNode(26, "Silchar DeliveryZone", NodeType.DELIVERY_ZONE, 24.8333, 92.7789, 350));

        cities.add(new CityNode(27, "Kochi Warehouse", NodeType.WAREHOUSE, 9.9312, 76.2673, 3000));
        cities.add(new CityNode(28, "Trivandrum Hub", NodeType.HUB, 8.5241, 76.9366, 1100));
        cities.add(new CityNode(29, "Kozhikode DeliveryZone", NodeType.DELIVERY_ZONE, 11.2588, 75.7804, 450));

        cities.add(new CityNode(30, "Vijayawada Warehouse", NodeType.WAREHOUSE, 16.5062, 80.6480, 3100));
        cities.add(new CityNode(31, "Visakhapatnam Hub", NodeType.HUB, 17.6868, 83.2185, 1400));
        cities.add(new CityNode(32, "Nellore DeliveryZone", NodeType.DELIVERY_ZONE, 14.4426, 79.9865, 500));

        // Maharashtra dense last-mile expansion
        cities.add(new CityNode(33, "Pune DeliveryZone", NodeType.DELIVERY_ZONE, 18.5204, 73.8567, 900));
        cities.add(new CityNode(34, "Navi Mumbai Hub", NodeType.HUB, 19.0330, 73.0297, 1800));
        cities.add(new CityNode(35, "Nashik Hub", NodeType.HUB, 19.9975, 73.7898, 1500));
        cities.add(new CityNode(36, "Nashik DeliveryZone", NodeType.DELIVERY_ZONE, 20.0110, 73.7900, 650));
        cities.add(new CityNode(37, "Aurangabad Hub", NodeType.HUB, 19.8762, 75.3433, 1300));
        cities.add(new CityNode(38, "Aurangabad DeliveryZone", NodeType.DELIVERY_ZONE, 19.8770, 75.3400, 550));
        cities.add(new CityNode(39, "Kolhapur DeliveryZone", NodeType.DELIVERY_ZONE, 16.7050, 74.2433, 500));
        cities.add(new CityNode(40, "Nagpur DeliveryZone", NodeType.DELIVERY_ZONE, 21.1466, 79.0889, 700));
        cities.add(new CityNode(41, "Solapur DeliveryZone", NodeType.DELIVERY_ZONE, 17.6599, 75.9064, 500));
        
        return cities;
    }
    
    /**
     * Real-world distances and traffic patterns between major logistics hubs
     */
    public static List<RouteConnection> getAllRoutes() {
        List<RouteConnection> routes = new ArrayList<>();
        
        // North India routes
        routes.add(new RouteConnection(0, 1, 30, 1.3));      // Delhi to Gurgaon (heavy traffic)
        routes.add(new RouteConnection(1, 2, 35, 1.1));      // Gurgaon to Noida
        routes.add(new RouteConnection(0, 2, 40, 1.2));      // Delhi-Noida direct
        
        // Delhi to West
        routes.add(new RouteConnection(0, 3, 450, 1.0));     // Delhi to Mumbai
        routes.add(new RouteConnection(0, 15, 250, 0.9));    // Delhi to Ahmedabad
        routes.add(new RouteConnection(0, 18, 280, 1.0));    // Delhi to Jaipur
        
        // West India routes
        routes.add(new RouteConnection(3, 4, 150, 1.2));     // Mumbai to Pune
        routes.add(new RouteConnection(4, 5, 145, 1.1));     // Pune to Thane
        routes.add(new RouteConnection(3, 5, 60, 1.3));      // Mumbai to Thane direct

        // Maharashtra dense network for realistic last-mile and inter-city movement
        routes.add(new RouteConnection(3, 34, 35, 1.2));     // Mumbai to Navi Mumbai Hub
        routes.add(new RouteConnection(34, 5, 25, 1.2));     // Navi Mumbai to Thane
        routes.add(new RouteConnection(34, 4, 120, 1.1));    // Navi Mumbai to Pune Hub
        routes.add(new RouteConnection(4, 33, 12, 1.15));    // Pune Hub to Pune DeliveryZone
        routes.add(new RouteConnection(3, 33, 145, 1.2));    // Mumbai to Pune DeliveryZone (direct corridor)
        routes.add(new RouteConnection(4, 35, 210, 1.0));    // Pune to Nashik Hub
        routes.add(new RouteConnection(35, 36, 8, 1.1));     // Nashik Hub to Nashik DeliveryZone
        routes.add(new RouteConnection(4, 37, 235, 1.0));    // Pune to Aurangabad Hub
        routes.add(new RouteConnection(37, 38, 12, 1.05));   // Aurangabad Hub to Aurangabad DeliveryZone
        routes.add(new RouteConnection(4, 39, 230, 1.0));    // Pune to Kolhapur DeliveryZone
        routes.add(new RouteConnection(4, 41, 250, 1.0));    // Pune to Solapur DeliveryZone
        routes.add(new RouteConnection(35, 37, 190, 1.0));   // Nashik Hub to Aurangabad Hub
        routes.add(new RouteConnection(3, 35, 170, 1.05));   // Mumbai to Nashik Hub
        routes.add(new RouteConnection(22, 40, 8, 1.1));     // Nagpur Hub to Nagpur DeliveryZone
        routes.add(new RouteConnection(37, 22, 500, 1.0));   // Aurangabad Hub to Nagpur Hub
        routes.add(new RouteConnection(41, 22, 320, 1.0));   // Solapur to Nagpur Hub
        
        // Ahmedabad region
        routes.add(new RouteConnection(15, 16, 90, 0.8));    // Ahmedabad to Baroda
        routes.add(new RouteConnection(16, 17, 180, 0.7));   // Baroda to Rajkot
        routes.add(new RouteConnection(0, 15, 250, 1.0));    // Delhi to Ahmedabad
        
        // Jaipur region
        routes.add(new RouteConnection(18, 19, 230, 0.9));   // Jaipur to Udaipur
        routes.add(new RouteConnection(19, 20, 200, 0.8));   // Udaipur to Jodhpur
        
        // East India routes
        routes.add(new RouteConnection(6, 7, 30, 1.1));      // Kolkata to Howrah
        routes.add(new RouteConnection(7, 8, 150, 0.9));     // Howrah to Durgapur
        routes.add(new RouteConnection(0, 6, 1200, 1.0));    // Delhi to Kolkata
        
        // South India routes
        routes.add(new RouteConnection(9, 10, 600, 1.0));    // Bengaluru to Hyderabad
        routes.add(new RouteConnection(10, 11, 15, 1.2));    // Hyderabad to Secunderabad
        routes.add(new RouteConnection(9, 12, 350, 0.95));   // Bengaluru to Chennai
        routes.add(new RouteConnection(12, 13, 450, 0.9));   // Chennai to Coimbatore
        routes.add(new RouteConnection(13, 14, 80, 0.85));   // Coimbatore to Salem
        
        // Cross-region routes
        routes.add(new RouteConnection(3, 9, 1250, 0.95));   // Mumbai to Bengaluru
        routes.add(new RouteConnection(15, 9, 1400, 1.0));   // Ahmedabad to Bengaluru
        routes.add(new RouteConnection(6, 10, 1100, 0.9));   // Kolkata to Hyderabad
        routes.add(new RouteConnection(0, 9, 2100, 0.95));   // Delhi to Bengaluru (via highways)

        // Central India expansion
        routes.add(new RouteConnection(21, 22, 350, 0.95));  // Bhopal to Nagpur
        routes.add(new RouteConnection(22, 23, 285, 0.95));  // Nagpur to Raipur
        routes.add(new RouteConnection(0, 21, 780, 1.0));    // Delhi to Bhopal
        routes.add(new RouteConnection(3, 21, 780, 0.95));   // Mumbai to Bhopal
        routes.add(new RouteConnection(9, 22, 1050, 0.95));  // Bengaluru to Nagpur

        // North-East expansion
        routes.add(new RouteConnection(6, 24, 1030, 1.0));   // Kolkata to Guwahati
        routes.add(new RouteConnection(24, 25, 100, 1.1));   // Guwahati to Shillong
        routes.add(new RouteConnection(24, 26, 320, 1.0));   // Guwahati to Silchar
        routes.add(new RouteConnection(25, 26, 290, 1.05));  // Shillong to Silchar

        // Kerala + South expansion
        routes.add(new RouteConnection(12, 27, 690, 0.95));  // Chennai to Kochi
        routes.add(new RouteConnection(27, 28, 205, 1.0));   // Kochi to Trivandrum
        routes.add(new RouteConnection(27, 29, 185, 0.95));  // Kochi to Kozhikode
        routes.add(new RouteConnection(13, 29, 175, 0.9));   // Coimbatore to Kozhikode

        // Andhra expansion
        routes.add(new RouteConnection(12, 30, 455, 0.95));  // Chennai to Vijayawada
        routes.add(new RouteConnection(30, 31, 350, 1.0));   // Vijayawada to Vizag
        routes.add(new RouteConnection(30, 32, 255, 1.0));   // Vijayawada to Nellore
        routes.add(new RouteConnection(10, 30, 275, 1.0));   // Hyderabad to Vijayawada
        routes.add(new RouteConnection(31, 6, 870, 0.95));   // Vizag to Kolkata
        
        // More dense connections for better routing
        routes.add(new RouteConnection(1, 0, 30, 1.3));      // Return routes (bidirectional)
        routes.add(new RouteConnection(2, 1, 35, 1.1));
        routes.add(new RouteConnection(2, 0, 40, 1.2));
        
        routes.add(new RouteConnection(4, 3, 150, 1.2));
        routes.add(new RouteConnection(5, 4, 145, 1.1));
        routes.add(new RouteConnection(5, 3, 60, 1.3));
        routes.add(new RouteConnection(34, 3, 35, 1.2));
        routes.add(new RouteConnection(5, 34, 25, 1.2));
        routes.add(new RouteConnection(4, 34, 120, 1.1));
        routes.add(new RouteConnection(33, 4, 12, 1.15));
        routes.add(new RouteConnection(33, 3, 145, 1.2));
        routes.add(new RouteConnection(35, 4, 210, 1.0));
        routes.add(new RouteConnection(36, 35, 8, 1.1));
        routes.add(new RouteConnection(37, 4, 235, 1.0));
        routes.add(new RouteConnection(38, 37, 12, 1.05));
        routes.add(new RouteConnection(39, 4, 230, 1.0));
        routes.add(new RouteConnection(41, 4, 250, 1.0));
        routes.add(new RouteConnection(37, 35, 190, 1.0));
        routes.add(new RouteConnection(35, 3, 170, 1.05));
        routes.add(new RouteConnection(40, 22, 8, 1.1));
        routes.add(new RouteConnection(22, 37, 500, 1.0));
        routes.add(new RouteConnection(22, 41, 320, 1.0));
        
        routes.add(new RouteConnection(7, 6, 30, 1.1));
        routes.add(new RouteConnection(8, 7, 150, 0.9));
        
        routes.add(new RouteConnection(10, 9, 600, 1.0));
        routes.add(new RouteConnection(11, 10, 15, 1.2));
        routes.add(new RouteConnection(12, 9, 350, 0.95));
        routes.add(new RouteConnection(13, 12, 450, 0.9));
        routes.add(new RouteConnection(14, 13, 80, 0.85));

        // Bidirectional links for expanded network
        routes.add(new RouteConnection(22, 21, 350, 0.95));
        routes.add(new RouteConnection(23, 22, 285, 0.95));
        routes.add(new RouteConnection(21, 0, 780, 1.0));
        routes.add(new RouteConnection(21, 3, 780, 0.95));
        routes.add(new RouteConnection(22, 9, 1050, 0.95));

        routes.add(new RouteConnection(24, 6, 1030, 1.0));
        routes.add(new RouteConnection(25, 24, 100, 1.1));
        routes.add(new RouteConnection(26, 24, 320, 1.0));
        routes.add(new RouteConnection(26, 25, 290, 1.05));

        routes.add(new RouteConnection(27, 12, 690, 0.95));
        routes.add(new RouteConnection(28, 27, 205, 1.0));
        routes.add(new RouteConnection(29, 27, 185, 0.95));
        routes.add(new RouteConnection(29, 13, 175, 0.9));

        routes.add(new RouteConnection(30, 12, 455, 0.95));
        routes.add(new RouteConnection(31, 30, 350, 1.0));
        routes.add(new RouteConnection(32, 30, 255, 1.0));
        routes.add(new RouteConnection(30, 10, 275, 1.0));
        routes.add(new RouteConnection(6, 31, 870, 0.95));
        
        return routes;
    }
    
    /**
     * Get GraphQL-like product listing from warehouses
     * Maps which warehouses stock which product categories
     */
    public static Map<Integer, List<String>> getWarehouseInventory() {
        Map<Integer, List<String>> inventory = new HashMap<>();
        
        // Delhi Warehouse stocks electronics, books, home & kitchen
        inventory.put(0, Arrays.asList("ELECTRONICS", "BOOKS", "HOME_KITCHEN"));
        
        // Mumbai Warehouse: fashion, electronics, jewelry
        inventory.put(3, Arrays.asList("FASHION", "ELECTRONICS", "JEWELRY"));
        
        // Kolkata: books, traditional items
        inventory.put(6, Arrays.asList("BOOKS", "HANDICRAFTS"));
        
        // Bengaluru: IT products, electronics
        inventory.put(9, Arrays.asList("ELECTRONICS", "IT_EQUIPMENT"));
        
        // Chennai: textiles, traditional
        inventory.put(12, Arrays.asList("TEXTILES", "TRADITIONAL"));
        
        // Ahmedabad: handicrafts, fabrics
        inventory.put(15, Arrays.asList("HANDICRAFTS", "FABRICS"));
        
        // Jaipur: jewelry, handicrafts
        inventory.put(18, Arrays.asList("JEWELRY", "HANDICRAFTS"));
        
        return inventory;
    }
}
