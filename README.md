# LogiCore - High-Performance Network Optimization & Logistics Engine

Initial implementation based on the attached project brief.

## What Is Implemented

- Java Spring Boot backend scaffold (`backend/`)
- Core algorithm APIs:
  - Dijkstra shortest path with min-heap priority queue
  - Exact TSP solver using Bitmask Dynamic Programming
  - Tarjan bridge detection for network resilience
- React + Tailwind frontend starter (`frontend/`) with API test dashboard cards

## Project Structure

- `backend/`: Spring Boot API and algorithm engine
- `frontend/`: Vite React dashboard UI
- `LogiCore_requirements_extracted.txt`: Text extracted from project PDF for traceability

## Run Backend

1. Install Java 17+ and Maven.
2. Run:

```powershell
cd backend
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`.

## Run Frontend

1. Install Node.js 18+.
2. Run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

## API Endpoints

- `POST /api/v1/graph/dijkstra`
- `POST /api/v1/graph/tsp/exact`
- `POST /api/v1/graph/bridges`

All sample payloads are preloaded in the frontend dashboard cards.

## Next Build Phases

1. Add persistent storage (MySQL/PostgreSQL + spatial support)
2. Add AVL/Red-Black index module for location lookup
3. Integrate Cytoscape graph visualization and step-by-step algorithm playback
4. Add dynamic rerouting simulation for edge/node failures
5. Add unit/integration tests and performance benchmarks
