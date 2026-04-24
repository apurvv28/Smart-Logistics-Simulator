export const CITY_DATA = {
  DEL: {
    id: 'DEL',
    name: 'Delhi',
    nodeId: 0,
    coordinates: { lat: 28.7041, lng: 77.1025 },
    warehouseLocations: [
      { id: 'DEL-NORTH', name: 'North Delhi Warehouse', lat: 28.7249, lng: 77.1501, latitude: 28.7249, longitude: 77.1501, address: 'Shalimar Bagh Logistics Depot' },
      { id: 'DEL-SOUTH', name: 'South Delhi Fulfillment Center', lat: 28.5244, lng: 77.2208, latitude: 28.5244, longitude: 77.2208, address: 'Saket Delivery Hub' },
      { id: 'DEL-EAST', name: 'East Delhi Distribution Hub', lat: 28.6448, lng: 77.3136, latitude: 28.6448, longitude: 77.3136, address: 'Laxmi Nagar Logistics Park' }
    ],
    warehouse: { id: 'DEL-NORTH', name: 'North Delhi Warehouse', lat: 28.7249, lng: 77.1501, latitude: 28.7249, longitude: 77.1501, address: 'Shalimar Bagh Logistics Depot' }
  },
  MUM: {
    id: 'MUM',
    name: 'Mumbai',
    nodeId: 3,
    coordinates: { lat: 19.0760, lng: 72.8777 },
    warehouseLocations: [
      { id: 'MUM-EAST', name: 'Navi Mumbai Warehouse', lat: 19.0620, lng: 73.0300, latitude: 19.0620, longitude: 73.0300, address: 'Vashi Logistics Park' },
      { id: 'MUM-WEST', name: 'Andheri West Fulfillment', lat: 19.1187, lng: 72.8458, latitude: 19.1187, longitude: 72.8458, address: 'Andheri West Distribution Hub' },
      { id: 'MUM-THN', name: 'Thane City Hub', lat: 19.2183, lng: 72.9781, latitude: 19.2183, longitude: 72.9781, address: 'Thane Industrial Estate' }
    ],
    warehouse: { id: 'MUM-EAST', name: 'Navi Mumbai Warehouse', lat: 19.0620, lng: 73.0300, latitude: 19.0620, longitude: 73.0300, address: 'Vashi Logistics Park' }
  },
  BLR: {
    id: 'BLR',
    name: 'Bengaluru',
    nodeId: 9,
    coordinates: { lat: 12.9716, lng: 77.5946 },
    warehouseLocations: [
      { id: 'BLR-YSP', name: 'Yeshwanthpur Warehouse', lat: 13.0305, lng: 77.5560, latitude: 13.0305, longitude: 77.5560, address: 'Yeshwanthpur Logistics Center' },
      { id: 'BLR-WFD', name: 'Whitefield Fulfillment', lat: 12.9719, lng: 77.7411, latitude: 12.9719, longitude: 77.7411, address: 'Whitefield Distribution Hub' },
      { id: 'BLR-ECL', name: 'Electronic City Hub', lat: 12.8391, lng: 77.6770, latitude: 12.8391, longitude: 77.6770, address: 'Electronic City Supply Yard' }
    ],
    warehouse: { id: 'BLR-YSP', name: 'Yeshwanthpur Warehouse', lat: 13.0305, lng: 77.5560, latitude: 13.0305, longitude: 77.5560, address: 'Yeshwanthpur Logistics Center' }
  },
  HYD: {
    id: 'HYD',
    name: 'Hyderabad',
    nodeId: 10,
    coordinates: { lat: 17.3850, lng: 78.4867 },
    warehouseLocations: [
      { id: 'HYD-GCB', name: 'Gachibowli Hub', lat: 17.4435, lng: 78.3772, latitude: 17.4435, longitude: 78.3772, address: 'Gachibowli Logistics Yard' },
      { id: 'HYD-KCK', name: 'Kukatpally Warehouse', lat: 17.4498, lng: 78.3959, latitude: 17.4498, longitude: 78.3959, address: 'Kukatpally Fulfillment Center' },
      { id: 'HYD-SCB', name: 'Secunderabad Distribution', lat: 17.4391, lng: 78.4983, latitude: 17.4391, longitude: 78.4983, address: 'Secunderabad Supply Hub' }
    ],
    warehouse: { id: 'HYD-GCB', name: 'Gachibowli Hub', lat: 17.4435, lng: 78.3772, latitude: 17.4435, longitude: 78.3772, address: 'Gachibowli Logistics Yard' }
  },
  PUN: {
    id: 'PUN',
    name: 'Pune',
    nodeId: 4,
    coordinates: { lat: 18.5204, lng: 73.8567 },
    warehouseLocations: [
      { id: 'PUN-HDP', name: 'Hadapsar Warehouse', lat: 18.5111, lng: 73.9367, latitude: 18.5111, longitude: 73.9367, address: 'Hadapsar Logistics Park' },
      { id: 'PUN-PPC', name: 'Pimpri-Chinchwad Hub', lat: 18.6270, lng: 73.8120, latitude: 18.6270, longitude: 73.8120, address: 'Pimpri-Chinchwad Fulfillment Center' },
      { id: 'PUN-KHD', name: 'Kharadi Distribution', lat: 18.5304, lng: 73.9367, latitude: 18.5304, longitude: 73.9367, address: 'Kharadi Delivery Depot' }
    ],
    warehouse: { id: 'PUN-HDP', name: 'Hadapsar Warehouse', lat: 18.5111, lng: 73.9367, latitude: 18.5111, longitude: 73.9367, address: 'Hadapsar Logistics Park' }
  },
  JAI: {
    id: 'JAI',
    name: 'Jaipur',
    nodeId: 18,
    coordinates: { lat: 26.9124, lng: 75.7873 },
    warehouseLocations: [
      { id: 'JAI-SIT', name: 'Sitapura Warehouse', lat: 26.8081, lng: 75.7839, latitude: 26.8081, longitude: 75.7839, address: 'Sitapura Logistics Zone' },
      { id: 'JAI-MAL', name: 'Malviya Nagar Hub', lat: 26.8546, lng: 75.8052, latitude: 26.8546, longitude: 75.8052, address: 'Malviya Nagar Fulfillment Center' },
      { id: 'JAI-TON', name: 'Tonk Road Distribution', lat: 26.8947, lng: 75.7932, latitude: 26.8947, longitude: 75.7932, address: 'Tonk Road Delivery Hub' }
    ],
    warehouse: { id: 'JAI-SIT', name: 'Sitapura Warehouse', lat: 26.8081, lng: 75.7839, latitude: 26.8081, longitude: 75.7839, address: 'Sitapura Logistics Zone' }
  },
  CHN: {
    id: 'CHN',
    name: 'Chennai',
    nodeId: 12,
    coordinates: { lat: 13.0827, lng: 80.2707 },
    warehouseLocations: [
      { id: 'CHN-PRG', name: 'Perungudi Hub', lat: 12.9784, lng: 80.2355, latitude: 12.9784, longitude: 80.2355, address: 'Perungudi Logistics Center' },
      { id: 'CHN-AMB', name: 'Ambattur Distribution', lat: 13.1166, lng: 80.1800, latitude: 13.1166, longitude: 80.1800, address: 'Ambattur Fulfillment Park' },
      { id: 'CHN-TMB', name: 'Tambaram Warehouse', lat: 12.9230, lng: 80.1652, latitude: 12.9230, longitude: 80.1652, address: 'Tambaram Delivery Hub' }
    ],
    warehouse: { id: 'CHN-PRG', name: 'Perungudi Hub', lat: 12.9784, lng: 80.2355, latitude: 12.9784, longitude: 80.2355, address: 'Perungudi Logistics Center' }
  },
  KOL: {
    id: 'KOL',
    name: 'Kolkata',
    nodeId: 6,
    coordinates: { lat: 22.5726, lng: 88.3639 },
    warehouseLocations: [
      { id: 'KOL-SLK', name: 'Salt Lake Warehouse', lat: 22.5770, lng: 88.4149, latitude: 22.5770, longitude: 88.4149, address: 'Salt Lake Logistics Hub' },
      { id: 'KOL-HWR', name: 'Howrah Fulfillment Center', lat: 22.5867, lng: 88.3294, latitude: 22.5867, longitude: 88.3294, address: 'Howrah Distribution Depot' },
      { id: 'KOL-GAR', name: 'Garia Distribution', lat: 22.4911, lng: 88.3780, latitude: 22.4911, longitude: 88.3780, address: 'Garia Delivery Park' }
    ],
    warehouse: { id: 'KOL-SLK', name: 'Salt Lake Warehouse', lat: 22.5770, lng: 88.4149, latitude: 22.5770, longitude: 88.4149, address: 'Salt Lake Logistics Hub' }
  },
  AHM: {
    id: 'AHM',
    name: 'Ahmedabad',
    nodeId: 15,
    coordinates: { lat: 23.0225, lng: 72.5714 },
    warehouseLocations: [
      { id: 'AHM-VAS', name: 'Vastrapur Warehouse', lat: 23.0389, lng: 72.5170, latitude: 23.0389, longitude: 72.5170, address: 'Vastrapur Logistics Yard' },
      { id: 'AHM-BPL', name: 'Bopal Fulfillment Hub', lat: 23.0308, lng: 72.4777, latitude: 23.0308, longitude: 72.4777, address: 'Bopal Distribution Center' },
      { id: 'AHM-NAR', name: 'Naroda Distribution', lat: 23.0775, lng: 72.6390, latitude: 23.0775, longitude: 72.6390, address: 'Naroda Delivery Hub' }
    ],
    warehouse: { id: 'AHM-VAS', name: 'Vastrapur Warehouse', lat: 23.0389, lng: 72.5170, latitude: 23.0389, longitude: 72.5170, address: 'Vastrapur Logistics Yard' }
  },
  BHO: {
    id: 'BHO',
    name: 'Bhopal',
    nodeId: 21,
    coordinates: { lat: 23.2599, lng: 77.4126 },
    warehouseLocations: [
      { id: 'BHO-KLR', name: 'Kolar Road Warehouse', lat: 23.2365, lng: 77.4320, latitude: 23.2365, longitude: 77.4320, address: 'Kolar Road Logistics Hub' },
      { id: 'BHO-HBR', name: 'Hoshangabad Road Hub', lat: 23.2456, lng: 77.4153, latitude: 23.2456, longitude: 77.4153, address: 'Hoshangabad Road Distribution Center' }
    ],
    warehouse: { id: 'BHO-KLR', name: 'Kolar Road Warehouse', lat: 23.2365, lng: 77.4320, latitude: 23.2365, longitude: 77.4320, address: 'Kolar Road Logistics Hub' }
  },
  NAG: {
    id: 'NAG',
    name: 'Nagpur',
    nodeId: 22,
    coordinates: { lat: 21.1458, lng: 79.0882 },
    warehouseLocations: [
      { id: 'NAG-HGR', name: 'Hingna Road Warehouse', lat: 21.1119, lng: 79.0750, latitude: 21.1119, longitude: 79.0750, address: 'Hingna Road Logistics Park' },
      { id: 'NAG-WRD', name: 'Wardha Road Fulfillment', lat: 21.1090, lng: 79.1006, latitude: 21.1090, longitude: 79.1006, address: 'Wardha Road Delivery Depot' }
    ],
    warehouse: { id: 'NAG-HGR', name: 'Hingna Road Warehouse', lat: 21.1119, lng: 79.0750, latitude: 21.1119, longitude: 79.0750, address: 'Hingna Road Logistics Park' }
  },
  LKO: {
    id: 'LKO',
    name: 'Lucknow',
    nodeId: 43,
    coordinates: { lat: 26.8467, lng: 80.9462 },
    warehouseLocations: [
      { id: 'LKO-GMN', name: 'Gomti Nagar Hub', lat: 26.8575, lng: 80.9730, latitude: 26.8575, longitude: 80.9730, address: 'Gomti Nagar Logistics Center' },
      { id: 'LKO-ALN', name: 'Aliganj Distribution', lat: 26.9020, lng: 80.9305, latitude: 26.9020, longitude: 80.9305, address: 'Aliganj Fulfillment Hub' },
      { id: 'LKO-INR', name: 'Indira Nagar Warehouse', lat: 26.8526, lng: 80.9363, latitude: 26.8526, longitude: 80.9363, address: 'Indira Nagar Delivery Yard' }
    ],
    warehouse: { id: 'LKO-GMN', name: 'Gomti Nagar Hub', lat: 26.8575, lng: 80.9730, latitude: 26.8575, longitude: 80.9730, address: 'Gomti Nagar Logistics Center' }
  },
  PAT: {
    id: 'PAT',
    name: 'Patna',
    nodeId: 46,
    coordinates: { lat: 25.5941, lng: 85.1376 },
    warehouseLocations: [
      { id: 'PAT-BRD', name: 'Boring Road Warehouse', lat: 25.6186, lng: 85.1186, latitude: 25.6186, longitude: 85.1186, address: 'Boring Road Logistics Hub' },
      { id: 'PAT-RJN', name: 'Rajendra Nagar Hub', lat: 25.5999, lng: 85.1666, latitude: 25.5999, longitude: 85.1666, address: 'Rajendra Nagar Fulfillment Center' }
    ],
    warehouse: { id: 'PAT-BRD', name: 'Boring Road Warehouse', lat: 25.6186, lng: 85.1186, latitude: 25.6186, longitude: 85.1186, address: 'Boring Road Logistics Hub' }
  },
  SUR: {
    id: 'SUR',
    name: 'Surat',
    nodeId: 42,
    coordinates: { lat: 21.1702, lng: 72.8311 },
    warehouseLocations: [
      { id: 'SUR-ADJ', name: 'Adajan Warehouse', lat: 21.1888, lng: 72.8106, latitude: 21.1888, longitude: 72.8106, address: 'Adajan Logistics Park' },
      { id: 'SUR-UDH', name: 'Udhna Fulfillment', lat: 21.1570, lng: 72.8508, latitude: 21.1570, longitude: 72.8508, address: 'Udhna Distribution Hub' }
    ],
    warehouse: { id: 'SUR-ADJ', name: 'Adajan Warehouse', lat: 21.1888, lng: 72.8106, latitude: 21.1888, longitude: 72.8106, address: 'Adajan Logistics Park' }
  },
  IND: {
    id: 'IND',
    name: 'Indore',
    nodeId: 45,
    coordinates: { lat: 22.7196, lng: 75.8577 },
    warehouseLocations: [
      { id: 'IND-MN10', name: 'MR-10 Warehouse', lat: 22.7336, lng: 75.8918, latitude: 22.7336, longitude: 75.8918, address: 'MR-10 Logistics Center' },
      { id: 'IND-RAU', name: 'Rau Hub', lat: 22.6393, lng: 75.8116, latitude: 22.6393, longitude: 75.8116, address: 'Rau Fulfillment Depot' }
    ],
    warehouse: { id: 'IND-MN10', name: 'MR-10 Warehouse', lat: 22.7336, lng: 75.8918, latitude: 22.7336, longitude: 75.8918, address: 'MR-10 Logistics Center' }
  },
  AGR: {
    id: 'AGR',
    name: 'Agra',
    nodeId: 48,
    coordinates: { lat: 27.1767, lng: 78.0081 },
    warehouseLocations: [
      { id: 'AGR-TAJ', name: 'Tajganj Warehouse', lat: 27.1637, lng: 78.0381, latitude: 27.1637, longitude: 78.0381, address: 'Tajganj Logistics Hub' },
      { id: 'AGR-FTR', name: 'Fatehabad Road Hub', lat: 27.1381, lng: 78.0006, latitude: 27.1381, longitude: 78.0006, address: 'Fatehabad Road Fulfillment Center' }
    ],
    warehouse: { id: 'AGR-TAJ', name: 'Tajganj Warehouse', lat: 27.1637, lng: 78.0381, latitude: 27.1637, longitude: 78.0381, address: 'Tajganj Logistics Hub' }
  }
};
