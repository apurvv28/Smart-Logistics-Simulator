import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8081/api/end-to-end';

const FALLBACK_WAREHOUSE = {
  id: 'warehouse',
  name: 'Pune Central Warehouse',
  latitude: 18.5204,
  longitude: 73.8567
};

const FALLBACK_ADDRESSES = [
  { id: 'addr1', name: 'Hinjewadi Tech Park',  latitude: 18.5912, longitude: 73.7719, address: 'Hinjewadi, Pune' },
  { id: 'addr2', name: 'Koregaon Park',         latitude: 18.5384, longitude: 73.8903, address: 'Koregaon Park, Pune' },
  { id: 'addr3', name: 'Baner',                 latitude: 18.5596, longitude: 73.8142, address: 'Baner, Pune' },
  { id: 'addr4', name: 'Viman Nagar',           latitude: 18.4674, longitude: 73.9162, address: 'Viman Nagar, Pune' }
];

export function useEndToEndState() {
  const [journey, setJourney] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [isPaused, setIsPaused] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [currentDeliveryStop, setCurrentDeliveryStop] = useState(null);

  const isPausedRef = useRef(false);
  const isDeliveringRef = useRef(false);
  const journeyIdRef = useRef(null);
  const animationIntervalRef = useRef(null);

  const [sessionData, setSessionData] = useState({ phase1: {}, phase2: {} });

  // Read bridge data on mount for UI display
  useEffect(() => {
    const p1 = JSON.parse(localStorage.getItem('logicore_phase1') || '{}');
    const p2 = JSON.parse(localStorage.getItem('logicore_phase2') || '{}');
    setSessionData({ phase1: p1, phase2: p2 });
  }, []);

  const initiateJourney = async (macroAlgo, microAlgo) => {
    console.log('[Phase 3] Initiating Journey: Macro=', macroAlgo, 'Micro=', microAlgo);
    setLoading(true);
    setError(null);
    setStatusMessage('Configuring Global Logistics Bridge...');

    // Read cross-phase data from localStorage
    let phase1Data = {};
    let phase2Data = {};
    try {
      phase1Data = JSON.parse(localStorage.getItem('logicore_phase1') || '{}');
      phase2Data = JSON.parse(localStorage.getItem('logicore_phase2') || '{}');
    } catch(e) {
      console.warn('[Phase 3] Could not parse localStorage data:', e);
    }

    console.log('[Phase 3] Phase1 data:', phase1Data);
    console.log('[Phase 3] Phase2 data:', phase2Data);

    // Safely extract node IDs with fallbacks
    const originNodeId = phase1Data.originNodeId ?? phase1Data.sourceNodeId ?? 0;
    const destNodeId   = phase2Data.nodeId ?? phase2Data.destinationNodeId ?? phase1Data.destinationNodeId ?? 4;

    // Safely extract micro routing data
    const warehouse         = phase2Data.warehouse         ?? FALLBACK_WAREHOUSE;
    const deliveryAddresses = phase2Data.deliveryAddresses ?? FALLBACK_ADDRESSES;

    console.log('[Phase 3] Origin nodeId:', originNodeId, '→ Dest nodeId:', destNodeId);

    // Validate we have minimum required data
    if (!warehouse || !warehouse.latitude) {
      setError('No intra-city session found. Please run Phase 2 (Intra-City) first.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        originCityId:            originNodeId,
        destinationCityId:       destNodeId,
        primaryAlgorithmMacro:   macroAlgo,
        secondaryAlgorithmMicro: microAlgo,
        deliveryAddresses:       deliveryAddresses
      };

      console.log('[Phase 3] Sending payload:', payload);

      const response = await axios.post(`${API_BASE}/initiate-journey`, payload);
      console.log('[Phase 3] API Response:', response.data);

      if (response.data.status === 'success') {
        const state = response.data.journey;
        setJourney(state);
        setJourneyId(response.data.journeyId);
        journeyIdRef.current = response.data.journeyId;
        setStatusMessage('Journey initialized. Starting macro transit.');
        startAnimation();
      } else {
        throw new Error(response.data.message || 'Initiation failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      console.error('[Phase 3] Initiation failed:', msg);
      setError(msg);
      setStatusMessage('Initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const startAnimation = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    
    isPausedRef.current = false;
    setIsPaused(false);
    isDeliveringRef.current = false;
    setIsDelivering(false);

    animationIntervalRef.current = setInterval(async () => {
      if (isPausedRef.current || isDeliveringRef.current) return;
      
      const currentJid = journeyIdRef.current;
      if (!currentJid) return;

      try {
        const response = await axios.post(`${API_BASE}/advance-step/${currentJid}`);
        
        if (response.data.status === 'success') {
          const newState = response.data.journey;
          
          setJourney(newState);
          setStatusMessage(newState.statusMessage || 'Transit in progress...');

          // ARRIVAL PAUSE LOGIC
          // Check if we just arrived at a delivery stop in micro-phase
          if (newState.currentPhase === 'IN_MICRO_TRANSIT' && newState.microCurrentStepIndex > 0) {
            const currentStop = newState.microOptimalRoute?.[newState.microCurrentStepIndex];
            // If it's a delivery stop (not the warehouse) we pause
            if (currentStop && currentStop.id !== 'warehouse') {
              isDeliveringRef.current = true;
              setIsDelivering(true);
              setCurrentDeliveryStop(currentStop.name);
              
              setTimeout(() => {
                isDeliveringRef.current = false;
                setIsDelivering(false);
                setCurrentDeliveryStop(null);
              }, 5000);
            }
          }

          if (newState.currentPhase === 'DELIVERED') {
            stopAnimation();
          }
        }
      } catch (err) {
        console.error('[Phase 3] Advance Step Error:', err.message);
      }
    }, 2000);
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
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

  const resetJourney = () => {
    stopAnimation();
    setJourney(null);
    setJourneyId(null);
    journeyIdRef.current = null;
    isPausedRef.current = false;
    setIsPaused(false);
    setError(null);
    setStatusMessage('Idle');
  };

  useEffect(() => {
    return () => stopAnimation();
  }, []);

  const currentPhase = journey?.currentPhase || 'INITIATED';
  const showMicroPhase = currentPhase === 'IN_MICRO_TRANSIT' || currentPhase === 'DELIVERED';
  
  let overallProgress = 0;
  if (journey?.overallProgressPercentage) {
    const p = parseFloat(journey.overallProgressPercentage);
    if (!isNaN(p)) overallProgress = p;
  }

  return {
    journey,
    journeyId,
    loading,
    error,
    statusMessage,
    isPaused,
    currentPhase,
    showMicroPhase,
    overallProgress,
    isDelivering,
    currentDeliveryStop,
    sessionData,
    initiateJourney,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetJourney
  };
}
