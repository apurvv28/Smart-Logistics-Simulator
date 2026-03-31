import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Layers, Box, Info } from 'lucide-react';

export default function FulfillmentCenter({ inventory = [], sortedOrders = [] }) {
  return (
    <div className="glass p-6 rounded-3xl h-full flex flex-col gap-6 min-h-[600px] border-l-4 border-emerald-500">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-bold text-slate-200">Fulfillment Center Simulator</h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-300">Inventory Hash Map (Chaining)</h4>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {inventory.map((bucket, i) => (
            <div 
              key={i}
              className={`h-12 rounded-lg border flex flex-col items-center justify-center transition-all group relative
                ${bucket.items.length > 0 ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="text-[10px] mono text-slate-500">{i}</div>
              {bucket.items.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
              )}
              
              {/* Tooltip for bucket items */}
              {bucket.items.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col gap-1 p-2 glass rounded-lg z-20 min-w-[120px] pointer-events-none">
                  <div className="text-[10px] mono text-emerald-400 border-b border-slate-700 pb-1 mb-1">Chain Link</div>
                  {bucket.items.map((item, idx) => (
                    <div key={idx} className="text-[9px] mono text-slate-200">{item}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-bold text-slate-300">Package Sorting (Merge Sort)</h4>
        </div>
        <div className="relative h-24 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center p-4">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-30" />
          <div className="flex gap-4">
            <AnimatePresence>
              {sortedOrders.map((o, idx) => (
                <motion.div
                  key={o.id + idx}
                  layout
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center gap-1 flex-shrink-0"
                >
                  <Box className="w-6 h-6 text-slate-500" />
                  <div className="text-[8px] mono text-slate-400">Idx: {idx}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        </div>
      </div>

      <div className="mt-auto glass p-3 rounded-2xl flex items-start gap-3 border border-slate-800">
        <Info className="w-5 h-5 text-slate-500 flex-shrink-0" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The inventory uses a custom chained hash map for O(1) average lookup. Package routing is optimized using Merge Sort to handle multiple SKU shipments by weight.
        </p>
      </div>
    </div>
  );
}
