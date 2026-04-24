import React, { useEffect, useRef, useState } from 'react';
import { useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import SportsBikeMarker from './SportsBikeMarker';

export default function SimulationAnimator({
  warehouse,
  deliveryAddresses,
  route,
  roadPath,
  isPaused,
  onProgressUpdate,
  onAnimationComplete
}) {
  const map = useMap();
  const [vanState, setVanState] = useState({
    pos: [warehouse?.latitude || 18.52, warehouse?.longitude || 73.85],
    bearing: 0,
    idx: 0,
    isDwell: false,
    delivered: new Set()
  });

  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const stateRef = useRef(vanState); // Keep ref for loop to avoid closure issues

  // Update ref whenever state changes (though loop will update state)
  useEffect(() => {
    stateRef.current = vanState;
  }, [vanState]);

  const calculateBearing = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const lat1 = p1[0] * Math.PI / 180;
    const lon1 = p1[1] * Math.PI / 180;
    const lat2 = p2[0] * Math.PI / 180;
    const lon2 = p2[1] * Math.PI / 180;
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  const createRiderIcon = (bearing = 0, isMoving = false) => {
    const html = renderToStaticMarkup(
      <SportsBikeMarker bearing={bearing} speed={isMoving ? 35 : 0} isMoving={isMoving} />
    );
    return L.divIcon({
      className: '',
      html: html,
      iconSize: [100, 60],
      iconAnchor: [50, 30],
    });
  };

  useEffect(() => {
    if (!roadPath || roadPath.length === 0 || isPaused || vanState.isDwell) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;

      if (delta > 30) { // Approx 30fps for stability
        lastTimeRef.current = time;
        const s = stateRef.current;

        if (s.idx >= roadPath.length - 1) {
          onAnimationComplete?.();
          return;
        }

        const nextIdx = Math.min(s.idx + 2, roadPath.length - 1);
        const currentPos = roadPath[s.idx];
        const nextPos = roadPath[nextIdx];
        
        // Stop detection
        let detectedStop = null;
        for (let i = s.idx; i <= nextIdx; i++) {
          const checkPos = roadPath[i];
          const found = (route || []).find(stop => {
            if (!stop || stop.id === warehouse?.id || s.delivered.has(stop.id)) return false;
            const dist = Math.pow(stop.latitude - checkPos[0], 2) + Math.pow(stop.longitude - checkPos[1], 2);
            return dist < 0.000002; // Threshold
          });
          if (found) {
            detectedStop = found;
            const newState = {
              ...s,
              pos: roadPath[i],
              idx: i,
              isDwell: true
            };
            setVanState(newState);
            onProgressUpdate?.({ 
               percentage: (i / (roadPath.length - 1)) * 100, 
               message: `⏹️ Delivering to: ${detectedStop.name}` 
            });

            setTimeout(() => {
              setVanState(prev => ({
                ...prev,
                isDwell: false,
                delivered: new Set(prev.delivered).add(detectedStop.id)
              }));
              lastTimeRef.current = 0;
            }, 4000);
            return;
          }
        }

        // Normal movement
        const bearing = calculateBearing(currentPos, nextPos);
        const newState = {
          ...s,
          pos: nextPos,
          bearing,
          idx: nextIdx
        };
        setVanState(newState);
        onProgressUpdate?.({ 
          percentage: (nextIdx / (roadPath.length - 1)) * 100, 
          message: `🚚 Traveling to Stop ${s.delivered.size + 1}` 
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [roadPath, isPaused, vanState.isDwell, route, warehouse?.id]);

  return (
    <Marker 
      position={vanState.pos} 
      icon={createRiderIcon(vanState.bearing, !isPaused && !vanState.isDwell)} 
      zIndexOffset={1000} 
    />
  );
}
