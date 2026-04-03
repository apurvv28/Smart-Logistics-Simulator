import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, MapPin } from 'lucide-react';
import axios from 'axios';
import AlgorithmAuditPanel from '../components/AlgorithmAuditPanel';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';

const API_BASE = 'http://localhost:8081/api';

/**
 * PHASE 4: END-TO-END COMPLETE JOURNEY
 * 
 * Combines macro (inter-city) and micro (intra-city) routing demonstrating:
 * 1. Macro Phase: Delhi warehouse → Pune warehouse using Bellman-Ford or Floyd-Warshall
 * 2. Micro Phase: Pune warehouse → 4 delivery stops using Dijkstra or A*
 * 3. Audit: Compare different algorithm choices and their performance
 */
export default function EndToEndJourneyPage() {
  const navigate = useNavigate();

  // Journey phase state
  const [journeyPhase, setJourneyPhase] = useState('SETUP'); // SETUP, MACRO, MICRO, COMPLETE
  const [journeyId, setJourneyId] = useState(null);
  const [journeyState, setJourneyState] = useState(null);
  const [auditData, setAuditData] = useState(null);

  // Algorithm selection
  const [macroAlgorithm, setMacroAlgorithm] = useState('BELLMAN_FORD');
  const [microAlgorithm, setMicroAlgorithm] = useState('DIJKSTRA');

  // Macro phase state
  const [macroRouting, setMacroRouting] = useState(null);

  // Micro phase state
  const [microRoute, setMicroRoute] = useState([]);
  const [microAnimating, setMicroAnimating] = useState(false);

  // Loading/Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // City network setup
  const CITIES = {
    2: { id: 2, name: 'Delhi', code: 'DEL', lat: 28.7041, lng: 77.1025 },
    8: { id: 8, name: 'Pune', code: 'PUN', lat: 18.5204, lng: 73.8567 }
  };

  const PUNE_WAREHOUSE = {
    id: 'warehouse',
    name: 'Pune Warehouse',
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'Kalyani Nagar, Pune'
  };

  const SAMPLE_DELIVERY_STOPS = [
    { id: 'stop-1', name: 'Shivaji Nagar', address: 'Shivaji Nagar, Pune 411005', latitude: 18.5523, longitude: 73.8479, type: 'delivery' },
    { id: 'stop-2', name: 'Koregaon Park', address: 'Koregaon Park, Pune 411001', latitude: 18.5347, longitude: 73.8787, type: 'delivery' },
    { id: 'stop-3', name: 'Viman Nagar', address: 'Viman Nagar, Pune 411014', latitude: 18.5672, longitude: 73.9125, type: 'delivery' },
    { id: 'stop-4', name: 'Hadapsar', address: 'Hadapsar, Pune 411013', latitude: 18.5183, longitude: 73.9288, type: 'delivery' }
  ];

  /**
   * Initiate full end-to-end journey
   */
  const initiateJourney = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE}/end-to-end/initiate-journey`, {
        originCityId: 2,
        destinationCityId: 8,
        primaryAlgorithmMacro: macroAlgorithm,
        secondaryAlgorithmMicro: microAlgorithm,
        deliveryAddresses: SAMPLE_DELIVERY_STOPS.map(stop => ({
          id: stop.id,
          name: stop.name,
          address: stop.address,
          latitude: stop.latitude,
          longitude: stop.longitude
        }))
      });

      if (response.data.status === 'success') {
        const journey = response.data.journey;
        setJourneyId(response.data.journeyId);
        setJourneyState(journey);
        setAuditData(response.data.journey);
        setJourneyPhase('MACRO');
        setSuccessMessage('✓ Journey initiated! Starting macro (inter-city) phase...');

        if (journey.macroRoute && journey.macroRoute.length > 0) {
          setMacroRouting({
            route: journey.macroRoute,
            startCity: CITIES[journey.macroOriginCityId],
            endCity: CITIES[journey.macroDestinationCityId],
            distance: journey.macroTotalDistance
          });
        }

        if (journey.microOptimalRoute && journey.microOptimalRoute.length > 0) {
          setMicroRoute(journey.microOptimalRoute);
        }
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn('Backend unavailable, using offline mode:', err.message);
      // Fallback: Use local mock data
      setIsOfflineMode(true);
      setJourneyId('offline-' + Date.now());
      
      // Create mock journey state
      const mockJourney = {
        macroRoute: [
          { id: 2, name: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
          { id: 8, name: 'Pune', latitude: 18.5204, longitude: 73.8567 }
        ],
        macroOriginCityId: 2,
        macroDestinationCityId: 8,
        macroTotalDistance: 1450,
        microOptimalRoute: [
          { id: 'warehouse', name: 'Pune Warehouse', latitude: 18.5204, longitude: 73.8567 },
          ...SAMPLE_DELIVERY_STOPS
        ],
        currentPhase: 'INITIATED'
      };
      
      setJourneyState(mockJourney);
      setAuditData(mockJourney);
      setJourneyPhase('MACRO');
      setMacroRouting({
        route: mockJourney.macroRoute,
        startCity: CITIES[2],
        endCity: CITIES[8],
        distance: mockJourney.macroTotalDistance
      });
      setMicroRoute(mockJourney.microOptimalRoute);
      setSuccessMessage('✓ Journey initiated in offline mode! Starting macro (inter-city) phase...');
    } finally {
      setLoading(false);
    }
  };

  const advancePhase = async () => {
    if (!journeyId) return;

    try {
      const response = await axios.post(`${API_BASE}/end-to-end/advance-step/${journeyId}`);

      if (response.data.status === 'success') {
        const updatedJourney = response.data.journey;
        setJourneyState(updatedJourney);

        const phase = updatedJourney.currentPhase;
        if (phase === 'IN_MACRO_TRANSIT' || phase === 'INITIATED') {
          setJourneyPhase('MACRO');
        } else if (phase === 'ARRIVED_AT_HUB' || phase === 'IN_MICRO_TRANSIT') {
          setJourneyPhase('MICRO');
        } else if (phase === 'COMPLETED') {
          setJourneyPhase('COMPLETE');
        }
      }
    } catch (err) {
      // Don't fail on error, just log it
      console.warn('Phase advance failed, using local state:', err.message);
    }
  };

  const handleReset = () => {
    setJourneyPhase('SETUP');
    setJourneyId(null);
    setJourneyState(null);
    setAuditData(null);
    setMicroAnimating(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Setup phase
  if (journeyPhase === 'SETUP') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
        {/* Offline Mode Banner */}
        {isOfflineMode && (
          <div className="bg-yellow-100 border-b border-yellow-400 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
            <span>📡</span>
            <span>Offline Mode: Using local route calculation (backend unavailable)</span>
          </div>
        )}
        
        <div className="bg-white border-b border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-amber-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-amber-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">End-to-End Complete Journey</h1>
              <p className="text-sm text-amber-600">Macro + Micro Routing with Algorithm Comparison</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-amber-100">
              <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">
                Journey Configuration
              </h2>

              <div className="space-y-6">
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700">
                    <strong>Route:</strong> Delhi Warehouse → Pune Warehouse → 4 City Delivery Stops
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-3">
                      Macro Algorithm (Inter-City)
                    </label>
                    <select
                      value={macroAlgorithm}
                      onChange={(e) => setMacroAlgorithm(e.target.value)}
                      className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black bg-white"
                      style={{ color: '#000000' }}
                    >
                      <option value="BELLMAN_FORD" style={{ color: '#000000' }}>Bellman-Ford</option>
                      <option value="FLOYD_WARSHALL" style={{ color: '#000000' }}>Floyd-Warshall</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-900 mb-3">
                      Micro Algorithm (Intra-City)
                    </label>
                    <select
                      value={microAlgorithm}
                      onChange={(e) => setMicroAlgorithm(e.target.value)}
                      className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-black bg-white"
                      style={{ color: '#000000' }}
                    >
                      <option value="DIJKSTRA" style={{ color: '#000000' }}>Dijkstra</option>
                      <option value="A_STAR" style={{ color: '#000000' }}>A*</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="font-semibold text-blue-900">Macro Scope</p>
                    <p className="text-blue-700">Delhi ↔ Pune (city network)</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="font-semibold text-green-900">Micro Scope</p>
                    <p className="text-green-700">Within Pune (4 stops)</p>
                  </div>
                </div>

                <button
                  onClick={initiateJourney}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {loading ? 'Initiating...' : '▶ Start Journey'}
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Macro phase
  if (journeyPhase === 'MACRO') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
        {/* Offline Mode Banner */}
        {isOfflineMode && (
          <div className="bg-yellow-100 border-b border-yellow-400 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
            <span>📡</span>
            <span>Offline Mode: Using local route calculation</span>
          </div>
        )}
        
        <div className="bg-white border-b border-blue-200 p-4 shadow-sm z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-blue-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-blue-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Phase 1: MACRO (Inter-City) Routing
                </h1>
                <p className="text-sm text-blue-600">Delhi Warehouse → Pune Warehouse</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-semibold">
              {macroAlgorithm}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex flex-col lg:flex-row gap-4 p-4">
          <div className="flex-1 bg-white rounded-lg shadow-md border border-blue-200 flex items-center justify-center p-6">
            {macroRouting ? (
              <div className="w-full">
                <h3 className="text-xl font-bold text-blue-900 mb-6 text-center">Macro Route Visualization</h3>

                <div className="flex items-center justify-center gap-8 py-12">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <div className="text-white text-center">
                        <p className="text-2xl font-bold">{macroRouting.startCity?.code}</p>
                        <p className="text-xs">{macroRouting.startCity?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 border-t-4 border-blue-500 relative h-1">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 px-2 py-1 text-white text-xs font-semibold rounded">
                      {macroRouting.distance?.toFixed(2) || '0'} km
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <div className="text-white text-center">
                        <p className="text-2xl font-bold">{macroRouting.endCity?.code}</p>
                        <p className="text-xs">{macroRouting.endCity?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-600">Total Distance</p>
                    <p className="text-lg font-bold text-blue-900">{macroRouting.distance?.toFixed(2) || '0'} km</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-600">Algorithm</p>
                    <p className="text-lg font-bold text-blue-900">{macroAlgorithm}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            )}
          </div>

          <div className="w-full lg:w-80">
            <AlgorithmAuditPanel auditData={auditData} />
          </div>
        </div>

        <div className="bg-white border-t border-blue-200 p-4 shadow-lg">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Reset
            </button>
            <button
              onClick={advancePhase}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Advance to Micro Phase
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
            {successMessage}
          </div>
        )}
      </div>
    );
  }

  // Micro phase
  if (journeyPhase === 'MICRO') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col">
        {/* Offline Mode Banner */}
        {isOfflineMode && (
          <div className="bg-yellow-100 border-b border-yellow-400 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
            <span>📡</span>
            <span>Offline Mode: Using local route calculation</span>
          </div>
        )}
        
        <div className="bg-white border-b border-emerald-200 p-4 shadow-sm z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-emerald-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-emerald-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  Phase 2: MICRO (Intra-City) Delivery
                </h1>
                <p className="text-sm text-emerald-600">Pune Warehouse → 4 Delivery Stops</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold">
              {microAlgorithm}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <IntraCityMapSimulator
            warehouse={PUNE_WAREHOUSE}
            deliveryStops={SAMPLE_DELIVERY_STOPS}
            route={microRoute}
            totalDistance={journeyState?.microTotalDistance || 0}
            onSimulationStart={() => setMicroAnimating(true)}
            onSimulationEnd={() => setMicroAnimating(false)}
            animationSpeed={1500}
          />
        </div>

        <div className="bg-white border-t border-emerald-200 p-4 shadow-lg">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setJourneyPhase('MACRO')}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Back to Macro
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Reset
            </button>
            <button
              onClick={() => setJourneyPhase('COMPLETE')}
              disabled={!microAnimating}
              className={`px-6 py-2 ${
                microAnimating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } text-white rounded-lg font-semibold transition`}
            >
              Complete Journey
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Journey complete
  if (journeyPhase === 'COMPLETE') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
        {/* Offline Mode Banner */}
        {isOfflineMode && (
          <div className="bg-yellow-100 border-b border-yellow-400 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
            <span>📡</span>
            <span>Offline Mode: Using local route calculation</span>
          </div>
        )}
        
        <div className="bg-white border-b border-purple-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-purple-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-purple-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-purple-900">Journey Complete! ✓</h1>
              <p className="text-sm text-purple-600">End-to-End Delivery Summary</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-purple-200 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-purple-900 mb-6">
                Journey Successfully Completed!
              </h2>

              {journeyState && (
                <div className="space-y-6 text-left mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-3">📋 Macro Phase</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-600">Algorithm</p>
                        <p className="font-semibold text-blue-900">{journeyState.macroAlgorithmUsed}</p>
                      </div>
                      <div>
                        <p className="text-blue-600">Distance</p>
                        <p className="font-semibold text-blue-900">{journeyState.macroTotalDistance?.toFixed(2) || '0'} km</p>
                      </div>
                      <div>
                        <p className="text-blue-600">Time</p>
                        <p className="font-semibold text-blue-900">{journeyState.macroComputationTimeMs}ms</p>
                      </div>
                      <div>
                        <p className="text-blue-600">Nodes</p>
                        <p className="font-semibold text-blue-900">{journeyState.macroNodesExplored}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-bold text-emerald-900 mb-3">📦 Micro Phase</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-emerald-600">Algorithm</p>
                        <p className="font-semibold text-emerald-900">{journeyState.microAlgorithmUsed}</p>
                      </div>
                      <div>
                        <p className="text-emerald-600">Distance</p>
                        <p className="font-semibold text-emerald-900">{journeyState.microTotalDistance?.toFixed(2) || '0'} km</p>
                      </div>
                      <div>
                        <p className="text-emerald-600">Time</p>
                        <p className="font-semibold text-emerald-900">{journeyState.microComputationTimeMs}ms</p>
                      </div>
                      <div>
                        <p className="text-emerald-600">Stops</p>
                        <p className="font-semibold text-emerald-900">{journeyState.microNodesExplored}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-3">🎯 Overall</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-purple-600">Total Distance</p>
                        <p className="font-semibold text-purple-900">
                          {((journeyState.macroTotalDistance || 0) + (journeyState.microTotalDistance || 0)).toFixed(2)} km
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-600">Total Time</p>
                        <p className="font-semibold text-purple-900">
                          {((journeyState.macroComputationTimeMs || 0) + (journeyState.microComputationTimeMs || 0))}ms
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
                >
                  Start New Journey
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Back Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

