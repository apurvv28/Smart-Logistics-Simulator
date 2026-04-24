import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_DATA } from '../../data/cityData';

const nodeIcon = (labelColor) =>
  new L.DivIcon({
    html: `<div style="width:16px;height:16px;border-radius:999px;background:${labelColor};border:2px solid #fff5d6;"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

const parcelIcon = new L.DivIcon({
  html: '<div style="font-size:20px;filter: drop-shadow(0 0 4px rgba(0,0,0,.45));">🚚</div>',
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const getNodeColor = (type) => {
  if (type === 'WAREHOUSE') return '#8b5a2b';
  if (type === 'HUB') return '#2b6f8b';
  return '#4f7f3a';
};

export default function StoryMapSimulator({ networkData, selectedOrder }) {
  const [mode, setMode] = useState('auto');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const findNodeFromText = (value, nameMap, allNodes) => {
    if (!value) return null;
    const key = String(value).toLowerCase();
    const exact = nameMap.get(key);
    if (exact) return exact;
    return allNodes.find((n) => key.includes(String(n.name || '').toLowerCase())) || null;
  };

  const fallbackNodes = useMemo(
    () =>
      Object.values(CITY_DATA).map((city) => ({
        id: city.nodeId,
        nodeId: city.nodeId,
        name: city.name,
        type: 'HUB',
        lat: city.coordinates.lat,
        lng: city.coordinates.lng,
      })),
    []
  );

  const displayNodes = useMemo(() => {
    if (Array.isArray(networkData?.nodes) && networkData.nodes.length > 0) {
      return networkData.nodes;
    }
    return fallbackNodes;
  }, [networkData, fallbackNodes]);

  const nodesById = useMemo(() => {
    const map = new Map();
    displayNodes.forEach((n) => {
      map.set(String(n.id), n);
      if (n.nodeId !== undefined) {
        map.set(String(n.nodeId), n);
      }
    });
    return map;
  }, [displayNodes]);

  const nodesByName = useMemo(() => {
    const map = new Map();
    displayNodes.forEach((n) => {
      map.set(String(n.name || '').toLowerCase(), n);
    });
    return map;
  }, [displayNodes]);

  const routeMode = useMemo(() => {
    if (mode !== 'auto') return mode;
    const status = String(selectedOrder?.status || '');
    if (status.startsWith('RETURN') || status === 'RETURNED') return 'return';
    return 'delivery';
  }, [mode, selectedOrder]);

  const activeRoute = useMemo(() => {
    if (!selectedOrder) return [];
    if (routeMode === 'return') return selectedOrder.returnRoute || [];
    return selectedOrder.plannedRoute || [];
  }, [selectedOrder, routeMode]);

  const routeCoordinates = useMemo(() => {
    if (activeRoute.length > 0) {
      return activeRoute
        .map((id) => nodesById.get(String(id)))
        .filter(Boolean)
        .map((n) => [n.lat, n.lng]);
    }

    const waypoints = selectedOrder?.waypoints || selectedOrder?.routeData?.waypoints;
    if (Array.isArray(waypoints) && waypoints.length > 1) {
      return waypoints
        .map((name) => findNodeFromText(name, nodesByName, displayNodes))
        .filter(Boolean)
        .map((n) => [n.lat, n.lng]);
    }

    const sourceNode = findNodeFromText(selectedOrder?.source, nodesByName, displayNodes);
    const destinationNode = findNodeFromText(selectedOrder?.destination, nodesByName, displayNodes);
    if (sourceNode && destinationNode) {
      return [
        [sourceNode.lat, sourceNode.lng],
        [destinationNode.lat, destinationNode.lng],
      ];
    }

    return [];
  }, [activeRoute, nodesById, selectedOrder, nodesByName, displayNodes]);

  useEffect(() => {
    setCursor(0);
    setPlaying(false);
  }, [routeMode, selectedOrder?.orderId]);

  useEffect(() => {
    if (!playing || routeCoordinates.length < 2) return undefined;
    const timer = setInterval(() => {
      setCursor((prev) => {
        if (prev >= routeCoordinates.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [playing, routeCoordinates]);

  const currentCoord = routeCoordinates[Math.min(cursor, Math.max(0, routeCoordinates.length - 1))];
  const canPlay = routeCoordinates.length > 1;

  const handlePlayPause = () => {
    if (!canPlay) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (cursor >= routeCoordinates.length - 1) {
      setCursor(0);
    }
    setPlaying(true);
  };

  return (
    <section className="story-card p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#121212]">Operations Map</h2>
          <p className="text-sm text-[#4f4f4f]">Watch exact movement across the India logistics map.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={`story-chip ${routeMode === 'delivery' ? 'story-chip-active' : ''}`} onClick={() => setMode('delivery')}>Delivery Quest</button>
          <button className={`story-chip ${routeMode === 'return' ? 'story-chip-active' : ''}`} onClick={() => setMode('return')}>Return Quest</button>
          <button className="story-chip" onClick={() => setMode('auto')}>Auto</button>
          <button className="story-btn" onClick={handlePlayPause} disabled={!canPlay}>
            {playing ? 'Pause Journey' : 'Play Journey'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-[#dfdfd7] h-[480px] bg-[#f2f2ef]">
        <MapContainer center={[22.5, 79.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri'
          />

          {displayNodes.map((node) => (
            <Marker key={node.id} position={[node.lat, node.lng]} icon={nodeIcon(getNodeColor(node.type))}>
              <Popup>
                <b>{node.name}</b><br />
                {node.type}
              </Popup>
            </Marker>
          ))}

          {routeCoordinates.length > 1 && (
            <Polyline positions={routeCoordinates} color={routeMode === 'return' ? '#d72638' : '#c8a44d'} weight={5} opacity={0.85} />
          )}

          {currentCoord && (
            <Marker position={currentCoord} icon={parcelIcon}>
              <Popup>
                <b>{routeMode === 'return' ? 'Return Transit' : 'Delivery Transit'}</b><br />
                Step {Math.min(cursor + 1, routeCoordinates.length)} of {routeCoordinates.length}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {activeRoute.length > 0 && (
        <div className="story-panel text-sm text-[#121212]">
          <span className="font-bold">Path Nodes:</span> {activeRoute.join(' -> ')}
        </div>
      )}
    </section>
  );
}
