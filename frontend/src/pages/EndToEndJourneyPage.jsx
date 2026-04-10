import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Activity, 
  CheckCircle, 
  Navigation, 
  Package, 
  ChevronRight,
  Settings,
  Zap,
  RotateCcw,
  Globe,
  Play,
  Pause
} from 'lucide-react';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import { useEndToEndState } from '../hooks/useEndToEndState';
import { CITY_DATA } from '../data/cityData';
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
    isDelivering,
    currentDeliveryStop,
    sessionData,
    initiateJourney,
    startAnimation,
    pauseAnimation,
    resumeAnimation,
    resetJourney
  } = useEndToEndState();

  const [macroAlgorithm, setMacroAlgorithm] = useState('Bellman-Ford');
  const [microAlgorithm, setMicroAlgorithm] = useState('A*');

  const handleLaunchJourney = async () => {
    await initiateJourney(macroAlgorithm, microAlgorithm);
  };

  const currentScreen = !journey 
    ? 'SETUP'
    : currentPhase === 'DELIVERED'
      ? 'COMPLETE'
      : 'SIMULATION';

  if (currentScreen === 'SETUP') {
    const hasSession = sessionData.phase1.originCity && sessionData.phase2.cityName;
    
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-[#FAF9F6]">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse-ring {
            0% { transform: scale(.33); }
            80%, 100% { opacity: 0; }
          }
          .animate-pulse-ring {
            animation: pulse-ring 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
          }
        `}} />

        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-200 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100/50 rotate-3">
                <Navigation className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Initialize Journey</h2>
            <p className="text-slate-500 font-bold mb-8 max-w-lg mx-auto leading-relaxed">
              Configure the end-to-end supply chain protocol. Bridge the gap between national hubs and local doorsteps.
            </p>

            <div className="mb-10 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Session Intelligence</h4>
                  <p className="text-sm font-bold text-slate-700">
                    {hasSession 
                      ? `${sessionData.phase1.originCity} → ${sessionData.phase2.cityName} | ${sessionData.phase2.deliveryAddresses?.length || 0} stops`
                      : 'No previous session found. Using defaults: Delhi → Pune.'}
                  </p>
                </div>
              </div>
              {!hasSession && <span className="text-[10px] font-black px-3 py-1 bg-amber-100 text-amber-700 rounded-lg">FALLBACK ACTIVE</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 text-left">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Inter-City Protocol</span>
                </div>
                <select 
                  value={macroAlgorithm}
                  onChange={(e) => setMacroAlgorithm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none"
                >
                  <option value="Bellman-Ford">Bellman-Ford</option>
                  <option value="Floyd-Warshall">Floyd-Warshall</option>
                </select>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-black/5 text-left">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Last-Mile Protocol</span>
                </div>
                <select 
                   value={microAlgorithm}
                   onChange={(e) => setMicroAlgorithm(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-800 shadow-sm focus:ring-4 focus:ring-amber-100 outline-none"
                >
                  <option value="Dijkstra">Dijkstra</option>
                  <option value="A*">A*</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleLaunchJourney}
              disabled={loading}
              className="group relative w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl tracking-tight shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-4 text-sm tracking-widest uppercase">
                  <Loader2 className="w-5 h-5 animate-spin" /> Initializing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  Confirm & Launch Mission <ChevronRight className="w-6 h-6" />
                </div>
              )}
            </button>
            {error && <p className="mt-4 text-red-500 font-bold text-xs">Error: {error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] text-slate-900 p-12 text-center">
        <div className="w-32 h-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center mb-10 border border-emerald-200 shadow-xl">
          <CheckCircle className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-slate-900">Mission Accomplished!</h1>
        <p className="text-slate-500 font-bold mb-16 max-w-lg mx-auto text-lg leading-relaxed">
          The package has been successfully delivered from hub to doorstep.
        </p>
        <button 
          onClick={resetJourney}
          className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl flex items-center gap-3"
        >
          <RotateCcw size={20} /> New Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      <header className="px-10 py-6 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Phase 4: Mission Journey</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Live Synchronization Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={isPaused ? resumeAnimation : pauseAnimation} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />} {isPaused ? 'Resume' : 'Pause'}
           </button>
           <button onClick={resetJourney} className="px-6 py-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all">
              <RotateCcw size={16} /> Reset
           </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        <aside className="w-full lg:w-[450px] border-r border-slate-200 bg-white flex flex-col shadow-sm z-10 p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-3 bg-indigo-50 rounded-xl"><Activity className="w-6 h-6 text-indigo-600" /></div>
            <h2 className="text-2xl font-black tracking-tighter text-slate-800">Mission Audit</h2>
          </div>
          
          <div className="flex-1 border bg-slate-50 border-slate-200 rounded-3xl overflow-hidden shadow-inner p-6 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Lifecycle</span>
                  <span className="text-xl font-black text-indigo-600">{Math.round(overallProgress || 0)}%</span>
                </div>
                <div className="flex gap-1.5 h-3">
                  <div className="flex-[7] bg-slate-100 rounded-l-full overflow-hidden border border-slate-200/50 relative">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${currentPhase === 'IN_MACRO_TRANSIT' ? 100 : (showMicroPhase ? 100 : 0)}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[7px] font-black text-slate-400/60 uppercase">MACRO</span></div>
                  </div>
                  <div className="flex-[3] bg-slate-100 rounded-r-full overflow-hidden border border-slate-200/50 relative">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${currentPhase === 'IN_MICRO_TRANSIT' ? ((overallProgress - 70) / 30 * 100) : (overallProgress >= 100 ? 100 : 0)}%` }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-[7px] font-black text-slate-400/60 uppercase">MICRO</span></div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${!showMicroPhase ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /><span className="font-black uppercase tracking-widest text-blue-800 text-[10px]">Macro Phase</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Algorithm</p><p className="text-xs font-black text-slate-800">{journey?.macroAlgorithmUsed || '...'}</p></div>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Distance</p><p className="text-xs font-black text-slate-800">{Math.round(journey?.macroDistanceTraveled || 0)} / {Math.round(journey?.macroTotalDistance || 100)} km</p></div>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${showMicroPhase ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-slate-200 opacity-60'}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /><span className="font-black uppercase tracking-widest text-emerald-800 text-[10px]">Micro Phase</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Algorithm</p><p className="text-xs font-black text-slate-800">{journey?.microAlgorithmUsed || '...'}</p></div>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase">Stops</p><p className="text-xs font-black text-slate-800">{journey?.microCurrentStepIndex || 0} / {journey?.microOptimalRoute?.length || 0}</p></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden">
                 <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Live Status Feed</p>
                 <p className="text-[11px] font-bold text-slate-200 italic truncate">{statusMessage}</p>
              </div>
          </div>
        </aside>

        <section className="flex-1 relative flex flex-col bg-slate-100 p-8">
           <div className="w-full h-full bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden relative">
              {!showMicroPhase ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F6] p-10">
                   <svg width="600" height="400" viewBox="0 0 600 400">
                      {Object.entries(MACRO_NODES).map(([id, node]) => {
                        const targets = [0,1,2,3,4].filter(t => t != id);
                        return targets.map(tid => <line key={`${id}-${tid}`} x1={node.x} y1={node.y} x2={MACRO_NODES[tid].x} y2={MACRO_NODES[tid].y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />);
                      })}
                      {journey?.macroRoute?.slice(0, journey.macroCurrentStepIndex).map((nid, i) => {
                         const nextId = journey.macroRoute[i + 1];
                         if (nextId === undefined) return null;
                         const n1 = MACRO_NODES[nid] || { x: 300, y: 200 };
                         const n2 = MACRO_NODES[nextId] || { x: 300, y: 200 };
                         return <line key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />;
                      })}
                      {Object.keys(MACRO_NODES).map(id => {
                        const cityMatch = Object.values(CITY_DATA).find(c => c.nodeId === Number(id));
                        const isCurrent = journey?.macroRoute?.[journey.macroCurrentStepIndex] === Number(id);
                        const node = MACRO_NODES[id];
                        return (
                          <g key={id}>
                            <circle cx={node.x} cy={node.y} r={isCurrent ? 12 : 6} fill={isCurrent ? "#f59e0b" : "#cbd5e1"} stroke="white" strokeWidth="2" />
                            <text x={node.x} y={node.y - 15} textAnchor="middle" fill="#64748b" className="text-[9px] font-black uppercase tracking-wider">{cityMatch?.name || node.name}</text>
                          </g>
                        );
                      })}
                   </svg>
                   <div className="absolute top-8 left-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm"><span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">National Hub Network</span></div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                   <IntraCityMapSimulator 
                      warehouse={journey?.microWarehouse || {}}
                      deliveryStops={journey?.microDeliveryAddresses || []}
                      route={journey?.microOptimalRoute || []}
                      totalDistance={journey?.microTotalDistance || 0}
                      autoSimulate={true}
                      externalIsPaused={isPaused}
                   />
                   <div className="absolute top-8 left-8 z-[1000] p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm"><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Local City View</span></div>
                </div>
              )}

              {isDelivering && (
                <div className="absolute inset-0 z-[2000] flex items-center justify-center p-8 bg-black/5 animate-in fade-in zoom-in duration-300">
                  <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl border border-emerald-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
                    <div className="relative w-24 h-24 mx-auto mb-8">
                       <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse-ring" />
                       <div className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200"><Package className="w-10 h-10 text-white" /></div>
                    </div>
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Package Delivered</h4>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{currentDeliveryStop}</h3>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Resuming in 5s</div>
                  </div>
                </div>
              )}

              {currentPhase === 'ARRIVED_AT_HUB' && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
                   <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce"><Package className="w-12 h-12" /></div>
                   <h3 className="text-4xl font-black text-slate-800 tracking-tighter">Arrived at Destination Hub</h3>
                   <p className="text-slate-500 font-bold mb-8 italic">Switching to last-mile delivery protocols...</p>
                   <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              )}
           </div>
        </section>
      </main>
    </div>
  );
}
