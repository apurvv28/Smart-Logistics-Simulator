# LogiCore: Advanced Multi-Phase Logistics Simulation System

## 🚀 System Overview
LogiCore is a high-performance logistics simulation engine designed to visualize and optimize the lifecycle of a package—from national hub transit to last-mile delivery. The system bridges complex graph theory algorithms with real-world geospatial data to provide a seamless, end-to-end logistics narrative.

---

## 🛠 Tech Stack

### Backend (The "Engine")
- **Language**: Java 17+
- **Framework**: Spring Boot 3.3.5
- **Communication**: REST API & WebSockets (STOMP) for real-time telemetry.
- **Algorithms**: 
  - **Inter-City**: Dijkstra, Bellman-Ford, Floyd-Warshall, A*.
  - **Intra-City**: Greedy Nearest-Neighbor (TSP), Haversine Distance Calculation.
- **Geospatial**: OSRM (Open Source Routing Machine) integration for road-accurate geometry.

### Frontend (The "Mission Control")
- **Framework**: React 18 (Vite)
- **Styling**: Vanilla CSS with modern "Aesthetic Premium" principles (Glassmorphism, Dark Modes, Vibrant Gradients).
- **Icons**: Lucide-React.
- **Maps**: Leaflet.js with React-Leaflet and OpenStreetMap tiles.
- **State Management**: 
  - **Phase Bridge**: `localStorage` used for cross-page data persistence between simulation nodes.
  - **Dashboards**: Custom React hooks (`useCampaignState`, `useEndToEndState`) for animation and API synchronization.

---

## 📑 Phase Documentation

### Phase 1: National Inter-City Network
**Objective**: Stabilizing the national logistics pipeline and implementing core routing algorithms across Indian hubs.
- **Features**:
  - **Order Lifecycle**: Automated creation → Warehouse picking → National routing → Delivery simulation.
  - **Algorithm Arena**: Compare execution speed and path optimality between Dijkstra and Bellman-Ford.
  - **WebSocket Telemetry**: Live status updates streamed from the backend to a "Chronicle Timeline."
- **Visuals**: Abstract SVG-based graph represents the national backbone (Delhi, Mumbai, Pune, etc.).

### Phase 2: Last-Mile Delivery (Intra-City)
**Objective**: Transitioning from abstract hub-to-hub transit to real-world street-level delivery.
- **Features**:
  - **City Registry**: Pre-configured data for 30+ major Indian cities including Pune, Mumbai, Delhi, Kolakata, etc.
  - **Road-Aligned Routing**: Instead of straight lines, the simulator fetches actual road geometry from the OSRM API.
  - **Animated Rider**: High-fidelity side-view sports bike marker with spinning wheels and speed lines.
- **Visuals**: High-resolution Leaflet map with multi-stop pins (warehouse + 4 delivery stops).


### Phase 4: End-to-End Mission Synchronization
**Objective**: The "Grand Finale"—bridging Phase 1 and Phase 2 into a single, seamless mission.
- **Features**:
  - **Session Intelligence**: Reads data from previous simulation phases (via `localStorage`) to auto-populate the E2E journey.
  - **Dual-Segment Animation**: Packages first move on the National SVG Graph (Macro Phase), then transition to a detailed Leaflet map (Micro Phase) upon arrival at the destination city.
  - **Delivery Dwells**: Implementation of 5-second "dwell-time" pauses at each stop with a premium "Package Delivered" overlay.
  - **Segmented Progress**: A dual-logic progress bar tracking both inter-city transit and local delivery completion.

---

## ⚙️ Backend Process & Workflow

1. **Initialization**: When a journey starts, the backend builds a `LogisticsGraph` from pre-defined nodes and edges representing the Indian road/rail network.
2. **Pathfinding**: The user selects a "Macro" and "Micro" algorithm. The backend calculates the shortest path between city hubs (National scale) and then optimizes the stop sequence within the target city (Last-mile scale).
3. **Telemetry Streaming**: During the simulation, the backend publishes STOMP messages over WebSockets at every "step." This includes GPS coordinates, current speed, and status messages.
4. **Dwell Management**: The backend manages the 5-second dwell timers for deliveries, pausing the packet transit to simulate actual unloading operations.
5. **Session Bridge**: Front-end captures data from each phase to ensure that if a user routes from Delhi to Pune in Phase 1, Phase 4 automatically starts in Delhi and ends on a Pune city map.

---

## 🎨 Design Philosophy
The system follows a **"Premium Dashboard"** aesthetic:
- **Rich Gradients**: Use of Indigo, Purple, and Amber to distinguish between different phases of logistics.
- **Micro-Animations**: Hover-effects, pulse-ring delivery markers, and spinning wheel markers enhance interactive engagement.
- **Data-Driven**: Every visual element—from the progress bar to the audit panel—is backed by real calculation data from the Spring Boot engine.
