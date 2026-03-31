import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Compass, Flag, Map, ScrollText } from 'lucide-react';
import { useCampaignState } from './hooks/useCampaignState';
import StoryHomePage from './pages/StoryHomePage';
import MissionControlPage from './pages/MissionControlPage';
import MapAndChroniclePage from './pages/MapAndChroniclePage';

function TopNav() {
  const links = [
    { to: '/', label: 'Story', icon: ScrollText },
    { to: '/mission', label: 'Mission', icon: Flag },
    { to: '/map', label: 'Map Quest', icon: Map }
  ];

  return (
    <nav className="story-nav">
      <div className="flex items-center gap-2 text-amber-950 font-black text-lg">
        <Compass size={20} /> LogiCore Adventure
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `story-chip ${isActive ? 'story-chip-active' : ''}`}
            >
              <span className="inline-flex items-center gap-1"><Icon size={14} /> {link.label}</span>
            </NavLink>
          );
        })}
      </div>
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
            <Route path="/" element={<StoryHomePage campaign={campaign} />} />
            <Route path="/mission" element={<MissionControlPage campaign={campaign} />} />
            <Route path="/map" element={<MapAndChroniclePage campaign={campaign} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
