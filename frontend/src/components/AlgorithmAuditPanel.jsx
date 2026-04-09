import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Info, ChevronRight, Zap, GitBranch, Globe, MapPin, Activity } from 'lucide-react';

export default function AlgorithmAuditPanel({ events = [], endToEndAudit = null }) {
  // DUAL-PHASE UI for End-to-End Simulation
  if (endToEndAudit) {
    const { macro, micro, overallProgress, currentPhase, statusMessage } = endToEndAudit;

    // Define phase badge colors
    const phaseColors = {
      'INITIATED': 'bg-slate-100 text-slate-600 border-slate-200',
      'IN_MACRO_TRANSIT': 'bg-blue-100 text-blue-700 border-blue-200',
      'ARRIVED_AT_HUB': 'bg-amber-100 text-amber-700 border-amber-200',
      'IN_MICRO_TRANSIT': 'bg-green-100 text-green-700 border-green-200',
      'DELIVERED': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    const currentPhaseColor = phaseColors[currentPhase] || phaseColors['INITIATED'];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
        {/* HEADER */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">End-to-End Audit</h3>
           </div>
           <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
              Active Sync
           </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          
          {/* SECTION 1: JOURNEY PHASE */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Phase</span>
             <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${currentPhaseColor}`}>
                {currentPhase.replace(/_/g, ' ')}
             </div>
             <p className="text-xs font-medium text-slate-500 mt-3 italic">{statusMessage || 'Awaiting status...'}</p>
          </div>

          {/* SECTION 2: MACRO PHASE */}
          {macro && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Inter-City Transit</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Algorithm</span>
                    <span className="text-sm font-black text-slate-800">{macro.algorithm}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Distance</span>
                    <span className="text-sm font-black text-slate-800">
                       {macro.macroDistanceTraveled?.toFixed(1) || '0.0'} / {macro.macroTotalDistance?.toFixed(0)} km
                    </span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Nodes Explored</span>
                    <span className="text-sm font-black text-slate-800">{macro.nodesExplored}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Computation Time</span>
                    <span className="text-sm font-black text-slate-800">{macro.computationMs} ms</span>
                 </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MICRO PHASE */}
          {micro && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Last-Mile Delivery</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Algorithm</span>
                    <span className="text-sm font-black text-slate-800">{micro.algorithm}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Stops Completed</span>
                    <span className="text-sm font-black text-slate-800">{micro.stopsCompleted} / {micro.totalStops - 1}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Distance</span>
                    <span className="text-sm font-black text-slate-800">
                       {micro.microDistanceTraveled?.toFixed(2) || '0.00'} / {micro.microTotalDistance?.toFixed(2)} km
                    </span>
                 </div>
                 <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Computation Time</span>
                    <span className="text-sm font-black text-slate-800">{micro.computationMs} ms</span>
                 </div>
              </div>
            </div>
          )}

          {/* SECTION 4: OVERALL PROGRESS */}
          <div className="pt-4 border-t border-slate-100">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lifecycle Progress</span>
                <span className="text-sm font-black text-indigo-600">{Math.round(overallProgress)}%</span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${overallProgress}%` }}
                />
             </div>
          </div>
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
