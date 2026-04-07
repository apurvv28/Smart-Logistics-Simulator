import React, { createContext, useContext, useState } from 'react';

/**
 * JourneyContext - Shared state for sequential three-stage logistics journey
 * 
 * Holds progress through:
 * 1. Inter-City Simulation (long-distance routing)
 * 2. Intra-City Delivery (last-mile optimization)
 * 3. End-to-End Journey (combined macro + micro)
 */
const JourneyContext = createContext();

/**
 * Initial journey state
 */
const initialJourneyState = {
  // Stage 1: Inter-city result (stored when inter-city delivery completes)
  interCityResult: {
    originCity: null,
    originCityId: null,
    destinationCity: null,
    destinationCityId: null,
    algorithm: null,
    distanceKm: 0,
    completed: false
  },

  // Stage 2: Intra-city result (stored when all cities delivered)
  intraCityResult: {
    warehouseCity: null,
    citiesServed: 0,
    totalDistanceKm: 0,
    completed: false
  },

  // Stage 3: End-to-end result (stored when final delivery complete)
  endToEndResult: {
    macroAlgorithm: null,
    microAlgorithm: null,
    totalDistanceKm: 0,
    completed: false
  },

  // Current stage in the journey
  currentStage: 'INTER_CITY' // 'INTER_CITY' | 'INTRA_CITY' | 'END_TO_END' | 'ALL_COMPLETE'
};

/**
 * JourneyProvider - Wraps app with journey context
 */
export function JourneyProvider({ children }) {
  const [journey, setJourney] = useState(initialJourneyState);

  /**
   * Save inter-city results and advance to intra-city stage
   */
  const setInterCityResult = (result) => {
    setJourney(prev => ({
      ...prev,
      interCityResult: {
        ...prev.interCityResult,
        ...result,
        completed: true
      },
      currentStage: 'INTRA_CITY'
    }));
  };

  /**
   * Save intra-city results and advance to end-to-end stage
   */
  const setIntraCityResult = (result) => {
    setJourney(prev => ({
      ...prev,
      intraCityResult: {
        ...prev.intraCityResult,
        ...result,
        completed: true
      },
      currentStage: 'END_TO_END'
    }));
  };

  /**
   * Save end-to-end results and mark journey complete
   */
  const setEndToEndResult = (result) => {
    setJourney(prev => ({
      ...prev,
      endToEndResult: {
        ...prev.endToEndResult,
        ...result,
        completed: true
      },
      currentStage: 'ALL_COMPLETE'
    }));
  };

  /**
   * Manually set current stage (for navigation/testing)
   */
  const setCurrentStage = (stage) => {
    setJourney(prev => ({
      ...prev,
      currentStage: stage
    }));
  };

  /**
   * Reset entire journey to initial state
   */
  const resetJourney = () => {
    setJourney(initialJourneyState);
  };

  /**
   * Check if a stage is complete
   */
  const isStageComplete = (stage) => {
    switch (stage) {
      case 'INTER_CITY':
        return journey.interCityResult.completed;
      case 'INTRA_CITY':
        return journey.intraCityResult.completed;
      case 'END_TO_END':
        return journey.endToEndResult.completed;
      default:
        return false;
    }
  };

  /**
   * Can user proceed to a stage? (previous stage must be complete)
   */
  const canProceedToStage = (stage) => {
    switch (stage) {
      case 'INTER_CITY':
        return true; // Always can start
      case 'INTRA_CITY':
        return journey.interCityResult.completed;
      case 'END_TO_END':
        return journey.intraCityResult.completed;
      default:
        return false;
    }
  };

  const value = {
    journey,
    setInterCityResult,
    setIntraCityResult,
    setEndToEndResult,
    setCurrentStage,
    resetJourney,
    isStageComplete,
    canProceedToStage
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
}

/**
 * Hook to use JourneyContext
 */
export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within JourneyProvider');
  }
  return context;
}
