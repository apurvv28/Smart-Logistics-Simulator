# Testing Guide: Phase 3 & Phase 4 Simulations

## Overview
Both Phase 3 (Intra-City Last-Mile Delivery) and Phase 4 (End-to-End Complete Journey) simulations are now **LIVE** and ready to test on the frontend.

---

## Quick Start

### Services Running
- **Backend**: http://localhost:8080 (Spring Boot)
- **Frontend**: http://localhost:5175 (Vite React)

### Access the Simulations
1. Navigate to: `http://localhost:5175/`
2. You'll see the **SimulationLandingPage** with 3 simulation options:
   - ✓ Inter-City Network Simulation (Ready)
   - ✓ **Intra-City Last-Mile Delivery (Ready)** ← New!
   - ✓ **End-to-End Complete Journey (Ready)** ← New!

---

## Phase 3: Intra-City Last-Mile Delivery

### What to Test
**Route**: Pune Warehouse → 4 Delivery Stops → Return to Warehouse

**Delivery Stops**:
- Stop 1: Shivaji Nagar (18.5523°N, 73.8479°E)
- Stop 2: Koregaon Park (18.5347°N, 73.8787°E)
- Stop 3: Viman Nagar (18.5672°N, 73.9125°E)
- Stop 4: Hadapsar (18.5183°N, 73.9288°E)

**Flow**:
1. Click "Launch Simulation" on the Intra-City card
2. Page loads IntraCityDeliveryPage
3. Backend calculates TSP-optimized route via `/api/local-delivery/calculate-route`
4. **Leaflet Map** renders with:
   - Red warehouse marker 🏭
   - Blue delivery stop markers 🎯
   - Green dashed planned route
5. Click "Start" to animate van movement
6. Van moves sequentially through all stops (2-second intervals)
7. Each stop is marked as ✓ delivered
8. Progress bar updates from 0% → 100%
9. Status: "✅ All deliveries completed!"

**Backend Endpoints Used**:
- `POST /api/local-delivery/calculate-route` → Calculate TSP
- `POST /api/local-delivery/get-progress` → Track progress

**Technologies**:
- React-Leaflet (map visualization)
- OpenStreetMap tiles (real city data)
- Greedy TSP algorithm (route optimization)
- Haversine distance formula (accurate geo-calculations)

---

## Phase 4: End-to-End Complete Journey

### What to Test
**Complete Journey**: Delhi Warehouse → Pune Warehouse → 4 Delivery Stops

**Macro Phase (Inter-City)**:
- Route: Delhi (Node 0) → Intermediate Cities → Pune (Node 8)
- Distance: ~1400km
- Options: Bellman-Ford or Floyd-Warshall
- Duration: ~12-16 steps × 2 seconds = 24-32 seconds

**Micro Phase (Intra-City)**:
- Route: Pune Warehouse → 4 customer addresses → warehouse
- Distance: ~23.45km
- Options: Dijkstra or A*
- Duration: ~6-8 steps × 2 seconds = 12-16 seconds

**Flow**:
1. Click "Launch Simulation" on the End-to-End card
2. Page shows algorithm configuration panel (SETUP phase)
3. Select macro algorithm:
   - **Bellman-Ford** (O(V·E), safer, reliable)
   - **Floyd-Warshall** (O(V³), pre-computed)
4. Select micro algorithm:
   - **Dijkstra** (O(E log V), standard)
   - **A*** (O(E), fastest with heuristic)
5. Click "▶ Start Journey"
6. **MACRO PHASE begins** (Blue UI theme)
   - Shows Delhi → Pune city network route
   - Displays distance, algorithm, progress
   - NetworkGraphVisualizer shows cities connecting
   - 2-second animation between each city
7. **AUTO-TRANSITION** when package arrives at Pune warehouse
   - UI smoothly fades from network map to city map
   - AlgorithmAuditPanel shows both algorithms now
8. **MICRO PHASE begins** (Green UI theme)
   - Shows Pune city map with 4 delivery stops
   - Van animates from warehouse → each stop
   - Progress continues (50-100%)
9. **COMPLETION**
   - Final delivery complete message
   - Shows total distance, total time, both algorithms used

