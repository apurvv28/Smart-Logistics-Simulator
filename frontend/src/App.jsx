import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Compass, Home, Sparkles } from 'lucide-react';
import { useCampaignState } from './hooks/useCampaignState';
import SimulationLandingPage from './pages/SimulationLandingPage';
import InterCitySimulationPage from './pages/InterCitySimulationPage';
import IntraCityDeliveryPage from './pages/IntraCityDeliveryPage';
import EndToEndJourneyPage from './pages/EndToEndJourneyPage';
import { SimulationProvider } from './context/SimulationContext';

function TopNav() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border border-[#dfdfd7] shadow-sm mb-6">
      <div className="flex items-center gap-3 text-[#121212] font-black text-xl tracking-tight">
        <div className="w-8 h-8 bg-[#d72638] flex items-center justify-center text-white">
          <Compass size={20} />
        </div>
        Logicore Simulation Engine
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] tracking-widest uppercase px-2 py-1 border border-[#d0b26d] bg-[#fff8e7] text-[#9a7318] ml-1">
          <Sparkles size={11} />
          Professional Theme
        </span>
      </div>
      {!isLandingPage && (
        <NavLink
          to="/"
          className="story-chip hover:story-chip-active flex items-center gap-2 px-4 py-2 transition-all font-bold text-sm"
        >
          <Home size={16} /> Simulations
        </NavLink>
      )}
    </nav>
  );
}

export default function App() {
  const campaign = useCampaignState();

  return (
    <SimulationProvider>
      <BrowserRouter>
        <div className="story-shell min-h-screen">
          <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
            <TopNav />
            <Routes>
              <Route path="/" element={<SimulationLandingPage />} />
              <Route path="/inter-city-simulation" element={<InterCitySimulationPage campaign={campaign} />} />
              <Route path="/intra-city-simulation" element={<IntraCityDeliveryPage campaign={campaign} />} />
              <Route path="/end-to-end-simulation" element={<EndToEndJourneyPage campaign={campaign} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </SimulationProvider>
  );
}