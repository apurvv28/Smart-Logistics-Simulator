import React from 'react';

export default function City({ name, isCompleted, isCurrent, isCritical }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500
        ${isCompleted ? 'border-emerald-500 bg-emerald-500/20' : 
          isCurrent ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 
          'border-slate-700 bg-slate-800'}
        ${isCritical ? 'animate-pulse border-orange-500' : ''}
      `}>
        {isCompleted && (
          <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        <div className={`h-2 w-2 rounded-full ${isCurrent ? 'bg-cyan-400' : 'bg-slate-500'}`} />
      </div>
      <span className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
        {name}
      </span>
    </div>
  );
}
