import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Play, Pause, RotateCcw } from 'lucide-react';
import L from 'leaflet';

// Custom icons
const warehouseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const completedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Create custom visible van icon with rotation
const createVanIcon = (rotation = 0) => {
  const svg = `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(${rotation} 25 25)">
      <!-- Van body -->
      <rect x="10" y="18" width="30" height="14" rx="3" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/>
      <!-- Van cabin -->
      <rect x="16" y="12" width="14" height="8" rx="2" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/>
      <!-- Front window -->
      <circle cx="23" cy="16" r="2.5" fill="#87ceeb"/>
      <!-- Back wheels -->
      <circle cx="16" cy="32" r="3.5" fill="#1e3a8a" stroke="#000" stroke-width="1"/>
      <circle cx="34" cy="32" r="3.5" fill="#1e3a8a" stroke="#000" stroke-width="1"/>
      <!-- Direction arrow -->
      <polygon points="25,8 28,14 22,14" fill="#f97316" stroke="#dc2626" stroke-width="1"/>
    </g>
  </svg>`;
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svg),
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

const IntraCityMapSimulator = ({
  warehouse,
  deliveryStops,
  route,
  totalDistance,
  onSimulationStart,
  onSimulationEnd,
  animationSpeed = 2000
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [vanPosition, setVanPosition] = useState(warehouse);
  const [deliveredStops, setDeliveredStops] = useState([]);
  const [completedPath, setCompletedPath] = useState([]);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [vanRotation, setVanRotation] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate bearing between two points
  const calculateBearing = (from, to) => {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dlon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(dlon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlon);
    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Fetch actual road waypoints from OSRM (Open Source Routing Machine)
  const fetchRoadWaypoints = async (fromStop, toStop) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromStop.longitude},${fromStop.latitude};${toStop.longitude},${toStop.latitude}?steps=false&geometries=geojson&overview=full`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates;
        return coordinates.map((coord, idx) => ({
          latitude: coord[1],
          longitude: coord[0],
          sequence: idx,
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch road waypoints from OSRM, using direct route:', error);
    }
    
    // Fallback: return direct path with interpolation
    return generateInterpolatedPath(fromStop, toStop);
  };

  // Generate interpolated path as fallback
  const generateInterpolatedPath = (from, to) => {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const fraction = i / steps;
      points.push({
        latitude: from.latitude + (to.latitude - from.latitude) * fraction,
        longitude: from.longitude + (to.longitude - from.longitude) * fraction,
        sequence: i,
      });
    }
    return points;
  };

  const handlePlayPause = () => {
    if (!isSimulating) {
      setIsSimulating(true);
      if (onSimulationStart) onSimulationStart();
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleReset = () => {
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentStep(0);
    setVanPosition(warehouse);
    setDeliveredStops([]);
    setCompletedPath([]);
    setRouteWaypoints([]);
  };

  // Load waypoints for current leg
  useEffect(() => {
    if (!isSimulating || isPaused || !route || currentStep >= route.length - 1) {
      return;
    }

    const loadWaypoints = async () => {
      setLoading(true);
      const currentStop = route[currentStep];
      const nextStop = route[currentStep + 1];
      const waypoints = await fetchRoadWaypoints(currentStop, nextStop);
      setRouteWaypoints(waypoints || []);
      setLoading(false);
    };

    loadWaypoints();
  }, [isSimulating, currentStep, route]);

  // Animate van along waypoints
  useEffect(() => {
    if (!isSimulating || isPaused || routeWaypoints.length === 0 || loading) {
      return;
    }

    let frameIndex = 0;
    const INTERPOLATION_FRAMES = 15; // smooth frames between waypoints
    const FRAME_DELAY = animationSpeed / (routeWaypoints.length * INTERPOLATION_FRAMES);

    const animateFrame = () => {
      if (!isSimulating || isPaused) return;

      // Calculate which waypoint pair we're interpolating between
      const segmentIndex = Math.floor(frameIndex / INTERPOLATION_FRAMES);
      
      if (segmentIndex >= routeWaypoints.length - 1) {
        // Finished all waypoints, move to next delivery stop
        if (currentStep < route.length - 1) {
          const nextStep = currentStep + 1;
          const nextStop = route[nextStep];
          setVanPosition(nextStop);

          if (nextStop.id !== 'warehouse' && !deliveredStops.includes(nextStop.id)) {
            setDeliveredStops([...deliveredStops, nextStop.id]);
          }

          setCurrentStep(nextStep);
          setRouteWaypoints([]);
        } else {
          setIsSimulating(false);
          if (onSimulationEnd) onSimulationEnd();
        }
        return;
      }

      // Get current and next waypoint
      const currentWaypoint = routeWaypoints[segmentIndex];
      const nextWaypoint = routeWaypoints[segmentIndex + 1];
      const localFrame = frameIndex % INTERPOLATION_FRAMES;
      const interpolationFactor = localFrame / INTERPOLATION_FRAMES;

      // Smooth interpolation between waypoints
      const interpolatedLat = 
        currentWaypoint.latitude + 
        (nextWaypoint.latitude - currentWaypoint.latitude) * interpolationFactor;
      const interpolatedLng = 
        currentWaypoint.longitude + 
        (nextWaypoint.longitude - currentWaypoint.longitude) * interpolationFactor;

      setVanPosition({
        latitude: interpolatedLat,
        longitude: interpolatedLng,
        id: 'van',
      });

      // Calculate rotation based on direction to next waypoint
      const rotation = calculateBearing(currentWaypoint, nextWaypoint);
      setVanRotation(rotation);

      // Add to completed path at key waypoints
      if (localFrame === 0 && segmentIndex > 0) {
        setCompletedPath(prev => [
          ...prev,
          {
            latitude: currentWaypoint.latitude,
            longitude: currentWaypoint.longitude,
          }
        ]);
      }

      frameIndex++;
      
      // Schedule next frame
      const timerId = setTimeout(animateFrame, FRAME_DELAY);
      return () => clearTimeout(timerId);
    };

    const timerId = setTimeout(animateFrame, FRAME_DELAY);
    return () => clearTimeout(timerId);
  }, [isSimulating, isPaused, routeWaypoints, currentStep, route, completedPath, deliveredStops, animationSpeed, loading, onSimulationEnd]);

  const centerCoords = warehouse ? [warehouse.latitude, warehouse.longitude] : [18.5204, 73.8567];
  const totalStops = route?.length || 0;
  const progressPercent = totalStops > 1 ? (currentStep / (totalStops - 1)) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="flex-1 relative">
        <MapContainer center={centerCoords} zoom={13} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />

          {warehouse && (
            <Marker position={[warehouse.latitude, warehouse.longitude]} icon={warehouseIcon}>
              <Popup><div className="text-sm"><strong>🏭 Warehouse</strong><p>{warehouse.name}</p></div></Popup>
            </Marker>
          )}

          {deliveryStops && deliveryStops.map((stop) => (
            <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={deliveredStops.includes(stop.id) ? completedIcon : deliveryIcon}>
              <Popup><div className="text-sm"><strong>📍 {stop.name}</strong><p>{stop.address}</p>{deliveredStops.includes(stop.id) && <p className="text-green-600">✓ Delivered</p>}</div></Popup>
            </Marker>
          ))}

          {completedPath && completedPath.length > 1 && (
            <Polyline positions={completedPath.map(wp => [wp.latitude, wp.longitude])} color="#FF6B00" weight={4} opacity={0.9} />
          )}

          {routeWaypoints && routeWaypoints.length > 0 && (
            <Polyline positions={routeWaypoints.map(wp => [wp.latitude, wp.longitude])} color="#FF8C42" weight={4} opacity={0.6} dashArray="5, 5" />
          )}

          {vanPosition && (
            <Marker position={[vanPosition.latitude, vanPosition.longitude]} icon={createVanIcon(vanRotation)} key={`van-${vanRotation}-${currentStep}`}>
              <Popup><div className="text-sm"><strong>🚐 Delivery Van</strong><p>Stop: {currentStep + 1} / {route?.length || 0}</p></div></Popup>
            </Marker>
          )}
        </MapContainer>
        {loading && <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm text-gray-600">Loading road data...</div>}
      </div>

      <div className="bg-white border-t border-emerald-200 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-emerald-900">Delivery Progress</span>
              <span className="text-sm text-emerald-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button onClick={handlePlayPause} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isSimulating && !isPaused ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
              {isSimulating && !isPaused ? (<><Pause className="w-4 h-4" />Pause</>) : (<><Play className="w-4 h-4" />{isSimulating ? 'Resume' : 'Start Simulation'}</>)}
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition">
              <RotateCcw className="w-4 h-4" />Reset
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200"><p className="text-xs text-teal-600 font-semibold">Total Distance</p><p className="text-lg font-bold text-teal-900">{totalDistance?.toFixed(2) || '0'} km</p></div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200"><p className="text-xs text-emerald-600 font-semibold">Stops</p><p className="text-lg font-bold text-emerald-900">{deliveryStops?.length || 0}</p></div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200"><p className="text-xs text-green-600 font-semibold">Delivered</p><p className="text-lg font-bold text-green-900">{deliveredStops.length}</p></div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200"><p className="text-xs text-blue-600 font-semibold">Current Stop</p><p className="text-lg font-bold text-blue-900">{currentStep + 1} / {route?.length || 0}</p></div>
          </div>

          <div className="mt-3 text-sm text-emerald-700">
            {!isSimulating && currentStep === 0 && 'Click "Start Simulation" to begin delivery tracking'}
            {isSimulating && isPaused && '⏸ Simulation paused'}
            {isSimulating && !isPaused && '▶ Simulation in progress... Van moving on actual roads'}
            {!isSimulating && currentStep > 0 && progressPercent >= 99 && '✓ Delivery complete!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntraCityMapSimulator;
