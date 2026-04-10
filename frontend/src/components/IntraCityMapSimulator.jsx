import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Navigation, Package, Truck, Info, ChevronRight } from 'lucide-react';
import L from 'leaflet';

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

// 1. BIKE SVG - Side View Sports Bike with Animations
const BIKE_SVG = `
  <div style="width: 80px; height: 52px; display: flex; align-items: center; justify-content: center; position: relative;">
    <style>
      @keyframes wheel-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes speed-line {
        0% { transform: translateX(0); opacity: 0; }
        50% { opacity: 0.8; }
        100% { transform: translateX(-15px); opacity: 0; }
      }
      .wheel { animation: wheel-spin 0.4s linear infinite; transform-origin: center; }
      .speed-line { animation: speed-line 0.6s ease-out infinite; }
    </style>
    
    <svg width="80" height="52" viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Speed Lines -->
      <line x1="10" y1="20" x2="2" y2="20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" class="speed-line" style="animation-delay: 0.1s" />
      <line x1="8" y1="30" x2="0" y2="30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" class="speed-line" style="animation-delay: 0.3s" />
      <line x1="12" y1="40" x2="4" y2="40" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" class="speed-line" style="animation-delay: 0.5s" />

      <!-- Back Wheel -->
      <g class="wheel">
        <circle cx="25" cy="40" r="9" stroke="#1e1b4b" stroke-width="3" fill="#334155" />
        <line x1="25" y1="31" x2="25" y2="49" stroke="#94a3b8" stroke-width="1" />
        <line x1="16" y1="40" x2="34" y2="40" stroke="#94a3b8" stroke-width="1" />
      </g>

      <!-- Front Wheel -->
      <g class="wheel">
        <circle cx="65" cy="40" r="9" stroke="#1e1b4b" stroke-width="3" fill="#334155" />
        <line x1="65" y1="31" x2="65" y2="49" stroke="#94a3b8" stroke-width="1" />
        <line x1="56" y1="40" x2="74" y2="40" stroke="#94a3b8" stroke-width="1" />
      </g>

      <!-- Bike Body -->
      <path d="M25 40L35 25H60L65 40" stroke="#4338ca" stroke-width="6" stroke-linecap="round" />
      <path d="M30 25L45 15H65L60 25" fill="#4338ca" />
      
      <!-- Engine/Details -->
      <rect x="35" y="28" width="20" height="10" rx="2" fill="#1e293b" />
      
      <!-- Delivery Box -->
      <rect x="15" y="10" width="18" height="15" rx="2" fill="#f59e0b" />
      <rect x="18" y="13" width="12" height="2" fill="#d97706" />

      <!-- Rider Body -->
      <path d="M48 25C48 25 45 15 55 12C65 9 68 18 68 18L60 25H48Z" fill="#1e1b4b" />
      <!-- Rider Helmet -->
      <circle cx="60" cy="12" r="5" fill="#0f172a" />
      <rect x="61" y="11" width="4" height="2" rx="1" fill="#475569" />
    </svg>
  </div>
`;

const createRiderIcon = (bearing = 0) => L.divIcon({
  className: '',
  html: `
    <div style="
      transform: rotate(${bearing}deg); 
      transform-origin: center center;
      width: 80px; 
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease-out;
    ">
      ${BIKE_SVG}
    </div>
  `,
  iconSize: [80, 52],
  iconAnchor: [40, 46],
});

// Map Auto-Center Component (Runs ONCE when route loads)
function AutoFitBounds({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coordinates, map]); // coordinates instance changes only on new route
  return null;
}

