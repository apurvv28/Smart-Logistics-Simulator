import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Truck, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.DivIcon({
  html: '<div class="p-1 bg-amber-500 rounded-full border-2 border-slate-900 shadow-lg"><svg viewBox="0 0 24 24" width="16" height="16" stroke="white" stroke-width="2" fill="none" class="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-2.48-3.094A1 1 0 0 0 16.52 9H15"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>',
  className: 'truck-div-icon',
  iconSize: [24, 24],
});

export default function FleetTracker({ vehicles = [], nodes = [], activePath = [] }) {
  const pathCoordinates = activePath.map(nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? [node.lat, node.lng] : null;
  }).filter(Boolean);

  return (
    <div className="glass p-6 rounded-3xl h-full flex flex-col gap-4 min-h-[500px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Navigation className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-slate-200">Delivery Fleet Live Tracker</h3>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
        <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {nodes.map(node => (
            <Marker key={node.id} position={[node.lat, node.lng]}>
              <Popup>
                <div className="text-slate-900 font-bold">{node.name}</div>
                <div className="text-xs text-slate-600">{node.type}</div>
              </Popup>
            </Marker>
          ))}

          {pathCoordinates.length > 1 && (
            <Polyline positions={pathCoordinates} color="#06b6d4" weight={4} opacity={0.7} />
          )}

          {vehicles.map(v => {
            const node = nodes.find(n => n.id === v.currentNodeId);
            if (!node) return null;
            return (
              <Marker key={v.id} position={[node.lat, node.lng]} icon={truckIcon}>
                <Popup>
                  <div className="text-slate-900 font-bold">Vehicle: {v.id}</div>
                  <div className="text-xs text-slate-600">Status: {v.status}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {vehicles.map(v => (
          <div key={v.id} className="glass p-3 rounded-xl border border-slate-700/50 flex flex-col gap-1">
            <div className="text-[10px] mono text-slate-500">{v.id}</div>
            <div className={`text-xs font-bold ${v.status === 'IDLE' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {v.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
