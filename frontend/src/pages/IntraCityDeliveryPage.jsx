import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

// Pune warehouse location
const PUNE_WAREHOUSE = {
  id: 'warehouse',
  name: 'Pune Warehouse',
  latitude: 18.5204,
  longitude: 73.8567,
  address: 'Kalyani Nagar, Pune'
};

// Sample delivery stops in Pune
const SAMPLE_DELIVERY_STOPS = [
  {
    id: 'stop-1',
    name: 'Shivaji Nagar',
    address: 'Shivaji Nagar, Pune 411005',
    latitude: 18.5523,
    longitude: 73.8479,
    type: 'delivery'
  },
  {
    id: 'stop-2',
    name: 'Koregaon Park',
    address: 'Koregaon Park, Pune 411001',
    latitude: 18.5347,
    longitude: 73.8787,
    type: 'delivery'
  },
  {
    id: 'stop-3',
    name: 'Viman Nagar',
    address: 'Viman Nagar, Pune 411014',
    latitude: 18.5672,
    longitude: 73.9125,
    type: 'delivery'
  },
  {
    id: 'stop-4',
    name: 'Hadapsar',
    address: 'Hadapsar, Pune 411013',
    latitude: 18.5183,
    longitude: 73.9288,
    type: 'delivery'
  }
];

// Fallback route calculation (offline/mock data)
const calculateFallbackRoute = () => {
  // Simple nearest neighbor algorithm for fallback
  const stops = [PUNE_WAREHOUSE, ...SAMPLE_DELIVERY_STOPS];
  const route = [PUNE_WAREHOUSE];
  const visited = new Set(['warehouse']);
  let current = PUNE_WAREHOUSE;

  while (visited.size < stops.length) {
    let nearest = null;
    let minDistance = Infinity;

    for (const stop of stops) {
      if (!visited.has(stop.id)) {
        const dx = stop.latitude - current.latitude;
        const dy = stop.longitude - current.longitude;
        const distance = Math.sqrt(dx * dx + dy * dy) * 111; // rough km conversion
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = stop;
        }
      }
    }

    if (nearest) {
      route.push(nearest);
      visited.add(nearest.id);
      current = nearest;
    }
  }

  // Calculate total distance
  let totalDist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const dx = route[i + 1].latitude - route[i].latitude;
    const dy = route[i + 1].longitude - route[i].longitude;
    totalDist += Math.sqrt(dx * dx + dy * dy) * 111;
  }

  return { route, totalDistance: totalDist };
};

export default function IntraCityDeliveryPage() {
  const navigate = useNavigate();
  const [route, setRoute] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Calculate optimal delivery route on mount
  useEffect(() => {
    const calculateRoute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.post(`${API_BASE}/local-delivery/calculate-route`, {
          warehouse: {
            id: PUNE_WAREHOUSE.id,
            name: PUNE_WAREHOUSE.name,
            latitude: PUNE_WAREHOUSE.latitude,
            longitude: PUNE_WAREHOUSE.longitude,
            address: PUNE_WAREHOUSE.address
          },
          deliveryStops: SAMPLE_DELIVERY_STOPS
        });

        if (response.data.status === 'success') {
          setRoute(response.data.route);
          setTotalDistance(response.data.totalDistance);
          setIsOfflineMode(false);
        }
      } catch (err) {
        console.warn('Backend unavailable, using offline mode:', err.message);
        // Use fallback/offline mode
        const { route: fallbackRoute, totalDistance: fallbackDistance } = calculateFallbackRoute();
        setRoute(fallbackRoute);
        setTotalDistance(fallbackDistance);
        setIsOfflineMode(true);
        setError(null); // Don't show error if fallback works
      } finally {
        setLoading(false);
      }
    };

    calculateRoute();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col">
        <div className="bg-white border-b border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-emerald-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Intra-City Last-Mile Delivery</h1>
              <p className="text-sm text-emerald-600">Pune Local Delivery Network</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-spin" />
            <p className="text-lg text-emerald-700">Calculating optimal delivery route...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col">
        <div className="bg-white border-b border-emerald-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-emerald-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Intra-City Last-Mile Delivery</h1>
              <p className="text-sm text-emerald-600">Pune Local Delivery Network</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-lg text-red-600 mb-4">⚠️ Error Loading Simulation</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex flex-col">
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="bg-yellow-100 border-b border-yellow-400 px-4 py-2 text-sm text-yellow-800 flex items-center gap-2">
          <span>📡</span>
          <span>Offline Mode: Using local route calculation (backend unavailable)</span>
        </div>
      )}
      
      {/* Header with back button */}
      <div className="bg-white border-b border-emerald-200 p-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-emerald-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Intra-City Last-Mile Delivery</h1>
            <p className="text-sm text-emerald-600">Pune Local Delivery Network</p>
          </div>
        </div>
      </div>

      {/* Map Simulator - Full height */}
      <IntraCityMapSimulator
        warehouse={PUNE_WAREHOUSE}
        deliveryStops={SAMPLE_DELIVERY_STOPS}
        route={route}
        totalDistance={totalDistance}
        animationSpeed={1500}
      />
    </div>
  );
}
