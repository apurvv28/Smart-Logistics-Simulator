import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import axios from 'axios';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import AddressSelectionPanel from '../components/AddressSelectionPanel';
import { useIntraCitySelection } from '../hooks/useIntraCitySelection';
import { useSimulationContext } from '../context/SimulationContext';

const API_BASE = 'http://localhost:8081/api';

export default function IntraCityDeliveryPage() {
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
    <div className="w-full h-[calc(100vh-140px)] flex flex-col overflow-hidden bg-slate-50 rounded-3xl shadow-sm border border-slate-200">
      <div className="bg-white px-8 py-5 border-b border-slate-100 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Intra-city Route Planner</h3>
            <p className="text-xs text-slate-400 font-medium tracking-tight">Pick city, warehouse, and delivery stops to simulate live last-mile routing.</p>
          </div>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">City selector</label>
            <select
              value={selectedCity?.id || ''}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="appearance-none w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.id})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Warehouse selector</label>
            <select
              value={selectedWarehouse?.id || ''}
              onChange={(e) => selectWarehouse(e.target.value)}
              disabled={!selectedCity}
              className="appearance-none w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 pr-10 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-[60%] -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Selection summary</p>
            <p className="mt-3 text-sm font-black text-slate-900 leading-snug">
              {selectedWarehouse ? selectedWarehouse.name : 'No warehouse selected'}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {deliveryAddresses.length} of 4 delivery addresses chosen
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-6 gap-6">
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

        <div className="flex-1 min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {selectedWarehouse ? (
            <IntraCityMapSimulator
              warehouse={selectedWarehouse}
              deliveryAddresses={deliveryAddresses}
              route={mapRoute}
              totalDistance={mapDistance}
              shouldStartAnimation={!!simulationData}
            />
          ) : (
            <div className="flex h-full min-h-[640px] flex-col items-center justify-center gap-4 bg-slate-100 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Choose a city and warehouse to preview the map.</h3>
              <p className="max-w-md text-sm text-slate-500">
                Once you have selected a city and warehouse, add four delivery addresses to visualize the route preview and launch the live simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
