import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Info, ChevronRight, Zap } from 'lucide-react';

export default function AlgorithmAuditPanel({ events = [] }) {
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
