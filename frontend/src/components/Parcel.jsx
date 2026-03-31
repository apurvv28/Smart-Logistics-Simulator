import React from 'react';

export default function Parcel({ className = "w-8 h-8", isDelivered }) {
  return (
    <div className={`
      relative rounded bg-orange-700/80 p-1 shadow-lg shadow-orange-900/40
      ${className} ${isDelivered ? 'opacity-0 scale-50' : 'animate-bounce-slow'}
    `}>
      <svg className="h-full w-full text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 7L12 11L3 7L12 3L21 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 7V17L12 21L3 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 21V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {/* Tape line */}
      <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-orange-200/40" />
    </div>
  );
}
