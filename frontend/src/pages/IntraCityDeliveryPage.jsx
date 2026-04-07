import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, ChevronDown, MapPin } from 'lucide-react';
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
          setCities(response.data.cities.sort((a, b) => a.cityName.localeCompare(b.cityName)));
          // Pre-select Nagpur or first city
          const initialCity = response.data.cities.find(c => c.cityId === 'NAG') || response.data.cities[0];
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
        numberOfStops: 12,
        algorithmType: 'GREEDY'
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
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 p-4 shadow-lg z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 text-white border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">National Intra-City Simulator</h1>
              <p className="text-sm text-indigo-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Regional Hub Network | Active Coverage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={selectedCityId}
                onChange={(e) => handleCitySelect(e.target.value)}
                disabled={loading}
                className="appearance-none bg-white/10 border border-white/30 text-white px-5 py-2.5 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer disabled:opacity-50 transition-all font-medium"
              >
                <option value="" disabled className="text-slate-900">Select Operating Hub</option>
                {cities.map(city => (
                  <option key={city.cityId} value={city.cityId} className="text-slate-900">
                    {city.cityName} ({city.cityId})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-200">
        {loading ? (
          <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm transform animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Optimizing Local Route</h3>
              <p className="text-slate-500 mt-2">Computing TSP sequence for the selected city hubs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Network Error</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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