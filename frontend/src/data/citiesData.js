/**
 * Comprehensive India Cities Data for Intra-City Delivery Simulations
 * Includes warehouse locations and predefined delivery zones for all major Indian cities
 */

export const MAJOR_CITIES = [
  {
    id: 'delhi',
    name: 'Delhi',
    displayName: 'Delhi Warehouse',
    latitude: 28.7041,
    longitude: 77.1025,
    region: 'North India',
    warehouseAddress: 'Delhi Warehouse, New Delhi'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai Warehouse',
    latitude: 19.0760,
    longitude: 72.8777,
    region: 'West India',
    warehouseAddress: 'Mumbai Warehouse, Maharashtra'
  },
  {
    id: 'pune',
    name: 'Pune',
    displayName: 'Pune Warehouse',
    latitude: 18.5204,
    longitude: 73.8567,
    region: 'West India',
    warehouseAddress: 'Pune Warehouse, Kalyani Nagar'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    displayName: 'Bengaluru Warehouse',
    latitude: 12.9716,
    longitude: 77.5946,
    region: 'South India',
    warehouseAddress: 'Bengaluru Warehouse, Karnataka'
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata Warehouse',
    latitude: 22.5726,
    longitude: 88.3639,
    region: 'East India',
    warehouseAddress: 'Kolkata Warehouse, West Bengal'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    displayName: 'Hyderabad Warehouse',
    latitude: 17.3850,
    longitude: 78.4867,
    region: 'South India',
    warehouseAddress: 'Hyderabad Warehouse, Telangana'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    displayName: 'Chennai Warehouse',
    latitude: 13.0827,
    longitude: 80.2707,
    region: 'South India',
    warehouseAddress: 'Chennai Warehouse, Tamil Nadu'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    displayName: 'Ahmedabad Warehouse',
    latitude: 23.0225,
    longitude: 72.5714,
    region: 'West India',
    warehouseAddress: 'Ahmedabad Warehouse, Gujarat'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    displayName: 'Jaipur Warehouse',
    latitude: 26.9124,
    longitude: 75.7873,
    region: 'North India',
    warehouseAddress: 'Jaipur Warehouse, Rajasthan'
  },
  {
    id: 'gurgaon',
    name: 'Gurgaon',
    displayName: 'Gurgaon Warehouse',
    latitude: 28.4595,
    longitude: 77.0266,
    region: 'North India',
    warehouseAddress: 'Gurgaon Warehouse, Haryana'
  },
  {
    id: 'bhopal',
    name: 'Bhopal',
    displayName: 'Bhopal Warehouse',
    latitude: 23.2599,
    longitude: 77.4126,
    region: 'Central India',
    warehouseAddress: 'Bhopal Warehouse, Madhya Pradesh'
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    displayName: 'Nagpur Warehouse',
    latitude: 21.1458,
    longitude: 79.0882,
    region: 'Central India',
    warehouseAddress: 'Nagpur Warehouse, Maharashtra'
  },
  {
    id: 'kochi',
    name: 'Kochi',
    displayName: 'Kochi Warehouse',
    latitude: 9.9312,
    longitude: 76.2673,
    region: 'South India',
    warehouseAddress: 'Kochi Warehouse, Kerala'
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    displayName: 'Lucknow Warehouse',
    latitude: 26.8467,
    longitude: 80.9462,
    region: 'North India',
    warehouseAddress: 'Lucknow Warehouse, Uttar Pradesh'
  },
  {
    id: 'chandigarh',
    name: 'Chandigarh',
    displayName: 'Chandigarh Warehouse',
    latitude: 30.7333,
    longitude: 76.7794,
    region: 'North India',
    warehouseAddress: 'Chandigarh Warehouse, Punjab'
  }
];

/**
 * Predefined delivery zones for each city
 * These represent common locality/area names within each city
 */
