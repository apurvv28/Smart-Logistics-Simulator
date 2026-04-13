import React from 'react';

export default function ProgressBar({ phase, progress, timeRemaining, currentStop }) {
  const isMacro = phase === 'macro';
  const colorClass = isMacro ? 'bg-gradient-to-r from-emerald-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-purple-500';
  const label = isMacro ? 'Macro Phase Progress' : 'Micro Phase Progress';

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h4>
          <p className="text-sm font-black text-slate-800">
            {currentStop || (isMacro ? 'Inter-City Transit' : 'Local Delivery')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold text-slate-600">
            {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Phase Complete'}
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}% Complete</p>
        </div>
      </div>
      
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative">
        <div 
          className={`h-full ${colorClass} transition-all duration-300 ease-out shadow-lg`}
          style={{ width: `${progress}%` }}
        />
        {/* Animated striped overlay */}
        <div className="absolute inset-0 opacity-10 animate-[progress_20s_linear_infinite]" 
             style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)' , backgroundSize: '1rem 1rem'}} />
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { background-position: 0 0; }
          to { background-position: 1000px 0; }
        }
      `}} />
    </div>
  );
}
