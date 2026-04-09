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
import AlgorithmAuditPanel from '../components/AlgorithmAuditPanel';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import NetworkGraphVisualizer from '../components/NetworkGraphVisualizer';
import { useEndToEndState } from '../hooks/useEndToEndState';

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
  const {
    journey,
    loading,
    error,
    statusMessage,
    initiateJourney,
    resetJourney,
    startAnimation
  } = useEndToEndState();

  const [activeTab, setActiveTab] = useState('VISUALIZATION');
  const [macroAlgorithm, setMacroAlgorithm] = useState('Bellman-Ford');
  const [microAlgorithm, setMicroAlgorithm] = useState('Dijkstra');

  const handleLaunchJourney = async () => {
    try {
      await initiateJourney(macroAlgorithm, microAlgorithm);
      startAnimation();
    } catch (err) {
      console.error('Launch failed:', err);
    }
  };

  const currentScreen = !journey 
    ? 'SETUP'
    : journey.currentPhase === 'IN_MACRO_TRANSIT' || journey.currentPhase === 'ARRIVED_AT_HUB'
      ? 'MACRO'
      : journey.currentPhase === 'IN_MICRO_TRANSIT'
        ? 'MICRO'
        : journey.currentPhase === 'DELIVERED'
          ? 'COMPLETE'
          : 'SETUP';

  // Phase View Components
  if (currentScreen === 'SETUP') {
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
                  <option value="Bellman-Ford">Bellman-Ford</option>
                  <option value="Floyd-Warshall">Floyd-Warshall</option>
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
              className="group relative w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight shadow-2xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" /> ⏳ Initializing Mission...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  Launch Complete Journey <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                <span>❌</span> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- SUB-COMPONENTS ---

  const StatCard = ({ label, value, color }) => (
    <div className="bg-slate-800/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col items-center">
       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</span>
       <span className="text-2xl font-black" style={{ color }}>{value}</span>
    </div>
  );

  const AlgoBadge = ({ phase, algo, color }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5">
       <span className="text-[10px] font-black uppercase text-slate-500">{phase}:</span>
       <span className="text-xs font-bold" style={{ color }}>{algo}</span>
    </div>
  );

  const MacroVisualizer = ({ journey }) => {
    const nodes = {
      0: { name: 'Delhi', x: 280, y: 80 },
      1: { name: 'Agra', x: 310, y: 130 },
      2: { name: 'Jaipur', x: 220, y: 150 },
      3: { name: 'Mumbai', x: 200, y: 300 },
      4: { name: 'Pune', x: 230, y: 330 }
    };

    const route = journey.macroRoute || [];
    const currentStepIndex = journey.macroCurrentStepIndex || 0;
    const currentNodeId = route[currentStepIndex];

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950/40 overflow-hidden">
        <svg width="600" height="400" viewBox="0 0 600 400" className="drop-shadow-2xl">
          {/* Node Connections (Network) */}
          {Object.entries(nodes).map(([id, node]) => {
            const neighbors = [0,1,2,3,4].filter(n => n != id);
            return neighbors.map(targetId => (
               <line 
                 key={`${id}-${targetId}`}
                 x1={node.x} y1={node.y} x2={nodes[targetId].x} y2={nodes[targetId].y}
                 stroke="#1e293b" strokeWidth="1" strokeDasharray="4 2"
               />
            ));
          })}

          {/* Active Path Highlighter */}
          {route.slice(0, currentStepIndex).map((nodeId, idx) => {
             const startNode = nodes[nodeId];
             const endNode = nodes[route[idx+1]];
             if (!startNode || !endNode) return null;
             return (
                <line 
                  key={`path-${idx}`}
                  x1={startNode.x} y1={startNode.y} x2={endNode.x} y2={endNode.y}
                  stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
                  className="animate-in fade-in duration-700"
                />
             );
          })}

          {/* City Nodes */}
          {Object.entries(nodes).map(([id, node]) => {
            const isVisited = route.slice(0, currentStepIndex).includes(Number(id));
            const isCurrent = currentNodeId === Number(id);
            const isInRoute = route.includes(Number(id));
            
            return (
              <g key={id}>
                {isCurrent && (
                   <circle cx={node.x} cy={node.y} r="20" fill="#3b82f6" opacity="0.15">
                      <animate attributeName="r" from="10" to="25" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
                   </circle>
                )}
                <circle 
                  cx={node.x} cy={node.y} r={isCurrent ? 12 : 7} 
                  fill={isCurrent ? "#facc15" : (isVisited ? "#3b82f6" : (isInRoute ? "#1e293b" : "#0f172a"))}
                  stroke={isCurrent ? "#fff" : (isVisited ? "#3b82f6" : "#334155")}
                  strokeWidth="2"
                  className="transition-all duration-700"
                />
                <text x={node.x} y={node.y - 20} textAnchor="middle" fill={isCurrent ? "#fff" : "#64748b"} className="text-[10px] font-black uppercase tracking-tighter">
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // ARRIVED AT HUB OVERLAY (Fix 5)
  const TransitionOverlay = () => {
    useEffect(() => {
      const timer = setTimeout(async () => {
         // Force advance to MICRO phase after delay
         try {
           await fetch(`${API_BASE}/end-to-end/advance-step/${journey.journeyId}`, { method: 'POST' });
         } catch(e) { console.error("Handover failed:", e); }
      }, 2500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="fixed inset-0 z-[9999] bg-[#0a0a14]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="text-7xl mb-8 animate-bounce">📦</div>
        <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">Hub Arrival: Pune</h2>
        <p className="text-slate-400 font-bold mb-10 text-lg">Initialising last-mile road dispatch...</p>
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
           <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 animate-[loading_2.5s_linear_forwards]" />
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading { from { width: 0%; } to { width: 100%; } }
        `}} />
      </div>
    );
  };

  // --- RENDERING ROUTER ---

  if (currentScreen === 'SETUP') {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-black/5 relative overflow-hidden text-center">
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
                  <option value="Bellman-Ford">Bellman-Ford</option>
                  <option value="Floyd-Warshall">Floyd-Warshall</option>
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
              className="group relative w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight shadow-2xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" /> Initializing Mission...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  Launch Complete Journey <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </button>
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center justify-center gap-2 animate-bounce">
                <span>❌</span> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a14] text-white p-12 text-center">
        <div className="w-32 h-32 bg-emerald-500/20 rounded-[3rem] flex items-center justify-center mb-10 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <CheckCircle className="w-16 h-16 text-emerald-500" />
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter">Delivery Complete!</h1>
        <p className="text-slate-400 font-bold mb-16 max-w-lg mx-auto text-lg leading-relaxed">
          Package successfully routed from Delhi Hub to the customer's doorstep in Pune.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-16 px-4">
          <StatCard label="Inter-City Distance" value={`${Math.round(journey.macroTotalDistance || 0)} km`} color="#3b82f6" />
          <StatCard label="Last-Mile Distance" value={`${journey.microTotalDistance?.toFixed(2)} km`} color="#10b981" />
          <StatCard label="Service Accuracy" value="100%" color="#facc15" />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-20">
           <AlgoBadge phase="Macro" algo={journey.macroAlgorithmUsed} color="#3b82f6" />
           <AlgoBadge phase="Micro" algo={journey.microAlgorithmUsed} color="#10b981" />
        </div>

        <button 
          onClick={resetJourney}
          className="px-16 py-6 bg-white text-slate-950 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-4"
        >
          <RotateCcw className="w-6 h-6" /> Run New Simulation
        </button>
      </div>
    );
  }

  // MACRO & MICRO Main Container
  return (
    <div className={`w-full flex-1 flex flex-col pt-0 px-0 md:px-0 relative min-h-screen transition-all duration-1000 ${
      currentScreen === 'MACRO' ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* HANDOVER OVERLAY */}
      {journey.currentPhase === 'ARRIVED_AT_HUB' && <TransitionOverlay />}

      {/* Navigation Header */}
      <div className={`flex items-center justify-between px-10 py-8 border-b transition-colors ${
        currentScreen === 'MACRO' ? 'bg-[#1e293b]/50 border-white/5' : 'bg-white border-black/5 shadow-sm'
      }`}>
        <div className="flex items-center gap-6">
          <button onClick={resetJourney} className="p-3 rounded-2xl bg-slate-800/10 hover:bg-slate-800/20 transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">Mission Console</h1>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                currentScreen === 'MACRO' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
              }`}>
                {currentScreen} PHASE ACTIVE
              </span>
            </div>
            <p className="font-bold opacity-60 text-sm mt-1 uppercase tracking-wider">{journey?.journeyId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className={`p-4 rounded-2xl flex items-center gap-4 ${currentScreen === 'MACRO' ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
              <div className="text-right">
                 <p className="text-[9px] font-black opacity-40 uppercase tracking-widest">Total Progress</p>
                 <p className="text-sm font-black tracking-tighter">{Math.round(journey?.overallProgressPercentage || 0)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                 <TrendingUp className="w-6 h-6" />
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Visualizer Panel (Right-aligned in UX flow, but primary focus) */}
        <div className="flex-[2.5] flex flex-col items-center justify-center p-8 bg-black/20 backdrop-blur-sm">
           <div className={`w-full aspect-video rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border relative overflow-hidden transition-all h-full ${
             currentScreen === 'MACRO' ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5'
           }`}>
              {currentScreen === 'MACRO' ? (
                 <MacroVisualizer journey={journey} />
              ) : (
                 <IntraCityMapSimulator 
                    warehouse={journey?.microWarehouse}
                    deliveryStops={journey?.microDeliveryAddresses}
                    route={journey?.microOptimalRoute}
                    totalDistance={journey?.microTotalDistance}
                    autoSimulate={true}
                 />
              )}
              
              {/* HUD Badge */}
              <div className="absolute top-10 left-10 z-[100] flex gap-3">
                 <div className="px-5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Live Telemetry
                 </div>
              </div>
           </div>
        </div>

        {/* Info Sidebar (Left Panel in prompt) */}
        <div className={`flex-1 flex flex-col border-l p-10 overflow-y-auto scrollbar-hide select-none transition-colors ${
           currentScreen === 'MACRO' ? 'bg-[#1e293b]/70 border-white/5' : 'bg-white border-black/5'
        }`}>
           <div className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className={`p-3 rounded-xl ${currentScreen === 'MACRO' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-600'}`}>
                    <Activity className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tighter">Phase Protocol</h3>
              </div>

              <div className="space-y-4">
                 <div className={`p-6 rounded-[2rem] border ${currentScreen === 'MACRO' ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-current">Active Algorithm</p>
                    <p className="text-2xl font-black italic tracking-tighter">
                       {currentScreen === 'MACRO' ? journey.macroAlgorithmUsed : journey.microAlgorithmUsed}
                    </p>
                    <div className="mt-4 h-1 w-full bg-current/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 animate-[pulse_2s_infinite]" style={{ width: '40%' }} />
                    </div>
                 </div>

                 <div className={`p-6 rounded-[2rem] border ${currentScreen === 'MACRO' ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-black/5'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-current">Compute Latency</p>
                    <p className="text-2xl font-black tracking-tighter">
                       {currentScreen === 'MACRO' ? journey.macroComputationTimeMs : journey.microComputationTimeMs}ms
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                 <div className={`p-3 rounded-xl ${currentScreen === 'MACRO' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-600'}`}>
                    <Clock className="w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tighter">Mission Log</h3>
              </div>

              <div className="space-y-6">
                 {/* Render steps from both phases but filter based on current screen if needed */}
                 {journey.macroRoute.slice(0, journey.macroCurrentStepIndex + 1).map((nodeId, idx) => (
                    <div key={`log-macro-${idx}`} className="flex gap-4 animate-in slide-in-from-left duration-300">
                       <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                       <div>
                          <p className="text-sm font-black tracking-tight">Reached Hub Node {nodeId}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Macro Transit • Verified</p>
                       </div>
                    </div>
                 ))}

                 {currentScreen === 'MICRO' && journey.microOptimalRoute.slice(0, journey.microCurrentStepIndex + 1).map((stop, idx) => (
                    <div key={`log-micro-${idx}`} className="flex gap-4 animate-in slide-in-from-left duration-500">
                       <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                       <div>
                          <p className="text-sm font-black tracking-tight">{idx === 0 ? "Dispatch" : `Delivered to ${stop.name}`}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">Micro Delivery • Finalized</p>
                       </div>
                    </div>
                 ))}

                 {journey.currentPhase === 'ARRIVED_AT_HUB' && (
                    <div className="flex gap-4 py-4 animate-pulse">
                       <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                       <p className="text-xs font-black uppercase text-emerald-500 tracking-widest italic">Hub Handover In Progress...</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Quick Actions */}
           <div className="mt-auto pt-10 flex gap-4">
              <button 
                onClick={resetJourney}
                className="flex-1 py-5 rounded-[2rem] bg-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-4 h-4" /> Reset 
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
