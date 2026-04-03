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
  const initiateJourney = async (originCityId, destinationCityId, deliveryAddresses, primaryAlgorithmMacro, secondaryAlgorithmMicro) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(`${API_BASE}/initiate-journey`, {
        originCityId,
        destinationCityId,
        deliveryAddresses,
        primaryAlgorithmMacro,
        secondaryAlgorithmMicro
      });

      if (data.status === 'success') {
        setJourney(data.journey);
        setJourneyId(data.journey.journeyId);
        setStatusMessage('🚀 Journey initiated! Starting simulation...');
        setAuditData(data.journey);
        return data.journey;
      } else {
        throw new Error(data.message || 'Failed to initiate journey');
      }
    } catch (err) {
      const msg = `❌ Journey initiation failed: ${err.response?.data?.message || err.message}`;
      setStatusMessage(msg);
      setError(msg);
      console.error('Journey initiation error:', err);
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

  /**
   * Starts animation loop
   */
  const startAnimation = () => {
    if (!journeyId) return;
    setIsAnimating(true);
    setIsPaused(false);
  };

  /**
   * Pauses animation loop
   */
  const pauseAnimation = () => {
    setIsPaused(true);
  };

  /**
   * Resumes animation loop
   */
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
   * Animation loop: auto-advances every 2 seconds when animating
   */
  useEffect(() => {
    if (!isAnimating || isPaused || !journeyId) return;

    animationIntervalRef.current = setInterval(() => {
      advanceStep(journeyId);
    }, 2000); // 2 second intervals

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isAnimating, isPaused, journeyId]);

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
