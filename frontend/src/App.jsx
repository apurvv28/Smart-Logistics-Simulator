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
    <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm mb-6">
      <div className="flex items-center gap-3 text-slate-900 font-black text-xl tracking-tighter">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <Compass size={20} />
        </div>
        LogiCore Simulation Engine
      </div>
      {!isLandingPage && (
        <NavLink
          to="/"
          className="story-chip hover:story-chip-active flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all font-bold text-sm"
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
  );
}