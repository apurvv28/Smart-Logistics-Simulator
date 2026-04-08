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

const createVanIcon = (bearing = 0) => L.divIcon({
  className: '',
  html: `
    <div style="transform: rotate(${bearing}deg); transition: transform 0.2s ease; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
      <svg width="40" height="24" viewBox="0 0 52 32">
        <rect x="1" y="8" width="36" height="18" rx="3" fill="#6366f1"/>
        <rect x="37" y="11" width="13" height="15" rx="3" fill="#4f46e5"/>
        <rect x="39" y="12" width="9" height="9" rx="2" fill="#e0f2fe"/>
        <circle cx="13" cy="27" r="4" fill="#1e293b"/>
        <circle cx="43" cy="27" r="4" fill="#1e293b"/>
      </svg>
    </div>
  `,
  iconSize: [40, 24],
  iconAnchor: [20, 12],
});

// Map Auto-Center Component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const IntraCityMapSimulator = ({ warehouse, deliveryStops, route, totalDistance }) => {
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

  const startSimulation = () => {
    if (roadPath.length === 0) return;
    setIsSimulating(true);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setDeliveredStops(new Set());
    setCompletedPath([roadPath[0]]);
    setStatusMessage('🚚 Van departing from hub...');
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
    if (!isSimulating || isPaused || isDwellTime || roadPath.length === 0) return;

    if (currentSegmentIndex >= roadPath.length - 1) {
      setStatusMessage('✅ Mission complete. Van returned to hub.');
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
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <ChangeView center={[warehouse.latitude, warehouse.longitude]} zoom={14} />
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

          {/* Van Marker */}
          <Marker position={vanPos} icon={createVanIcon(vanBearing)} zIndexOffset={1000} />
        </MapContainer>

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
                <p className="text-sm font-bold text-slate-900 truncate">{targetStop.name} {isDwellTime && <span className="text-amber-600 ml-1">({dwellCountdown}s)</span>}</p>
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

        {/* OVERLAY: Bottom Playback Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-4xl pointer-events-auto">
           <div className="bg-slate-900/95 backdrop-blur-lg shadow-2xl rounded-2xl p-4 border border-slate-800 flex items-center gap-6">
              <button 
                onClick={isSimulating ? togglePause : startSimulation}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                {isSimulating && !isPaused ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>

              <div className="flex-1 flex flex-col gap-2">
                <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                   <div 
                      className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${overallProgress}%` }}
                   />
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   <span>00:00:00</span>
                   <span className="text-slate-300">Intra-City Journey ID: LOGI-TRK-782</span>
                   <span>00:00:30 (Scaled)</span>
                </div>
              </div>

              <button 
                onClick={resetSimulation}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Reset System"
              >
                 <RotateCcw className="w-5 h-5" />
              </button>
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