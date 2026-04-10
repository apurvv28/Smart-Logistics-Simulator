import { createContext, useContext, useState } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  // Stores the last city the user ran in Phase 1 (inter-city destination)
  const [lastInterCityDestination, setLastInterCityDestination] = useState(null);
  // { cityId: 'PUN', cityName: 'Pune', nodeId: 4, algorithmUsed: 'DIJKSTRA' }

  // Stores the last city the user ran in Phase 2 (intra-city selected city)
  const [lastIntraCityData, setLastIntraCityData] = useState(null);
  // { cityId: 'PUN', cityName: 'Pune', nodeId: 4, warehouse: {...}, deliveryAddresses: [...] }

  return (
    <SimulationContext.Provider value={{ 
      lastInterCityDestination, 
      setLastInterCityDestination,
      lastIntraCityData,
      setLastIntraCityData
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulationContext = () => useContext(SimulationContext);
