import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { CITY_DATA } from '../data/cityData';

const API_BASE = 'http://127.0.0.1:8081/api';
const MACRO_TICK_MS = 1700;

export function useEndToEndState() {
  const [formData, setFormData] = useState({
    skuCityId: '',
    customerCityId: '',
    customerAddress: '',
    customerAddressCoords: null,
    customerAddressName: '',
  });

  const [currentPhase, setCurrentPhase] = useState('FORM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Fill the form to start Phase 3.');
  const [isPaused, setIsPaused] = useState(false);

  const [macroRoute, setMacroRoute] = useState([]);
  const [macroCurrentStep, setMacroCurrentStep] = useState(0);
  const [macroTotalDistance, setMacroTotalDistance] = useState(0);

  const [microSimulationData, setMicroSimulationData] = useState(null);
  const [microWarehouse, setMicroWarehouse] = useState(null);
  const [microDeliveryAddresses, setMicroDeliveryAddresses] = useState([]);
  const [microTotalDistance, setMicroTotalDistance] = useState(0);

  const macroTimerRef = useRef(null);
  const isPausedRef = useRef(false);
  const macroRouteRef = useRef([]);

  const cityOptions = useMemo(
    () => Object.values(CITY_DATA).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const getCityData = (cityId) => CITY_DATA[cityId] || null;

  const clearMacroTimer = () => {
    if (macroTimerRef.current) {
      clearInterval(macroTimerRef.current);
      macroTimerRef.current = null;
    }
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.skuCityId) return 'Select Product SKU city.';
    if (!formData.customerCityId) return 'Select Customer city.';
    if (!formData.customerAddressCoords) return 'Select a customer address from suggestions.';
    return '';
  };

  const findNearestWarehouse = (cityId, coords) => {
    const city = getCityData(cityId);
    if (!city) return null;
    const options = city.warehouseLocations?.length ? city.warehouseLocations : [city.warehouse].filter(Boolean);
    if (!options.length) return null;
    let nearest = options[0];
    let best = Infinity;
    options.forEach((wh) => {
      const lat = wh.lat ?? wh.latitude;
      const lng = wh.lng ?? wh.longitude;
      const d = Math.sqrt((lat - coords.lat) ** 2 + (lng - coords.lng) ** 2);
      if (d < best) {
        best = d;
        nearest = wh;
      }
    });
    return nearest;
  };

  const startMicroPhase = async (warehouse, customerStop) => {
    const customerCity = getCityData(formData.customerCityId);
    if (!customerCity || !warehouse) {
      setError('Unable to prepare last-mile simulation.');
      return;
    }

    setCurrentPhase('MICRO_LOADING');
    setStatusMessage('Phase 2: calculating warehouse to customer route...');

    try {
      const response = await axios.post(`${API_BASE}/local-delivery/calculate-city-route`, {
        cityId: customerCity.id,
        warehouseId: warehouse.id,
        warehouse: {
          ...warehouse,
          latitude: warehouse.lat ?? warehouse.latitude,
          longitude: warehouse.lng ?? warehouse.longitude,
        },
        deliveryStops: [
          {
            ...customerStop,
            latitude: customerStop.lat ?? customerStop.latitude,
            longitude: customerStop.lng ?? customerStop.longitude,
          },
        ],
        algorithmType: 'DIJKSTRA',
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Route calculation failed.');
      }

      setMicroSimulationData(response.data);
      setMicroTotalDistance(response.data.totalDistance || 0);
      setCurrentPhase('MICRO_TRANSIT');
      setStatusMessage('Phase 2: last-mile simulation in progress...');
    } catch (routeError) {
      const fallback = {
        status: 'success',
        totalDistance: 0,
        route: {
          path: [
            {
              id: warehouse.id,
              name: warehouse.name || 'Warehouse',
              address: warehouse.address || '',
              latitude: warehouse.lat ?? warehouse.latitude,
              longitude: warehouse.lng ?? warehouse.longitude,
            },
            {
              id: customerStop.id,
              name: customerStop.name,
              address: customerStop.address,
              latitude: customerStop.lat ?? customerStop.latitude,
              longitude: customerStop.lng ?? customerStop.longitude,
            },
          ],
        },
      };
      setMicroSimulationData(fallback);
      setMicroTotalDistance(0);
      setCurrentPhase('MICRO_TRANSIT');
      setStatusMessage('Phase 2: last-mile simulation started (offline fallback).');
      console.warn('Micro phase fallback used:', routeError.message);
    }
  };

  const startMacroAnimation = (route, onComplete) => {
    clearMacroTimer();
    setMacroCurrentStep(0);
    macroRouteRef.current = route;

    if (route.length <= 1) {
      onComplete();
      return;
    }

    macroTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setMacroCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= macroRouteRef.current.length - 1) {
          clearMacroTimer();
          setTimeout(onComplete, 600);
          return macroRouteRef.current.length - 1;
        }
        return next;
      });
    }, MACRO_TICK_MS);
  };

  const startJourney = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError('');
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentPhase('INITIATING');
    setStatusMessage('Preparing Phase 1 inter-city route...');

    const skuCity = getCityData(formData.skuCityId);
    const customerCity = getCityData(formData.customerCityId);
    if (!skuCity || !customerCity) {
      setLoading(false);
      setError('Invalid city selection.');
      return;
    }

    const customerStop = {
      id: 'customer-address',
      name: formData.customerAddressName || 'Customer Address',
      address: formData.customerAddress,
      lat: formData.customerAddressCoords.lat,
      lng: formData.customerAddressCoords.lng,
      latitude: formData.customerAddressCoords.lat,
      longitude: formData.customerAddressCoords.lng,
    };

    const nearestWarehouse = findNearestWarehouse(formData.customerCityId, formData.customerAddressCoords);
    setMicroWarehouse(nearestWarehouse);
    setMicroDeliveryAddresses([customerStop]);

    try {
      const response = await axios.post(`${API_BASE}/end-to-end/initiate-journey`, {
        originCityId: skuCity.nodeId,
        destinationCityId: customerCity.nodeId,
        primaryAlgorithmMacro: 'Bellman-Ford',
        secondaryAlgorithmMicro: 'Dijkstra',
        deliveryAddresses: [customerStop],
      });

      const backendRoute = response.data?.journey?.macroRoute || [];
      const route = backendRoute.length ? backendRoute : [skuCity.nodeId, customerCity.nodeId];
      setMacroRoute(route);
      setMacroTotalDistance(response.data?.journey?.macroTotalDistance || 0);
      setCurrentPhase('MACRO_TRANSIT');
      setStatusMessage('Phase 1: inter-city simulation in progress...');

      startMacroAnimation(route, async () => {
        setCurrentPhase('MACRO_COMPLETE');
        setStatusMessage('Phase 1 complete. Transitioning to Phase 2...');
        await startMicroPhase(nearestWarehouse, customerStop);
      });
    } catch (journeyError) {
      const fallbackRoute = [skuCity.nodeId, customerCity.nodeId];
      setMacroRoute(fallbackRoute);
      setMacroTotalDistance(0);
      setCurrentPhase('MACRO_TRANSIT');
      setStatusMessage('Phase 1 started (offline fallback).');

      startMacroAnimation(fallbackRoute, async () => {
        setCurrentPhase('MACRO_COMPLETE');
        setStatusMessage('Phase 1 complete. Transitioning to Phase 2...');
        await startMicroPhase(nearestWarehouse, customerStop);
      });
      console.warn('Macro phase fallback used:', journeyError.message);
    } finally {
      setLoading(false);
    }
  };

  const pauseAnimation = () => {
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const resumeAnimation = () => {
    isPausedRef.current = false;
    setIsPaused(false);
  };

  const handleMicroComplete = () => {
    setCurrentPhase('DELIVERED');
    setStatusMessage('Package delivered. Phase 3 completed successfully.');
  };

  const resetJourney = () => {
    clearMacroTimer();
    isPausedRef.current = false;
    setIsPaused(false);
    setError('');
    setCurrentPhase('FORM');
    setStatusMessage('Fill the form to start Phase 3.');
    setMacroRoute([]);
    setMacroCurrentStep(0);
    setMacroTotalDistance(0);
    setMicroSimulationData(null);
    setMicroWarehouse(null);
    setMicroDeliveryAddresses([]);
    setMicroTotalDistance(0);
  };

  useEffect(() => {
    return () => clearMacroTimer();
  }, []);

  const overallProgress = (() => {
    if (currentPhase === 'FORM') return 0;
    if (currentPhase === 'INITIATING') return 8;
    if (currentPhase === 'MACRO_TRANSIT') {
      const ratio = macroRoute.length <= 1 ? 1 : macroCurrentStep / (macroRoute.length - 1);
      return 8 + ratio * 52;
    }
    if (currentPhase === 'MACRO_COMPLETE') return 62;
    if (currentPhase === 'MICRO_LOADING') return 68;
    if (currentPhase === 'MICRO_TRANSIT') return 78;
    if (currentPhase === 'DELIVERED') return 100;
    return 0;
  })();

  return {
    formData,
    updateForm,
    cityOptions,
    currentPhase,
    loading,
    error,
    statusMessage,
    isPaused,
    overallProgress,
    macroRoute,
    macroCurrentStep,
    macroTotalDistance,
    microSimulationData,
    microWarehouse,
    microDeliveryAddresses,
    microTotalDistance,
    startJourney,
    pauseAnimation,
    resumeAnimation,
    handleMicroComplete,
    resetJourney,
  };
}
