import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8081/api/end-to-end';

const DELIVERY_ADDRESSES = [
  { id: 'addr1', name: 'Hinjewadi Tech Park', latitude: 18.5912, longitude: 73.7719, address: 'Phase 1, Hinjewadi, Pune' },
  { id: 'addr2', name: 'Koregaon Park', latitude: 18.5384, longitude: 73.8903, address: 'Koregaon Park, Pune' },
  { id: 'addr3', name: 'Baner', latitude: 18.5596, longitude: 73.8142, address: 'Baner, Pune' },
  { id: 'addr4', name: 'Viman Nagar', latitude: 18.4674, longitude: 73.9162, address: 'Viman Nagar, Pune' }
];

export function useEndToEndState() {
  const [journey, setJourney] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Idle');
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(false);
  const journeyIdRef = useRef(null);
  const animationIntervalRef = useRef(null);

  const initiateJourney = async (macroAlgo, microAlgo) => {
    console.log(`[Phase 4] Initiate called with Macro: ${macroAlgo}, Micro: ${microAlgo}`);
    setLoading(true);
    setError(null);
    setStatusMessage('Synchronizing with Global Hubs...');

    try {
      const payload = {
        originCityId: 0, // Delhi
        destinationCityId: 4, // Pune
        primaryAlgorithmMacro: macroAlgo,
        secondaryAlgorithmMicro: microAlgo,
        deliveryAddresses: DELIVERY_ADDRESSES
      };

      const response = await axios.post(`${API_BASE}/initiate-journey`, payload);
      console.log('[Phase 4] API response received:', response.data);

      if (response.data.status === 'success') {
        const initialState = response.data.journey;
        setJourney(initialState);
        setJourneyId(response.data.journeyId);
        journeyIdRef.current = response.data.journeyId;
        setStatusMessage('Journey Initialized. Commencing Macro Transit.');
        
        startAnimation();
      } else {
        throw new Error(response.data.message || 'Initiation failed');
      }
    } catch (err) {
      console.error('[Phase 4] Error initiating journey:', err);
      setError(err.response?.data?.message || err.message);
      setStatusMessage('❌ Initiation Failed');
    } finally {
      setLoading(false);
    }
  };

  const startAnimation = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    
    isPausedRef.current = false;
    setIsPaused(false);

    animationIntervalRef.current = setInterval(async () => {
      if (isPausedRef.current) return;
      
      const currentJid = journeyIdRef.current;
      if (!currentJid) return;

      try {
        console.log(`[Phase 4] Advancing step for journey: ${currentJid}`);
        const response = await axios.post(`${API_BASE}/advance-step/${currentJid}`);
        
        if (response.data.status === 'success') {
          const newState = response.data.journey;
          
          setJourney(prev => {
            if (prev && prev.currentPhase !== newState.currentPhase) {
              console.log(`[Phase 4] Phase change: ${prev.currentPhase} -> ${newState.currentPhase}`);
            }
            return newState;
          });
          
          setStatusMessage(newState.statusMessage || 'Transit in progress...');

          if (newState.currentPhase === 'DELIVERED') {
            console.log('[Phase 4] Journey Completed!');
            stopAnimation();
          }
        }
      } catch (err) {
        console.error('[Phase 4] Advance Step Error:', err.message);
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
    initiateJourney,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetJourney
  };
}
