import StoryMapSimulator from '../components/map/StoryMapSimulator';

export default function MapAndChroniclePage({ campaign }) {
  const { networkData, selectedOrder, algorithmComparison, orders, setSelectedOrder } = campaign;

  return (
    <div className="space-y-5">
      <StoryMapSimulator networkData={networkData} selectedOrder={selectedOrder} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="story-card p-5">
          <h3 className="text-xl font-black text-amber-900">Algorithm Arena</h3>
          {!algorithmComparison && <p className="text-sm text-amber-900/70 mt-2">Run route + compare from Mission page.</p>}
          {algorithmComparison && (
            <div className="mt-3 space-y-3 text-sm">
              <div className="story-panel"><b>Fastest:</b> {algorithmComparison.fastestAlgorithm || '-'}</div>
              <p className="text-xs text-amber-900/70 px-1">
                Path nodes are the final route stops. Search-space nodes are candidates each algorithm evaluated to prove optimality.
              </p>
              {Object.entries(algorithmComparison.algorithms || {}).map(([name, details]) => (
                <div key={name} className="rounded-lg border border-amber-800/20 bg-amber-50 p-3 text-amber-950">
                  <p className="font-bold">{name}</p>
                  <p>Distance: {Number(details.distance || 0).toFixed(2)} km</p>
                  <p>Execution: {details.executionTimeMs} ms</p>
                  <p>Path Nodes: {(details.path || []).length}</p>
                  <p>Search-Space Nodes: {details.nodesExplored}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="story-card p-5">
          <h3 className="text-xl font-black text-amber-900">Chronicle Timeline</h3>
          {!selectedOrder && <p className="text-sm text-amber-900/70 mt-2">Select an order to inspect full story.</p>}
          {selectedOrder && (
            <div className="mt-3 max-h-[400px] overflow-y-auto space-y-2">
              {(selectedOrder.statusHistory || []).map((h, idx) => (
                <div key={`${h.timestamp}-${idx}`} className="rounded-lg border border-amber-800/20 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-bold">{h.status}</p>
                  <p className="text-xs text-amber-900/70">{h.timestamp ? new Date(h.timestamp).toLocaleString() : '-'}</p>
                  <p>{h.remarks}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">Switch Order</p>
            <div className="max-h-[180px] overflow-y-auto space-y-1">
              {orders.map((o) => (
                <button key={o.orderId} className="w-full text-left rounded-md border border-amber-800/20 bg-amber-50 px-2 py-1 text-xs text-amber-950" onClick={() => setSelectedOrder(o)}>
                  {o.orderId} | {o.status}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
