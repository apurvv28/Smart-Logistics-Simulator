import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import AddressSelectionPanel from '../components/AddressSelectionPanel';
import { useIntraCitySelection } from '../hooks/useIntraCitySelection';
import { useSimulationContext } from '../context/SimulationContext';

const API_BASE = 'http://localhost:8081/api';

export default function IntraCityDeliveryPage() {
  const navigate = useNavigate();
  const { setLastIntraCityData } = useSimulationContext();
  const {
    selectedCity,
    selectedWarehouse,
    deliveryAddresses,
    warehouseOptions,
    cityOptions,
    selectCity,
    selectWarehouse,
    addDeliveryAddress,
    removeDeliveryAddress,
    moveDeliveryAddress,
    isReadyForSimulation,
    clearSelections,
  } = useIntraCitySelection();

  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSimulationData(null);
    setError(null);
  }, [selectedCity?.id, selectedWarehouse?.id, deliveryAddresses.length]);

  const handleCitySelect = (cityId) => {
    selectCity(cityId);
  };

  const handleStartSimulation = async () => {
    if (!selectedCity || !selectedWarehouse || deliveryAddresses.length !== 4) {
      setError('Please select a warehouse and exactly 4 delivery addresses.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/local-delivery/calculate-city-route`, {
        cityId: selectedCity.id,
        warehouseId: selectedWarehouse.id,
        warehouse: {
          ...selectedWarehouse,
          latitude: selectedWarehouse.lat,
          longitude: selectedWarehouse.lng,
        },
        deliveryStops: deliveryAddresses.map((address) => ({
          ...address,
          latitude: address.lat,
          longitude: address.lng,
        })),
        algorithmType: 'DIJKSTRA',
      });

      if (response.data.status === 'success') {
        const data = response.data;
        setSimulationData(data);

        // Persist data for Phase 3 handoff
        const persistedData = {
          cityId: selectedCity.id,
          cityName: selectedCity.name,
          warehouseId: selectedWarehouse.id,
          warehouse: {
            name: selectedWarehouse.name,
            lat: selectedWarehouse.lat,
            lng: selectedWarehouse.lng,
            address: selectedWarehouse.address
          },
          deliveryAddresses: deliveryAddresses.map((addr, idx) => ({
            index: idx + 1,
            ...addr
          })),
          calculatedRoute: {
            sequence: data.sequence,
            totalDistance: data.totalDistance,
            estimatedDuration: data.estimatedDuration,
            path: data.route.path
          }
        };

        localStorage.setItem('logicore_phase2', JSON.stringify(persistedData));
        setLastIntraCityData(persistedData);
      } else {
        throw new Error(response.data.message || 'Unable to calculate route.');
      }
    } catch (err) {
      setError('Could not calculate the delivery route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    clearSelections();
    setSimulationData(null);
    setError(null);
  };

  const mapRoute = useMemo(() => {
    return simulationData?.route || (selectedWarehouse ? [selectedWarehouse, ...deliveryAddresses] : []);
  }, [simulationData, selectedWarehouse, deliveryAddresses]);

  const mapDistance = useMemo(() => {
    return simulationData?.totalDistance || 0;
  }, [simulationData]);

  return (
    <div className="min-h-screen bg-logi-off-white">
      {/* Header */}
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
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-logi-navy">Intra-City Last-Mile Delivery</h1>
              <p className="text-gray-600 mt-1">Warehouse to multi-stop local delivery optimization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border-b border-logi-card-border">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-logi-red/10 border border-logi-red/20 rounded">
              <MapPin className="w-5 h-5 text-logi-red" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-logi-navy uppercase tracking-wider">Intra-City Route Planner</h3>
              <p className="text-xs text-gray-600 font-medium">Pick city, warehouse, and delivery stops to simulate live last-mile routing.</p>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3">
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-logi-gold mb-2">City Selector</label>
              <select
                value={selectedCity?.id || ''}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="appearance-none w-full rounded border border-logi-card-border bg-white px-4 py-3 pr-10 text-sm font-semibold text-logi-navy focus:outline-none focus:ring-2 focus:ring-logi-red/20"
              >
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.id})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-[60%] -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-logi-gold mb-2">Warehouse Selector</label>
              <select
                value={selectedWarehouse?.id || ''}
                onChange={(e) => selectWarehouse(e.target.value)}
                disabled={!selectedCity}
                className="appearance-none w-full rounded border border-logi-card-border bg-white px-4 py-3 pr-10 text-sm font-semibold text-logi-navy focus:outline-none focus:ring-2 focus:ring-logi-red/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {warehouseOptions.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-[60%] -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="rounded border border-logi-card-border bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-logi-gold">Selection Summary</p>
              <p className="mt-3 text-sm font-bold text-logi-navy leading-snug">
                {selectedWarehouse ? selectedWarehouse.name : 'No warehouse selected'}
              </p>
              <p className="mt-2 text-xs text-gray-600">
                {deliveryAddresses.length} of 4 delivery addresses chosen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-6">
          <div className="w-full max-w-[320px] flex-shrink-0">
            <AddressSelectionPanel
              selectedCity={selectedCity}
              selectedWarehouse={selectedWarehouse}
              warehouseOptions={warehouseOptions}
              deliveryAddresses={deliveryAddresses}
              selectWarehouse={selectWarehouse}
              addDeliveryAddress={addDeliveryAddress}
              removeDeliveryAddress={removeDeliveryAddress}
              moveDeliveryAddress={moveDeliveryAddress}
              isReadyForSimulation={isReadyForSimulation}
              onStartSimulation={handleStartSimulation}
              onClearSelections={handleClearAll}
              loading={loading}
            />
          </div>

          <div className="flex-1 min-w-0 border border-logi-card-border bg-white rounded-md shadow-sm overflow-hidden">
            {selectedWarehouse ? (
              <IntraCityMapSimulator
                warehouse={selectedWarehouse}
                deliveryAddresses={deliveryAddresses}
                route={mapRoute}
                totalDistance={mapDistance}
                shouldStartAnimation={!!simulationData}
                onStartSimulation={handleStartSimulation}
                loading={loading}
              />
            ) : (
              <div className="flex h-full min-h-[640px] flex-col items-center justify-center gap-4 bg-logi-off-white px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-logi-red/10 text-logi-red">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-logi-navy">Choose a city and warehouse to preview the map.</h3>
                <p className="max-w-md text-sm text-gray-600">
                  Once you have selected a city and warehouse, add four delivery addresses to visualize the route preview and launch the live simulation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
