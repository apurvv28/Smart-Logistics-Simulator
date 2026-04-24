import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Pause, Play, RotateCcw } from 'lucide-react';
import IntraCityMapSimulator from '../components/IntraCityMapSimulator';
import { useEndToEndState } from '../hooks/useEndToEndState';
import { CITY_DATA } from '../data/cityData';
import { searchAddressesInCity } from '../services/geocodingService';
import 'leaflet/dist/leaflet.css';

const MACRO_NODES = {
  0:  { name: 'Delhi', x: 280, y: 70 },
  15: { name: 'Ahmedabad', x: 160, y: 180 },
  21: { name: 'Bhopal', x: 280, y: 200 },
  6:  { name: 'Kolkata', x: 500, y: 210 },
  18: { name: 'Jaipur', x: 220, y: 130 },
  48: { name: 'Agra', x: 300, y: 110 },
  3:  { name: 'Mumbai', x: 180, y: 310 },
  4:  { name: 'Pune', x: 210, y: 340 },
  22: { name: 'Nagpur', x: 320, y: 260 },
  10: { name: 'Hyderabad', x: 320, y: 370 },
  9:  { name: 'Bangalore', x: 270, y: 470 },
  12: { name: 'Chennai', x: 330, y: 490 },
  42: { name: 'Surat', x: 170, y: 260 },
  43: { name: 'Lucknow', x: 360, y: 110 },
  44: { name: 'Kanpur', x: 350, y: 130 },
  45: { name: 'Indore', x: 240, y: 240 },
  46: { name: 'Patna', x: 440, y: 150 },
  47: { name: 'Ludhiana', x: 250, y: 40 },
  50: { name: 'Amritsar', x: 230, y: 25 },
  24: { name: 'Guwahati', x: 580, y: 140 },
  27: { name: 'Kochi', x: 260, y: 550 },
  30: { name: 'Vijayawada', x: 360, y: 410 },
  31: { name: 'Vizag', x: 400, y: 380 },
  13: { name: 'Coimbatore', x: 290, y: 520 },
  51: { name: 'Gwalior', x: 290, y: 150 },
  28: { name: 'Trivandrum', x: 280, y: 580 },
  23: { name: 'Raipur', x: 390, y: 270 }
};

