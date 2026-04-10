export const CITY_DATA = {
  DEL: {
    id: 'DEL', name: 'Delhi', nodeId: 0,
    warehouse: { id: 'warehouse', name: 'Delhi Central Hub', latitude: 28.7041, longitude: 77.1025 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Connaught Place', address: 'B-Block, CP, New Delhi', latitude: 28.6327, longitude: 77.2197 },
      { id: 'addr2', name: 'Aerocity Hub', address: 'Asset 13, Aerocity, Delhi', latitude: 28.5505, longitude: 77.1216 },
      { id: 'addr3', name: 'Rohini Sector 7', address: 'Pocket 5, Rohini, Delhi', latitude: 28.7161, longitude: 77.1158 },
      { id: 'addr4', name: 'South Ext', address: 'Main Market, South Ext II, Delhi', latitude: 28.5683, longitude: 77.2203 }
    ]
  },
  MUM: {
    id: 'MUM', name: 'Mumbai', nodeId: 3,
    warehouse: { id: 'warehouse', name: 'Mumbai Logistics Hub', latitude: 19.0760, longitude: 72.8777 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Bandra West', address: 'Linking Road, Bandra, Mumbai', latitude: 19.0607, longitude: 72.8362 },
      { id: 'addr2', name: 'Andheri East', address: 'MIDC Industry Estate, Mumbai', latitude: 19.1176, longitude: 72.8631 },
      { id: 'addr3', name: 'Worli Sealink', address: 'Annie Besant Rd, Worli, Mumbai', latitude: 19.0176, longitude: 72.8161 },
      { id: 'addr4', name: 'Powai Hiranandani', address: 'Central Ave, Powai, Mumbai', latitude: 19.1176, longitude: 72.9060 }
    ]
  },
  BLR: {
    id: 'BLR', name: 'Bangalore', nodeId: 9,
    warehouse: { id: 'warehouse', name: 'Bengaluru Distribution Center', latitude: 12.9716, longitude: 77.5946 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Indiranagar', address: '100ft Road, Indiranagar, Bangalore', latitude: 12.9719, longitude: 77.6412 },
      { id: 'addr2', name: 'Koramangala', address: '5th Block, Koramangala, Bangalore', latitude: 12.9352, longitude: 77.6245 },
      { id: 'addr3', name: 'Whitefield ITPL', address: 'ITPL Main Rd, Whitefield, Bangalore', latitude: 12.9845, longitude: 77.7376 },
      { id: 'addr4', name: 'Electronic City', address: 'Phase 1, Electronic City, Bangalore', latitude: 12.8452, longitude: 77.6635 }
    ]
  },
  HYD: {
    id: 'HYD', name: 'Hyderabad', nodeId: 10,
    warehouse: { id: 'warehouse', name: 'Hyderabad Hub', latitude: 17.3850, longitude: 78.4867 },
    deliveryAddresses: [
      { id: 'addr1', name: 'HITEC City', address: 'Madhapur, Hyderabad', latitude: 17.4483, longitude: 78.3708 },
      { id: 'addr2', name: 'Banjara Hills', address: 'Road No. 1, Hyderabad', latitude: 17.4123, longitude: 78.4418 },
      { id: 'addr3', name: 'Gachibowli', address: 'DLF Cyber City, Hyderabad', latitude: 17.4401, longitude: 78.3489 },
      { id: 'addr4', name: 'Secunderabad', address: 'MG Road, Hyderabad', latitude: 17.4399, longitude: 78.4983 }
    ]
  },
  PUN: {
    id: 'PUN', name: 'Pune', nodeId: 4,
    warehouse: { id: 'warehouse', name: 'Pune Logistics Hub', latitude: 18.5204, longitude: 73.8567 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Hinjewadi Tech Park', address: 'Phase 1, Hinjewadi, Pune', latitude: 18.5912, longitude: 73.7719 },
      { id: 'addr2', name: 'Koregaon Park', address: 'Koregaon Park, Pune', latitude: 18.5384, longitude: 73.8903 },
      { id: 'addr3', name: 'Baner', address: 'Baner, Pune', latitude: 18.5596, longitude: 73.8142 },
      { id: 'addr4', name: 'Viman Nagar', address: 'Viman Nagar, Pune', latitude: 18.4674, longitude: 73.9162 }
    ]
  },
  JAI: {
    id: 'JAI', name: 'Jaipur', nodeId: 18,
    warehouse: { id: 'warehouse', name: 'Jaipur Pink City Hub', latitude: 26.9124, longitude: 75.7873 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Malviya Nagar', address: 'GT Road, Jaipur', latitude: 26.8546, longitude: 75.8052 },
      { id: 'addr2', name: 'C-Scheme', address: 'Bhagwan Das Rd, Jaipur', latitude: 26.9110, longitude: 75.8030 },
      { id: 'addr3', name: 'Vaishali Nagar', address: 'Queens Rd, Jaipur', latitude: 26.9050, longitude: 75.7483 },
      { id: 'addr4', name: 'Mansarovar', address: 'Metro Stn Rd, Jaipur', latitude: 26.8770, longitude: 75.7600 }
    ]
  },
  CHN: {
    id: 'CHN', name: 'Chennai', nodeId: 12,
    warehouse: { id: 'warehouse', name: 'Chennai Port Warehouse', latitude: 13.0827, longitude: 80.2707 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Adyar', address: 'Gandhi Nagar, Chennai', latitude: 13.0067, longitude: 80.2578 },
      { id: 'addr2', name: 'OMR IT Corridor', address: 'Sholinganallur, Chennai', latitude: 12.8996, longitude: 80.2209 },
      { id: 'addr3', name: 'T. Nagar', address: 'Pondy Bazaar, Chennai', latitude: 13.0418, longitude: 80.2341 },
      { id: 'addr4', name: 'Anna Nagar', address: '2nd Avenue, Chennai', latitude: 13.0850, longitude: 80.2101 }
    ]
  },
  KOL: {
    id: 'KOL', name: 'Kolkata', nodeId: 6,
    warehouse: { id: 'warehouse', name: 'Kolkata East Terminal', latitude: 22.5726, longitude: 88.3639 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Salt Lake Sec V', address: 'Electronics Complex, Kolkata', latitude: 22.5735, longitude: 88.4331 },
      { id: 'addr2', name: 'Park Street', address: 'Mother Teresa Sarani, Kolkata', latitude: 22.5473, longitude: 88.3532 },
      { id: 'addr3', name: 'New Town', address: 'Action Area I, Kolkata', latitude: 22.5867, longitude: 88.4750 },
      { id: 'addr4', name: 'Ballygunge', address: 'Rash Behari Ave, Kolkata', latitude: 22.5244, longitude: 88.3650 }
    ]
  },
  AHM: {
    id: 'AHM', name: 'Ahmedabad', nodeId: 15,
    warehouse: { id: 'warehouse', name: 'Ahmedabad Logistics Park', latitude: 23.0225, longitude: 72.5714 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Satellite area', address: 'Shivranjani Cross Rd, Ahmedabad', latitude: 23.0298, longitude: 72.5273 },
      { id: 'addr2', name: 'SG Highway', address: 'Prahlad Nagar, Ahmedabad', latitude: 23.0120, longitude: 72.5020 },
      { id: 'addr3', name: 'Navrangpura', address: 'C.G. Road, Ahmedabad', latitude: 23.0373, longitude: 72.5613 },
      { id: 'addr4', name: 'Maninagar', address: 'LG Corner, Ahmedabad', latitude: 22.9977, longitude: 72.6015 }
    ]
  },
  BHO: {
    id: 'BHO', name: 'Bhopal', nodeId: 21,
    warehouse: { id: 'warehouse', name: 'Bhopal Hub', latitude: 23.2599, longitude: 77.4126 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Arera Colony', address: 'E-Block, Bhopal', latitude: 23.2167, longitude: 77.4333 },
      { id: 'addr2', name: 'MP Nagar', address: 'Zone-I, Bhopal', latitude: 23.2333, longitude: 77.4333 },
      { id: 'addr3', name: 'New Market', address: 'TT Nagar, Bhopal', latitude: 23.2450, longitude: 77.4050 },
      { id: 'addr4', name: 'Indrapuri', address: 'BHEL side, Bhopal', latitude: 23.2550, longitude: 77.4650 }
    ]
  },
  NAG: {
    id: 'NAG', name: 'Nagpur', nodeId: 22,
    warehouse: { id: 'warehouse', name: 'Nagpur Central Hub', latitude: 21.1458, longitude: 79.0882 },
    deliveryAddresses: [
      { id: 'addr1', name: 'Sitabuldi Market', address: 'Variety Square, Nagpur', latitude: 21.1466, longitude: 79.0818 },
      { id: 'addr2', name: 'Dharampeth', address: 'WHC Road, Nagpur', latitude: 21.1413, longitude: 79.0664 },
      { id: 'addr3', name: 'MIHAN SEZ', address: 'Wardha Rd, Nagpur', latitude: 21.0661, longitude: 79.0560 },
      { id: 'addr4', name: 'Itwari', address: 'Central Ave, Nagpur', latitude: 21.1550, longitude: 79.1080 }
    ]
  }
};
