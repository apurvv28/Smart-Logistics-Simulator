import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

export default function IntraCityDeliveryPage() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${API_BASE}/local-delivery/cities`);
        if (response.data.status === 'success') {
          const sortedCities = response.data.cities.sort((a, b) => a.cityName.localeCompare(b.cityName));
          setCities(sortedCities);
          // Pre-select Nagpur (NAG) if available, else first city
          const initialCity = sortedCities.find(c => c.cityId === 'NAG') || sortedCities[0];
          if (initialCity) {
            handleCitySelect(initialCity.cityId);
          }
        }
      } catch (err) {
        setError('Failed to load cities network. Backend may be offline.');
      }
    };
    fetchCities();
  }, []);

  const handleCitySelect = async (cityId) => {
    setSelectedCityId(cityId);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/local-delivery/calculate-city-route`, {
        cityId: cityId,
        numberOfStops: 4,
        algorithmType: 'AStar' // Requesting A* as shown in the screenshot audit panel
      });
      if (response.data.status === 'success') {
        setSimulationData(response.data);
      }
    } catch (err) {
      setError('Could not calculate delivery route for the selected city.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col overflow-hidden bg-white rounded-3xl shadow-sm border border-slate-200">
      {/* City Selector Header (Integrated into content area) */}
      <div className="bg-white px-8 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Operation Hub</h3>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Select city for last-mile simulation</p>
          </div>
        </div>

        <div className="relative group">
          <select
            value={selectedCityId}
            onChange={(e) => handleCitySelect(e.target.value)}
            disabled={loading}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 px-6 py-2.5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer disabled:opacity-50 transition-all font-bold text-sm"
          >
            {cities.map(city => (
              <option key={city.cityId} value={city.cityId}>
                {city.cityName} ({city.cityId})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:scale-110 transition-transform" />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-slate-100">
        {loading ? (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter">Optimizing Logistics</h3>
              <p className="text-sm text-slate-500 font-medium">Computing OSRM road geometry & stop sequence...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md border border-red-50">
               <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚠️</span>
               </div>
               <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tighter">Connection Failed</h3>
               <p className="text-slate-500 mb-8 font-medium leading-relaxed">{error}</p>
               <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100"
               >
                  Retry Connection
               </button>
            </div>
          </div>
        ) : simulationData && (
          <IntraCityMapSimulator
            warehouse={simulationData.warehouse}
            deliveryStops={simulationData.deliveryStops}
            route={simulationData.route}
            totalDistance={simulationData.totalDistance}
          />
        )}
      </div>
    </div>
  );
}