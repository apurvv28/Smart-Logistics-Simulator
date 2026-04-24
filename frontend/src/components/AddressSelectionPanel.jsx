import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Loader2, MapPin, Search, Trash2, X, AlertCircle } from 'lucide-react';

export default function AddressSelectionPanel({
  selectedCity,
  selectedWarehouse,
  warehouseOptions,
  deliveryAddresses,
  selectWarehouse,
  addDeliveryAddress,
  removeDeliveryAddress,
  moveDeliveryAddress,
  isReadyForSimulation,
  onStartSimulation,
  onClearSelections,
  loading,
}) {
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  useEffect(() => {
    setAddressInput('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setSuggestionError('');
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedCity || addressInput.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const query = addressInput.trim();
    const timer = setTimeout(() => {
      fetchAddressSuggestions(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [addressInput, selectedCity]);

  const fetchAddressSuggestions = async (query) => {
    if (!selectedCity || query.trim().length < 3) return;

    setSuggestionError('');
    setIsFetchingSuggestions(true);

    try {
      const { lat, lng } = selectedCity.coordinates || {};
      const radius = 0.22;
      const minLat = lat - radius;
      const maxLat = lat + radius;
      const minLng = lng - radius;
      const maxLng = lng + radius;
      const encoded = encodeURIComponent(`${query} ${selectedCity.name}`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&countrycodes=in&bounded=1&viewbox=${minLng},${maxLat},${maxLng},${minLat}&q=${encoded}`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'LogiCore-Smart-Logistics-Simulator'
        },
      });

      if (!response.ok) {
        throw new Error('Location lookup failed.');
      }

      const results = await response.json();
      const suggestions = results.map((item) => ({
        id: item.place_id ? `nom-${item.place_id}` : `${item.lat}-${item.lon}`,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        lat: Number(item.lat),
        lng: Number(item.lon),
      }));

      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      setSuggestionError('Unable to fetch suggestions. Try a different landmark.');
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    if (deliveryAddresses.length >= 4) {
      setSuggestionError('Maximum of 4 delivery stops allowed.');
      return;
    }

    const alreadySelected = deliveryAddresses.some(
      (address) => address.id === suggestion.id ||
        (address.latitude === suggestion.latitude && address.longitude === suggestion.longitude)
    );

    if (alreadySelected) {
      setSuggestionError('This address is already in your route.');
      return;
    }

    addDeliveryAddress(suggestion);
    setAddressInput('');
    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  const canAdd = selectedCity && selectedWarehouse && deliveryAddresses.length < 4;
  const stopsNeeded = 4 - deliveryAddresses.length;

  return (
    <div className="h-full flex flex-col rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-left duration-700">
      <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shadow-lg shadow-indigo-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Phase 2: Last-Mile</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📍 Delivery Stops</h2>
          </div>
        </div>

        {selectedCity ? (
          <div className="space-y-6">
             <div className="relative group">
              <input
                type="text"
                value={addressInput}
                onChange={(event) => setAddressInput(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder={`Search addresses in ${selectedCity.name}...`}
                disabled={!canAdd}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 pr-12 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isFetchingSuggestions ? (
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                ) : (
                  <Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500" />
                )}
              </div>

               {/* Autocomplete Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && canAdd && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                    <p className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Suggestions</p>
                  </div>
                  {addressSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-5 py-4 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <p className="text-sm font-black text-slate-800">{suggestion.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{suggestion.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {suggestionError && (
              <div className="flex items-center gap-2 px-2 text-xs font-bold text-rose-500 animate-pulse">
                <AlertCircle className="w-4 h-4" /> {suggestionError}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <p className="text-sm font-bold text-slate-400">Please select a city to begin</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Selected Stops ({deliveryAddresses.length}/4)</h3>
            {deliveryAddresses.length > 0 && (
              <button 
                onClick={onClearSelections}
                className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {deliveryAddresses.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                   <Search className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">No stops selected yet.</p>
                <p className="text-xs text-slate-300 mt-1 max-w-[200px]">Search for landmarks like "Mall", "Hospital", or "Store" within the city.</p>
              </div>
            ) : (
              deliveryAddresses.map((address, index) => {
                const iconMap = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
                return (
                  <div 
                    key={address.id} 
                    className="group relative rounded-3xl bg-white p-6 border-2 border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all animate-in slide-in-from-bottom-4 duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <span className="text-xl">{iconMap[index]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{address.name}</p>
                          <p className="mt-1 text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">
                            ({address.lat.toFixed(2)}°N, {address.lng.toFixed(2)}°E)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDeliveryAddress(index)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {deliveryAddresses.length > 0 && deliveryAddresses.length < 4 && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center text-amber-700">
               <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-black text-amber-700 uppercase tracking-widest">
              ⚠️ Add {stopsNeeded} more stop{stopsNeeded > 1 ? 's' : ''} to proceed
            </p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button
          type="button"
          onClick={onStartSimulation}
          disabled={!isReadyForSimulation() || loading}
          className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 ${
            isReadyForSimulation() 
              ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isReadyForSimulation() ? <CheckCircle2 className="w-5 h-5" /> : null}
              {isReadyForSimulation() ? 'Start Simulation' : `Disabled until 4 stops`}
            </>
          )}
        </button>
        <p className="mt-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
           {isReadyForSimulation() ? 'Route optimization ready' : 'Pick exactly 4 addresses to launch'}
        </p>
      </div>
    </div>
  );
}