**Backend Endpoints Used**:
- `POST /api/end-to-end/initiate-journey` → Create journey with both routes
- `POST /api/end-to-end/advance-step/{journeyId}` → Move forward one step
- `GET /api/end-to-end/audit/{journeyId}` → Get algorithm audit data

**Technologies**:
- Dual graph algorithms (Bellman-Ford, Floyd-Warshall, Dijkstra, A*)
- State bridging (transitional logic between phases)
- Conditional rendering (auto-swap views)
- React hooks (useEndToEndState for orchestration)

---

## Testing Scenarios

### Scenario 1: Compare Algorithms
**Macro Phase Comparison**
- Run with Bellman-Ford, note execution time
- Run with Floyd-Warshall, compare
- Observe different routes and distances

**Micro Phase Comparison**
- Run with Dijkstra, note time and path
- Run with A*, compare
- Check audit panel for metrics

### Scenario 2: Full End-to-End Journey
- Run with Bellman-Ford + Dijkstra (standard)
- Watch phase transition at Pune warehouse
- Verify progress calculation (40% macro + 60% micro)
- Confirm final delivery at customer address

### Scenario 3: Performance Analysis
- Open browser DevTools → Performance tab
- Run full journey simulation
- Track render times during animation
- Check API response times in Network tab

---

## Expected Results

✅ **Phase 3 Success Criteria**:
- [ ] Leaflet map loads with Pune centered
- [ ] Warehouse and 4 delivery stops visible
- [ ] Route calculation responds within 1 second
- [ ] Van animates smoothly through all stops
- [ ] Progress bar reaches 100%
- [ ] All stops marked as delivered

✅ **Phase 4 Success Criteria**:
- [ ] Setup dialog opens with algorithm selections
- [ ] Journey initializes with valid macro + micro routes
- [ ] Macro phase shows city network visualization
- [ ] Cities animate sequentially
- [ ] Phase transitions smoothly at Pune arrival
- [ ] Micro phase shows Pune city map with stops
- [ ] Van delivers to all 4 stops
- [ ] Overall progress reaches 100%
- [ ] AlgorithmAuditPanel shows both phases simultaneously
- [ ] Completion message and statistics display

---

## Debugging / Troubleshooting

### Issue: "Failed to calculate route"
**Solution**: Ensure Spring Boot backend is running on port 8080
```bash
mvn spring-boot:run  # In backend folder
```

### Issue: Map not loading in Phase 3
**Solution**: Check browser console for CORS errors. Verify:
- React-Leaflet is installed: `npm ls react-leaflet`
- Leaflet CSS is imported in IntraCityMapSimulator.jsx
- TileLayer source is correct (OpenStreetMap)

### Issue: Phase transition not happening
**Solution**: Check browser DevTools:
- Network tab: POST to `/advance-step` should return updated `currentPhase`
- Phase value should change from `IN_MACRO_TRANSIT` → `ARRIVED_AT_HUB` → `IN_MICRO_TRANSIT`

### Issue: AlgorithmAuditPanel not showing dual phases
**Solution**: Verify EndToEndJourneyPage passes `endToEndAuditData` prop to AlgorithmAuditPanel

---

## Architecture Reference

```
┌─ SimulationLandingPage ─┐
│ (3 simulation cards)     │
└─────────────────────────┘
         ↓ ↓ ↓
    ┌────┴─┴─┴─────────────────────┐
    ↓              ↓                ↓
[Inter-City]  [Intra-City]  [End-to-End]
    ↓              ↓                ↓
Mission+Map  IntraCityMap   EndToEndJourney
    ↓              ↓                ↓
Network Viz   Leaflet Map    (Macro→Micro)
    ↓              ↓                ↓
NetworkGraph  IntraCityMapSim  NetworkGraph+Leaflet
```

---

## Files Modified for Testing

✅ **Changes Made**:
1. `SimulationLandingPage.jsx` → Removed `disabled: true` from Phase 3 & 4 cards
2. `SimulationLandingPage.jsx` → Changed status from "🔄 Coming Soon" to "✓ Ready"

✅ **No Breaking Changes**:
- All Phase 1 & 2 functionality preserved
- Existing routes and components unchanged
- Backend is backward compatible

---

## Happy Testing! 🚀

**Start here**: http://localhost:5175/

All three simulations are now fully operational and ready for comprehensive testing of graph algorithms in logistics optimization!