export default function EndToEndJourneyPage() {
  const navigate = useNavigate();
  const {
    formData,
    updateForm,
    cityOptions,
    loading,
    error,
    statusMessage,
    currentPhase,
    overallProgress,
    isPaused,
    macroRoute,
    macroCurrentStep,
    macroTotalDistance,
    microSimulationData,
    microWarehouse,
    microDeliveryAddresses,
    microTotalDistance,
    startJourney,
    pauseAnimation,
    resumeAnimation,
    handleMicroComplete,
    resetJourney,
  } = useEndToEndState();

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  const sourceCity = useMemo(
    () => CITY_DATA[formData.skuCityId] || null,
    [formData.skuCityId]
  );
  const destinationCity = useMemo(
    () => CITY_DATA[formData.customerCityId] || null,
    [formData.customerCityId]
  );
  const inMacroPhase = ['INITIATING', 'MACRO_TRANSIT', 'MACRO_COMPLETE'].includes(currentPhase);
  const inMicroPhase = ['MICRO_LOADING', 'MICRO_TRANSIT', 'DELIVERED'].includes(currentPhase);
  const normalizedMicroWarehouse = useMemo(() => {
    if (!microWarehouse) return null;
    return {
      ...microWarehouse,
      latitude: microWarehouse.latitude ?? microWarehouse.lat,
      longitude: microWarehouse.longitude ?? microWarehouse.lng,
    };
  }, [microWarehouse]);
  const normalizedMicroRoute = useMemo(() => {
    if (!microSimulationData) return [];
    if (Array.isArray(microSimulationData.route)) return microSimulationData.route;
    if (Array.isArray(microSimulationData.route?.path)) return microSimulationData.route.path;

    if (normalizedMicroWarehouse && microDeliveryAddresses.length) {
      return [normalizedMicroWarehouse, ...microDeliveryAddresses];
    }
    return [];
  }, [microSimulationData, normalizedMicroWarehouse, microDeliveryAddresses]);

  const handleAddressSearch = async () => {
    setAddressError('');
    if (!destinationCity) {
      setAddressError('Select customer city first.');
      return;
    }
    if (!formData.customerAddress || formData.customerAddress.trim().length < 3) {
      setAddressError('Type at least 3 characters for customer address.');
      return;
    }
    setAddressLoading(true);
    const results = await searchAddressesInCity(formData.customerAddress, destinationCity.name, 6);
    setAddressSuggestions(results);
    if (!results.length) {
      setAddressError('No address suggestions found. Try a nearby landmark.');
    }
    setAddressLoading(false);
  };

  if (currentPhase === 'FORM') {
    return (
      <div className="w-full flex-1 p-8 bg-[#f7f7f5]">
        <div className="mx-auto max-w-3xl border border-[#dfdfd7] bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#121212]">Phase 3: End-to-End Simulation</h1>
              <p className="mt-1 text-sm text-slate-500">
                Fill all inputs, then simulation runs sequentially: Phase 1 (inter-city) then Phase 2 (last-mile).
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Product SKU City
              </label>
              <select
                value={formData.skuCityId}
                onChange={(e) => updateForm('skuCityId', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900"
              >
                <option value="" className="text-slate-900">Select source city</option>
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.id} className="text-slate-900">
                    {city.name} ({city.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Customer City
              </label>
              <select
                value={formData.customerCityId}
                onChange={(e) => {
                  updateForm('customerCityId', e.target.value);
                  updateForm('customerAddressCoords', null);
                  setAddressSuggestions([]);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900"
              >
                <option value="" className="text-slate-900">Select destination city</option>
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.id} className="text-slate-900">
                    {city.name} ({city.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Customer Address
              </label>
              <div className="flex gap-3">
                <input
                  value={formData.customerAddress}
                  onChange={(e) => {
                    updateForm('customerAddress', e.target.value);
                    updateForm('customerAddressCoords', null);
                  }}
                  placeholder="Enter customer address or landmark"
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={handleAddressSearch}
                  disabled={addressLoading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-70"
                >
                  {addressLoading ? 'Searching...' : 'Find'}
                </button>
              </div>
              {addressError && <p className="mt-2 text-xs font-semibold text-rose-500">{addressError}</p>}
              {!!addressSuggestions.length && (
                <div className="mt-3 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white p-2">
                  {addressSuggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        updateForm('customerAddress', item.address);
                        updateForm('customerAddressName', item.name);
                        updateForm('customerAddressCoords', { lat: item.lat, lng: item.lng });
                        setAddressSuggestions([]);
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.address}</p>
                    </button>
                  ))}
                </div>
              )}
              {formData.customerAddressCoords && (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  Address selected ({formData.customerAddressCoords.lat.toFixed(4)},{' '}
                  {formData.customerAddressCoords.lng.toFixed(4)})
                </p>
              )}
            </div>

            <button
              onClick={startJourney}
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-3 bg-[#d72638] py-4 text-sm font-black uppercase tracking-wider text-white hover:bg-[#b71f2f] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Preparing
                </>
              ) : (
                'Start Phase 3 (Phase 1 + Phase 2)'
              )}
            </button>
            {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'DELIVERED') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center border border-[#dfdfd7] bg-white p-8 text-center">
        <CheckCircle2 className="mb-4 h-16 w-16 text-[#198754]" />
        <h2 className="text-3xl font-black text-[#121212]">Phase 3 Completed</h2>
        <p className="mt-2 text-slate-600">Package delivered successfully through sequential Phase 1 and Phase 2.</p>
        <button
          onClick={resetJourney}
          className="mt-6 flex items-center gap-2 bg-[#121212] px-5 py-3 text-sm font-black text-white"
        >
          <RotateCcw size={16} /> New Simulation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 border border-[#dfdfd7] bg-white p-5">
      <div className="flex items-center justify-between border border-[#dfdfd7] bg-[#f7f7f5] px-4 py-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Phase 3 Live Simulation</h2>
          <p className="text-xs font-semibold text-slate-500">{statusMessage}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isPaused ? resumeAnimation : pauseAnimation}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={resetJourney}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="h-3 overflow-hidden bg-[#e7e7df]">
        <div className="h-full bg-[#d72638] transition-all duration-500" style={{ width: `${overallProgress}%` }} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Input Snapshot</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {sourceCity?.name || 'N/A'} → {destinationCity?.name || 'N/A'}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formData.customerAddress}</p>
          </div>

          <div className={`border p-4 ${inMacroPhase ? 'border-[#f1c2c8] bg-[#fff2f2]' : 'border-[#dfdfd7] bg-white'}`}>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Phase 1 (Inter-city)</p>
            <p className="mt-2 text-xs font-semibold text-slate-700">
              {macroRoute.length ? `${macroCurrentStep + 1} / ${macroRoute.length} nodes` : 'Preparing...'}
            </p>
            <p className="text-xs text-slate-500">Distance: {Math.round(macroTotalDistance)} km</p>
          </div>

          <div className={`border p-4 ${inMicroPhase ? 'border-[#d9e8db] bg-[#f3faf4]' : 'border-[#dfdfd7] bg-white'}`}>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Phase 2 (Last-mile)</p>
            <p className="mt-2 text-xs font-semibold text-slate-700">
              Warehouse: {microWarehouse?.name || 'Preparing...'}
            </p>
            <p className="text-xs text-slate-500">Distance: {microTotalDistance.toFixed(2)} km</p>
          </div>
        </aside>

        <section className="min-h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {inMacroPhase ? (
            <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-6">
              <h3 className="mb-4 text-lg font-black text-slate-900">Phase 1 Simulation</h3>
              <svg width="600" height="520" viewBox="0 0 600 520">
                {Object.keys(MACRO_NODES).map((id) => {
                  const node = MACRO_NODES[id];
                  return Object.keys(MACRO_NODES)
                    .filter((target) => target !== id)
                    .slice(0, 3)
                    .map((target) => (
                      <line
                        key={`${id}-${target}`}
                        x1={node.x}
                        y1={node.y}
                        x2={MACRO_NODES[target].x}
                        y2={MACRO_NODES[target].y}
                        stroke="#e2e8f0"
                        strokeWidth="0.6"
                      />
                    ));
                })}

                {macroRoute.slice(0, Math.max(0, macroCurrentStep)).map((nodeId, idx) => {
                  const next = macroRoute[idx + 1];
                  if (next === undefined) return null;
                  const n1 = MACRO_NODES[nodeId];
                  const n2 = MACRO_NODES[next];
                  if (!n1 || !n2) return null;
                  return (
                    <line
                      key={`progress-${idx}`}
                      x1={n1.x}
                      y1={n1.y}
                      x2={n2.x}
                      y2={n2.y}
                      stroke="#4f46e5"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  );
                })}

                {Object.keys(MACRO_NODES).map((id) => {
                  const numericId = Number(id);
                  const point = MACRO_NODES[id];
                  const isCurrent = macroRoute[macroCurrentStep] === numericId;
                  return (
                    <g key={id}>
                      <circle cx={point.x} cy={point.y} r={isCurrent ? 10 : 5} fill={isCurrent ? '#f59e0b' : '#94a3b8'} />
                      <text x={point.x} y={point.y - 12} textAnchor="middle" fill="#475569" className="text-[9px] font-bold">
                        {point.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <IntraCityMapSimulator
              warehouse={normalizedMicroWarehouse || {}}
              deliveryAddresses={microDeliveryAddresses}
              route={normalizedMicroRoute}
              totalDistance={microTotalDistance}
              autoSimulate={currentPhase === 'MICRO_TRANSIT'}
              shouldStartAnimation={currentPhase === 'MICRO_TRANSIT'}
              externalIsPaused={isPaused}
              onAnimationComplete={handleMicroComplete}
            />
          )}
        </section>
      </div>
    </div>
  );
}
