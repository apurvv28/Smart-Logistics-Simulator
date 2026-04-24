import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Navigation, CheckCircle2, Clock, MapPin } from 'lucide-react';

/**
 * Component to auto-fit map bounds to the route
 */
function AutoFitBounds({ coordinates, shouldStartAnimation }) {
    const map = useMap();
    useEffect(() => {
        if (coordinates && coordinates.length > 0 && !shouldStartAnimation) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coordinates, map, shouldStartAnimation]);
    return null;
}

/**
 * Custom Marker component for the animated Bike
 */
const BikeMarker = ({ position, bearing }) => {
    const bikeIcon = L.divIcon({
        className: 'bike-marker-container',
        html: `
            <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.1s linear;">
                <img src="/assets/bike.png" 
                     style="width: 48px; height: 48px; object-fit: contain;" 
                     onerror="this.src='https://cdn-icons-png.flaticon.com/512/2830/2830305.png'; this.style.backgroundColor='#6366f1'; this.style.borderRadius='50%'; this.style.padding='5px';"
                />
            </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
    });

    return <Marker position={position} icon={bikeIcon} zIndexOffset={1000} />;
};

const IntraCityMapSimulator = ({
    warehouse,
    deliveryAddresses = [],
    route = [], // Ordered stops sequence
    totalDistance = 0,
    shouldStartAnimation = false,
    routePath = [], // OSRM waypoints from backend
    simulationData = null
}) => {
    // Animation State
    const [bikePos, setBikePos] = useState(null);
    const [bikeBearing, setBikeBearing] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentStep, setCurrentStep] = useState('System Standby');
    const [progressStats, setProgressStats] = useState({
        distance: 0,
        stopsCompleted: 0,
        percentage: 0
    });
    
    // Animation Refs
    const animationRef = useRef(null);
    const currentIndexRef = useRef(0);
    const isPausedAtStopRef = useRef(false);

    // Initial Position
    useEffect(() => {
        if (warehouse) {
            setBikePos([warehouse.latitude || warehouse.lat, warehouse.longitude || warehouse.lng]);
        }
    }, [warehouse]);

    const calculateBearing = (start, end) => {
        if (!start || !end) return 0;
        const lat1 = start[0] * Math.PI / 180;
        const lon1 = start[1] * Math.PI / 180;
        const lat2 = end[0] * Math.PI / 180;
        const lon2 = end[1] * Math.PI / 180;
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        const brng = Math.atan2(y, x) * 180 / Math.PI;
        return (brng + 90) % 360; 
    };

    // Animation Loop
    useEffect(() => {
        if (!shouldStartAnimation || !routePath || routePath.length === 0) return;

        const startSimulation = () => {
            currentIndexRef.current = 0;
            setIsAnimating(true);
            setCurrentStep('Initiating Delivery Mission...');
            animate();
        };

        const animate = () => {
            if (isPausedAtStopRef.current) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const idx = currentIndexRef.current;
            if (idx >= routePath.length - 1) {
                setIsAnimating(false);
                setCurrentStep('All Deliveries Successful!');
                setProgressStats(prev => ({ ...prev, percentage: 100 }));
                return;
            }

            const currentPos = routePath[idx];
            const nextPos = routePath[Math.min(idx + 1, routePath.length - 1)];

            // Stop Detection (Dwell Time Logic)
            const reachedStopIdx = route.findIndex((stop, sIdx) => {
                if (sIdx === 0) return false;
                const d = Math.pow(stop.latitude - currentPos[0], 2) + Math.pow(stop.longitude - currentPos[1], 2);
                return d < 0.00005; // Arrival threshold
            });

            if (reachedStopIdx !== -1 && !isPausedAtStopRef.current) {
                isPausedAtStopRef.current = true;
                setCurrentStep(`🚀 At Stop ${reachedStopIdx}: ${route[reachedStopIdx].name}`);
                setProgressStats(prev => ({ 
                    ...prev, 
                    stopsCompleted: reachedStopIdx,
                }));

                setTimeout(() => {
                    isPausedAtStopRef.current = false;
                    currentIndexRef.current += 1;
                    setCurrentStep(`Traveling to Stop ${reachedStopIdx + 1 > 4 ? 'Hub' : reachedStopIdx + 1}...`);
                }, 1500); // 1.5s pause at each stop
                return;
            }

            // Update Bike
            setBikePos(currentPos);
            setBikeBearing(calculateBearing(currentPos, nextPos));
            
            // Progress Update
            const pct = (idx / (routePath.length - 1)) * 100;
            const dist = (idx / (routePath.length - 1)) * totalDistance;
            setProgressStats(prev => ({
                ...prev,
                distance: dist,
                percentage: pct
            }));

            currentIndexRef.current = Math.min(idx + 5, routePath.length - 1); // Step speed
            animationRef.current = requestAnimationFrame(animate);
        };

        startSimulation();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setIsAnimating(false);
        };
    }, [shouldStartAnimation, routePath, warehouse, route, totalDistance]);

    if (!warehouse) return null;

    const hubPos = [warehouse.latitude || warehouse.lat, warehouse.longitude || warehouse.lng];
    const destinationCoords = deliveryAddresses.map(s => [s.latitude || s.lat, s.longitude || s.lng]);
    const mapPolyline = routePath.length > 0 ? routePath : [hubPos, ...destinationCoords];

    return (
        <div className="relative w-full h-full min-h-[640px] bg-slate-50 flex flex-col font-sans overflow-hidden transition-all duration-700 animate-in fade-in">
            {/* Simulation HUD (Top) */}
            <div className={`absolute top-6 left-6 right-6 z-[1000] transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                             <Truck className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">LogiCore Active Pulse</p>
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">{currentStep}</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Distance</p>
                            <p className="text-lg font-black text-slate-900 leading-none mt-1">{totalDistance.toFixed(2)} km</p>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-100 mx-2" />
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Health</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black text-emerald-600 uppercase">Linked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={hubPos}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <AutoFitBounds coordinates={[hubPos, ...destinationCoords]} shouldStartAnimation={shouldStartAnimation} />

                    {/* Route Line */}
                    <Polyline 
                        positions={mapPolyline} 
                        color="#6366f1" 
                        weight={5} 
                        opacity={isAnimating ? 0.8 : 0.4} 
                        lineJoin="round"
                        dashArray={isAnimating ? null : "10, 10"}
                    />

                    {/* Markers */}
                    <Marker position={hubPos}>
                        <Popup>Warehouse Hub: {warehouse.name}</Popup>
                    </Marker>
                    
                    {deliveryAddresses.map((stop, idx) => (
                        <Marker 
                            key={stop.id || idx} 
                            position={[stop.latitude || stop.lat, stop.longitude || stop.lng]}
                            icon={L.divIcon({
                                className: '',
                                html: `<div style="background:#ef4444; width:28px; height:28px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 15px rgba(0,0,0,0.1);"><span style="transform:rotate(45deg); color:white; font-weight:black; font-size:10px;">${idx + 1}</span></div>`,
                                iconSize: [28, 28],
                                iconAnchor: [14, 28]
                            })}
                        />
                    ))}

                    {/* The Active Agent */}
                    {bikePos && <BikeMarker position={bikePos} bearing={bikeBearing} />}
                </MapContainer>
            </div>

            {/* Live Stats Monitor (Bottom) */}
            <div className={`absolute bottom-6 left-6 right-6 z-[1000] p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl transition-all duration-700 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                 <div className="flex items-center justify-between gap-8">
                      <div className="flex-1">
                           <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mission Completion Trace</span>
                                <span className="text-xs font-black text-indigo-400">{Math.round(progressStats.percentage)}%</span>
                           </div>
                           <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-700">
                                <div 
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                    style={{ width: `${progressStats.percentage}%` }} 
                                />
                           </div>
                      </div>

                      <div className="flex items-center gap-8">
                           <div className="text-center px-4">
                                <Navigation className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                                <p className="text-lg font-black text-white tracking-tighter">{progressStats.distance.toFixed(2)}km</p>
                           </div>
                           <div className="text-center px-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stops</p>
                                <p className="text-lg font-black text-white tracking-tighter">{progressStats.stopsCompleted}/4</p>
                           </div>
                      </div>
                 </div>
            </div>
        </div>
    );
};

export default IntraCityMapSimulator;
