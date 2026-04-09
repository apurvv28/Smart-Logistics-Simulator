import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Info, ChevronRight, Zap, GitBranch, Globe, MapPin, Activity } from 'lucide-react';

export default function AlgorithmAuditPanel({ events = [], endToEndAudit = null }) {
  // DUAL-PHASE UI for End-to-End Simulation
  if (endToEndAudit) {
    const { macro, micro, overallProgress, currentPhase, statusMessage } = endToEndAudit;

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">End-to-End Audit</h3>
           </div>
           <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">
              Dual-Phase Active
           </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {/* OVERALL STATUS */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Overall Progress</span>
                <span className="text-sm font-black text-indigo-400">{Math.round(overallProgress)}%</span>
             </div>
             <p className="text-[11px] font-bold text-gray-400 mb-2">Phase: <span className="text-white">{currentPhase}</span></p>
             <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${overallProgress}%` }}
                />
             </div>
          </div>

          {/* MACRO SECTION */}
          {macro && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest">🌍 Macro Phase</span>
              </div>
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-400/60 uppercase">Algorithm</span>
                    <span className="text-xs font-black text-blue-300">{macro.algorithm}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-400/60 uppercase">Cities Traversed</span>
                    <span className="text-xs font-black text-white">{macro.stepIndex} / {macro.totalSteps}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-400/60 uppercase">Distance</span>
                    <span className="text-xs font-black text-white">
                       {macro.macroDistanceTraveled?.toFixed(1) || '0.0'} / {macro.macroTotalDistance?.toFixed(0)} km
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-400/60 uppercase">Computation</span>
                    <span className="text-xs font-black text-white">{macro.computationMs}ms</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-400/60 uppercase">Nodes Explored</span>
                    <span className="text-xs font-black text-white">{macro.nodesExplored}</span>
                 </div>
              </div>
            </div>
          )}

          {/* MICRO SECTION */}
          {micro && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">📍 Micro Phase</span>
              </div>
              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400/60 uppercase">Algorithm</span>
                    <span className="text-xs font-black text-emerald-300">{micro.algorithm}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400/60 uppercase">Stops Delivered</span>
                    <span className="text-xs font-black text-white">{micro.stopsCompleted} / {micro.totalStops - 1}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400/60 uppercase">Distance</span>
                    <span className="text-xs font-black text-white">
                       {micro.microDistanceTraveled?.toFixed(2) || '0.00'} / {micro.microTotalDistance?.toFixed(2)} km
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-400/60 uppercase">Computation</span>
                    <span className="text-xs font-black text-white">{micro.computationMs}ms</span>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 text-[10px] font-bold text-gray-500 italic">
           * Real-time audit synchronization active
        </div>
      </div>
    );
  }

  // SINGLE-PHASE SIMULATION UI (BACKWARD COMPATIBILITY)
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]">
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Algorithm Audit</h3>
         </div>
         <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500/80 uppercase">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Trace
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
              <Cpu className="w-12 h-12 opacity-10" />
              <p className="text-xs font-black uppercase tracking-widest opacity-20">No events recorded</p>
            </div>
          ) : (
            events.map((event, i) => (
              <motion.div
                key={event.timestamp + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-gray-900/80 border border-gray-700 flex flex-col gap-2 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-black text-slate-300 uppercase">{event.algorithmUsed}</span>
                  </div>
                  <span className="text-[9px] font-black bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                    {event.complexityNote}
                  </span>
                </div>
                
                <div className="text-[10px] font-bold text-gray-400 space-y-1">
                  <div className="flex gap-2">
                    <span className="text-emerald-500 uppercase font-black">[EVENT]:</span> {event.type}
                  </div>
                </div>
                
                <div className="text-[9px] text-gray-600 self-end">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            )).reverse()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
