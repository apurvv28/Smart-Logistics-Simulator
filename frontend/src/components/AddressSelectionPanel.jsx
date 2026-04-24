import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, Loader2, MapPin, CheckCircle2, AlertCircle, Trash2, ChevronRight } from 'lucide-react';
import debounce from 'lodash.debounce';

export default function AddressSelectionPanel({
  selectedCity,
  selectedWarehouse,
  deliveryAddresses,
  addDeliveryAddress,
  removeDeliveryAddress,
  isReadyForSimulation,
  onStartSimulation,
  onClearSelections,
  loading,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Debounced Nominatim Search
  const searchAddresses = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 3 || !selectedCity) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // We use the city coordinates to bound the search
        const { lat, lng } = selectedCity.coordinates || { lat: 18.5204, lng: 73.8567 }; // Pune default fallback
        const radius = 0.2; // roughly 20km
        const viewbox = `${lng - radius},${lat + radius},${lng + radius},${lat - radius}`;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' ' + selectedCity.name)}&bounded=1&viewbox=${viewbox}&limit=8&addressdetails=1`
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        
        const formatted = data.map(item => ({
          place_id: item.place_id,
          main_text: item.display_name.split(',')[0],
          secondary_text: item.display_name.split(',').slice(1).join(',').trim(),
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));

        setSuggestions(formatted);
        setShowDropdown(true);
      } catch (error) {
        console.error('Address search failed:', error);
        setSearchError('Could not fetch suggestions. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 400),
    [selectedCity]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchAddresses(value);
  };

  const handleSelectSuggestion = (suggestion) => {
    if (deliveryAddresses.length >= 4) {
      alert("Maximum 4 delivery addresses allowed");
      return;
    }

    addDeliveryAddress({
      id: `addr_${Date.now()}`,
      name: suggestion.main_text,
      address: suggestion.address,
      lat: suggestion.lat,
      lng: suggestion.lng,
      latitude: suggestion.lat,
      longitude: suggestion.lng
    });

    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const maxAddresses = 4;
  const stopsNeeded = maxAddresses - deliveryAddresses.length;

  return (
    <div className="h-full flex flex-col rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-left duration-700">
      {/* Header & Search */}
      <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white relative z-50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shadow-lg shadow-indigo-200">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-500 font-black">Phase 2: Last-Mile</p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">📍 Delivery Stops</h2>
          </div>
        </div>

        <div className="relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={selectedCity ? `Search in ${selectedCity.name}...` : "Select a city first"}
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length >= 3 && setShowDropdown(true)}
              disabled={!selectedCity || deliveryAddresses.length >= maxAddresses}
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showDropdown && (suggestions.length > 0 || searchError) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 overflow-y-auto max-h-64">
              {searchError ? (
                <div className="p-4 text-center text-xs font-bold text-rose-500 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {searchError}
                </div>
              ) : (
                suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-5 py-4 hover:bg-indigo-50 border-b border-slate-50 last:border-0 transition-colors group"
                  >
                    <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.main_text}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.secondary_text}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Addresses List */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
        <div className="flex items-center justify-between">
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
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400">No locations chosen.</p>
              <p className="text-xs text-slate-300 mt-1">Add exactly 4 stops to launch mission.</p>
            </div>
          ) : (
            deliveryAddresses.map((addr, idx) => (
              <div 
                key={addr.id} 
                className="group relative rounded-3xl bg-white p-5 border-2 border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all animate-in slide-in-from-bottom-4 duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="mt-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-100">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{addr.name}</p>
                      <p className="mt-1 text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors line-clamp-2">
                        {addr.address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDeliveryAddress(idx)}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
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

      {/* Footer Button */}
      <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <button
          onClick={onStartSimulation}
          disabled={!isReadyForSimulation() || loading}
          className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 ${
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
              {isReadyForSimulation() ? 'Launch Simulation' : `Selection Incomplete`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
