import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Info, ChevronRight, Zap, GitBranch } from 'lucide-react';

export default function AlgorithmAuditPanel({ events = [], endToEndAudit = null }) {
  // For end-to-end journey display
  if (endToEndAudit) {
    return (
      <div className="glass p-6 rounded-3xl h-full flex flex-col gap-4 min-h-[500px] border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-slate-200">End-to-End Journey Audit</h3>
          </div>
          <div className="flex items-center gap-2 text-xs mono text-purple-500/80">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Dual-Phase Active
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 space-y-4">
          {/* Journey Phase Status */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold text-purple-300 mb-2">JOURNEY PHASE</div>
            <div className="text-sm font-bold text-purple-200">{endToEndAudit.journeyPhase}</div>
            <div className="text-xs text-slate-400 mt-2">{endToEndAudit.statusMessage}</div>
          </div>

          {/* Macro Phase Audit */}
          {endToEndAudit.macroPhase && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-blue-300">🌍 MACRO PHASE</span>
                <span className="text-xs bg-blue-900/60 px-2 py-1 rounded text-blue-200">{endToEndAudit.macroPhase.type}</span>
              </div>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-blue-400">Algorithm:</span>
                  <span className="font-bold text-blue-200">{endToEndAudit.macroPhase.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Distance Traveled:</span>
                  <span className="font-bold text-blue-200">{endToEndAudit.macroPhase.distanceTraveled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Total Distance:</span>
                  <span className="font-bold text-blue-200">{endToEndAudit.macroPhase.totalDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Execution Time:</span>
                  <span className="font-bold text-blue-200">{endToEndAudit.macroPhase.executionTimeMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Nodes Explored:</span>
                  <span className="font-bold text-blue-200">{endToEndAudit.macroPhase.nodesExplored}</span>
                </div>
              </div>
            </div>
          )}

          {/* Micro Phase Audit */}
          {endToEndAudit.microPhase && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-emerald-300">📍 MICRO PHASE</span>
                <span className="text-xs bg-emerald-900/60 px-2 py-1 rounded text-emerald-200">{endToEndAudit.microPhase.type}</span>
              </div>
              
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-emerald-400">Algorithm:</span>
                  <span className="font-bold text-emerald-200">{endToEndAudit.microPhase.algorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Distance Traveled:</span>
                  <span className="font-bold text-emerald-200">{endToEndAudit.microPhase.distanceTraveled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Total Distance:</span>
                  <span className="font-bold text-emerald-200">{endToEndAudit.microPhase.totalDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Execution Time:</span>
                  <span className="font-bold text-emerald-200">{endToEndAudit.microPhase.executionTimeMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Stops:</span>
                  <span className="font-bold text-emerald-200">{endToEndAudit.microPhase.nodesExplored}</span>
                </div>
              </div>
            </div>
          )}

          {/* Overall Progress */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold text-purple-300 mb-2">OVERALL PROGRESS</div>
            <div className="text-xl font-bold text-purple-200">{endToEndAudit.overallProgress}</div>
          </div>
        </div>
      </div>
    );
  }

  // Original event-based display for single-phase simulations
  return (
    <div className="glass p-6 rounded-3xl h-full flex flex-col gap-4 min-h-[500px] border-l-4 border-amber-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-200">Algorithm Audit Control</h3>
        </div>
        <div className="flex items-center gap-2 text-xs mono text-emerald-500/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Trace Active
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
              <Cpu className="w-12 h-12 opacity-20" />
              No computational events recorded
            </div>
          ) : (
            events.map((event, i) => (
              <motion.div
                key={event.timestamp + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-300">{event.algorithmUsed}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-[10px] mono text-cyan-400 font-bold border border-cyan-500/30">
                    {event.complexityNote}
                  </span>
                </div>
                
                <div className="text-[11px] mono text-slate-400 flex flex-col gap-1 mt-1">
                  <div className="flex gap-2">
                    <span className="text-emerald-500">[EVENT]:</span> {event.type}
                  </div>
                  <div className="flex gap-2 bg-slate-950/50 p-2 rounded-lg mt-1 group">
                    <span className="text-amber-500">[INPUT]:</span>
                    <pre className="whitespace-pre-wrap break-all text-slate-300">
                      {typeof event.inputSnapshot === 'object' ? JSON.stringify(event.inputSnapshot).slice(0, 100) + '...' : event.inputSnapshot}
                    </pre>
                  </div>
                  <div className="flex gap-2 bg-slate-950/50 p-2 rounded-lg group">
                    <span className="text-emerald-500">[RESULT]:</span>
                    <pre className="whitespace-pre-wrap break-all text-slate-300">
                      {typeof event.outputSnapshot === 'object' ? JSON.stringify(event.outputSnapshot).slice(0, 100) + '...' : event.outputSnapshot}
                    </pre>
                  </div>
                </div>
                
                <div className="text-[9px] text-slate-600 self-end">
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
