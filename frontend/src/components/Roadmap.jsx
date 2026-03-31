import React, { useState, useEffect } from 'react';
import City from './City';
import Parcel from './Parcel';
import DeliveryBoy from './DeliveryBoy';
import DeliveryVan from './DeliveryVan';
import LogisticsVan from './LogisticsVan';

export default function Roadmap({ hops, itemName, totalTime }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (hops.length > 0) {
      setIsAnimating(true);
      setCurrentStep(0);
      
      let step = 0;
      const interval = setInterval(() => {
        if (step < hops.length - 1) {
          step += 1;
          setCurrentStep(step);
        } else {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 1500); // 1.5 seconds per hop for visualization

      return () => clearInterval(interval);
    }
  }, [hops]);

  if (!hops || hops.length === 0) return null;

  const getVehicle = (index) => {
    const total = hops.length;
    if (index === 0 || index === total - 1) return <DeliveryBoy className="w-8 h-8 text-cyan-400" />;
    if (index === 1 || index === total - 2) return <DeliveryVan className="w-10 h-6 text-emerald-400" />;
    return <LogisticsVan className="w-12 h-8 text-orange-400" />;
  };

  return (
    <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/40 p-8 shadow-2xl">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-black text-white">Live Tracking: {itemName || 'Parcel'}</h3>
          <p className="text-sm text-slate-400">Total estimated transit: {totalTime} mins</p>
        </div>
        <div className="flex gap-2">
           <span className={`h-3 w-3 rounded-full ${isAnimating ? 'animate-pulse bg-emerald-500' : 'bg-slate-600'}`} />
           <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
             {isAnimating ? 'In Transit' : 'Arrived'}
           </span>
        </div>
      </div>

      <div className="relative">
        {/* The Road Path */}
        <div className="absolute left-0 top-5 h-1 w-full -translate-y-1/2 bg-slate-800" />
        <div 
          className="absolute left-0 top-5 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000" 
          style={{ width: `${(currentStep / (hops.length - 1)) * 100}%` }}
        />

        {/* Cities and Vehicles */}
        <div className="relative flex justify-between">
          {hops.map((hop, idx) => (
            <div key={`${hop.node}-${idx}`} className="relative z-10">
              <City 
                name={hop.label} 
                isCompleted={idx < currentStep} 
                isCurrent={idx === currentStep}
                isCritical={hop.isCriticalLeg}
              />
              
              {/* Vehicle / Parcel */}
              {idx === currentStep && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 transition-all duration-500">
                  <div className="flex flex-col items-center gap-1">
                    {getVehicle(idx)}
                    <Parcel className="h-6 w-6" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">Status Update</p>
            <p className="text-xs text-slate-400">
              Currently at <span className="text-white font-medium">{hops[currentStep].label}</span>. 
              Segment: {hops[currentStep].stage}. 
              {hops[currentStep].isCriticalLeg && " This is a critical network segment."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
