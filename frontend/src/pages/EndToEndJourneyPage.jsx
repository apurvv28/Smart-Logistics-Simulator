import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Activity, 
  CheckCircle, 
  Truck, 
  Navigation, 
  Package, 
  ChevronRight,
  TrendingUp,
  Settings,
  Zap,
  Clock,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';
import AlgorithmAuditPanel from '../components/AlgorithmAuditPanel';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import NetworkGraphVisualizer from '../components/NetworkGraphVisualizer';

const API_BASE = 'http://localhost:8081/api';

/**
 * PHASE 4: END-TO-END COMPLETE JOURNEY
 * 
 * Orchestrates the full lifecycle:
 * 1. Macro (Inter-City Network)
 * 2. Arrived at Hub (Transition)
 * 3. Micro (Local Road Delivery)
 * 4. Delivered (Completion)
 */
export default function EndToEndJourneyPage() {
  const navigate = useNavigate();

  // State
  const [journeyPhase, setJourneyPhase] = useState('SETUP'); 
  const [journeyState, setJourneyState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('VISUALIZATION'); // VISUALIZATION or AUDIT

  // Controls
  const [macroAlgorithm, setMacroAlgorithm] = useState('BELLMAN_FORD');
  const [microAlgorithm, setMicroAlgorithm] = useState('DIJKSTRA');

  // Hardcoded destinations for demo (Matches LogisticsGraph nodes)
  const ORIGIN_CITY_ID = 0; // Delhi
  const DEST_CITY_ID = 4;   // Pune

  const SAMPLE_DELIVERY_STOPS = [
    { id: 'stop-1', name: 'Kalyani Nagar', address: 'Pune, MH', latitude: 18.5477, longitude: 73.9033, type: 'delivery' },
    { id: 'stop-2', name: 'Viman Nagar', address: 'Pune, MH', latitude: 18.5679, longitude: 73.9143, type: 'delivery' },
    { id: 'stop-3', name: 'Hadapsar', address: 'Pune, MH', latitude: 18.5089, longitude: 73.9260, type: 'delivery' },
    { id: 'stop-4', name: 'Koregaon Park', address: 'Pune, MH', latitude: 18.5362, longitude: 73.8899, type: 'delivery' }
  ];

  const initiateJourney = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_BASE}/end-to-end/initiate-journey`, {
        originCityId: ORIGIN_CITY_ID,
        destinationCityId: DEST_CITY_ID,
        macroAlgorithm: macroAlgorithm,
        microAlgorithm: microAlgorithm,
        deliveryAddresses: SAMPLE_DELIVERY_STOPS
      });

      if (res.data.status === 'success') {
        setJourneyState(res.data.journey);
        setJourneyPhase(res.data.journey.currentPhase);
      }
    } catch (err) {
      setError('System Error: Could not synchronize with simulation engine.');
    } finally {
      setLoading(false);
    }
  };

  const advanceStep = async () => {
    if (!journeyState) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/end-to-end/advance-step/${journeyState.journeyId}`);
      if (res.data.status === 'success') {
        const newState = res.data.journey;
        setJourneyState(newState);
        setJourneyPhase(newState.currentPhase);
      }
    } catch (err) {
      setError('Transit Error: Synchronization lost.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJourneyPhase('SETUP');
    setJourneyState(null);
    setError(null);
  };

  // Auto-progress timer for demonstration
  useEffect(() => {
    let timer;
    if (journeyState && 
        journeyPhase !== 'SETUP' && 
        journeyPhase !== 'DELIVERED' && 
        !loading) {
      timer = setTimeout(() => {
        advanceStep();
      }, 3000); // 3 seconds per step
    }
    return () => clearTimeout(timer);
  }, [journeyState, journeyPhase, loading]);

  // Phase View Components
  if (journeyPhase === 'SETUP') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-black/5 relative overflow-hidden text-center">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100/50 rotate-3">
                <Navigation className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Initialize Journey</h2>
            <p className="text-slate-500 font-bold mb-12 max-w-lg mx-auto leading-relaxed">
              Configure the end-to-end supply chain protocol. We'll simulate a package moving from Delhi to Pune, then performing last-mile deliveries.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 text-left transition-all hover:shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Macro Phase Protocol</span>
                </div>
                <select 
                  value={macroAlgorithm}
                  onChange={(e) => setMacroAlgorithm(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
                >
                  <option value="BELLMAN_FORD">Bellman-Ford</option>
                  <option value="FLOYD_WARSHALL">Floyd-Warshall</option>
                </select>
                <p className="mt-4 text-[11px] font-bold text-slate-400 leading-relaxed px-1">
                  Optimizes inter-city transit across the India hub network graph.
                </p>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 text-left transition-all hover:shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Micro Phase Protocol</span>
                </div>
                <select 
                   value={microAlgorithm}
                   onChange={(e) => setMicroAlgorithm(e.target.value)}
                   className="w-full bg-white border border-black/5 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                >
                  <option value="DIJKSTRA">Dijkstra</option>
                  <option value="A_STAR">A*</option>
                </select>
                <p className="mt-4 text-[11px] font-bold text-slate-400 leading-relaxed px-1">
                  Optimizes last-mile stops within the Pune city road network.
                </p>
              </div>
            </div>

            <button
              onClick={initiateJourney}
              disabled={loading}
              className="group relative w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight shadow-2xl transition-all active:scale-95 disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" /> Synchronizing Engines...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  Launch Complete Journey <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Simulation View
  return (
    <div className="w-full flex-1 flex flex-col pt-0 px-0 md:px-0 bg-transparent">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-10 py-8 bg-white/40 backdrop-blur-md border border-black/5 rounded-[3rem] mb-10 mx-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
            {journeyPhase === 'IN_MACRO_TRANSIT' ? <Truck className="w-8 h-8 animate-pulse" /> : <Package className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Journey: {journeyState?.journeyId}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                journeyPhase === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}>
                {journeyPhase.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-slate-500 font-bold mt-1">{journeyState?.statusMessage}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-black/5 rounded-2xl font-black text-sm text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-10 px-6 pb-10 min-h-0">
        {/* Main Simulation Window */}
        <div className="flex-[2] flex flex-col gap-6 min-h-0">
          <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-black/5 relative overflow-hidden">
            {journeyPhase === 'IN_MACRO_TRANSIT' ? (
              <div className="w-full h-full p-4">
                 <NetworkGraphVisualizer 
                   activePath={journeyState?.macroRoute}
                   currentNodeId={journeyState?.macroRoute[journeyState?.macroCurrentStepIndex]}
                 />
              </div>
            ) : (
              <div className="w-full h-full">
                <IntraCityMapSimulator 
                   warehouse={journeyState?.microWarehouse}
                   deliveryStops={journeyState?.microDeliveryAddresses}
                   route={journeyState?.microOptimalRoute}
                   totalDistance={journeyState?.microTotalDistance}
                   autoSimulate={true}
                />
              </div>
            )}
            
            {/* Phase Overlay */}
            <div className="absolute top-8 right-8 z-20 flex gap-3">
              <div className={`px-5 py-2 rounded-2xl border backdrop-blur-md font-black text-xs shadow-xl transition-all ${
                journeyPhase === 'IN_MACRO_TRANSIT' 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-white/80 text-slate-400 border-black/5'
              }`}>
                MACRO (Inter-City)
              </div>
              <div className={`px-5 py-2 rounded-2xl border backdrop-blur-md font-black text-xs shadow-xl transition-all ${
                (journeyPhase === 'IN_MICRO_TRANSIT' || journeyPhase === 'ARRIVED_AT_HUB')
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-white/80 text-slate-400 border-black/5'
              }`}>
                MICRO (Last-Mile)
              </div>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="bg-white px-10 py-8 rounded-[2.5rem] border border-black/5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Lifecycle Progress</span>
              <span className="text-sm font-black text-slate-900 tracking-tighter">{Math.round(journeyState?.overallProgressPercentage || 0)}% Complete</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner p-0.5">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 rounded-full flex items-center justify-end px-2"
                style={{ width: `${Math.min(journeyState?.overallProgressPercentage || 0, 40)}%` }}
              >
                {journeyState?.overallProgressPercentage > 20 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
              </div>
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 rounded-full ml-1"
                style={{ width: `${Math.max(0, (journeyState?.overallProgressPercentage || 0) - 40)}%` }}
              />
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-tighter text-slate-300">
               <span className="text-indigo-600">Phase 1: Inter-Hub Network</span>
               <span className={journeyPhase === 'DELIVERED' ? 'text-emerald-600' : ''}>Phase 2: Local Fulfillment</span>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
           {/* Phase Specific Stats */}
           <div className="bg-white p-8 rounded-[3rem] border border-black/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-slate-900" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter">Engine Audit</h3>
              </div>

              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                       <span>Macro Engine</span>
                       <span className="text-indigo-600">{journeyState?.macroAlgorithmUsed}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-black/5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Time</p>
                          <p className="text-lg font-black text-slate-900">{journeyState?.macroComputationTimeMs}ms</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-black/5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Dist</p>
                          <p className="text-lg font-black text-slate-900">{Math.round(journeyState?.macroTotalDistance || 0)}km</p>
                       </div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                       <span>Micro Engine</span>
                       <span className="text-emerald-600">{journeyState?.microAlgorithmUsed}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-black/5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Time</p>
                          <p className="text-lg font-black text-slate-900">{journeyState?.microComputationTimeMs}ms</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-black/5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Dist</p>
                          <p className="text-lg font-black text-slate-900">{journeyState?.microTotalDistance?.toFixed(1)}km</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Event Log */}
           <div className="flex-1 bg-white p-8 rounded-[3rem] border border-black/5 shadow-2xl flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-8 flex-shrink-0">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-900" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter">Timeline</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                 {/* Macro Steps */}
                 {journeyState?.macroRoute.slice(0, journeyState.macroCurrentStepIndex + 1).map((nodeId, idx) => (
                    <div key={`macro-${idx}`} className="flex items-start gap-4">
                       <div className="mt-1 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900">Reached Hub Node {nodeId}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Macro Phase • Transit</p>
                       </div>
                    </div>
                 ))}

                 {/* Hub Transition */}
                 {journeyState?.currentPhase !== 'IN_MACRO_TRANSIT' && journeyState?.currentPhase !== 'INITIATED' && (
                    <div className="flex items-start gap-4">
                       <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-emerald-600">Arrived at {journeyState.microWarehouse?.name}</p>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase">Transition • Unloading</p>
                       </div>
                    </div>
                 )}

                 {/* Micro Steps */}
                 {journeyState?.microCurrentStepIndex > 0 && journeyState.microOptimalRoute.slice(1, journeyState.microCurrentStepIndex + 1).map((stop, idx) => (
                    <div key={`micro-${idx}`} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-500">
                       <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-900">Delivered to {stop.name}</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase">Micro Phase • Last-Mile</p>
                       </div>
                    </div>
                 ))}
                 
                 {journeyPhase === 'DELIVERED' && (
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center animate-bounce">
                       <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                       <p className="text-sm font-black text-emerald-700">Journey Complete</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
