import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Route, ArrowRight, Plus, Rocket, Zap } from 'lucide-react';

// Truck icon source - swap this path as needed
const TRUCK_ICON_SRC = '/src/assets/truck.png';

// Logistics company logos - add your logo files to assets folder
const COMPANY_LOGOS = [
  { name: 'Swiggy', src: '/src/assets/logos/swiggy.png' },
  { name: 'Zomato', src: '/src/assets/logos/zomato.png' },
  { name: 'Zepto', src: '/src/assets/logos/zepto.png' },
  { name: 'Dunzo', src: '/src/assets/logos/dunzo.png' },
  { name: 'Delhivery', src: '/src/assets/logos/delhivery.png' },
  { name: 'BlueDart', src: '/src/assets/logos/bluedart.png' },
  { name: 'Porter', src: '/src/assets/logos/porter.png' },
  { name: 'Shadowfax', src: '/src/assets/logos/shadowfax.png' },
  { name: 'Ecom Express', src: '/src/assets/logos/ecom-express.png' },
];

// Delivery partner animation GIF source - swap this path as needed
const DELIVERY_GIF_SRC = '/src/assets/del1.png';

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
    stack: ['Java Spring Boot', 'Graph Services', 'React Telemetry', 'WebSocket Events']
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
    stack: ['Overpass API', 'OSRM', 'Spring Services', 'React-Leaflet']
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
    stack: ['State Orchestration', 'Phased APIs', 'React Mission UI', 'Routing Microservices']
  }
];

// Animation variants
const navVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const heroLeftVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const heroChildVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const heroRightVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: 'easeOut', delay: 0.2 } }
};

const phaseCardVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.6 + i * 0.15 }
  })
};

const infoCardVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, delay: i * 0.1 }
  })
};