export const CITY_NEIGHBORHOODS = {
  delhi: [
    { name: 'Connaught Place', offset: { lat: 0.01, lng: 0.008 } },
    { name: 'South Delhi', offset: { lat: -0.08, lng: 0.02 } },
    { name: 'North Delhi', offset: { lat: 0.07, lng: 0 } },
    { name: 'East Delhi', offset: { lat: 0, lng: 0.08 } },
    { name: 'West Delhi', offset: { lat: -0.02, lng: -0.1 } }
  ],
  mumbai: [
    { name: 'Bandra', offset: { lat: 0.03, lng: -0.05 } },
    { name: 'Worli', offset: { lat: 0.01, lng: 0.02 } },
    { name: 'Thane', offset: { lat: 0.15, lng: 0.1 } },
    { name: 'Navi Mumbai', offset: { lat: -0.03, lng: 0.03 } },
    { name: 'Virar', offset: { lat: 0.35, lng: -0.08 } }
  ],
  pune: [
    { name: 'Shivaji Nagar', offset: { lat: 0.03, lng: -0.01 } },
    { name: 'Koregaon Park', offset: { lat: 0.015, lng: 0.02 } },
    { name: 'Viman Nagar', offset: { lat: 0.047, lng: 0.046 } },
    { name: 'Hadapsar', offset: { lat: -0.002, lng: 0.072 } },
    { name: 'Warje', offset: { lat: -0.08, lng: 0.06 } }
  ],
  bengaluru: [
    { name: 'Koramangala', offset: { lat: -0.03, lng: 0.05 } },
    { name: 'Indiranagar', offset: { lat: 0.02, lng: 0.06 } },
    { name: 'Whitefield', offset: { lat: 0.05, lng: 0.12 } },
    { name: 'Marathahalli', offset: { lat: 0.02, lng: 0.08 } },
    { name: 'Jayanagar', offset: { lat: -0.03, lng: 0 } }
  ],
  kolkata: [
    { name: 'Ballygunge', offset: { lat: -0.04, lng: 0.02 } },
    { name: 'Alipore', offset: { lat: -0.06, lng: 0.01 } },
    { name: 'Salt Lake', offset: { lat: 0.03, lng: 0.06 } },
    { name: 'Howrah', offset: { lat: 0.032, lng: -0.1 } },
    { name: 'Dakshin Kolkata', offset: { lat: -0.05, lng: 0 } }
  ],
  hyderabad: [
    { name: 'Banjara Hills', offset: { lat: -0.04, lng: 0.03 } },
    { name: 'Jubilee Hills', offset: { lat: -0.02, lng: 0.05 } },
    { name: 'Kukatpally', offset: { lat: 0.03, lng: -0.02 } },
    { name: 'Secunderabad', offset: { lat: -0.014, lng: 0.025 } },
    { name: 'Uppal', offset: { lat: 0.04, lng: 0.08 } }
  ],
  chennai: [
    { name: 'Velachery', offset: { lat: -0.04, lng: 0.02 } },
    { name: 'Mylapore', offset: { lat: -0.05, lng: 0.02 } },
    { name: 'Nungambakkam', offset: { lat: -0.02, lng: -0.01 } },
    { name: 'Guindy', offset: { lat: -0.03, lng: 0.05 } },
    { name: 'Koyambedu', offset: { lat: 0.02, lng: -0.05 } }
  ],
  ahmedabad: [
    { name: 'Ahmedabad West', offset: { lat: -0.02, lng: -0.04 } },
    { name: 'Ahmedabad East', offset: { lat: 0.01, lng: 0.05 } },
    { name: 'Vastrapur', offset: { lat: 0.03, lng: 0 } },
    { name: 'Satellite', offset: { lat: 0.04, lng: 0.03 } },
    { name: 'Bopal', offset: { lat: 0.04, lng: -0.08 } }
  ],
  jaipur: [
    { name: 'C-Scheme', offset: { lat: 0.01, lng: 0.02 } },
    { name: 'Malviya Nagar', offset: { lat: -0.02, lng: 0.03 } },
    { name: 'Tonk Road', offset: { lat: 0.05, lng: -0.01 } },
    { name: 'Vaishali', offset: { lat: -0.05, lng: 0.01 } },
    { name: 'Amer Road', offset: { lat: 0.03, lng: -0.03 } }
  ],
  gurgaon: [
    { name: 'Cyber City', offset: { lat: 0.01, lng: 0.02 } },
    { name: 'MG Road', offset: { lat: -0.01, lng: 0.03 } },
    { name: 'Golf Course Road', offset: { lat: -0.02, lng: 0.01 } },
    { name: 'Manesar', offset: { lat: 0.08, lng: -0.03 } },
    { name: 'South City', offset: { lat: -0.04, lng: 0 } }
  ],
  bhopal: [
    { name: 'Arera Colony', offset: { lat: 0.01, lng: 0.02 } },
    { name: 'Homi Bhabha Nagar', offset: { lat: 0.03, lng: -0.02 } },
    { name: 'TT Nagar', offset: { lat: -0.02, lng: 0.01 } },
    { name: 'Indore Road', offset: { lat: 0.02, lng: -0.05 } },
    { name: 'Bairagarh', offset: { lat: -0.03, lng: 0.03 } }
  ],
  nagpur: [
    { name: 'South Nagpur', offset: { lat: -0.02, lng: 0 } },
    { name: 'Sitabuldi', offset: { lat: -0.01, lng: 0.01 } },
    { name: 'Dharampeth', offset: { lat: 0.01, lng: -0.02 } },
    { name: 'Mankapur', offset: { lat: 0.03, lng: 0.02 } },
    { name: 'Futala', offset: { lat: -0.04, lng: 0.04 } }
  ],
  kochi: [
    { name: 'Fort Kochi', offset: { lat: -0.01, lng: 0.015 } },
    { name: 'Mattancherry', offset: { lat: -0.008, lng: 0.012 } },
    { name: 'Ernakulathappan', offset: { lat: 0.02, lng: -0.02 } },
    { name: 'Kakkanad', offset: { lat: 0.04, lng: 0.05 } },
    { name: 'Palarivattom', offset: { lat: 0.02, lng: 0.01 } }
  ],
  lucknow: [
    { name: 'Hazratganj', offset: { lat: -0.01, lng: 0.02 } },
    { name: 'Gomti Nagar', offset: { lat: 0.02, lng: 0.01 } },
    { name: 'Indira Nagar', offset: { lat: -0.02, lng: -0.01 } },
    { name: 'Alamnagar', offset: { lat: 0.03, lng: 0.03 } },
    { name: 'Rajajipuram', offset: { lat: 0.04, lng: -0.02 } }
  ],
  chandigarh: [
    { name: 'Sector 17', offset: { lat: -0.005, lng: 0.005 } },
    { name: 'Sector 35', offset: { lat: 0.02, lng: -0.02 } },
    { name: 'Sector 43', offset: { lat: 0.03, lng: 0.01 } },
    { name: 'Sector 9', offset: { lat: -0.03, lng: 0.01 } },
    { name: 'Sector 22', offset: { lat: 0, lng: 0.03 } }
  ]
};

