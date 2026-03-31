import React from 'react';
const { useEffect, useState } = React;
import { Package, ChevronRight, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeapNode = ({ order, x, y, level, size, heap }) => {
  const leftChild = 2 * level + 1;
  const rightChild = 2 * level + 2;

  return (
    <g>
      {leftChild < heap.length && (
        <line x1={x} y1={y} x2={x - 100 / (level + 1)} y2={y + 80} stroke="#27272a" strokeWidth="2" />
      )}
      {rightChild < heap.length && (
        <line x1={x} y1={y} x2={x + 100 / (level + 1)} y2={y + 80} stroke="#27272a" strokeWidth="2" />
      )}
      <circle cx={x} cy={y} r="25" fill="#151518" stroke="#06b6d4" strokeWidth="2" className="pulse-node" />
      <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="10" className="mono">
        {order.slaTier === 'SAME_DAY' ? 'EX' : 'ST'}
      </text>
      
      {leftChild < heap.length && (
        <HeapNode 
          order={heap[leftChild]} 
          x={x - 100 / (level + 1)} 
          y={y + 80} 
          level={level + 1} 
          size={size} 
          heap={heap} 
        />
      )}
      {rightChild < heap.length && (
        <HeapNode 
          order={heap[rightChild]} 
          x={x + 100 / (level + 1)} 
          y={y + 80} 
          level={level + 1} 
          size={size} 
          heap={heap} 
        />
      )}
    </g>
  );
};

export default function OrderControlTower({ orders = [] }) {
  return (
    <div className="glass p-6 rounded-3xl h-full flex flex-col gap-4 overflow-hidden min-h-[500px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-200">Order Priority Queue (Min-Heap)</h3>
        </div>
        <span className="mono text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          Size: {orders.length}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {orders.length > 0 ? (
          <svg width="100%" height="400" viewBox="0 0 600 400" className="max-w-full">
            <HeapNode order={orders[0]} x={300} y={40} level={0} size={orders.length} heap={orders} />
          </svg>
        ) : (
          <div className="text-slate-500 mono text-sm flex flex-col items-center gap-3">
            <Package className="w-12 h-12 opacity-20" />
            Waiting for orders...
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Heap Array</h4>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {orders.map((o, i) => (
            <motion.div 
              layout
              key={o.id}
              className={`flex-shrink-0 w-24 p-2 rounded-lg border flex flex-col gap-1 items-center
                ${o.slaTier === 'SAME_DAY' ? 'border-rose-500/30 bg-rose-500/10' : 'border-slate-700 bg-slate-800/50'}`}
            >
              <div className="text-[10px] mono text-slate-400">Idx: {i}</div>
              <div className="text-xs font-bold truncate w-full text-center">{o.id?.slice(-4)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
