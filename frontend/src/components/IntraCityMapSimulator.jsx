import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Play, Pause, RotateCcw } from 'lucide-react';
import L from 'leaflet';

// Swiggy-style smooth animator using requestAnimationFrame
class SwiggySmoothAnimator {
  constructor(map, vanMarker, routeCoords, options = {}) {
    this.map = map;
    this.vanMarker = vanMarker;
    this.routeCoords = routeCoords; // [[lat,lng], [lat,lng], ...]
    this.totalPoints = routeCoords.length;
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.msPerPoint = options.msPerPoint || 60;
    
    this.totalDuration = this.totalPoints * this.msPerPoint;
    
    this.rafId = null;
    this.startTime = null;
    this.paused = false;
    this.pausedAt = 0;
    this.totalElapsed = 0;
    this.running = false;

    // CRITICAL: Bind _animate to preserve 'this' context in RAF callbacks
    this._animate = this._animate.bind(this);
  }

  // Smooth easing - mimics Swiggy's natural acceleration/deceleration
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Get interpolated position along route for any progress 0-1
  getPositionAtProgress(progress) {
    const eased = this.easeInOutCubic(Math.min(progress, 1));
    const floatIdx = eased * (this.totalPoints - 1);
    const idx = Math.floor(floatIdx);
    const remainder = floatIdx - idx;

    if (idx >= this.totalPoints - 1) {
      return this.routeCoords[this.totalPoints - 1];
    }

    const [lat1, lng1] = this.routeCoords[idx];
    const [lat2, lng2] = this.routeCoords[idx + 1];

    return [
      lat1 + (lat2 - lat1) * remainder,
      lng1 + (lng2 - lng1) * remainder,
    ];
  }

  start() {
    // CRITICAL: Validate route before starting
    if (!this.routeCoords || this.routeCoords.length < 2) {
      console.error('❌ SwiggySmoothAnimator: routeCoords is empty or invalid!', 
                    this.routeCoords);
      return;
    }

    if (this.running) {
      console.warn('⚠️ Animator already running');
      return;
    }

    console.log('✅ Animator starting with', this.totalPoints, 
                'points, duration:', this.totalDuration, 'ms');

    this.running = true;
    this.startTime = null;
    this.totalElapsed = 0;
    this.paused = false;
    this.rafId = requestAnimationFrame(this._animate);
  }

  _animate(timestamp) {
    // Guard: stop if not running
    if (!this.running) {
      console.log('⏹ Animator stopped during animation');
      return;
    }

    if (!this.startTime) {
      this.startTime = timestamp;
    }

    const elapsed = this.totalElapsed + (timestamp - this.startTime);
    const progress = Math.min(elapsed / this.totalDuration, 1);

    if (!this.vanMarker) {
      console.error('❌ Van marker is null!');
      this.running = false;
      return;
    }

    // Move the van
    const pos = this.getPositionAtProgress(progress);
    try {
      this.vanMarker.setLatLng(pos);
    } catch (e) {
      console.error('❌ Failed to set van position:', e);
      this.running = false;
      return;
    }

    this.onProgress(progress, pos);

    if (progress >= 1) {
      console.log('✅ Animation complete');
      this.running = false;
      this.onComplete();
      return;
    }

    // Continue animation
    this.rafId = requestAnimationFrame(this._animate);
  }

  pause() {
    if (this.paused || !this.running) return;
    console.log('⏸ Animation paused at', Math.round(this.totalElapsed / this.totalDuration * 100) + '%');
    this.paused = true;
    this.running = false;
    this.totalElapsed += performance.now() - this.startTime;
    cancelAnimationFrame(this.rafId);
  }

  resume() {
    if (!this.paused) return;
    console.log('▶️ Animation resumed');
    this.paused = false;
    this.running = true;
    this.startTime = null;
    this.rafId = requestAnimationFrame(this._animate);
  }

  reset() {
    console.log('🔄 Animation reset');
    this.running = false;
    this.paused = false;
    cancelAnimationFrame(this.rafId);
    this.startTime = null;
    this.totalElapsed = 0;
    if (this.vanMarker && this.routeCoords[0]) {
      this.vanMarker.setLatLng(this.routeCoords[0]);
    }
  }

