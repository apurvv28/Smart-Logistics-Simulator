import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Navigation, Package, Truck, Info, ChevronRight } from 'lucide-react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import SportsBikeMarker from './SportsBikeMarker';

const STOP_DWELL_TIME = 5000; 

// Component Icons
function createStopMarker(isDelivered, isCurrent, index) {
  const bgColor = isDelivered ? '#10b981' : (isCurrent ? '#f59e0b' : '#6366f1');
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${bgColor};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.5s ease;
      ">
        <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 10px;">
          ${isDelivered ? '✓' : index}
        </span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

const createRiderIcon = (bearing = 0, speed = 0, isMoving = false) => {
  const html = renderToStaticMarkup(
    <SportsBikeMarker bearing={bearing} speed={speed} isMoving={isMoving} />
  );
  
  return L.divIcon({
    className: '',
    html: html,
    iconSize: [100, 60],
    iconAnchor: [50, 30],
  });
};

// Map Auto-Center Component (Runs ONCE when route loads)
function AutoFitBounds({ coordinates, isSimulating }) {
  const map = useMap();
  const lastCoordsLength = useRef(0);

  useEffect(() => {
    if (coordinates && coordinates.length > 0 && !isSimulating) {
      // Only auto-fit if the number of stops changed or it's the first load
      if (coordinates.length !== lastCoordsLength.current) {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [40, 40] });
        lastCoordsLength.current = coordinates.length;
      }
    }
  }, [coordinates, map, isSimulating]);
  return null;
}

const IntraCityMapSimulator = ({ 
  warehouse, 
  deliveryStops = [], 
  deliveryAddresses = [], // Prop alias for consistency with request
  route, 
  totalDistance = 0, 
  autoSimulate = false, 
  shouldStartAnimation = false,
  onAnimationComplete,
  externalIsPaused = false 
}) => {
  const finalStops = deliveryAddresses.length > 0 ? deliveryAddresses : deliveryStops;
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0); 
  const [roadPath, setRoadPath] = useState([]); // High-res road coordinates
  const [vanPos, setVanPos] = useState([warehouse.latitude, warehouse.longitude]);
  const [vanBearing, setVanBearing] = useState(0);
  const [deliveredStops, setDeliveredStops] = useState(new Set());
  const [isDwellTime, setIsDwellTime] = useState(false);
  const [dwellCountdown, setDwellCountdown] = useState(0);
  const [currentArrivalStop, setCurrentArrivalStop] = useState(null);
  const [statusMessage, setStatusMessage] = useState('System ready. Launch simulation to begin.');
  const [completedPath, setCompletedPath] = useState([]);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // 1. Fetch OSRM Road Geometry when route changes
  useEffect(() => {
    const fetchRoadGeometry = async () => {
      if (!route || route.length < 2) return;
      
      setIsLoadingPath(true);
      // Reset simulation state for new city/route
      setIsSimulating(false);
      setIsPaused(false);
      setCurrentSegmentIndex(0);
      setDeliveredStops(new Set());
      setCompletedPath([]);
      setVanBearing(0);
      setIsDwellTime(false);
      setDwellCountdown(0);
      setStatusMessage('System ready. Click "Launch Simulation" to begin tracking.');

      try {
        const coords = route.map(s => `${s.longitude},${s.latitude}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes.length > 0) {
          const path = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoadPath(path);
          // Pre-set van position to start
          setVanPos(path[0]);
        }
      } catch (err) {
        console.error('OSRM Fetch Error:', err);
        // Fallback to direct stops if OSRM fails
        setRoadPath(route.map(s => [s.latitude, s.longitude]));
      } finally {
        setIsLoadingPath(false);
      }
    };

    fetchRoadGeometry();
  }, [route]);

  // Auto-start for End-to-End integration or manual trigger
  useEffect(() => {
    if ((autoSimulate || shouldStartAnimation) && roadPath.length > 0 && !isSimulating) {
      startSimulation();
    }
  }, [autoSimulate, shouldStartAnimation, roadPath, isSimulating]);

  const startSimulation = () => {
    if (roadPath.length === 0) return;
    setIsSimulating(true);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setDeliveredStops(new Set());
    setCompletedPath([roadPath[0]]);
    setStatusMessage('🚚 Agent departing from hub...');
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setDeliveredStops(new Set());
    setVanPos(roadPath.length > 0 ? roadPath[0] : [warehouse.latitude, warehouse.longitude]);
    setCompletedPath([]);
    setVanBearing(0);
    setIsDwellTime(false);
    setDwellCountdown(0);
    setStatusMessage('System reset. Ready for new simulation.');
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const togglePause = () => setIsPaused(!isPaused);

  // Helper: Calculate bearing
  const calculateBearing = (p1, p2) => {
    const lat1 = p1[0] * Math.PI / 180;
    const lon1 = p1[1] * Math.PI / 180;
    const lat2 = p2[0] * Math.PI / 180;
    const lon2 = p2[1] * Math.PI / 180;
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  // Master Animation Loop
  useEffect(() => {
    if (!isSimulating || isPaused || externalIsPaused || isDwellTime || roadPath.length === 0) return;

    if (currentSegmentIndex >= roadPath.length - 1) {
      setStatusMessage('✅ Mission complete. Agent returned to hub.');
      setIsSimulating(false);
      return;
    }

    const animate = (time) => {
      if (lastUpdateRef.current === 0) lastUpdateRef.current = time;
      const deltaTime = time - lastUpdateRef.current;

      // Update every ~20ms for faster, smooth motion
      if (deltaTime > 20) {
        lastUpdateRef.current = time;
        
        // Increase step increment to 2 for higher speed
        const nextIdx = Math.min(currentSegmentIndex + 2, roadPath.length - 1);
        
        // Robust stop detection: Check all indices in this step skip to ensure no stop is ever missed
        let detectedStop = null;
        let detectionIdx = nextIdx;

        for (let i = currentSegmentIndex; i <= nextIdx; i++) {
          const checkPos = roadPath[i];
          const found = route.find((s, routeIdx) => {
            const d = Math.sqrt(Math.pow(s.latitude - checkPos[0], 2) + Math.pow(s.longitude - checkPos[1], 2));
            // 0.001 threshold (~110m) ensures we never miss a stop even if roads are slightly offset from marker
            return d < 0.001 && !deliveredStops.has(s.id) && s.id !== warehouse.id;
          });
          if (found) {
            detectedStop = found;
            detectionIdx = i;
            break;
          }
        }

        if (detectedStop) {
          const stopPos = roadPath[detectionIdx];
          setVanPos(stopPos);
          setCompletedPath(prev => [...prev, stopPos]);
          setCurrentSegmentIndex(detectionIdx);
          handleArrival(detectedStop);
          return;
        }

        const currentPos = roadPath[currentSegmentIndex];
        const nextPos = roadPath[nextIdx];
        const bearing = calculateBearing(currentPos, nextPos);
        
        setVanBearing(bearing);
        setVanPos(nextPos);
        setCompletedPath(prev => [...prev, nextPos]);
        setCurrentSegmentIndex(nextIdx);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulating, isPaused, currentSegmentIndex, isDwellTime, roadPath, route, deliveredStops, warehouse.id]);

  const handleArrival = (stop) => {
    setCurrentArrivalStop(stop);
    setIsDwellTime(true);
    setDwellCountdown(5);
    setStatusMessage(`⏹️ Stopped at ${stop.name}. Delivering...`);
    
    const timer = setInterval(() => {
      setDwellCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setDeliveredStops(prevSet => new Set(prevSet).add(stop.id));
          setIsDwellTime(false);
          setCurrentArrivalStop(null);
          lastUpdateRef.current = 0; // Restart frame calculations cleanly
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const overallProgress = roadPath.length > 0 ? (currentSegmentIndex / (roadPath.length - 1)) * 100 : 0;

  // Find currently targeted stop
  const targetStop = route.find(s => !deliveredStops.has(s.id) && s.id !== warehouse.id) || { name: 'Returning to Hub' };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden font-sans">
      {/* LEFT: Map & Overlays */}
      <div className="flex-1 relative">
        <MapContainer
          center={[warehouse.latitude, warehouse.longitude]}
          zoom={13}
          scrollWheelZoom={true}
          dragging={true}
          zoomControl={true}
          touchZoom={true}
          doubleClickZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <AutoFitBounds coordinates={route ? route.map(s => [s.latitude || s.lat, s.longitude || s.lng]) : []} isSimulating={isSimulating} />
          <TileLayer 
             url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Road Path (OSRM) - Solid when simulating, subtle when preparing */}
          <Polyline 
            positions={roadPath} 
            color="#6366f1" 
            weight={4} 
            opacity={isSimulating ? 0.3 : 0.1}
          />

          {/* Preview Route (Dashed) - Only shows before/during simulation setup */}
          {!isSimulating && route && route.length > 1 && (
            <Polyline
              positions={route.map(s => [s.latitude, s.longitude])}
              color="#6366f1"
              weight={2}
              dashArray="10, 10"
              opacity={0.5}
            />
          )}
          
          {/* Completed Path */}
          <Polyline 
            positions={completedPath} 
            color="#6366f1" 
            weight={6} 
            opacity={0.9}
          />

          {/* Hub Marker */}
          <Marker position={[warehouse.latitude, warehouse.longitude]} icon={createStopMarker(false, false, 'H')}>
            <Popup>Main Logistics Hub</Popup>
          </Marker>

          {/* Delivery Stops */}
          {finalStops.map((stop, mapIdx) => {
            // Find visit order in optimized route (0 is hub, 1-4 are stops)
            // Use ID if available, otherwise fallback to index search
            const visitOrder = route ? route.findIndex(s => (s.id === stop.id || (s.latitude === stop.latitude && s.longitude === stop.longitude))) : -1;
            const isDelivered = deliveredStops.has(stop.id);
            const isCurrent = targetStop.id === stop.id;

            return (
              <Marker 
                key={stop.id || mapIdx} 
                position={[stop.latitude || stop.lat, stop.longitude || stop.lng]}
                icon={createStopMarker(isDelivered, isCurrent, visitOrder > 0 ? visitOrder : '?')}
              >
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-slate-800">{stop.name || 'Delivery Stop'}</p>
                    <p className="text-xs text-slate-500">Visit #{visitOrder > 0 ? visitOrder : mapIdx + 1}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Rider Marker */}
          {(() => {
            const isMoving = isSimulating && !isPaused && !isDwellTime && !externalIsPaused;
            const speed = isMoving ? 30 : 0; // Simple approximation for animation
            return <Marker position={vanPos} icon={createRiderIcon(vanBearing, speed, isMoving)} zIndexOffset={1000} />;
          })()}
        </MapContainer>

        {/* 5-SECOND DELIVERY OVERLAY */}
        {isDwellTime && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] animate-in zoom-in duration-300">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border border-emerald-100 text-center scale-110">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              </div>
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Package Delivered</h4>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
                {currentArrivalStop?.name || 'Area Delivery'}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resuming in {dwellCountdown}s</span>
              </div>
            </div>
          </div>
        )}

        {/* MISSION ACCOMPLISHED OVERLAY */}
        {deliveredStops.size === deliveryStops.length && !isSimulating && currentSegmentIndex >= roadPath.length - 1 && roadPath.length > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] animate-in fade-in zoom-in duration-500">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl border border-indigo-500/30 text-center scale-110">
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <CheckCircle2 className="w-12 h-12 text-indigo-400" />
              </div>
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">All Deliveries Complete</h4>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-6">
                Mission Accomplished
              </h3>
              <div className="flex items-center justify-center gap-3">
                 <Truck className="w-4 h-4 text-slate-400" />
                 <span className="text-sm font-bold text-slate-400 tracking-tight">Returned to Hub safely</span>
              </div>
              <button 
                onClick={resetSimulation}
                className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Reset System
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: Top-Left Analytics Panel */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3 pointer-events-none">
          {/* Compact Live Status Box */}
          <div className="w-64 bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 border border-white/50 pointer-events-auto transform transition-all hover:scale-105">
             <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDwellTime ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                  {isDwellTime ? <Package className="w-5 h-5 text-amber-600 animate-pulse" /> : <Truck className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Status</h4>
                   <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{isDwellTime ? 'Stop In Progress' : (isSimulating ? 'In Transit' : 'System Ready')}</p>
                </div>
             </div>
             
             <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                <div className="flex justify-between items-center mb-1.5">
                   <p className="text-[11px] font-bold text-slate-900 truncate flex-1">{targetStop.name} {isDwellTime && <span className="text-amber-600 ml-1">({dwellCountdown}s)</span>}</p>
                   <span className="text-[9px] font-black text-indigo-500 ml-2">{Math.round(overallProgress)}%</span>
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                   <div 
                      className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      style={{ width: `${overallProgress}%` }}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* OVERLAY: Bottom-Right Algorithm Audit */}
        <div className="absolute bottom-4 right-4 z-[1000] pointer-events-none">
          <div className="w-52 bg-slate-900/90 backdrop-blur-md shadow-2xl rounded-xl p-3 border border-slate-700 pointer-events-auto">
             <div className="flex items-center gap-2 mb-2">
                <Info className="w-3 h-3 text-indigo-400" />
                <h4 className="text-[9px] font-bold text-indigo-100 uppercase tracking-wider">Algorithm Audit</h4>
             </div>
             <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px]">
                   <span className="text-slate-400">Optimization:</span>
                   <span className="text-indigo-300 font-bold">A* Heuristic</span>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                   <span className="text-slate-400">Road Data:</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"/>
                      OSRM Live
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Control Sidebar */}
      <div className="w-[420px] bg-white border-l border-slate-200 flex flex-col z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
        <div className="p-8 border-b border-slate-100">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Navigation className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mission Control</h2>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                City Scale: 15KM
              </span>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Distance</p>
                 <p className="text-2xl font-black text-slate-800 tracking-tighter">{totalDistance.toFixed(2)}km</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Total Stops</p>
                 <p className="text-2xl font-black text-slate-800 tracking-tighter">{deliveryStops.length}</p>
              </div>
           </div>

           <button 
              onClick={isSimulating ? togglePause : startSimulation}
              disabled={isLoadingPath}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-50 ${
                isSimulating 
                  ? (isPaused ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
           >
              {isLoadingPath ? 'Analyzing Roads...' : (
                <>
                  {isSimulating ? (isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />) : <Play className="w-5 h-5 fill-current" />}
                  {isSimulating ? (isPaused ? 'Resume Mission' : 'Pause Tracking') : 'Launch Simulation'}
                </>
              )}
           </button>
           
           <div className="mt-4 text-center">
              <button 
                onClick={resetSimulation}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset System
              </button>
           </div>
        </div>

        {/* DELIVERY SEQUENCE LIST */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide bg-slate-50/30">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4 text-slate-400" />
                 <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Delivery Sequence</span>
              </div>
              <span className="text-[10px] font-bold text-slate-300">{deliveredStops.size} / {deliveryStops.length} done</span>
           </div>

           <div className="space-y-4">
              {/* Return to Hub (Start) */}
              <div className="flex items-start gap-4 p-4 rounded-2xl border bg-white border-slate-100 opacity-80">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">🏭</div>
                 <div className="flex-1">
                    <p className="text-sm font-bold text-slate-400">Logistics Hub Departure</p>
                    <p className="text-[11px] text-slate-300">Warehouse Origin</p>
                 </div>
              </div>

              {route.filter(s => s.id !== warehouse.id).map((stop, idx) => {
                const isDelivered = deliveredStops.has(stop.id);
                const isCurrent = targetStop.id === stop.id;

                return (
                  <div 
                    key={`${stop.id}-${idx}`}
                    className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-500 ${
                      isDelivered ? 'bg-indigo-50/30 border-indigo-100/50 grayscale-[0.5]' : 
                      (isCurrent ? 'bg-white border-white ring-4 ring-indigo-50 shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 opacity-60')
                    }`}
                  >
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isDelivered ? 'bg-indigo-600 text-white' : (isCurrent ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200')
                    }`}>
                      {isDelivered ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-black truncate ${isDelivered ? 'text-slate-400' : 'text-slate-900 underline-offset-4 decoration-indigo-200 decoration-2'}`}>
                          {stop.name}
                        </p>
                        {isCurrent && <ChevronRight className="w-4 h-4 text-indigo-600 animate-pulse" />}
                      </div>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDelivered ? 'text-slate-300' : 'text-slate-500'}`}>
                        {stop.address}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Final Return */}
              <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                deliveredStops.size === deliveryStops.length && !isSimulating ? 'bg-indigo-600 border-indigo-700 shadow-xl' : 'bg-white border-slate-100 opacity-30'
              }`}>
                 <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🏁</div>
                 <div className="flex-1">
                    <p className={`text-sm font-bold ${deliveredStops.size === deliveryStops.length && !isSimulating ? 'text-white' : 'text-slate-400'}`}>Return to Hub</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntraCityMapSimulator;