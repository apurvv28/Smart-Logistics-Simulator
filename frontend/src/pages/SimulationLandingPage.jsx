import { useNavigate } from 'react-router-dom';
import { Globe, MapPin, Route, ArrowRight, Zap } from 'lucide-react';

export default function SimulationLandingPage() {
  const navigate = useNavigate();

  const simulations = [
    {
      id: 'inter-city',
      title: 'Phase 1: Inter-City Network',
      description: 'Watch packages travel across India through intelligent routing algorithms. Compare Dijkstra, A*, Bellman-Ford, and Floyd-Warshall in real-time.',
      icon: Globe,
      features: [
        'City-to-city logistics',
        '4 graph algorithms',
        'Real-time tracking',
        'Route comparison'
      ],
      color: 'from-blue-600 to-cyan-600',
      status: '✓ Ready',
      action: () => navigate('/inter-city-simulation')
    },
    {
      id: 'intra-city',
      title: 'Phase 2: Intra-City Multi-Stop',
      description: 'Optimize delivery from a hub to multiple customer addresses within a single city using OSRM and Greedy TSP sequencing.',
      icon: MapPin,
      features: [
        'Multi-stop distribution',
        'TSP optimization',
        'Road-aligned routing',
        'Animated delivery'
      ],
      color: 'from-emerald-600 to-teal-600',
      status: '✓ Ready',
      action: () => navigate('/intra-city-simulation'),
      disabled: false
    },
    {
      id: 'end-to-end',
      title: 'Phase 3: End-to-End Journey',
      description: 'The ultimate simulation bridging Phase 1 (National) and Phase 2 (Local) into one seamless, synchronized mission lifecycle.',
      icon: Route,
      features: [
        'Macro + micro view',
        'Seamless transition',
        'Persistence bridge',
        'Complete lifecycle'
      ],
      color: 'from-purple-600 to-pink-600',
      status: '✓ Ready',
      action: () => navigate('/end-to-end-simulation'),
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-amber-200">
            <Zap size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">LogiCore Simulation Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-amber-950">
            Choose Your Logistics Journey
          </h1>
          
          <p className="text-xl text-amber-900/70 max-w-3xl mx-auto">
            Explore three distinct simulation scenarios to understand the power of graph algorithms 
            in real-world logistics optimization.
          </p>
        </div>

        {/* Simulation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {simulations.map((sim) => {
            const Icon = sim.icon;
            const isDisabled = sim.disabled;
            
            return (
              <div
                key={sim.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDisabled ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sim.color} opacity-90 group-hover:opacity-95 transition-opacity`} />
                
                {/* Card content */}
                <div className="relative p-8 space-y-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/20 group-hover:bg-white/30 transition-all">
                    <Icon size={32} className="text-white" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 flex-1">
                    <h2 className="text-2xl font-black text-white">{sim.title}</h2>
                    <p className="text-white/90 text-sm leading-relaxed">{sim.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {sim.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-white/85 flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Status & CTA */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <div className="text-xs font-semibold text-white/80">{sim.status}</div>
                    
                    <button
                      onClick={sim.action}
                      disabled={isDisabled}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isDisabled
                          ? 'bg-white/20 text-white/60 cursor-not-allowed'
                          : 'bg-white text-gray-900 hover:bg-white/95 hover:gap-3 active:scale-95'
                      }`}
                    >
                      {isDisabled ? 'Coming Soon' : 'Launch Simulation'}
                      {!isDisabled && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>

                {/* Disabled overlay */}
                {isDisabled && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-sm font-bold">Phase 3 & 4</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 rounded-xl p-8 space-y-4 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900">How It Works</h3>
            <ol className="space-y-3 text-amber-900/80 text-sm">
              <li className="flex gap-3">
                <span className="font-black text-amber-600">1.</span>
                <span>Select a simulation scenario from the cards above</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-amber-600">2.</span>
                <span>Create orders and watch graph algorithms optimize routes</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-amber-600">3.</span>
                <span>Compare algorithm performance and see real-time tracking</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-amber-600">4.</span>
                <span>Explore returns, handling, and complete order lifecycle</span>
              </li>
            </ol>
          </div>

          <div className="bg-white/80 rounded-xl p-8 space-y-4 border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900">Algorithms Included</h3>
            <div className="space-y-2 text-sm text-amber-900/80">
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 mt-0.5">Dijkstra:</span>
                <span>O(E log V) - Optimal for most routing scenarios</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 mt-0.5">A*:</span>
                <span>Heuristic-based - Fastest with geographical guidance</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 mt-0.5">Bellman-Ford:</span>
                <span>Detects anomalies - Handles negative weights</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-600 mt-0.5">Floyd-Warshall:</span>
                <span>All-pairs algorithm - Precomputed for batch optimization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-amber-900/60 border-t border-amber-200 pt-8">
          <p>LogiCore © 2026 | Advanced Data Structures & Algorithms Application</p>
        </div>
      </div>
    </div>
  );
}