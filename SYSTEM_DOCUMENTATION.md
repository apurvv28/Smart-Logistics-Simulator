# LogiCore: Advanced Multi-Phase Logistics System
**The Definitive Blueprint for National Hub Transit & Last-Mile Delivery**

---

## 🚀 1. System Vision & Overview
LogiCore is an advanced logistics simulation engine designed to visualize and optimize the lifecycle of a package—from national hub transit to last-mile customer delivery. The system is engineered as a **three-stage evolutionary pipeline**, bridging abstract graph theory with high-fidelity geospatial navigation.

### Core Value Proposition
- **Algorithmic Transparency**: Real-time visualization of pathfinding logic.
- **Geospatial Fidelity**: Integration with OSRM for road-accurate urban navigation.
- **Seamless Integration**: A unified data bridge between inter-city and intra-city operations.

---

## 🛠 2. Technical Architecture & Tech Stack

### Backend (The Algorithm Engine)
*   **Core**: Java 17+ / Spring Boot 3.3.5.
*   **Pathfinding**: Custom-built graph implementations including **Dijkstra**, **Bellman-Ford**, and **A***.
*   **TSP Solver**: A heuristic-based **Greedy Nearest-Neighbor** approach for optimizing multi-stop city delivery sequences.
*   **Geo-Services**: OSRM (Open Source Routing Machine) API for fetching road geometry and distance metrics.
*   **Telemetry**: WebSocket (STOMP) for persistent, low-latency status streaming.

### Frontend (Mission Control)
*   **Core**: React 18 / Vite.
*   **Mapping**: Leaflet.js with customized tile layers for high-performance geospatial rendering.
*   **Visualization**: Dynamic SVG graph overlays for the national hub network.
*   **State Management**: `localStorage` Bridge for cross-phase session persistence.
*   **Aesthetics**: Vanilla CSS emphasizing **Glassmorphism**, vibrant gradients, and fluid micro-animations.

---

## 📑 3. The Three-Phase Logistics Lifecycle

### Phase 1: Inter-City National Network (Macro Phase)
**Objective**: Automating the movement of goods between major industrial hubs across India.
- **Scope**: National-scale logistics involving 30+ primary nodes (Delhi, Mumbai, Kolkata, etc.).
- **Process Highlights**:
    - **Dynamic Routing**: Users select origin/destination hubs and compare algorithm performance.
    - **Network Resilience**: Calculation of shortest paths considering both physical distance and real-time traffic weights.
    - **Telemetry Feed**: Live tracking of the "National Transit Packet" via an interactive SVG map.

### Phase 2: Intra-City Multi-Stop Distribution (Micro Phase)
**Objective**: Optimizing the "Last-Mile" distribution within an urban environment.
- **Unification Note**: This phase consolidates **Multi-City Network** and **Intra-City Delivery** concepts into a single optimized module.
- **Process Highlights**:
    - **Multi-Stop TSP**: Packages are distributed from a central warehouse to 4+ delivery stops in a single optimized voyage.
    - **Road-Accurate Transit**: Markers follow actual road paths (not straight lines) provided by OSRM geometry.
    - **Agent Animation**: A professional side-view sports bike marker with rolling wheels and speed-line effects.
    - **Dwell Management**: Simulated 5-second hand-over pauses at each stop with a premium arrival overlay.

### Phase 3: End-to-End Integrated Journey (The Grand Finale)
**Objective**: Synchronizing national transit and local delivery into a single, uninterrupted mission.
- **Process Highlights**:
    - **Session Handshake**: Automatically retrieves the destination hub from Phase 1 and the delivery addresses from Phase 2.
    - **State Transition**: The UI seamlessly shifts from the National SVG view to the Local Map view upon reaching the destination city hub.
    - **Synchronized UI**: A unified progress bar tracks the entire journey from the source warehouse (0%) to the final customer doorstep (100%).
    - **Algorithmic Harmony**: Combines Dijkstra (Inter-city) and Greedy TSP (Intra-city) into a single execution thread.

---

## 🧠 4. Intelligence & Algorithm Arena

| Phase | Algorithm | Primary Responsibility | Technical Strength |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Dijkstra / Bellman-Ford** | Hub-to-Hub Routing | Optimal pathfinding on complex national graphs. |
| **Phase 2** | **Greedy Nearest-Neighbor** | Multi-Stop Optimization | Efficiency in solving the Traveling Salesman Problem (TSP). |
| **Phase 3** | **A*** | Heuristic-Guided Navigation | Rapid execution for long-distance transit across multiple nodes. |

---

## ⚡ 5. Data Flow & Persistence Bridge

1.  **Phase 1 Data**: `localStorage.setItem('logicore_phase1', ...)` captures the Origin Hub and Global Algorithm.
2.  **Phase 2 Data**: `localStorage.setItem('logicore_phase2', ...)` captures the local Warehouse, 4 Delivery Addresses, and the TSP Sequence.
3.  **Phase 3 Initialization**: The E2E Mission Control reads both keys simultaneously to reconstruct the full journey without requiring user re-input.
4.  **Real-Time Sync**: Telemetry updates for Phase 3 are managed via a dedicated `LocalDeliveryController` endpoint that simulates the transition from Macro to Micro phases.

---

## 🎨 6. Design Philosophy
- **Glassmorphism**: High transparency panels with `backdrop-filter` for a modern SaaS aesthetic.
- **Dynamic Gradients**: Semantic use of color (Indigo for Transit, Amber for Delivery, Emerald for Success).
- **Interactive Layers**: Multi-layer maps with custom markers and SVG-animated path traces.

---
*Developed by Antigravity — Smart Logistics Division.*
