import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Globe,
  Play,
  Pause
} from 'lucide-react';
import AlgorithmAuditPanel from '../components/AlgorithmAuditPanel';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import { useEndToEndState } from '../hooks/useEndToEndState';
import 'leaflet/dist/leaflet.css';

const MACRO_NODES = {
  0: { name: 'Delhi', x: 280, y: 80 },
  1: { name: 'Agra', x: 310, y: 130 },
  2: { name: 'Jaipur', x: 220, y: 150 },
  3: { name: 'Mumbai', x: 200, y: 300 },
  4: { name: 'Pune', x: 230, y: 330 }
};

export default function EndToEndJourneyPage() {
  const navigate = useNavigate();
  const {
    journey,
    loading,
    error,
    statusMessage,
    currentPhase,
    showMicroPhase,
    overallProgress,
    isPaused,
    initiateJourney,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetJourney
  } = useEndToEndState();

  const [macroAlgorithm, setMacroAlgorithm] = useState('Bellman-Ford');
  const [microAlgorithm, setMicroAlgorithm] = useState('Dijkstra');

  const handleLaunchJourney = async () => {
    await initiateJourney(macroAlgorithm, microAlgorithm);
  };

  const currentScreen = !journey 
    ? 'SETUP'
    : currentPhase === 'IN_MACRO_TRANSIT' || currentPhase === 'ARRIVED_AT_HUB'
      ? 'MACRO'
      : currentPhase === 'IN_MICRO_TRANSIT'
        ? 'MICRO'
        : currentPhase === 'DELIVERED'
          ? 'COMPLETE'
          : 'SETUP';

  if (currentScreen === 'SETUP') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-[#FAF9F6]">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-200 relative overflow-hidden text-center">
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
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Macro Phase Protocol</span>
                </div>
                <select 
                  value={macroAlgorithm}
                  onChange={(e) => setMacroAlgorithm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
                >
                  <option value="Bellman-Ford">Bellman-Ford</option>
                  <option value="Floyd-Warshall">Floyd-Warshall</option>
                </select>
                <p className="mt-4 text-[11px] font-bold text-slate-400 leading-relaxed px-1">
                  Optimizes inter-city transit across the India hub network graph.
                </p>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 text-left transition-all hover:shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Micro Phase Protocol</span>
                </div>
                <select 
                   value={microAlgorithm}
                   onChange={(e) => setMicroAlgorithm(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-emerald-100 outline-none transition-all cursor-pointer"
                >
                  <option value="Dijkstra">Dijkstra</option>
                  <option value="A*">A*</option>
                </select>
                <p className="mt-4 text-[11px] font-bold text-slate-400 leading-relaxed px-1">
                  Optimizes last-mile stops within the Pune city road network.
                </p>
              </div>
            </div>

            <button
              onClick={handleLaunchJourney}
              disabled={loading}
              className="group relative w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" /> <span className="tracking-widest uppercase text-sm">Initializing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  Launch Complete Journey <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-center gap-2">
                <span>❌</span> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // AUDIT DATA PREPARATION (Optional, kept for consistency if needing AlgorithmAuditPanel later)
  const endToEndAudit = journey ? {
    macro: {
      algorithm: journey.macroAlgorithmUsed,
      stepIndex: journey.macroCurrentStepIndex,
      totalSteps: journey.macroRoute?.length,
      macroDistanceTraveled: journey.macroDistanceTraveled,
      macroTotalDistance: journey.macroTotalDistance,
      computationMs: journey.macroComputationTimeMs,
      nodesExplored: journey.macroNodesExplored || 0
    },
    micro: showMicroPhase ? {
      algorithm: journey.microAlgorithmUsed,
      stopsCompleted: journey.microCurrentStepIndex,
      totalStops: journey.microOptimalRoute?.length,
      microDistanceTraveled: journey.microDistanceTraveled,
      microTotalDistance: journey.microTotalDistance,
      computationMs: journey.microComputationTimeMs
    } : null,
    overallProgress,
    currentPhase,
    statusMessage
  } : null;

  // Render Completion Screen
  if (currentScreen === 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] text-slate-900 p-12 text-center">
        <div className="w-32 h-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center mb-10 border border-emerald-200 shadow-xl">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-slate-900">Delivery Complete!</h1>
        <p className="text-slate-500 font-bold mb-16 max-w-lg mx-auto text-lg leading-relaxed">
          Package successfully routed from Delhi Hub to the customer's doorstep in Pune.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16 px-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Inter-City Distance</span>
             <span className="text-2xl font-black text-blue-600">{Math.round(journey.macroTotalDistance || 0)} km</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last-Mile Distance</span>
             <span className="text-2xl font-black text-emerald-600">{journey.microTotalDistance?.toFixed(2)} km</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Accuracy</span>
             <span className="text-2xl font-black text-indigo-600">100%</span>
          </div>
        </div>

        <button 
          onClick={resetJourney}
          className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-2xl flex mx-auto items-center gap-3"
        >
          <RotateCcw className="w-5 h-5" /> Run New Simulation
        </button>
      </div>
    );
  }

  // MACRO & MICRO SIMULATION DASHBOARD (Clean Light Aesthetic)
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      
      {/* 1. HEADER */}
      <header className="px-10 py-6 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Phase 4: Complete Mission Journey</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Live Synchronization Interface
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex gap-2">
              <button 
                onClick={isPaused ? resumeAnimation : pauseAnimation}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                 {isPaused ? <><Play className="w-4 h-4 fill-slate-700" /> Resume</> : <><Pause className="w-4 h-4 fill-slate-700" /> Pause</>}
              </button>
              <button 
                onClick={resetJourney}
                className="px-6 py-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all"
              >
                 <RotateCcw className="w-4 h-4" /> Reset
              </button>
           </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        
        {/* LEFT COMPONENT: INLINE AUDIT PANEL */}
        <aside className="w-full lg:w-[450px] border-r border-slate-200 bg-white flex flex-col shadow-sm z-10 p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-800">Mission Audit</h2>
          </div>
          
          <div className="flex-1 border bg-slate-50 border-slate-200 rounded-3xl overflow-hidden shadow-inner">
            <div className="p-6 space-y-6">

              {/* Overall Progress */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lifecycle Progress</span>
                  <span className="text-xl font-black text-indigo-600">{Math.round(overallProgress || 0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-1000"
                    style={{ width: `${overallProgress || 0}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-slate-500 mt-3 flex justify-between">
                  <span>Current Phase:</span>
                  <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter text-[10px]">{currentPhase?.replace(/_/g, ' ')}</span>
                </p>
              </div>

              {/* Macro Stats */}
              <div className={`p-6 rounded-2xl border transition-all ${!showMicroPhase ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="font-black uppercase tracking-widest text-blue-800 text-[10px]">Macro Transit</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Algorithm</p>
                      <p className="text-xs font-black text-slate-800">{journey?.macroAlgorithmUsed || '...'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Distance</p>
                      <p className="text-xs font-black text-slate-800">{journey?.macroDistanceTraveled?.toFixed(1) || 0} / {journey?.macroTotalDistance?.toFixed(0) || 0} km</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Nodes Visited</p>
                      <p className="text-xs font-black text-slate-800">{journey?.macroCurrentStepIndex || 0} / {journey?.macroRoute?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Compute Time</p>
                      <p className="text-xs font-black text-slate-800">{journey?.macroComputationTimeMs || 0} ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Micro Stats */}
              <div className={`p-6 rounded-2xl border transition-all ${showMicroPhase ? 'bg-emerald-50 border-emerald-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500' : 'bg-white border-slate-200 opacity-60'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span className="font-black uppercase tracking-widest text-emerald-800 text-[10px]">Micro Delivery</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Algorithm</p>
                      <p className="text-xs font-black text-slate-800">{journey?.microAlgorithmUsed || '...'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Distance</p>
                      <p className="text-xs font-black text-slate-800">{journey?.microDistanceTraveled?.toFixed(2) || 0} km</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Stops Completed</p>
                      <p className="text-xs font-black text-slate-800">{journey?.microCurrentStepIndex || 0} / {journey?.microOptimalRoute?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Compute Time</p>
                      <p className="text-xs font-black text-slate-800">{journey?.microComputationTimeMs || 0} ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Status */}
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Live Telemetry Feed</p>
                 <p className="text-[11px] font-bold text-slate-700 italic leading-snug">
                    {statusMessage}
                 </p>
              </div>

            </div>
          </div>
        </aside>

        {/* RIGHT COMPONENT: MAIN VISUALIZATION */}
        <section className="flex-1 relative flex flex-col bg-slate-100 p-8">
           
           <div className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
              
              {!showMicroPhase ? (
                // MACRO PHASE (SVG GRAPH) - Light Theme Variant
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F6] p-10 animate-in fade-in duration-1000">
                   <svg width="600" height="400" viewBox="0 0 600 400">
                      {/* Base Edges */}
                      {Object.entries(MACRO_NODES).map(([id, node]) => {
                        const targets = [0,1,2,3,4].filter(t => t != id);
                        return targets.map(tid => (
                          <line 
                            key={`${id}-${tid}`} 
                            x1={node.x} y1={node.y} x2={MACRO_NODES[tid].x} y2={MACRO_NODES[tid].y}
                            stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6"
                          />
                        ));
                      })}
                      
                      {/* Active Route Path */}
                      {journey?.macroRoute?.slice(0, journey.macroCurrentStepIndex).map((nid, i) => {
                         const nextId = journey.macroRoute[i + 1];
                         if (nextId === undefined) return null;
                         
                         const n1 = MACRO_NODES[nid] || { x: 260 + (i*10), y: 180 + (i*15) };
                         const n2 = MACRO_NODES[nextId] || { x: 260 + ((i+1)*10), y: 180 + ((i+1)*15) };
                         
                         return (
                            <line 
                               key={`path-${i}`}
                               x1={n1.x} y1={n1.y}
                               x2={n2.x} y2={n2.y}
                               stroke="#4f46e5" strokeWidth="6" strokeLinecap="round"
                               className="animate-in fade-in duration-700"
                            />
                         );
                      })}

                      {/* City Nodes */}
                      {(journey?.macroRoute || Object.keys(MACRO_NODES).map(Number)).map((nodeId, i) => {
                        const isVisited = journey?.macroRoute?.slice(0, journey.macroCurrentStepIndex)?.includes(Number(nodeId)) || false;
                        const isCurrent = journey?.macroRoute?.[journey.macroCurrentStepIndex] === Number(nodeId);
                        
                        // Use static positions or generate dynamically
                        const node = MACRO_NODES[nodeId] || { name: `Hub ${nodeId}`, x: 260 + (i*10), y: 180 + (i*15) };
                        
                        return (
                          <g key={nodeId}>
                            {isCurrent && (
                              <circle cx={node.x} cy={node.y} r="30" fill="#4f46e5" opacity="0.1">
                                 <animate attributeName="r" from="20" to="40" dur="1.5s" repeatCount="indefinite" />
                                 <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                              </circle>
                            )}
                            <circle 
                              cx={node.x} cy={node.y} r={isCurrent ? 14 : 10} 
                              fill={isCurrent ? "#f59e0b" : (isVisited ? "#4f46e5" : "#f1f5f9")}
                              stroke={isCurrent ? "#fff" : (isVisited ? "#c7d2fe" : "#94a3b8")}
                              strokeWidth="3"
                              className="transition-all duration-500"
                            />
                            <text 
                              x={node.x} y={node.y - 25} 
                              textAnchor="middle" 
                              fill="#334155" 
                              className="text-[12px] font-black uppercase tracking-wider"
                            >
                               {node.name}
                            </text>
                          </g>
                        );
                      })}
                   </svg>
                   <div className="absolute top-8 left-8">
                     <span className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm">
                       National Network View
                     </span>
                   </div>
                </div>
              ) : (
                // MICRO PHASE (LEAFLET)
                <div className="w-full h-full animate-in fade-in duration-1000">
                   <IntraCityMapSimulator 
                      warehouse={journey?.microWarehouse || {}}
                      deliveryStops={journey?.microDeliveryAddresses || []}
                      route={journey?.microOptimalRoute || []}
                      totalDistance={journey?.microTotalDistance || 0}
                      autoSimulate={true}
                      externalIsPaused={isPaused}
                   />
                   <div className="absolute top-8 left-8 z-[1000] pointer-events-none">
                     <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm">
                       Local Delivery View
                     </span>
                   </div>
                </div>
              )}

              {/* TRANSITION OVERLAY */}
              {currentPhase === 'ARRIVED_AT_HUB' && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                   <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
                     <Package className="w-12 h-12" />
                   </div>
                   <h3 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Arrived at Destination Hub</h3>
                   <p className="text-slate-500 font-bold mb-8">Switching to Micro Phase protocol for local delivery...</p>
                   <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              )}
           </div>

        </section>
      </main>
    </div>
  );
}
