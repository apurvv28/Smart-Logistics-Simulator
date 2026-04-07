import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, MapPin, Activity, CheckCircle, Truck } from 'lucide-react';
import axios from 'axios';
import AlgorithmAuditPanel from '../components/AlgorithmAuditPanel';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import NetworkGraphVisualizer from '../components/NetworkGraphVisualizer';

const API_BASE = 'http://localhost:8081/api';

/**
 * PHASE 4: END-TO-END COMPLETE JOURNEY
 * 
 * Combines macro (inter-city) and micro (intra-city) routing demonstrating:
 * 1. Macro Phase: Inter-city Hub-to-Hub transit (0-40% Progress)
 * 2. Micro Phase: Last-mile delivery within city (40-100% Progress)
 * 3. Audit: Comparative algorithmic analysis
 */
export default function EndToEndJourneyPage() {
  const navigate = useNavigate();

  // Journey phase state
  const [journeyPhase, setJourneyPhase] = useState('SETUP'); // SETUP, MACRO, MICRO, COMPLETE
  const [journeyId, setJourneyId] = useState(null);
  const [journeyState, setJourneyState] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Algorithm selection
  const [macroAlgorithm, setMacroAlgorithm] = useState('BELLMAN_FORD');
  const [microAlgorithm, setMicroAlgorithm] = useState('DIJKSTRA');

  // Macro phase state
  const [macroRouting, setMacroRouting] = useState(null);
  const [macroProgress, setMacroProgress] = useState(0);

  // Micro phase state
  const [microRoute, setMicroRoute] = useState([]);
  const [microProgress, setMicroProgress] = useState(0);
  const [microAnimating, setMicroAnimating] = useState(false);

  // Loading/Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Constants
  const MACRO_WEIGHT = 0.4;
  const MICRO_WEIGHT = 0.6;

  // Mock Graph Data for NetworkVisualizer
  const MOCK_GRAPH = {
    nodes: [
      { id: 1, name: 'Warehouse-1 (Nagpur)', type: 'WAREHOUSE' },
      { id: 2, name: 'Hub-North (Delhi)', type: 'HUB' },
      { id: 3, name: 'Hub-South (Bengaluru)', type: 'HUB' },
      { id: 4, name: 'Hub-West (Mumbai)', type: 'HUB' },
      { id: 5, name: 'Hub-East (Kolkata)', type: 'HUB' },
      { id: 8, name: 'Delivery Hub (Pune)', type: 'HUB' }
    ],
    edges: [
      { from: 1, to: 2, distanceKm: 1000 },
      { from: 1, to: 4, distanceKm: 800 },
      { from: 4, to: 8, distanceKm: 150 },
      { from: 2, to: 8, distanceKm: 1450 },
      { from: 3, to: 8, distanceKm: 850 },
      { from: 5, to: 8, distanceKm: 1600 }
    ]
  };

  const PUNE_WAREHOUSE = {
    id: 'warehouse',
    name: 'Pune Local Warehouse',
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'Kalyani Nagar, Pune'
  };

  const SAMPLE_DELIVERY_STOPS = [
    { id: 'stop-1', name: 'Shivaji Nagar', address: 'Pune 411005', latitude: 18.5523, longitude: 73.8479, type: 'delivery' },
    { id: 'stop-2', name: 'Koregaon Park', address: 'Pune 411001', latitude: 18.5347, longitude: 73.8787, type: 'delivery' },
    { id: 'stop-3', name: 'Viman Nagar', address: 'Pune 411014', latitude: 18.5672, longitude: 73.9125, type: 'delivery' },
    { id: 'stop-4', name: 'Hadapsar', address: 'Pune 411013', latitude: 18.5183, longitude: 73.9288, type: 'delivery' }
  ];

  // Manual return to warehouse added to route
  const MICRO_ROUTE_WITH_RETURN = [...SAMPLE_DELIVERY_STOPS, PUNE_WAREHOUSE];

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
        deliveryAddresses: SAMPLE_DELIVERY_STOPS
      });

      if (response.data.status === 'success') {
        processInitiatedJourney(response.data.journey, response.data.journeyId);
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn('Backend unavailable, using national offline journey mode:', err.message);
      setIsOfflineMode(true);
      const mockJourney = {
        macroRoute: [2, 8],
        macroOriginCityId: 2,
        macroDestinationCityId: 8,
        macroTotalDistance: 1450,
        microOptimalRoute: [PUNE_WAREHOUSE, ...SAMPLE_DELIVERY_STOPS, PUNE_WAREHOUSE],
        microTotalDistance: 45.2,
        currentPhase: 'INITIATED',
        macroAlgorithmUsed: macroAlgorithm,
        microAlgorithmUsed: microAlgorithm,
        macroComputationTimeMs: 12,
        microComputationTimeMs: 8,
        macroNodesExplored: 6,
        microNodesExplored: 4
      };
      processInitiatedJourney(mockJourney, 'offline-' + Date.now());
    } finally {
      setLoading(false);
    }
  };

  const processInitiatedJourney = (journey, id) => {
    setJourneyId(id);
    setJourneyState(journey);
    setAuditData(journey);
    setJourneyPhase('MACRO');
    setMacroProgress(0);
    setOverallProgress(0);
    
    setMacroRouting({
      route: journey.macroRoute || [2, 8],
      startCity: MOCK_GRAPH.nodes.find(n => n.id === 2),
      endCity: MOCK_GRAPH.nodes.find(n => n.id === 8),
      distance: journey.macroTotalDistance
    });

    setMicroRoute(journey.microOptimalRoute || [PUNE_WAREHOUSE, ...SAMPLE_DELIVERY_STOPS, PUNE_WAREHOUSE]);
    setSuccessMessage('✓ Journey initiated! Simulating inter-city transit...');
  };

  /**
   * Simulate Macro Phase Progress and Automatic Transition
   */
  useEffect(() => {
    let interval;
    if (journeyPhase === 'MACRO') {
      interval = setInterval(() => {
        setMacroProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => advanceToMicro(), 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [journeyPhase]);

  // Update Overall Progress
  useEffect(() => {
    if (journeyPhase === 'MACRO') {
      setOverallProgress((macroProgress / 100) * (MACRO_WEIGHT * 100));
    } else if (journeyPhase === 'MICRO') {
      setOverallProgress((MACRO_WEIGHT * 100) + (microProgress / 100) * (MICRO_WEIGHT * 100));
    } else if (journeyPhase === 'COMPLETE') {
      setOverallProgress(100);
    }
  }, [macroProgress, microProgress, journeyPhase]);

  const advanceToMicro = () => {
    setJourneyPhase('MICRO');
    setSuccessMessage('✓ Arrived at Hub! Starting Micro (last-mile) delivery...');
  };

  const handleReset = () => {
    setJourneyPhase('SETUP');
    setJourneyId(null);
    setJourneyState(null);
    setAuditData(null);
    setOverallProgress(0);
    setMacroProgress(0);
    setMicroProgress(0);
    setMicroAnimating(false);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * ProgressBar Component
   */
  const GlobalProgressBar = () => (
    <div className="bg-white border-t border-amber-200 p-4 shadow-lg sticky bottom-0 z-30">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Overall Progress: {Math.round(overallProgress)}%
          </span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div> MACRO (40%)
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> MICRO (60%)
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner flex">
          <div 
            className="bg-blue-500 h-full transition-all duration-300" 
            style={{ width: `${Math.min(overallProgress, 40)}%` }}
          />
          <div 
            className="bg-emerald-500 h-full transition-all duration-300" 
            style={{ width: `${Math.max(0, overallProgress - 40)}%` }}
          />
        </div>
        <div className="mt-2 text-center">
           <p className="text-xs font-medium text-amber-700 italic">
             {journeyPhase === 'MACRO' ? '🚚 Inter-city transit in progress...' : 
              journeyPhase === 'MICRO' ? '🚲 Last-mile deliveries active...' : 
              '✅ Journey Complete'}
           </p>
        </div>
      </div>
    </div>
  );

  // Setup phase
  if (journeyPhase === 'SETUP') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col">
        <div className="bg-white border-b border-amber-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-amber-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-amber-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">End-to-End LogiSim Journey</h1>
              <p className="text-sm text-amber-600">Phase 4: Multi-tier Network Integration</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-amber-100">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-amber-900 mb-2 text-center">
                Initialize Journey
              </h2>
              <p className="text-sm text-amber-600 text-center mb-8">
                Configure hierarchical routing algorithms for the nationwide supply chain.
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-900 mb-3 uppercase">
                      Macro (Hub-to-Hub)
                    </label>
                    <select
                      value={macroAlgorithm}
                      onChange={(e) => setMacroAlgorithm(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="BELLMAN_FORD">Bellman-Ford</option>
                      <option value="FLOYD_WARSHALL">Floyd-Warshall</option>
                    </select>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-900 mb-3 uppercase">
                      Micro (Last-Mile)
                    </label>
                    <select
                      value={microAlgorithm}
                      onChange={(e) => setMicroAlgorithm(e.target.value)}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      <option value="DIJKSTRA">Dijkstra</option>
                      <option value="A_STAR">A*</option>
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-900 mb-2 uppercase flex items-center gap-2">
                    <MapPin className="w-3 h-3"/> Shipment Details
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1 ml-5 list-disc">
                    <li><strong>Origin:</strong> Delhi Warehouse</li>
                    <li><strong>Transit Hub:</strong> Pune Logistics Center</li>
                    <li><strong>Destinations:</strong> 4 Local Pune Addresses</li>
                  </ul>
                </div>

                <button
                  onClick={initiateJourney}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:shadow-amber-200/50'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" /> Calculating System...
                    </div>
                  ) : '▶ BATTLE-TEST SYSTEM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Macro phase (Inter-City Network Graph)
  if (journeyPhase === 'MACRO') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col">
        <div className="bg-slate-900/50 border-b border-slate-800 p-4 z-40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Macro Phase: Inter-City Topology</h1>
                <p className="text-xs text-blue-400 font-medium">Nagpur Hub → Delhi Hub → Pune Central</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Protocol</p>
                  <p className="text-sm text-blue-400 font-bold">{macroAlgorithm}</p>
               </div>
               <button 
                 onClick={advanceToMicro}
                 className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
               >
                 Skip to Micro <ArrowLeft className="w-3 h-3 rotate-180" />
               </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col lg:flex-row p-4 gap-4">
           {/* Progress overlay for Macro */}
           <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-blue-600/90 text-white px-4 py-1 rounded-full text-[10px] font-bold shadow-xl border border-blue-400/50">
             TRANSIT STATUS: {Math.round(macroProgress)}%
           </div>

           <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <NetworkGraphVisualizer 
                nodes={MOCK_GRAPH.nodes}
                edges={MOCK_GRAPH.edges}
                activePath={[2, 8]}
              />
           </div>

           <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto">
              <div className="glass p-6 rounded-3xl border border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 mb-4 uppercase tracking-tighter">Routing Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold">DISTANCE</span>
                    <span className="text-lg text-blue-400 font-mono font-bold">1,450 km</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold">ETD</span>
                    <span className="text-lg text-blue-400 font-mono font-bold">14.2 hrs</span>
                  </div>
                </div>
              </div>
              <AlgorithmAuditPanel auditData={auditData} />
           </div>
        </div>
        <GlobalProgressBar />
      </div>
    );
  }

  // Micro phase (Map Simulation)
  if (journeyPhase === 'MICRO') {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-emerald-200 p-4 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center border border-emerald-200">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-950">Micro Phase: Last-Mile Topology</h1>
                <p className="text-xs text-emerald-600 font-bold">Pune Local Delivery | 4 Stops + Return</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[10px] text-emerald-800 uppercase font-black">Algorithm</p>
                  <p className="text-sm text-emerald-600 font-black">{microAlgorithm}</p>
               </div>
               <div className="h-8 w-[1px] bg-emerald-200"></div>
               <button 
                 onClick={() => setJourneyPhase('COMPLETE')}
                 className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-emerald-200"
               >
                 Finalize Journey
               </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <IntraCityMapSimulator
            warehouse={PUNE_WAREHOUSE}
            deliveryStops={SAMPLE_DELIVERY_STOPS}
            route={microRoute}
            totalDistance={journeyState?.microTotalDistance || 45.2}
            onSimulationStart={() => setMicroAnimating(true)}
            onSimulationEnd={() => {
              setMicroAnimating(false);
              setMicroProgress(100);
            }}
            animationSpeed={2000}
          />
        </div>
        <GlobalProgressBar />
      </div>
    );
  }

  // Journey complete
  if (journeyPhase === 'COMPLETE') {
    return (
      <div className="w-full h-screen bg-white flex flex-col">
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">MISSION SUMMARY</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-10 shadow-2xl border border-slate-200 text-center relative overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
              <div className="inline-block p-4 bg-emerald-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Delivery Complete!</h2>
              <p className="text-slate-500 font-medium mb-10 italic">System optimized across 1,500+ km within 1.2s</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-[10px] font-black text-blue-800 uppercase mb-4 tracking-widest">Macro Phase</p>
                  <p className="text-2xl font-black text-blue-900 mb-1">{journeyState?.macroTotalDistance?.toFixed(0) || 1450} km</p>
                  <p className="text-xs text-blue-600 font-bold">{macroAlgorithm}</p>
                </div>
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-800 uppercase mb-4 tracking-widest">Micro Phase</p>
                  <p className="text-2xl font-black text-emerald-900 mb-1">{journeyState?.microTotalDistance?.toFixed(1) || 45.2} km</p>
                  <p className="text-xs text-emerald-600 font-bold">{microAlgorithm}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Efficiency</p>
                  <p className="text-2xl font-black text-white mb-1">98.4%</p>
                  <p className="text-xs text-slate-400 font-bold">Route Optimized</p>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 flex gap-4 justify-center">
                 <button onClick={handleReset} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all shadow-xl">
                   START NEW MISSION
                 </button>
              </div>
            </div>
            
            <AlgorithmAuditPanel auditData={auditData} />
          </div>
        </div>
      </div>
    );
  }
}