const IntraCityMapSimulator = ({ warehouse, deliveryStops, route, totalDistance, autoSimulate = false, externalIsPaused = false }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0); 
  const [roadPath, setRoadPath] = useState([]); // High-res road coordinates
  const [vanPos, setVanPos] = useState([warehouse.latitude, warehouse.longitude]);
  const [vanBearing, setVanBearing] = useState(0);
  const [deliveredStops, setDeliveredStops] = useState(new Set());
  const [isDwellTime, setIsDwellTime] = useState(false);
  const [dwellCountdown, setDwellCountdown] = useState(0);
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

  // Auto-start for End-to-End integration
  useEffect(() => {
    if (autoSimulate && roadPath.length > 0 && !isSimulating) {
      startSimulation();
    }
  }, [autoSimulate, roadPath, isSimulating]);

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

      // Update every ~30ms for smoothness
      if (deltaTime > 30) {
        lastUpdateRef.current = time;
        
        const nextIdx = currentSegmentIndex + 1;
        const currentPos = roadPath[currentSegmentIndex];
        const nextPos = roadPath[nextIdx];

        // Check if we reached a delivery stop
        // We match by finding nearest delivery stop within distance (threshold)
        const currentStop = route.find(s => {
          const d = Math.sqrt(Math.pow(s.latitude - nextPos[0], 2) + Math.pow(s.longitude - nextPos[1], 2));
          return d < 0.0001 && !deliveredStops.has(s.id) && s.id !== warehouse.id;
        });

        const bearing = calculateBearing(currentPos, nextPos);
        setVanBearing(bearing);
        setVanPos(nextPos);
        setCompletedPath(prev => [...prev, nextPos]);
        setCurrentSegmentIndex(nextIdx);

        if (currentStop) {
          handleArrival(currentStop);
          return;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulating, isPaused, currentSegmentIndex, isDwellTime, roadPath, route, deliveredStops, warehouse.id]);

  const handleArrival = (stop) => {
    setIsDwellTime(true);
    setDwellCountdown(5);
    setStatusMessage(`⏹️ Stopped at ${stop.name}. Delivering...`);
    
    const timer = setInterval(() => {
      setDwellCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setDeliveredStops(prevSet => new Set(prevSet).add(stop.id));
          setIsDwellTime(false);
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
          <AutoFitBounds coordinates={route ? route.map(s => [s.latitude, s.longitude]) : []} />
          <TileLayer 
             url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Road Path (OSRM) */}
          <Polyline 
            positions={roadPath} 
            color="#6366f1" 
            weight={4} 
            opacity={0.3}
          />
          
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
          {deliveryStops.map((stop, idx) => (
            <Marker 
              key={stop.id} 
              position={[stop.latitude, stop.longitude]}
              icon={createStopMarker(deliveredStops.has(stop.id), targetStop.id === stop.id, idx + 1)}
            >
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}

          {/* Rider Marker */}
          <Marker position={vanPos} icon={createRiderIcon(vanBearing)} zIndexOffset={1000} />
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
                {targetStop.name}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resuming in {dwellCountdown}s</span>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY: Top-Left Analytics Panels */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4 pointer-events-none">
          {/* Live Status Box */}
          <div className="w-80 bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-5 border border-white/50 pointer-events-auto transform transition-all hover:scale-105">
             <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDwellTime ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                  {isDwellTime ? <Package className="w-6 h-6 text-amber-600 animate-pulse" /> : <Truck className="w-6 h-6 text-indigo-600" />}
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Status</h4>
                   <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">{isDwellTime ? 'Stop in Progress' : (isSimulating ? 'In Transit' : 'System Ready')}</p>
                </div>
             </div>
             
             <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1">Heading to:</p>
                <div className="flex justify-between items-center mb-1">
                   <p className="text-sm font-bold text-slate-900 truncate flex-1">{targetStop.name} {isDwellTime && <span className="text-amber-600 ml-1">({dwellCountdown}s)</span>}</p>
                   <span className="text-[10px] font-black text-indigo-500 ml-2">{Math.round(overallProgress)}%</span>
                </div>
                {/* Progress Bar moved here */}
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                   <div 
                      className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      style={{ width: `${overallProgress}%` }}
                   />
                </div>
             </div>
          </div>

          {/* Algorithm Audit Panel */}
          <div className="w-80 bg-slate-900/90 backdrop-blur-md shadow-2xl rounded-2xl p-5 border border-slate-700 pointer-events-auto">
             <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Algorithm Audit Panel</h4>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                   <span className="text-slate-400">Stop order optimized by:</span>
                   <span className="text-indigo-300 font-bold">A* Algorithm</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                   <span className="text-slate-400">Road geometry:</span>
                   <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"/>
                      OSRM (Real Roads)
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