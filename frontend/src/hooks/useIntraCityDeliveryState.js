import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * useIntraCityDeliveryState
 * Manages intra-city delivery simulation state and animation logic
 */
export const useIntraCityDeliveryState = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [deliveryRoute, setDeliveryRoute] = useState([]);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [vanPosition, setVanPosition] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedStops, setCompletedStops] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [stoppedAtLocation, setStoppedAtLocation] = useState(null);
  const [stopCountdown, setStopCountdown] = useState(0);
  
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  /**
   * Select a city and calculate its delivery route
   */
  const selectCity = async (city) => {
    setSelectedCity(city);
    setCurrentStopIndex(0);
    setCompletedStops([]);
    setVanPosition(city.warehouseCoords);
    setProgressPercentage(0);
    setStoppedAtLocation(null);
    setStopCountdown(0);
    setIsRunning(false);
    setIsPaused(false);

    // Call backend to calculate route
    try {
      const warehouseStop = {
        id: "warehouse",
        name: city.name + " Warehouse",
        latitude: city.warehouseCoords.lat,
        longitude: city.warehouseCoords.lng,
        address: city.name + " Distribution Center",
        type: "warehouse"
      };

      const deliveryAddresses = city.deliveryAddresses.map(addr => ({
        id: addr.id,
        name: addr.name,
        latitude: addr.lat,
        longitude: addr.lng,
        address: addr.address,
        type: "delivery"
      }));

      const response = await axios.post(`${API_BASE}/api/local-delivery/calculate-route`, {
        cityId: city.id,
        warehouse: warehouseStop,
        deliveryAddresses: deliveryAddresses,
        algorithmType: "DIJKSTRA"
      });

      setDeliveryRoute(response.data.route);
      setTotalDistance(response.data.totalDistance);
      setStatusMessage(`📍 Route calculated for ${city.name}: ${response.data.totalDistance.toFixed(2)} km, ${response.data.route.length} stops`);
    } catch (error) {
      console.error('Route calculation error:', error);
      setStatusMessage(`❌ Error calculating route: ${error.message}`);
      setDeliveryRoute(city.deliveryAddresses);
      setTotalDistance(0);
    }
  };

  /**
   * Start or resume simulation
   */
  const startSimulation = () => {
    if (deliveryRoute.length === 0) {
      setStatusMessage("❌ No route available. Select a city first.");
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    setStatusMessage(`🚐 Simulation started...`);
  };

  /**
   * Pause simulation
   */
  const pauseSimulation = () => {
    setIsRunning(false);
    setIsPaused(true);
    setStatusMessage(`⏸️ Paused at ${stoppedAtLocation?.name || 'current location'}`);
  };

  /**
   * Reset simulation
   */
  const resetSimulation = () => {
    setCurrentStopIndex(0);
    setCompletedStops([]);
    setVanPosition(selectedCity?.warehouseCoords);
    setIsRunning(false);
    setIsPaused(false);
    setStopCountdown(0);
    setProgressPercentage(0);
    setStoppedAtLocation(null);
    setStatusMessage(`🔄 Reset. Ready to start.`);
  };

  /**
   * Calculate Haversine distance between two coordinates
   */
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth radius in km
    const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
    const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /**
   * Calculate bearing (direction) from one point to another
   */
  const calculateBearing = (from, to) => {
    const dLng = (to.lng - from.lng) * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(to.lat * (Math.PI / 180));
    const x =
      Math.cos(from.lat * (Math.PI / 180)) * Math.sin(to.lat * (Math.PI / 180)) -
      Math.sin(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) * Math.cos(dLng);
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  /**
   * Main animation loop
   * Handles: Van movement, stop detection, 5-second pauses, progress tracking
   */
  useEffect(() => {
    if (!isRunning || !deliveryRoute || deliveryRoute.length === 0) return;

    // Handle 5-second countdown at delivery stops
    if (stopCountdown > 0) {
      const stopTimer = setTimeout(() => {
        setStopCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(stopTimer);
    }

    // After countdown finished, move to next stop
    if (stoppedAtLocation && stopCountdown === 0) {
      if (currentStopIndex < deliveryRoute.length - 1) {
        setCurrentStopIndex(prev => prev + 1);
        setStoppedAtLocation(null);
      } else {
        setIsRunning(false);
        setStatusMessage(`✅ All deliveries completed! Van returning to warehouse.`);
      }
      return;
    }

    // Animation timer: Move van towards next stop every 200ms
    const animationTimer = setInterval(() => {
      if (currentStopIndex >= deliveryRoute.length) {
        setIsRunning(false);
        setStatusMessage(`✅ All deliveries completed!`);
        clearInterval(animationTimer);
        return;
      }

      setVanPosition(prevPos => {
        if (!prevPos) return prevPos;

        const nextStop = deliveryRoute[currentStopIndex];
        const nextCoords = { lat: nextStop.latitude, lng: nextStop.longitude };

        // Check if van arrived at stop (within 0.005 km = 5 meters)
        const distance = calculateDistance(prevPos, nextCoords);

        if (distance < 0.005) {
          // Van arrived at stop
          setCompletedStops(prev => [...prev, nextStop.id]);
          setStoppedAtLocation(nextStop);
          setStopCountdown(5);
          setStatusMessage(`📦 Stopped at ${nextStop.name} for delivery (5s remaining)`);
          
          // Update progress
          const newProgress = ((completedStops.length + 1) / deliveryRoute.length) * 100;
          setProgressPercentage(Math.min(newProgress, 99));
          
          return prevPos; // Keep position at stop
        } else {
          // Continue moving towards stop
          const moveStep = 0.0005; // ~0.5m per animation frame
          const bearing = calculateBearing(prevPos, nextCoords);
          const bearingRad = bearing * (Math.PI / 180);
          
          const newLat = prevPos.lat + (moveStep * Math.cos(bearingRad)) / 111; // 111 km per degree latitude
          const newLng = prevPos.lng + (moveStep * Math.sin(bearingRad)) / (111 * Math.cos(prevPos.lat * (Math.PI / 180))); // Adjust for longitude convergence
          
          setStatusMessage(`🚐 Van heading to ${nextStop.name}... (${distance.toFixed(2)} km away)`);
          
          return { lat: newLat, lng: newLng };
        }
      });
    }, 200);

    return () => clearInterval(animationTimer);
  }, [isRunning, currentStopIndex, deliveryRoute, stoppedAtLocation, stopCountdown, completedStops]);

  return {
    selectedCity,
    selectCity,
    deliveryRoute,
    vanPosition,
    isRunning,
    isPaused,
    completedStops,
    totalDistance,
    progressPercentage,
    statusMessage,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    currentStopIndex,
    stoppedAtLocation,
    stopCountdown
  };
};
