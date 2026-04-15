# LogiCore - Advanced Network Optimization & Multi-Phase Logistics Engine

LogiCore is a professional logistics simulation system built with **Spring Boot** and **React**. It visualizes the entire lifecycle of a package voyage—from national inter-city transit to high-precision urban "last-mile" delivery.

---

## 🚀 Key Simulation Phases

The system is structured into **three definitive phases** of logistics evolution:

### 1. Phase 1: National Inter-City Network
- **Objective**: Optimize transit between major Indian hubs (Delhi, Mumbai, Bengaluru, etc.).
- **Tech**: Dijkstra/Bellman-Ford algorithms on a weighted national graph.
- **Visuals**: Animated SVG hub-and-spoke visualization with real-time telemetry.

### 2. Phase 2: Intra-City Last-Mile & Multi-Stop Delivery
- **Objective**: High-fidelity urban distribution within a specific city.
- **Unified Logic**: Combines local navigation with multi-stop distribution optimization.
- **Tech**: Greedy Nearest-Neighbor (TSP) algorithm, OSRM road geometry, and Haversine distance.
- **Visuals**: Animated side-view bike marker on a Leaflet map with actual road-following behavior.

### 3. Phase 3: End-to-End Mission Journey
- **Objective**: The synchronized integration of Phase 1 and Phase 2.
- **Persistence**: Uses a "Session Bridge" (localStorage) to link national routing results directly into the local city delivery map.
- **Experience**: A seamless transition from the National Macro view to a street-level Micro view.

---

## 🛠 Technology Stack

### Backend
- **Java 17 / Spring Boot 3.3.5**: Core simulation engine.
- **Graph Algorithms**: Dijkstra, Bellman-Ford, Floyd-Warshall, and Greedy TSP.
- **Telemetry**: STOMP over WebSockets for live status streaming.
- **Data Integration**: External OSRM API for road-accurate GPS coordinate fetching.

### Frontend
- **React 18 / Vite**: Ultra-fast, modular Mission Control dashboard.
- **Leaflet.js**: Geospatial rendering for city-scale delivery.
- **Vanilla CSS**: Premium "Aesthetic Dashboard" design system with glassmorphism and smooth animations.
- **Lucide-React**: High-resolution iconography.

---

## ⚙️ Quick Start

### 1. Backend
```powershell
cd backend
mvn spring-boot:run
```
Started at `http://localhost:8081`.

### 2. Frontend
```powershell
cd frontend
npm install
npm run dev
```
Started at `http://localhost:5173`.

---

## 🔬 Project Documentation
For a deep dive into the algorithmic implementation, architecture, and design philosophy, refer to:
👉 **[SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)**

---
*Developed by Antigravity — Smart Logistics Division.*


