import React, { useState } from 'react';
import { ChevronDown, Truck, Search, Zap } from 'lucide-react';

export default function MicroPathAnalysis({ microPathData }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!microPathData) return null;

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-white">Micro Path Analysis</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="p-6 font-mono text-[11px] leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar text-slate-300">
          <div className="text-amber-400 font-bold mb-4 flex items-center gap-2">
            <Truck className="w-3 h-3" /> LAST-MILE OPTIMIZATION (Greedy TSP)
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
              <span className="text-slate-500">Total Route:</span> <span className="text-emerald-400 font-bold">{microPathData.totalDistance} km</span>
              <br />
              <span className="text-slate-500">Stops:</span> <span className="text-white font-bold">{microPathData.path.length - 2} addresses</span>
            </div>

            <div className="space-y-3">
              <div className="text-slate-500 border-b border-white/10 pb-1">Optimization Steps:</div>
              {microPathData.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-amber-600 shrink-0">[{idx}]</span>
                  <span>{step.description}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
               <div className="text-slate-500 mb-2">Algorithm logic:</div>
               <div className="text-[10px] italic text-slate-400">
                 1. Start at warehouse hub.
                 <br />2. Compute Haversine distance to all delivery points.
                 <br />3. Move to nearest neighbor.
                 <br />4. Repeat until all clusters serviced.
                 <br />5. Calculate return loop vector.
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
