import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import MissionControlPage from './MissionControlPage';

export default function InterCitySimulationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-logi-off-white">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-logi-card-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-logi-red hover:text-logi-red-deep font-semibold text-sm mb-4 transition-colors duration-200"
          >
            <ArrowLeft size={16} /> Back to Simulations
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-logi-red rounded flex items-center justify-center">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-logi-navy">Inter-City Network Simulation</h1>
              <p className="text-gray-600 mt-1">Watch packages traverse India using intelligent routing algorithms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Mission Control Section */}
        <MissionControlPage />
      </div>
    </div>
  );
}