  setSpeed(factor) {
    this.speedFactor = factor;
    this.msPerPoint = 120 / factor;
    this.totalDuration = this.totalPoints * this.msPerPoint;
  }

  stop() {
    cancelAnimationFrame(this.rafId);
  }
}

// Fetch real road route from OSRM with guaranteed fallback
async function fetchRoadRoute(stops) {
  if (!stops || stops.length < 2) {
    console.error('❌ fetchRoadRoute: Need at least 2 stops');
    return null;
  }

  // Build coordinate string: lng,lat;lng,lat;...
  const coords = stops
    .map(s => `${parseFloat(s.longitude).toFixed(6)},${parseFloat(s.latitude).toFixed(6)}`)
    .join(';');
  
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  
  console.log('🔄 Fetching OSRM route from', stops.length, 'stops:', url);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`OSRM HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
      throw new Error(`OSRM returned code: ${data.code}`);
    }

    const coords = data.routes[0].geometry.coordinates;
    console.log('✅ OSRM returned', coords.length, 'road points');

    // Flip [lng, lat] → [lat, lng] for Leaflet
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch (e) {
    console.warn('⚠️ OSRM fetch failed:', e.message, '— Using fallback straight lines');
  }
  
  // Fallback: straight lines between stops
  console.log('ℹ️ Using straight-line fallback route');
  return stops.map(s => [s.latitude, s.longitude]);
}

// Draw Swiggy-style orange route with glow
function drawSwiggyRoute(map, routeCoords) {
  if (!map || !routeCoords || routeCoords.length < 2) {
    console.error('❌ drawSwiggyRoute: Invalid map or routeCoords');
    return;
  }

  // Remove any existing route layers
  if (window._routeGlow) {
    try {
      map.removeLayer(window._routeGlow);
    } catch (e) { /* Silent */ }
    window._routeGlow = null;
  }
  if (window._routeLayer) {
    try {
      map.removeLayer(window._routeLayer);
    } catch (e) { /* Silent */ }
    window._routeLayer = null;
  }

  // Glow effect (wider, semi-transparent)
  window._routeGlow = L.polyline(routeCoords, {
    color: '#FF6B00',
    weight: 10,
    opacity: 0.25,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(map);

  // Main orange road line (like Swiggy)
  window._routeLayer = L.polyline(routeCoords, {
    color: '#FF6B00',
    weight: 5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
    smoothFactor: 1,
  }).addTo(map);

  console.log('✅ Route drawn on map');
}

// Create Swiggy-style numbered teardrop stop markers
function createStopMarker(index, isWarehouse = false) {
  const color = isWarehouse ? '#1a73e8' : '#FF6B00';
  const label = isWarehouse ? '🏭' : index;
  
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white; font-weight: bold; font-size: 13px;
        ">${label}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [10, 32],
  });
}

// Create clean Swiggy-style delivery van (no rotation)
const createDeliveryVanIcon = () => {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 52px;
        height: 32px;
        filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.35));
      ">
        <div style="
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 7px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%);
          border-radius: 50%;
        "></div>

        <svg xmlns="http://www.w3.org/2000/svg" 
             viewBox="0 0 52 32" width="52" height="32">
          <rect x="1" y="8" width="36" height="18" rx="3" fill="#FF6B00"/>
          <rect x="37" y="11" width="13" height="15" rx="3" fill="#e65c00"/>
          <rect x="39" y="12" width="9" height="9" rx="2" fill="#b3e5fc" opacity="0.9"/>
          <rect x="5"  y="11" width="9" height="6" rx="1.5" fill="#b3e5fc" opacity="0.8"/>
          <rect x="17" y="11" width="9" height="6" rx="1.5" fill="#b3e5fc" opacity="0.8"/>
          <rect x="1" y="8" width="36" height="3" rx="1.5" fill="#ff8c00"/>
          <ellipse cx="50" cy="22" rx="2" ry="1.8" fill="#fff9c4"/>
          <rect x="1" y="17" width="2.5" height="5" rx="1" fill="#ff1744"/>
          <circle cx="28" cy="19" r="3.5" fill="white" opacity="0.9"/>
          <circle cx="28" cy="19" r="2" fill="#FF6B00"/>
          <circle cx="43" cy="27" r="4.5" fill="#212121"/>
          <circle cx="43" cy="27" r="2.5" fill="#616161"/>
          <circle cx="43" cy="27" r="1"   fill="#bdbdbd"/>
          <circle cx="13" cy="27" r="4.5" fill="#212121"/>
          <circle cx="13" cy="27" r="2.5" fill="#616161"/>
          <circle cx="13" cy="27" r="1"   fill="#bdbdbd"/>
          <line x1="0" y1="14" x2="-7"  y2="14" stroke="#FF6B00" stroke-width="1.5" opacity="0.4"/>
          <line x1="0" y1="18" x2="-11" y2="18" stroke="#FF6B00" stroke-width="2"   opacity="0.3"/>
          <line x1="0" y1="22" x2="-7"  y2="22" stroke="#FF6B00" stroke-width="1.5" opacity="0.4"/>
        </svg>
      </div>
    `,
    iconSize:   [52, 32],
    iconAnchor: [26, 30],
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
  const [vanPosition, setVanPosition] = useState(warehouse);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('▶ Click "Start Simulation" to begin');
  const [fullRoute, setFullRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const animatorRef = useRef(null);

  // Initialize full road route on mount and when route changes
  useEffect(() => {
    if (!route || route.length < 2) {
      console.log('⚠️ Route not ready:', route?.length || 0, 'stops');
      return;
    }
    
    const initRoute = async () => {
      setLoading(true);
      console.log('🔄 Initializing route from', route.length, 'stops');
      
      const roadRoute = await fetchRoadRoute(route);
      
      if (!roadRoute || roadRoute.length < 2) {
        console.error('❌ Route fetch returned empty:', roadRoute);
        setLoading(false);
        return;
      }
      
      console.log('✅ Route initialized with', roadRoute.length, 'points');
      setFullRoute(roadRoute);
      setStatusText('▶ Click "Start Simulation" to begin');
      setLoading(false);
    };
    
    initRoute();
  }, [route]);

  // Create animator instance when route and map are ready
  useEffect(() => {
    if (!fullRoute || !mapInstanceRef.current) {
      console.log('⏳ Waiting for fullRoute:', !!fullRoute, 'and map:', !!mapInstanceRef.current);
      return;
    }
    
    console.log('🚀 Setting up animator with', fullRoute.length, 'route points');
    
    // Draw Swiggy-style route on map
    drawSwiggyRoute(mapInstanceRef.current, fullRoute);
    
    // Fit map bounds to route
    const bounds = L.latLngBounds(fullRoute);
    mapInstanceRef.current.fitBounds(bounds.pad(0.15));

    // Create van marker at start position if it doesn't exist
    if (window._vanMarker) {
      try {
        mapInstanceRef.current.removeLayer(window._vanMarker);
      } catch (e) { /* Silent */ }
    }
    
    window._vanMarker = L.marker(fullRoute[0], {
      icon: createDeliveryVanIcon(),
      zIndexOffset: 1000,
    }).addTo(mapInstanceRef.current);
    
    console.log('✅ Van marker created at:', fullRoute[0]);
    
    // Create animator instance
    animatorRef.current = new SwiggySmoothAnimator(
      mapInstanceRef.current,
      window._vanMarker,
      fullRoute,
      {
        msPerPoint: 60, // Fast like Swiggy
        onProgress: (progress, pos) => {
          setProgressPercent(Math.round(progress * 100));
          
          // Update van position in state for re-renders (visual indicator)
          setVanPosition({ latitude: pos[0], longitude: pos[1] });
          
          // Calculate which stop we're approaching
          const stopIndex = Math.floor(progress * (route.length - 1));
          const targetStop = route[Math.min(stopIndex, route.length - 1)];
          const stopName = targetStop?.name?.split(',')[0] || 'Destination';
          
          setStatusText(`🚚 Van heading to ${stopName}...`);
          
          // Smooth camera follow
          if (progress < 0.99 && mapInstanceRef.current) {
            mapInstanceRef.current.panTo(pos, { animate: true, duration: 0.2, noMoveStart: true });
          }
        },
        onComplete: () => {
          setStatusText('✅ All deliveries complete!');
          setProgressPercent(100);
          setIsSimulating(false);
          setIsPaused(false);
          console.log('✅ Simulation complete');
          if (onSimulationEnd) onSimulationEnd();
        }
      }
    );

    console.log('✅ Animator instance created. Ready to start.');

    return () => {
      // Cleanup on unmount
      if (animatorRef.current) {
        animatorRef.current.stop();
      }
    };
  }, [fullRoute, route]);

  const handlePlayPause = () => {
    if (!animatorRef.current) {
      console.error('❌ Animator not initialized yet');
      return;
    }
    
    if (!isSimulating) {
      setIsSimulating(true);
      setIsPaused(false);
      setStatusText('🚚 Simulation started...');
      console.log('▶️ Starting animation...');
      animatorRef.current.start();
      if (onSimulationStart) onSimulationStart();
    } else if (isPaused) {
      setIsPaused(false);
      setStatusText('🚚 Simulation resumed...');
      console.log('▶️ Resuming animation...');
      animatorRef.current.resume();
    } else {
      setIsPaused(true);
      setStatusText('⏸ Simulation paused');
      console.log('⏸ Pausing animation...');
      animatorRef.current.pause();
    }
  };

  const handleReset = () => {
    if (animatorRef.current) {
      console.log('🔄 Resetting animation...');
      animatorRef.current.reset();
    }
    setIsSimulating(false);
    setIsPaused(false);
    setProgressPercent(0);
    setStatusText('▶ Click "Start Simulation" to begin');
  };

  const centerCoords = warehouse ? [warehouse.latitude, warehouse.longitude] : [18.5204, 73.8567];
  const totalStops = route?.length || 0;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="flex-1 relative">
        <MapContainer
          center={centerCoords}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          ref={(mapContainer) => {
            if (mapContainer && !mapInstanceRef.current) {
              // Initialize map instance only once
              mapInstanceRef.current = mapContainer;
              console.log('✅ Map instance initialized');
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {warehouse && (
            <Marker
              position={[warehouse.latitude, warehouse.longitude]}
              icon={createStopMarker(0, true)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>🏭 Warehouse</strong>
                  <p>{warehouse.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {deliveryStops &&
            deliveryStops.map((stop, idx) => (
              <Marker
                key={stop.id}
                position={[stop.latitude, stop.longitude]}
                icon={createStopMarker(idx + 1)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>📍 {stop.name}</strong>
                    <p>{stop.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          
          {/* Van marker is created and managed programmatically in animator setup useEffect */}
        </MapContainer>

        {loading && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm text-gray-600">
            🔄 Loading route...
          </div>
        )}
      </div>

      <div className="bg-white border-t border-emerald-200 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Progress Display */}
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-sm font-bold text-emerald-900">🚗 Delivery Progress</span>
                <p className="text-xs text-emerald-600 mt-1">
                  {statusText}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  {progressPercent}%
                </div>
                <div className="text-xs text-emerald-700 font-semibold">
                  {totalStops} stops
                </div>
              </div>
            </div>

            {/* Larger Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-4 rounded-full transition-all duration-200 flex items-center justify-end pr-2 shadow-lg"
                style={{ width: `${Math.max(progressPercent, 2)}%` }}
              >
                {progressPercent > 10 && (
                  <span className="text-xs font-bold text-white">▶</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                isSimulating && !isPaused
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSimulating && !isPaused ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {isSimulating ? 'Resume' : 'Start Simulation'}
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
              <p className="text-xs text-teal-600 font-semibold">Total Distance</p>
              <p className="text-lg font-bold text-teal-900">
                {totalDistance?.toFixed(2) || '0'} km
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-600 font-semibold">Total Stops</p>
              <p className="text-lg font-bold text-emerald-900">{totalStops}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-semibold">Progress</p>
              <p className="text-lg font-bold text-green-900">{progressPercent}%</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">Status</p>
              <p className="text-lg font-bold text-blue-900">
                {isSimulating ? '🚚 Active' : isPaused ? '⏸ Paused' : '⏹ Idle'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntraCityMapSimulator;
