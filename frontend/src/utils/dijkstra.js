/**
 * Generic Dijkstra's Shortest Path Algorithm
 * @param {Object} graph - { nodes: [], edges: [] }
 * @param {string|number} startNodeId - ID of origin node
 * @param {string|number} endNodeId - ID of destination node
 * @returns {Object} - { path: [], totalDistance: number, steps: [] }
 */
export const calculateDijkstra = (graph, startNodeId, endNodeId) => {
  const { nodes, edges } = graph;
  
  // Initialize distances, previous nodes, and unvisited set
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  const steps = [];

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  distances[startNodeId] = 0;

  let stepCount = 0;
  steps.push({
    step: stepCount++,
    type: 'INITIALIZE',
    description: `Initialized distances. Start node ${startNodeId} is 0, all others ∞.`,
    distances: { ...distances },
    unvisited: Array.from(unvisited)
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentNodeId = null;
    let minDistance = Infinity;

    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNodeId = nodeId;
      }
    });

    if (currentNodeId === null || currentNodeId === endNodeId || distances[currentNodeId] === Infinity) {
      break;
    }

    unvisited.delete(currentNodeId);
    
    const currentNode = nodes.find(n => n.id === currentNodeId);
    const currentName = currentNode ? currentNode.name : `Node ${currentNodeId}`;

    steps.push({
      step: stepCount++,
      type: 'PROCESS_NODE',
      currentNodeId,
      currentName,
      description: `Processing ${currentName}. Checking its neighbors...`,
      distances: { ...distances }
    });

    // Find neighbors (outgoing edges)
    const neighbors = edges.filter(edge => edge.from === currentNodeId || edge.source === currentNodeId);

    neighbors.forEach(edge => {
      const neighborId = edge.to !== undefined ? edge.to : edge.target;
      if (!unvisited.has(neighborId)) return;

      const weight = edge.distance || edge.weight || 0;
      const newDistance = distances[currentNodeId] + weight;

      if (newDistance < distances[neighborId]) {
        const oldDist = distances[neighborId];
        distances[neighborId] = newDistance;
        previous[neighborId] = currentNodeId;

        const neighborNode = nodes.find(n => n.id === neighborId);
        const neighborName = neighborNode ? neighborNode.name : `Node ${neighborId}`;

        steps.push({
          step: stepCount++,
          type: 'UPDATE_NEIGHBOR',
          currentNodeId,
          neighborId,
          neighborName,
          oldDistance: oldDist,
          newDistance: newDistance,
          description: `Found shorter path to ${neighborName}: ${newDistance}km (via ${currentName}).`,
          distances: { ...distances }
        });
      }
    });
  }

  // Reconstruct path
  const path = [];
  let u = endNodeId;
  while (u !== null && previous[u] !== undefined) {
    path.unshift(u);
    u = previous[u];
  }
  if (path.length > 0 || u === startNodeId) {
    path.unshift(startNodeId);
  }

  const finalDist = distances[endNodeId] === Infinity ? 0 : distances[endNodeId];

  steps.push({
    step: stepCount++,
    type: 'FINAL',
    description: `Algorithm complete. Shortest distance to ${endNodeId} is ${finalDist}km.`,
    path,
    totalDistance: finalDist
  });

  return {
    path,
    totalDistance: finalDist,
    steps
  };
};

/**
 * Calculates a simple TSP route using a greedy Nearest-Neighbor approach
 * as a proxy for the Micro-path optimization.
 * @param {Object} warehouse 
 * @param {Array} stops 
 * @returns {Object} 
 */
export const calculateMicroDijkstra = (warehouse, stops) => {
  const unvisited = new Set(stops.map(s => s.id));
  const pathIds = ['warehouse'];
  const route = [{ ...warehouse, id: 'warehouse', isWarehouse: true }];
  const steps = [];
  let totalDistance = 0;
  let currentPos = warehouse;

  steps.push({
    step: 0,
    description: `Starting route from warehouse: ${warehouse.name}`,
    totalDistance: 0
  });

  while (unvisited.size > 0) {
    let nearestId = null;
    let minDistance = Infinity;
    let nearestStop = null;

    unvisited.forEach(stopId => {
      const stop = stops.find(s => s.id === stopId);
      const dist = calculateHaversine(currentPos.latitude, currentPos.longitude, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestId = stopId;
        nearestStop = stop;
      }
    });

    if (nearestId === null) break;

    totalDistance += minDistance;
    pathIds.push(nearestId);
    route.push({ ...nearestStop });
    unvisited.delete(nearestId);
    
    steps.push({
      step: steps.length,
      stopName: nearestStop.name,
      segmentDistance: minDistance.toFixed(1),
      totalDistance: totalDistance.toFixed(1),
      description: `Next nearest stop: ${nearestStop.name} (${minDistance.toFixed(1)} km).`
    });

    currentPos = nearestStop;
  }

  // Return to warehouse
  const distBack = calculateHaversine(currentPos.latitude, currentPos.longitude, warehouse.latitude, warehouse.longitude);
  totalDistance += distBack;
  pathIds.push('warehouse');
  route.push({ ...warehouse, id: 'warehouse', isWarehouse: true });
  
  steps.push({
    step: steps.length,
    description: `Returning to warehouse (${distBack.toFixed(1)} km).`,
    totalDistance: totalDistance.toFixed(1)
  });

  return {
    path: pathIds,
    route,
    totalDistance: totalDistance.toFixed(1),
    steps
  };
};

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
