import { Zap, AlertTriangle, TrendingUp, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScenarioSimulator({ onTrigger, loading }) {
  const scenarios = [
    {
      id: 'FLASH_SALE',
      title: 'Flash Sale Pulse',
      desc: 'Simulate a massive surge in Same-Day orders. Tests Heap rebalancing and priority sorting.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5'
    },
    {
      id: 'ROAD_BLOCKAGE',
      title: 'Highway Closure',
      desc: 'Inject real-time traffic spikes on major routes. Triggers A* dynamic rerouting.',
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5'
    },
    {
      id: 'WAREHOUSE_STOCKOUT',
      title: 'Stock Criticality',
      desc: 'Drain inventory SKUs to trigger sliding-window reorder point detection.',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5'
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-slate-200">Scenario Simulation Lab</h3>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrigger(s.id)}
            disabled={loading}
            className={`p-5 rounded-3xl border transition-all text-left flex flex-col gap-3 group relative overflow-hidden ${s.color}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/50 md:group-hover:scale-110 transition">
                {s.icon}
              </div>
              <h4 className="font-bold text-slate-100">{s.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.03] group-hover:opacity-10 transition">
              {s.icon}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
