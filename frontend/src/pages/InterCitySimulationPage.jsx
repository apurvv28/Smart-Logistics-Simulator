import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MissionControlPage from './MissionControlPage';
import MapAndChroniclePage from './MapAndChroniclePage';

export default function InterCitySimulationPage({ campaign }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 bg-[#f7f7f5]">
      {/* Header */}
      <div className="flex items-center justify-between border border-[#dfdfd7] bg-white px-6 py-5">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#d72638] hover:text-[#b71f2f] font-semibold text-sm mb-3"
          >
            <ArrowLeft size={16} /> Back to Simulations
          </button>
          <h1 className="text-4xl font-black text-[#121212]">Inter-City Network Simulation</h1>
          <p className="text-[#4f4f4f]">Option 1: Watch packages traverse India using intelligent routing algorithms</p>
        </div>
      </div>

      {/* Mission Control + Map View */}
      <div className="space-y-6">
        {/* Mission Control Section - now uses hooks internally */}
        <MissionControlPage />

        {/* Map and Chronicle Section */}
        <div className="border-t-2 border-[#dfdfd7] pt-6">
          <MapAndChroniclePage campaign={campaign} />
        </div>
      </div>
    </div>
  );
}