import { Link } from 'react-router-dom';

export default function StoryHomePage({ campaign }) {
  const { selectedOrder, statusMessage, stageItems, networkData } = campaign;

  return (
    <div className="space-y-6">
      <section className="story-hero p-6 md:p-8">
        <p className="story-kicker">LogiCore Quest Board</p>
        <h1 className="text-3xl md:text-4xl font-black text-amber-950">From Product Link to Heroic Delivery Journey</h1>
        <p className="mt-3 text-amber-950/80 max-w-3xl">
          Play through the logistics storyline: summon an order, choose intelligent routes, complete delivery,
          and bring returns back to the seller through the exact map path.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="story-btn" to="/mission">Start Mission</Link>
          <Link className="story-btn-secondary" to="/map">Open Adventure Map</Link>
        </div>
      </section>

      {statusMessage && <section className="story-panel">{statusMessage}</section>}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="story-card p-5 lg:col-span-2">
          <h2 className="text-xl font-black text-amber-900">Campaign Progress</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {stageItems.map((stage, idx) => (
              <div key={stage.key} className={`rounded-xl border px-3 py-2 text-sm ${stage.ok ? 'border-emerald-700/40 bg-emerald-100/70 text-emerald-900' : 'border-amber-800/20 bg-amber-50 text-amber-900/80'}`}>
                <span className="font-bold">{idx + 1}.</span> {stage.label}
              </div>
            ))}
          </div>
        </div>

        <div className="story-card p-5">
          <h2 className="text-xl font-black text-amber-900">World Stats</h2>
          <div className="mt-3 space-y-2 text-sm text-amber-900">
            <div className="story-stat"><span>Total Nodes</span><strong>{networkData?.nodeCount || '-'}</strong></div>
            <div className="story-stat"><span>Total Routes</span><strong>{networkData?.edgeCount || '-'}</strong></div>
            <div className="story-stat"><span>Active Order</span><strong>{selectedOrder?.orderId ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>
      </section>

      {selectedOrder && (
        <section className="story-card p-5">
          <h2 className="text-xl font-black text-amber-900">Current Quest Card</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-amber-950">
            <p><b>Order:</b> {selectedOrder.orderId}</p>
            <p><b>Product:</b> {selectedOrder.productName}</p>
            <p><b>Status:</b> {selectedOrder.status}</p>
            <p><b>SLA:</b> {selectedOrder.slaTier}</p>
            <p><b>Algorithm:</b> {selectedOrder.routeAlgorithm || '-'}</p>
            <p><b>Return:</b> {selectedOrder.returnStatus || '-'}</p>
          </div>
        </section>
      )}
    </div>
  );
}
