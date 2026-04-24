import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Route, ArrowRight, Zap, Layers3, BrainCircuit, Building2, Cpu } from 'lucide-react';

const PHASES = [
  {
    id: 'phase-1',
    title: 'Phase 1: Inter-City Network',
    icon: Globe,
    route: '/inter-city-simulation',
    short: 'Nationwide route optimization between hubs',
    dsa: 'Dijkstra, A*, Bellman-Ford, Floyd-Warshall',
    realtime: 'Continuously recomputes shortest/least-cost path using live order and node status.',
    simulationUse: 'We compare algorithm performance per order, visualize explored nodes, and trace optimal route.',
    industry: 'Amazon line-haul planning and FedEx network balancing use graph shortest path + heuristics.',
    stack: 'Java Spring Boot, graph services, React telemetry panel, WebSocket event stream.'
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Intra-City Last-Mile',
    icon: MapPin,
    route: '/intra-city-simulation',
    short: 'Warehouse to multi-stop local delivery',
    dsa: 'Nearest-neighbor TSP + Dijkstra over road network',
    realtime: 'Reorders stop sequence and computes path distance against road graph constraints.',
    simulationUse: 'We optimize stop order, fetch realistic roads, and animate delivery progression on map.',
    industry: 'Swiggy, Zomato, and Dunzo use route sequencing + road graph shortest path for dispatch.',
    stack: 'Overpass API + OSRM + Spring services + React-Leaflet animation engine.'
  },
  {
    id: 'phase-3',
    title: 'Phase 3: End-to-End',
    icon: Route,
    route: '/end-to-end-simulation',
    short: 'Macro and micro routing in one pipeline',
    dsa: 'Hybrid orchestration of Phase 1 and Phase 2 algorithms',
    realtime: 'Runs inter-city first, then hands off to nearest local warehouse for final delivery.',
    simulationUse: 'We chain both phases with shared payload, milestone transitions, and one mission state.',
    industry: 'Flipkart and DHL style backbone-to-doorstep orchestration with unified visibility.',
    stack: 'State orchestration hooks, phased APIs, React mission UI, backend routing microservices.'
  }
];

export default function SimulationLandingPage() {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState(PHASES[0]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] py-10 px-4 md:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="grid gap-6 border border-[#dfdfd7] bg-white p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 border border-[#f1c2c8] bg-[#fff2f2] px-3 py-2 text-[#d72638]">
              <Zap size={14} />
              <span className="text-xs font-black uppercase tracking-widest">Logicore Control Tower</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-[#121212]">
              Build Smarter Logistics Decisions In Real Time
            </h1>
            <p className="max-w-2xl text-lg text-[#4f4f4f]">
              A professional simulation suite for route optimization, last-mile orchestration, and full mission lifecycle insights.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-[#5d5d5d]">
              <span className="border border-[#dfdfd7] bg-[#faf8f3] px-3 py-2">Graph Algorithms</span>
              <span className="border border-[#dfdfd7] bg-[#faf8f3] px-3 py-2">Satellite Operations View</span>
              <span className="border border-[#dfdfd7] bg-[#faf8f3] px-3 py-2">Live Phase Transitions</span>
            </div>
          </div>

          <motion.div
            whileHover={{ rotateX: 6, rotateY: -8, y: -4 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className="border border-[#121212] bg-[#121212] p-6 text-white shadow-xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c8a44d]">3D Operations Preview</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="border border-[#353535] bg-[#1c1c1c] p-3">
                <Layers3 className="mb-2 text-[#c8a44d]" size={18} />
                <p className="text-xs font-bold">Routing Layers</p>
              </div>
              <div className="border border-[#353535] bg-[#1c1c1c] p-3">
                <BrainCircuit className="mb-2 text-[#c8a44d]" size={18} />
                <p className="text-xs font-bold">Algorithm Brain</p>
              </div>
              <div className="border border-[#353535] bg-[#1c1c1c] p-3">
                <Building2 className="mb-2 text-[#c8a44d]" size={18} />
                <p className="text-xs font-bold">Hub Network</p>
              </div>
              <div className="border border-[#353535] bg-[#1c1c1c] p-3">
                <Cpu className="mb-2 text-[#c8a44d]" size={18} />
                <p className="text-xs font-bold">Telemetry Core</p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border border-[#dfdfd7] bg-white p-6">
          <h2 className="text-2xl font-black text-[#121212]">Choose A Phase</h2>
          <p className="mt-1 text-sm text-[#4f4f4f]">Select any phase to inspect technical depth before launching simulation.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {PHASES.map((phase) => {
              const Icon = phase.icon;
              const isActive = selectedPhase.id === phase.id;
              return (
                <motion.button
                  key={phase.id}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedPhase(phase)}
                  className={`border p-4 text-left transition-colors ${isActive ? 'border-[#d72638] bg-[#fff2f2]' : 'border-[#dfdfd7] bg-white hover:border-[#c8a44d]'}`}
                >
                  <Icon size={20} className={isActive ? 'text-[#d72638]' : 'text-[#121212]'} />
                  <h3 className="mt-3 text-base font-black text-[#121212]">{phase.title}</h3>
                  <p className="mt-1 text-sm text-[#4f4f4f]">{phase.short}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        <section className="border border-[#dfdfd7] bg-white p-6">
          <div className="flex items-center justify-between gap-4 border-b border-[#ecece7] pb-4">
            <div>
              <h3 className="text-2xl font-black text-[#121212]">{selectedPhase.title}</h3>
              <p className="text-sm text-[#5a5a5a]">Technical profile and real-world mapping</p>
            </div>
            <button
              onClick={() => navigate(selectedPhase.route)}
              className="inline-flex items-center gap-2 bg-[#d72638] px-4 py-2 text-sm font-black uppercase tracking-wider text-white hover:bg-[#b71f2f]"
            >
              Launch Phase <ArrowRight size={16} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="border border-[#dfdfd7] bg-[#faf8f3] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a7318]">Advanced DSA Used</p>
              <p className="mt-2 text-sm font-semibold text-[#121212]">{selectedPhase.dsa}</p>
            </div>
            <div className="border border-[#dfdfd7] bg-[#faf8f3] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a7318]">Real-Time System Implementation</p>
              <p className="mt-2 text-sm text-[#222]">{selectedPhase.realtime}</p>
            </div>
            <div className="border border-[#dfdfd7] bg-[#faf8f3] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a7318]">How Logicore Uses It</p>
              <p className="mt-2 text-sm text-[#222]">{selectedPhase.simulationUse}</p>
            </div>
            <div className="border border-[#dfdfd7] bg-[#faf8f3] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9a7318]">Industry Reference</p>
              <p className="mt-2 text-sm text-[#222]">{selectedPhase.industry}</p>
            </div>
          </div>

          <div className="mt-4 border border-[#dfdfd7] bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#d72638]">Technical Stack</p>
            <p className="mt-2 text-sm text-[#222]">{selectedPhase.stack}</p>
          </div>
        </section>
      </div>
    </div>
  );
}