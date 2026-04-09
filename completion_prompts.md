# LogiCore Project Completion: AI Prompts Guide

This document contains a comprehensive set of high-quality prompts designed to guide an AI agent (or developer) through the completion and enhancement of the **LogiCore** simulation project. 

## Project Context
**LogiCore** is a full-stack logistics and supply-chain simulation application.
- **Backend:** Java (Spring Boot) providing REST APIs and WebSocket (`SimulationEventPublisher`) for real-time simulation updates.
- **Graph Algorithms Built-in:** The engine currently implements 4 core graph-based algorithms for routing: `DijkstraService`, `AStarService`, `BellmanFordService`, and `FloydWarshallService`.
- **Frontend:** React + Vite + Tailwind CSS. Features components like `AlgorithmAuditPanel`, `NetworkGraphVisualizer`, `ScenarioSimulator`, and geographical elements mapping an `IndiaLogisticsNetwork`.
- **Current State:** The application simulates city-to-city logistics, plotting cities, warehouses, and delivery vans on a network graph.

---

## The Prompts

Copy and paste these prompts sequentially into your AI assistant to complete the project phases.

### Phase 1: Verify and Stabilize Existing Pipeline

**Prompt:**
```text
Task: Verify and stabilize the existing LogiCore simulation pipeline. 

Context:
Our current stack is React+Vite (frontend) and Java Spring Boot (backend). The backend uses WebSockets to publish `SimulationEvent` objects which the frontend consumes. 

Instructions:
1. Review the backend controllers (`OrderDeliveryController`, `SimulationController`) and the frontend state management (e.g., `useCampaignState.js`, Socket handlers).
2. Verify that the entire logistics simulation pipeline works flawlessly from end-to-end: Order Placed -> Processing -> Transit (City to City) -> Out for Delivery -> Delivered -> Return (if applicable).
3. Ensure no WebSocket disconnections crash the app and that state updates organically on the UI.
4. Fix any bugs in the current city-to-city traversal logic utilizing the existing graph algorithms (Dijkstra, A*, Bellman-Ford, Floyd-Warshall). 
5. Do not add new features yet; just make sure the existing baseline is 100% robust and smooth. Please show me the code changes required to ensure this stability.
```

### Phase 2: Create a Landing Page & Option 1 (Existing Pipeline)

**Prompt:**
```text
Task: Refactor the frontend to include a new Main Landing Page with 3 distinct simulation options.

Context: 
We need to modularize our simulation views. Currently, the app loads directly into the main dashboards (`MapAndChroniclePage` / `MissionControlPage`).

Instructions:
1. Create a `StoryHomePage.jsx` layout that acts as a modern landing page.
2. The landing page should present 3 clear simulation options (Cards/Buttons) for the user to choose from:
   - Option 1: Inter-City Network Simulation (The existing pipeline).
   - Option 2: Intra-City Last-Mile Delivery Simulation.
   - Option 3: End-to-End Complete Journey Simulation.
3. Hook up Option 1 to route strictly to our currently built visualizer and scenario simulator.
4. Set up placeholder routes/components for Option 2 and Option 3. 
Provide the React code and React Router setup to achieve this structure.
```

### Phase 3: Implement Option 2 - Intra-City Last-Mile Delivery (Multiple Stops)

**Prompt:**
```text
Task: Implement "Option 2", the Intra-City Last-Mile Delivery Simulation.

Context:
This option simulates a delivery partner starting from a specific city's warehouse (e.g., Pune Warehouse) and delivering multiple different orders to specific customer addresses within that same city. 

Instructions:
1. Integrate the OpenStreetMap API (via a library like Leaflet/React-Leaflet) to render an actual city map (e.g., Pune).
2. Generate mock nodes on this real-world map representing the Warehouse and 3-4 random customer delivery addresses.
3. ONLY use the 4 graph algorithms already available in this project (A*, Dijkstra, Bellman-Ford, Floyd-Warshall) to calculate the shortest path traversing all these points (e.g., Warehouse -> Address 1 -> Address 2 -> Address 3).
4. Visualize the calculated shortest path natively on the map.
5. Animate a delivery van moving along this path, dropping off parcels one by one, and returning to the warehouse.
6. Provide the architectural updates needed for the Java backend to support this localized routing calculation and the React code for the OpenStreetMap visualization.
```

### Phase 4: Implement Option 3 - End-to-End Complete Journey

**Prompt:**
```text
Task: Implement "Option 3", the End-to-End Logistics Journey combining both scopes.

Context:
This is the ultimate simulation. It must show an order being placed and fulfilled from a distant origin city, traveling to the destination city, and then seamlessly moving to the last-mile delivery format.

Instructions:
1. Start the simulation in the macro view (Inter-City network). Show the item traveling from City A (e.g., Delhi) to the destination warehouse in City B (e.g., Pune). 
2. Use Bellman-Ford or Floyd-Warshall to calculate this macro-level transit across the India network.
3. Once the package arrives at City B's logistics center, transition the UI seamlessly to the micro view (Intra-City OpenStreetMap simulation built in Phase 3).
4. Use Dijkstra or A* to calculate the local shortest path from the City B warehouse to the specific customer's doorstep.
5. Animate the final delivery. 
6. Ensure that the 'AlgorithmAuditPanel' accurately updates to reflect which algorithm is being used at which stage of the journey (Macro vs Micro).
Provide the necessary state bridging logic (React) and backend hand-offs (Java) to link these two simulations into one continuous flow.
``` 
