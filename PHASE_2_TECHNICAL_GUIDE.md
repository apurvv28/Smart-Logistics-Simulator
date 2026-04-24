# LogiCore: Phase 2 — Intra-City Delivery Technical Guide

## Overview
Phase 2 of the LogiCore Smart Logistics Simulator focuses on **Last-Mile Delivery Optimization**. It simulates the process of taking packages from a local fulfillment center (warehouse) and delivering them to multiple customer locations within a single city using the most efficient route.

---

## 🛠 How It Works: Step-by-Step

### 1. City & Warehouse Selection
*   **Action**: The user selects a city (e.g., Pune, Delhi) and a specific warehouse hub.
*   **Logic**: The system fetches preset warehouse coordinates for that city from the backend. The map automatically centers on the selected city center.

### 2. Dynamic Address Geocoding
*   **Action**: The user searches for addresses or landmarks (e.g., "Amanora Mall", "Shivaji Nagar").
*   **Technology**: We use the **Nominatim (OpenStreetMap) API**.
*   **Process**: 
    1.  As the user types, a debounced request is sent to Nominatim.
    2.  The search is **region-bounded** to the selected city's lat/lng coordinates to ensure relevant results.
    3.  Coordinates (Lat/Lng) are extracted and saved for each selected stop.

### 3. Route Optimization (The Algorithm)
*   **Problem**: This is a classic **Traveling Salesman Problem (TSP)**—finding the shortest path that visits all points and returns to the start.
*   **Algorithm**: **Greedy Nearest-Neighbor (Heuristic)**.
    1.  **Start**: Warehouse (Hub).
    2.  **Next Step**: The algorithm looks at all unvisited delivery stops and calculates the **Haversine Distance** (distance on a sphere) to each.
    3.  **Action**: It moves to the closest stop.
    4.  **Repeat**: This continues until all selected stops are visited.
    5.  **Return**: Finally, the path returns to the Warehouse.

### 4. Real-Road Mapping (OSRM Integration)
*   **Problem**: Points A and B are connected by roads, not just straight lines.
*   **Action**: Once the stops are ordered by the algorithm, the system sends the sequence to the **OSRM (Open Source Routing Machine)**.
*   **Result**: OSRM returns high-resolution road geometry (polylines) that align perfectly with city streets.

### 5. Live Simulation & Animation
*   **Action**: A delivery agent (Van) follows the OSRM road path.
*   **Key Features**:
    *   **Dwell Time**: The agent pauses for 5 seconds at each stop to simulate package hand-off.
    *   **Bearing Logic**: The agent icon rotates dynamically based on its movement direction between two GPS points.
    *   **Progress Tracking**: A live status panel tracks the percentage of completion and the current delivery destination.

---

## 🏗 System Architecture

### Frontend (React + Leaflet)
*   **`useIntraCitySelection.js`**: A custom hook managing the state of selected cities, warehouses, and the delivery address list.
*   **`IntraCityMapSimulator.jsx`**: The core rendering engine for the map, polylines, and agent animation.
*   **`geocodingService.js`**: Handles communication with the OpenStreetMap search API.

### Backend (Spring Boot + Java)
*   **`LocalDeliveryController.java`**: Exposes endpoints for warehouse lookup and TSP route calculation.
*   **`LocalDeliveryService.java`**: Contains the mathematical logic for the Haversine formula and the Greedy TSP optimization.

---

## 📦 Phase 3 Bridge (Data Handoff)
Once the simulation is ready, the system serializes the entire state (optimized sequence, distances, and road paths) into the browser's `localStorage` under the key `logicore_phase2`. This allows **Phase 3 (End-to-End Journey)** to instantly load the user's specific route without recalculating.

---

## 🚀 Accuracy & Performance
*   **Optimization Speed**: < 50ms for up to 20 stops.
*   **Road Realism**: Powered by OSRM driving profiles.
*   **UX**: Smooth 60fps animations using `requestAnimationFrame`.
