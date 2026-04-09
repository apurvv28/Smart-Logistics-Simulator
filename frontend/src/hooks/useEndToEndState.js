import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8081/api/end-to-end';

/**
 * useEndToEndState Hook
 * Manages end-to-end journey state combining macro (inter-city) and micro (intra-city) phases
 */
export function useEndToEndState() {
  const [journey, setJourney] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [journeyId, setJourneyId] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const animationIntervalRef = useRef(null);

  /**
   * Initiates a new end-to-end journey
   * @param {number} originCityId - Delhi warehouse node ID
   * @param {number} destinationCityId - Pune warehouse node ID
   * @param {Array} deliveryAddresses - 3-4 customer addresses in Pune
   * @param {string} primaryAlgorithmMacro - BELLMAN_FORD or FLOYD_WARSHALL
   * @param {string} secondaryAlgorithmMicro - DIJKSTRA or A_STAR
   */
  const ALGO_MAP = {
    'Bellman-Ford':    'BELLMAN_FORD',
    'Floyd-Warshall':  'FLOYD_WARSHALL',
    'Dijkstra':        'DIJKSTRA',
    'A*':              'A_STAR',
    // Fallbacks if backend values are passed directly
    'BELLMAN_FORD':    'BELLMAN_FORD',
    'FLOYD_WARSHALL':  'FLOYD_WARSHALL',
    'DIJKSTRA':        'DIJKSTRA',
    'A_STAR':          'A_STAR'
  };

  const DELIVERY_ADDRESSES = [
    { id: 'addr1', name: 'Hinjewadi Tech Park', latitude: 18.5912, longitude: 73.7719, address: 'Phase 1, Hinjewadi, Pune', type: 'delivery' },
    { id: 'addr2', name: 'Koregaon Park', latitude: 18.5384, longitude: 73.8903, address: 'Koregaon Park, Pune', type: 'delivery' },
    { id: 'addr3', name: 'Baner', latitude: 18.5596, longitude: 73.8142, address: 'Baner, Pune', type: 'delivery' },
    { id: 'addr4', name: 'Viman Nagar', latitude: 18.4674, longitude: 73.9162, address: 'Viman Nagar, Pune', type: 'delivery' }
  ];

  const initiateJourney = async (macroAlgoDisplay, microAlgoDisplay) => {
    try {
      setLoading(true);
      setError(null);

      const body = {
        originCityId: 0,
        destinationCityId: 4,
        primaryAlgorithmMacro: ALGO_MAP[macroAlgoDisplay] || 'BELLMAN_FORD',
        secondaryAlgorithmMicro: ALGO_MAP[microAlgoDisplay] || 'DIJKSTRA',
        deliveryAddresses: DELIVERY_ADDRESSES
      };

      const response = await fetch(`${API_BASE}/initiate-journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`System sync failed (${response.status})`);
      }

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Journey initiation failed');
      }

      setJourneyId(data.journeyId);
      setJourney(data.journey);
      setStatusMessage(data.journey.statusMessage || 'Journey initialized');
      return data.journey;
    } catch (err) {
      setError(err.message);
      setStatusMessage(`❌ Error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches current journey state from backend
   */
  const fetchJourneyState = async (jid) => {
    try {
      const { data } = await axios.get(`${API_BASE}/journey/${jid}`);
      if (data.status === 'success') {
        setJourney(data.journey);
        setAuditData(data.audit);
        return data.journey;
      }
    } catch (err) {
      console.error('Failed to fetch journey state:', err);
    }
  };

  /**
   * Advances journey to next step
   */
  const advanceStep = async (jid) => {
    try {
      const { data } = await axios.post(`${API_BASE}/advance-step/${jid}`);
      if (data.status === 'success') {
        setJourney(data.journey);
        setAuditData(data.audit);
        return data.journey;
      }
    } catch (err) {
      console.error('Failed to advance step:', err);
    }
  };

  // journeyIdRef keeps the latest journeyId accessible inside the interval closure
  const journeyIdRef = useRef(journeyId);
  useEffect(() => { journeyIdRef.current = journeyId; }, [journeyId]);

  /**
   * Starts animation loop
   */
  const startAnimation = () => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    setIsAnimating(true);
    setIsPaused(false);
    
    animationIntervalRef.current = setInterval(async () => {
      if (isPaused) return;
      
      try {
        const response = await fetch(`${API_BASE}/advance-step/${journeyIdRef.current}`, {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.status === 'success') {
          setJourney(data.journey);
          setStatusMessage(data.journey.statusMessage);
          
          if (data.journey.currentPhase === 'DELIVERED') {
            clearInterval(animationIntervalRef.current);
            setIsAnimating(false);
          }
        }
      } catch (err) {
        console.error('advanceStep failed:', err);
      }
    }, 2000);
  };

  /**
   * Auto-start animation when journey is first created
   */
  useEffect(() => {
    if (journey && journey.currentPhase === 'IN_MACRO_TRANSIT' && !isAnimating) {
      startAnimation();
    }
  }, [journey?.journeyId]);

  /**
   * Pauses animation loop
   */
  const pauseAnimation = () => {
    setIsPaused(true);
  };

  const resumeAnimation = () => {
    setIsPaused(false);
  };

  /**
   * Resets journey (stops animation and clears state)
   */
  const resetJourney = () => {
    setIsAnimating(false);
    setIsPaused(false);
    setJourney(null);
    setJourneyId(null);
    setAuditData(null);
    setStatusMessage('Journey reset');
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
  };

  /**
   * Auto-stop animation when journey is complete
   */
  useEffect(() => {
    if (journey?.currentPhase === 'DELIVERED') {
      setIsAnimating(false);
      setStatusMessage('✅ Journey complete! Package delivered.');
    }
  }, [journey?.currentPhase]);

  return {
    journey,
    isAnimating,
    isPaused,
    journeyId,
    auditData,
    statusMessage,
    loading,
    error,
    initiateJourney,
    fetchJourneyState,
    advanceStep,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetJourney
  };
}
