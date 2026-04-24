/**
 * Geocoding Service
 * Uses Nominatim OpenStreetMap API to convert between addresses and coordinates.
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search for addresses within a specific city
 * @param {string} query - The search term (e.g., "school", "mall")
 * @param {string} cityName - The city to restrict searching in
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of address objects
 */
export const searchAddressesInCity = async (query, cityName, limit = 5) => {
  if (!query || query.trim().length < 3) return [];

  try {
    const encodedQuery = encodeURIComponent(`${query} ${cityName}`);
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodedQuery}&format=json&limit=${limit}&addressdetails=1&countrycodes=in`
    );

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();
    
    return data.map(item => ({
      id: item.place_id ? `nom-${item.place_id}` : `${item.lat}-${item.lon}`,
      name: item.display_name.split(',')[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      displayName: item.display_name
    }));
  } catch (error) {
    console.error('Error in searchAddressesInCity:', error);
    return [];
  }
};

/**
 * Get human-readable address from coordinates (reverse geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Address details
 */
export const getReverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding API request failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      address: data.display_name,
      street: address.road || address.suburb || '',
      city: address.city || address.town || address.village || '',
      postalCode: address.postcode || '',
      displayName: data.display_name
    };
  } catch (error) {
    console.error('Error in getReverseGeocode:', error);
    return null;
  }
};
