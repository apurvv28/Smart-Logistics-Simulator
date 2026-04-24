import { useEffect, useMemo, useState } from 'react';
import { CITY_DATA } from '../data/cityData';

const STORAGE_KEY = 'logicore_phase2_selection';
const MAX_DELIVERY_ADDRESSES = 4;

const normalizeLocation = (location) => {
  if (!location) return null;
  const lat = location.lat ?? location.latitude ?? 0;
  const lng = location.lng ?? location.longitude ?? 0;
  return {
    ...location,
    latitude: lat,
    longitude: lng,
    lat,
    lng,
  };
};

export const useIntraCitySelection = () => {
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);

  const cityOptions = useMemo(
    () => Object.values(CITY_DATA).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const selectedCity = useMemo(
    () => (selectedCityId ? CITY_DATA[selectedCityId] : null),
    [selectedCityId]
  );

  const warehouseOptions = useMemo(
    () => (selectedCity ? selectedCity.warehouseLocations.map(normalizeLocation) : []),
    [selectedCity]
  );

  const selectedWarehouse = useMemo(
    () => warehouseOptions.find((option) => option.id === selectedWarehouseId) || warehouseOptions[0] || null,
    [warehouseOptions, selectedWarehouseId]
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.selectedCityId && CITY_DATA[parsed.selectedCityId]) {
          setSelectedCityId(parsed.selectedCityId);
          setSelectedWarehouseId(parsed.selectedWarehouseId || '');
          setDeliveryAddresses(
            (parsed.deliveryAddresses || []).map((address) => normalizeLocation(address))
          );
          return;
        }
      } catch (error) {
        console.warn('Failed to load saved Phase 2 selection:', error);
      }
    }

    if (cityOptions.length > 0) {
      setSelectedCityId(cityOptions[0].id);
    }
  }, [cityOptions]);

  useEffect(() => {
    if (!selectedCity) {
      setSelectedWarehouseId('');
      setDeliveryAddresses([]);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (warehouseOptions.length > 0 && !warehouseOptions.some((option) => option.id === selectedWarehouseId)) {
      setSelectedWarehouseId(warehouseOptions[0].id);
    }
  }, [selectedCity, warehouseOptions, selectedWarehouseId]);

  useEffect(() => {
    if (!selectedCity) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedCityId,
        selectedWarehouseId: selectedWarehouse?.id || '',
        deliveryAddresses,
      })
    );
  }, [selectedCity, selectedWarehouse, selectedCityId, selectedWarehouseId, deliveryAddresses]);

  const selectCity = (cityId) => {
    if (cityId === selectedCityId) return;
    setSelectedCityId(cityId);
    setSelectedWarehouseId('');
    setDeliveryAddresses([]);
  };

  const selectWarehouse = (warehouseId) => {
    setSelectedWarehouseId(warehouseId);
  };

  const addDeliveryAddress = (address) => {
    const normalized = normalizeLocation(address);
    if (!normalized || deliveryAddresses.length >= MAX_DELIVERY_ADDRESSES) return;

    setDeliveryAddresses((prev) => {
      if (
        prev.some(
          (existing) =>
            existing.id === normalized.id ||
            (existing.latitude === normalized.latitude && existing.longitude === normalized.longitude)
        )
      ) {
        return prev;
      }
      return [...prev, normalized];
    });
  };

  const removeDeliveryAddress = (index) => {
    setDeliveryAddresses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveDeliveryAddress = (index, direction) => {
    setDeliveryAddresses((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const clearSelections = () => {
    setSelectedCityId('');
    setSelectedWarehouseId('');
    setDeliveryAddresses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isReadyForSimulation = () => {
    return Boolean(selectedCity && selectedWarehouse && deliveryAddresses.length === MAX_DELIVERY_ADDRESSES);
  };

  return {
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
  };
};
