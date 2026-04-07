import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { useCampaignState } from './hooks/useCampaignState';
import SimulationLandingPage from './pages/SimulationLandingPage';
import InterCitySimulationPage from './pages/InterCitySimulationPage';
import IntraCityDeliveryPage from './pages/IntraCityDeliveryPage';
import EndToEndJourneyPage from './pages/EndToEndJourneyPage';

function TopNav() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="story-nav">
      <div className="flex items-center gap-2 text-amber-950 font-black text-lg">
        <Compass size={20} /> LogiCore Simulation Engine
      </div>
      {!isLandingPage && (
        <NavLink
          to="/"
          className="story-chip hover:story-chip-active flex items-center gap-1"
        >
          <Home size={14} /> Simulations
        </NavLink>
      )}
    </nav>
  );
}

export default function App() {
  const campaign = useCampaignState();

  return (
    <BrowserRouter>
      <div className="story-shell min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-7 space-y-5">
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
  );
}