export default function SimulationLandingPage() {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState(PHASES[0]);

  const handleQuickLaunch = (phaseId) => {
    const phase = PHASES.find(p => p.id === phaseId);
    if (phase) {
      navigate(phase.route);
    }
  };

  return (
    <div className="min-h-screen bg-logi-off-white">
      {/* NAVBAR */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 z-50 bg-logi-navy px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-logi-red flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight">LOGICORE</span>
            <span className="text-logi-gold font-mono text-[10px] uppercase tracking-wider">SIMULATION ENGINE</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => document.getElementById('phases-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-logi-gold text-[11px] uppercase tracking-wider font-bold hover:text-white transition-colors duration-200"
          >
            Mission Phases
          </button>
        </div>

        <button 
          onClick={() => document.getElementById('phases-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="border-2 border-logi-red text-logi-red px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-logi-red hover:text-white transition-colors duration-200"
        >
          Launch Control
        </button>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="relative bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-16 grid lg:grid-cols-[58fr_42fr] gap-8 items-stretch">
          {/* Left 58% */}
          <motion.div
            variants={heroLeftVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 flex flex-col justify-center"
          >
            <motion.div variants={heroChildVariants} className="inline-flex items-center gap-2 border border-logi-red rounded px-3 py-1.5 bg-white w-fit">
              <Plus size={14} className="text-logi-red" />
              <span className="text-xs font-bold uppercase tracking-widest text-logi-red">LOGICORE CONTROL TOWER</span>
            </motion.div>
            
            <motion.h1 variants={heroChildVariants} className="text-[56px] leading-[1.1] font-bold tracking-tight text-logi-navy">
              Build Smarter Logistics Decisions In Real Time
            </motion.h1>
            
            <motion.p variants={heroChildVariants} className="text-base text-gray-600 max-w-xl">
              A professional simulation suite for route optimization, last-mile orchestration, and full mission lifecycle insights.
            </motion.p>
            
            <motion.div variants={heroChildVariants} className="flex flex-wrap gap-3">
              <TagButton>GRAPH ALGORITHMS</TagButton>
              <TagButton>SATELLITE OPERATIONS VIEW</TagButton>
              <TagButton>LIVE PHASE TRANSITIONS</TagButton>
            </motion.div>

            {/* QUICK LAUNCH PANEL */}
            <motion.div 
              variants={heroChildVariants}
              className="mt-8 border-2 border-logi-gold rounded-md bg-gradient-to-br from-logi-navy to-logi-charcoal p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="text-logi-gold" size={20} />
                <p className="text-white font-bold text-sm uppercase tracking-wider">Quick Launch Pad</p>
              </div>
              <p className="text-gray-300 text-xs mb-4">Select a mission phase to begin simulation</p>
              
              <div className="grid grid-cols-3 gap-2">
                <QuickLaunchButton
                  icon={Globe}
                  label="Inter-City"
                  onClick={() => handleQuickLaunch('phase-1')}
                />
                <QuickLaunchButton
                  icon={MapPin}
                  label="Last-Mile"
                  onClick={() => handleQuickLaunch('phase-2')}
                />
                <QuickLaunchButton
                  icon={Route}
                  label="End-to-End"
                  onClick={() => handleQuickLaunch('phase-3')}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-logi-charcoal flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-logi-gold rounded-full animate-pulse" />
                  <span className="text-logi-gold text-xs font-mono">SYSTEMS READY</span>
                </div>
                <button
                  onClick={() => document.getElementById('phases-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white text-xs hover:text-logi-gold transition-colors flex items-center gap-1"
                >
                  View Details <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right 42% - Floating Logos */}
          <motion.div
            variants={heroRightVariants}
            initial="hidden"
            animate="visible"
            className="relative flex items-center justify-center min-h-[600px]"
          >
            <FloatingLogosDisplay />
          </motion.div>
        </div>

        {/* DELIVERY PARTNER ANIMATION */}
        <div className="absolute bottom-0 left-0 w-full h-[180px] overflow-hidden pointer-events-none z-10">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-logi-red" />
          <img
            id="delivery-partner"
            src={DELIVERY_GIF_SRC}
            alt=""
            className="absolute bottom-0 left-0 h-[180px] md:h-[180px] w-auto animate-delivery-run"
            style={{ animationDelay: '1.5s' }}
          />
        </div>
      </section>

      <div id="phases-section" className="mx-auto max-w-7xl px-6 py-12 space-y-12">
        {/* PHASE SELECTOR */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-logi-gold" size={20} />
            <p className="text-logi-gold font-mono text-[11px] uppercase tracking-[0.2em]">MISSION PHASE SELECT</p>
          </div>
          <h2 className="text-3xl font-bold text-logi-navy mb-2">Choose Your Mission Phase</h2>
          <p className="text-gray-600 mb-6">Select any phase to inspect technical depth before launching simulation.</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {PHASES.map((phase, i) => {
              const Icon = phase.icon;
              const isActive = selectedPhase.id === phase.id;
              return (
                <motion.button
                  key={phase.id}
                  custom={i}
                  variants={phaseCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedPhase(phase)}
                  className={`rounded-md border bg-white p-5 text-left transition-all duration-200 ${
                    isActive 
                      ? 'border-l-[3px] border-l-logi-red border-t border-r border-b border-logi-card-border bg-[#FEF5F5]' 
                      : 'border border-logi-card-border hover:border-logi-red'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'text-logi-red' : 'text-gray-400'} />
                  <h3 className="mt-3 text-base font-semibold text-logi-navy">{phase.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{phase.short}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* PHASE DETAIL SECTION */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[28px] font-bold text-logi-navy">{selectedPhase.title}</h3>
            </div>
            <button
              onClick={() => navigate(selectedPhase.route)}
              className="inline-flex items-center gap-2 bg-logi-red px-5 py-2.5 rounded text-sm font-bold uppercase tracking-wider text-white hover:bg-logi-red-deep transition-all duration-200 hover:scale-105"
            >
              Launch Phase <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <InfoCard
              index={0}
              label="Advanced DSA Used"
              content={selectedPhase.dsa}
              bold
            />
            <InfoCard
              index={1}
              label="Real-Time System Implementation"
              content={selectedPhase.realtime}
            />
            <InfoCard
              index={2}
              label="How Logicore Uses It"
              content={selectedPhase.simulationUse}
            />
            <InfoCard
              index={3}
              label="Industry Reference"
              content={selectedPhase.industry}
            />
          </div>

          <motion.div
            custom={4}
            variants={infoCardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-md border border-logi-card-border bg-white p-5"
          >
            <p className="text-logi-gold font-mono text-[11px] uppercase tracking-[0.2em] mb-3">Technical Stack</p>
            <div className="flex flex-wrap gap-2">
              {selectedPhase.stack.map((tech, i) => (
                <span
                  key={i}
                  className="border border-logi-red rounded text-logi-red px-3 py-1 text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.section>
      </div>

      <style jsx>{`
        @keyframes deliveryRun {
          0%   { transform: translateX(-160px); opacity: 1; }
          15%  { transform: translateX(-160px); opacity: 1; }
          55%  { transform: translateX(40vw); opacity: 1; }
          85%  { transform: translateX(100vw); opacity: 1; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        
        .animate-delivery-run {
          animation: deliveryRun 4s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          #delivery-partner {
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
}

// Helper Components
function TagButton({ children }) {
  return (
    <button className="border border-logi-red rounded text-logi-red px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-logi-red hover:text-white transition-colors duration-200">
      {children}
    </button>
  );
}

function QuickLaunchButton({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-logi-charcoal hover:bg-logi-red border border-logi-gold/30 hover:border-logi-gold rounded p-3 flex flex-col items-center gap-2 transition-all duration-200 group"
    >
      <Icon className="text-logi-gold group-hover:text-white transition-colors" size={20} />
      <span className="text-white text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </motion.button>
  );
}

function FloatingLogosDisplay() {
  // Circular positions for logos around the center (in degrees)
  const logoCount = COMPANY_LOGOS.length;
  const radius = 180; // Distance from center - increased from 140

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Truck Icon */}
      <div className="w-40 h-40 flex items-center justify-center z-20">
        <img 
          src={TRUCK_ICON_SRC} 
          alt="Logistics" 
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if truck icon doesn't load - show SVG truck
            e.target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = `
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" class="text-logi-gold">
                <path d="M1 6v13h4m14-13v13h4M1 6l4-4h9l4 4M1 19h4m14 0h4M5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            `;
            e.target.parentElement.appendChild(fallback);
          }}
        />
      </div>

      {/* Revolving Company Logos */}
      {COMPANY_LOGOS.map((company, index) => {
        const angle = (index / logoCount) * 360;
        
        return (
          <motion.div
            key={company.name}
            className="absolute"
            style={{
              width: '85px',
              height: '85px',
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: [
                Math.cos((angle * Math.PI) / 180) * radius,
                Math.cos(((angle + 360) * Math.PI) / 180) * radius,
              ],
              y: [
                Math.sin((angle * Math.PI) / 180) * radius,
                Math.sin(((angle + 360) * Math.PI) / 180) * radius,
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: (index * 20) / logoCount,
            }}
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [-angle, -(angle + 360)],
              }}
              transition={{
                y: {
                  duration: 2 + (index * 0.2),
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: (index * 20) / logoCount,
                }
              }}
              whileHover={{ scale: 1.3, zIndex: 50 }}
              className="w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center p-3 cursor-pointer"
            >
              <img 
                src={company.src} 
                alt={company.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to company name if logo doesn't load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-[10px] font-bold text-gray-700 text-center">${company.name}</span>`;
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function PreviewCell({ icon: Icon, label }) {
  return (
    <div className="bg-logi-navy p-4 hover:bg-logi-charcoal transition-colors duration-150 cursor-pointer">
      <Icon className="text-logi-gold mb-2" size={20} />
      <p className="text-white text-xs font-medium">{label}</p>
    </div>
  );
}

function InfoCard({ index, label, content, bold = false }) {
  return (
    <motion.div
      custom={index}
      variants={infoCardVariants}
      initial="hidden"
      animate="visible"
      className="rounded-md border border-logi-card-border bg-white p-5"
    >
      <p className="text-logi-gold font-mono text-[11px] uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-sm text-gray-800 ${bold ? 'font-semibold' : ''}`}>{content}</p>
    </motion.div>
  );
}
