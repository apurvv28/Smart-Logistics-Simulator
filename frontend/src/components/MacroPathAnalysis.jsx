import React, { useState } from 'react';
import { ChevronDown, Map, List, Calculator } from 'lucide-react';

export default function MacroPathAnalysis({ macroPathData }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!macroPathData) return null;

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-white">Macro Path Analysis</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-6 font-mono text-[11px] leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="text-indigo-400 font-bold mb-4 flex items-center gap-2">
            <Map className="w-3 h-3" /> DIJKSTRA'S ALGORITHM TRACE
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400">Path:</span> <span className="text-white font-bold">{macroPathData.path.join(' → ')}</span>
              <br />
              <span className="text-slate-400">Dist:</span> <span className="text-emerald-400 font-bold">{macroPathData.totalDistance} km</span>
            </div>

            <div className="space-y-2">
              <div className="text-slate-500 border-b border-white/10 pb-1 mb-2">Step-by-Step Breakdown:</div>
              {macroPathData.steps.slice(0, 15).map((step, idx) => (
                <div key={idx} className="flex gap-3 text-slate-300">
                  <span className="text-slate-600 shrink-0 w-8">{step.step}:</span>
                  <span>
                    {step.type === 'INITIALIZE' && `Initial state at node ${step.unvisited[0]}`}
                    {step.type === 'PROCESS_NODE' && `Processing ${step.currentName}...`}
                    {step.type === 'UPDATE_NEIGHBOR' && (
                      <>
                        Update {step.neighborName}: <span className="text-blue-400">{step.newDistance}km</span> 
                        <span className="text-slate-600 italic ml-2">(was {step.oldDistance === Infinity ? '∞' : step.oldDistance})</span>
                      </>
                    )}
                    {step.type === 'FINAL' && <span className="text-emerald-400">Shortest path found!</span>}
                  </span>
                </div>
              ))}
              {macroPathData.steps.length > 15 && (
                <div className="text-slate-600 italic">... {macroPathData.steps.length - 15} more steps processed</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}} />
    </div>
  );
}