/**
 * Generate random delivery stops for a given city
 * @param {Object} city - City object from MAJOR_CITIES
 * @param {number} numberOfStops - Number of delivery stops to generate (default 4)
 * @returns {Array} Array of delivery stop objects
 */
export function generateDeliveryStopsForCity(city, numberOfStops = 4) {
  const neighborhoods = CITY_NEIGHBORHOODS[city.id] || [];
  const stops = [];
  
  // Shuffle neighborhoods and pick random ones
  const shuffled = [...neighborhoods].sort(() => Math.random() - 0.5);
  const selectedNeighborhoods = shuffled.slice(0, Math.min(numberOfStops, neighborhoods.length));

  selectedNeighborhoods.forEach((neighborhood, index) => {
    stops.push({
      id: `stop-${index + 1}`,
      name: neighborhood.name,
      address: `${neighborhood.name}, ${city.name}`,
      latitude: city.latitude + neighborhood.offset.lat,
      longitude: city.longitude + neighborhood.offset.lng,
      type: 'delivery'
    });
  });

  return stops;
}

/**
 * Get city by ID
 * @param {string} cityId - City identifier
 * @returns {Object|null} City object or null if not found
 */
export function getCityById(cityId) {
  return MAJOR_CITIES.find(city => city.id === cityId) || null;
}

/**
 * Get all city IDs
 * @returns {Array} Array of city IDs
 */
export function getCityIds() {
  return MAJOR_CITIES.map(city => city.id);
}

/**
 * Get city options for dropdown/select
 * @returns {Array} Array of objects with id and label for UI rendering
 */
export function getCityOptions() {
  return MAJOR_CITIES.map(city => ({
    value: city.id,
    label: city.name,
    region: city.region
  }));
}
