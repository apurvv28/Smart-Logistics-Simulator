import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, Navigation, Package, Truck } from 'lucide-react';
import L from 'leaflet';

const STOP_DWELL_TIME = 5000; // 5 seconds as requested

// Component Icons
function createStopMarker(isDelivered, isCurrent, index) {
  const bgColor = isDelivered ? '#10b981' : (isCurrent ? '#f59e0b' : '#3b82f6');
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${bgColor};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.5s ease;
      ">
        <span style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 11px;">
          ${isDelivered ? '✓' : index}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

const createVanIcon = () => L.divIcon({
  className: '',
  html: `
    <div style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); transition: transform 0.3s ease;">
      <svg width="48" height="28" viewBox="0 0 52 32">
        <rect x="1" y="8" width="36" height="18" rx="3" fill="#6366f1"/>
        <rect x="37" y="11" width="13" height="15" rx="3" fill="#4f46e5"/>
        <rect x="39" y="12" width="9" height="9" rx="2" fill="#e0f2fe"/>
        <circle cx="13" cy="27" r="4" fill="#1e293b"/>
        <circle cx="43" cy="27" r="4" fill="#1e293b"/>
      </svg>
    </div>
  `,
  iconSize: [48, 28],
  iconAnchor: [24, 28],
});

const IntraCityMapSimulator = ({ warehouse, deliveryStops, route, totalDistance }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(0); // Index in route array
  const [deliveredStops, setDeliveredStops] = useState(new Set());
  const [isDwellTime, setIsDwellTime] = useState(false);
  const [vanPos, setVanPos] = useState([warehouse.latitude, warehouse.longitude]);
  const [statusMessage, setStatusMessage] = useState('System ready. Select a hub city to start.');
  const [completedPath, setCompletedPath] = useState([]);
  
  const mapRef = useRef(null);
  const vanMarkerRef = useRef(null);
  const animationRef = useRef(null);

  // Helper: Find coordinate point in route for a stop
  const findStopCoordIndex = (stop) => {
    // In our simplified mock, route is exactly stop sequence
    return route.findIndex(s => s.id === stop.id);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setIsPaused(false);
    setCurrentStopIndex(0);
    setDeliveredStops(new Set());
    setCompletedPath([[warehouse.latitude, warehouse.longitude]]);
    setStatusMessage('🚚 Van departing from warehouse...');
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setIsPaused(false);
    setCurrentStopIndex(0);
    setDeliveredStops(new Set());
    setVanPos([warehouse.latitude, warehouse.longitude]);
    setCompletedPath([]);
    setStatusMessage('System reset. Ready for new simulation.');
    if (animationRef.current) clearTimeout(animationRef.current);
  };

  const togglePause = () => setIsPaused(!isPaused);

  // Master Animation Logic
  useEffect(() => {
    if (!isSimulating || isPaused || isDwellTime) return;

    if (currentStopIndex >= route.length - 1) {
      setStatusMessage('✅ Journey Complete. Van returned to Hub.');
      setIsSimulating(false);
      return;
    }

    const nextStopIndex = currentStopIndex + 1;
    const from = route[currentStopIndex];
    const to = route[nextStopIndex];

    setStatusMessage(`🚚 Heading to: ${to.name}...`);

    // Animate move to next stop
    const animationDuration = 2000;
    const start = performance.now();

    const animate = (time) => {
      if (isPaused) return;
      
      const elapsed = time - start;
      const progress = Math.min(elapsed / animationDuration, 1);

      const lat = from.latitude + (to.latitude - from.latitude) * progress;
      const lng = from.longitude + (to.longitude - from.longitude) * progress;
      
      const newPos = [lat, lng];
      setVanPos(newPos);
      setCompletedPath(prev => [...prev, newPos]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Arrived at stop
        handleArrival(to, nextStopIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSimulating, isPaused, currentStopIndex, isDwellTime]);

  const handleArrival = (stop, index) => {
    if (stop.id === warehouse.id) {
       setCurrentStopIndex(index);
       return;
    }

    setIsDwellTime(true);
    setStatusMessage(`⏹️ Stopped at ${stop.name}. Delivering parcels...`);
    
    // 5-second dwell
    setTimeout(() => {
      setDeliveredStops(prev => new Set(prev).add(stop.id));
      setIsDwellTime(false);
      setCurrentStopIndex(index);
    }, STOP_DWELL_TIME);
  };

  const overallProgress = (currentStopIndex / (route.length - 1)) * 100;
  const plannedPath = route.map(s => [s.latitude, s.longitude]);

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden">
      {/* Map Content */}
      <div className="flex-1 relative">
        <MapContainer
          center={[warehouse.latitude, warehouse.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
          
          {/* Planned Route - Dashed Orange */}
          <Polyline 
            positions={plannedPath} 
            color="#f97316" 
            dashArray="10, 15" 
            weight={3} 
            opacity={0.6}
          />
          
          {/* Completed Path - Solid Green */}
          <Polyline 
            positions={completedPath} 
            color="#10b981" 
            weight={5} 
            opacity={0.8}
          />

          {/* Markers */}
          <Marker position={[warehouse.latitude, warehouse.longitude]} icon={createStopMarker(false, false, 'H')}>
            <Popup>Main Hub Warehouse</Popup>
          </Marker>

          {deliveryStops.map((stop, idx) => (
            <Marker 
              key={stop.id} 
              position={[stop.latitude, stop.longitude]}
              icon={createStopMarker(deliveredStops.has(stop.id), route[currentStopIndex+1]?.id === stop.id, idx + 1)}
            >
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}

          {/* Van Marker */}
          <Marker position={vanPos} icon={createVanIcon()} zIndexOffset={1000} />
        </MapContainer>

        {/* Floating Status Card */}
        <div className="absolute top-4 left-4 z-[1000] w-72 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 border border-slate-200 animate-in fade-in slide-in-from-left duration-500">
           <div className="flex items-center gap-3 mb-2">
             <div className={`p-2 rounded-lg ${isDwellTime ? 'bg-amber-100' : 'bg-indigo-100'}`}>
               {isDwellTime ? <Package className="w-5 h-5 text-amber-600 animate-bounce" /> : <Truck className="w-5 h-5 text-indigo-600" />}
             </div>
             <div className="flex-1">
               <h4 className="text-sm font-bold text-slate-900 leading-tight">Live Status</h4>
               <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{isDwellTime ? 'Stop in Progress' : 'In Transit'}</p>
             </div>
           </div>
           <p className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">{statusMessage}</p>
           <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
             <div 
               className="h-full bg-indigo-500 transition-all duration-500 rounded-full" 
               style={{ width: `${overallProgress}%` }}
             />
           </div>
        </div>
      </div>

      {/* Control Sidebar */}
      <div className="w-[400px] border-l border-slate-200 bg-white shadow-2xl flex flex-col z-20">
        <div className="p-6 border-b border-slate-100">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               <Navigation className="w-6 h-6 text-indigo-600" />
               Mission Control
             </h2>
             <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100 uppercase">
               City Scale: 15km
             </span>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
                <p className="text-lg font-black text-slate-800">{totalDistance.toFixed(2)}km</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Stops</span>
                <p className="text-lg font-black text-slate-800">{deliveryStops.length}</p>
              </div>
           </div>

           <div className="flex flex-col gap-3">
              <button 
                onClick={isSimulating ? togglePause : startSimulation}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                  isSimulating 
                    ? (isPaused ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {isSimulating ? (isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />) : <Play className="w-5 h-5 fill-current" />}
                {isSimulating ? (isPaused ? 'Resume Mission' : 'Pause Tracking') : 'Launch Simulation'}
              </button>
              
              <button 
                onClick={resetSimulation}
                className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset System
              </button>
           </div>
        </div>

        {/* Real-time Stop Checklist */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
             <Clock className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest">Delivery Sequence</span>
          </div>

          <div className="space-y-4">
             {route.map((stop, idx) => {
               const isDelivered = deliveredStops.has(stop.id);
               const isCurrent = route[currentStopIndex+1]?.id === stop.id;
               const isWarehouse = stop.id === warehouse.id;

               return (
                 <div 
                   key={`${stop.id}-${idx}`}
                   className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                     isDelivered ? 'bg-emerald-50 border-emerald-100' : 
                     (isCurrent ? 'bg-amber-50 border-amber-200 scale-105 shadow-md' : 'bg-white border-slate-100 opacity-60')
                   }`}
                 >
                   <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                     isDelivered ? 'bg-emerald-500' : (isCurrent ? 'bg-amber-500' : 'bg-slate-200')
                   }`}>
                     {isDelivered ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-[10px] font-bold text-slate-600">{idx === 0 ? '🏭' : idx}</span>}
                   </div>
                   <div className="flex-1">
                     <p className={`text-sm font-bold ${isDelivered ? 'text-emerald-900 border-b border-emerald-100 pb-1 mb-1' : 'text-slate-800'}`}>
                       {isWarehouse ? 'Return to Hub' : stop.name}
                     </p>
                     <p className="text-[11px] text-slate-500 leading-relaxed">{stop.address}</p>
                     {isDwellTime && isCurrent && (
                        <div className="mt-2 flex items-center gap-2">
                           <div className="flex gap-1">
                             {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                           </div>
                           <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Delivering...</span>
                        </div>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Global Progress Dashboard */}
        <div className="p-6 bg-slate-900">
           <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-black text-slate-400 uppercase">Mission Progress</span>
             <span className="text-xl font-black text-white">{Math.round(overallProgress)}%</span>
           </div>
           <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 shadow-inner">
             <div 
               className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-700"
               style={{ width: `${overallProgress}%` }}
             />
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntraCityMapSimulator;