function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-amber-900 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      />
    </div>
  );
}

function Action({ label, onClick, disabled }) {
  return (
    <button className="story-btn w-full disabled:opacity-50" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

export default function MissionControlPage({ campaign }) {
  const {
    form,
    setForm,
    selectedOrder,
    returnReason,
    setReturnReason,
    loading,
    actions
  } = campaign;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <section className="story-card p-5 xl:col-span-2 space-y-4">
        <h2 className="text-2xl font-black text-amber-900">Mission Intake</h2>
        <p className="text-sm text-amber-900/70">Create an order and command each mission stage.</p>

        <InputField label="Product URL" value={form.productUrl} onChange={(v) => setForm({ ...form, productUrl: v })} placeholder="https://www.amazon.in/..." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField label="Product SKU" value={form.productSku} onChange={(v) => setForm({ ...form, productSku: v })} />
          <InputField label="Product Name" value={form.productName} onChange={(v) => setForm({ ...form, productName: v })} />
          <InputField label="Weight (kg)" type="number" value={form.weight} onChange={(v) => setForm({ ...form, weight: Number(v) })} />
          <InputField label="Price (INR)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: Number(v) })} />
          <InputField label="Customer Name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
          <InputField label="Customer Email" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} />
          <InputField label="Delivery Pincode" value={form.deliveryPincode} onChange={(v) => setForm({ ...form, deliveryPincode: v })} />
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">SLA Tier</label>
            <select value={form.slaTier} onChange={(e) => setForm({ ...form, slaTier: e.target.value })} className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <option value="STANDARD">STANDARD</option>
              <option value="EXPRESS">EXPRESS</option>
              <option value="SAME_DAY">SAME_DAY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-1">Delivery Address</label>
          <textarea rows={3} value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Action label={loading ? 'Working...' : '1) Create Order'} onClick={actions.handleCreateOrder} disabled={loading} />
          <Action label="2) Process & Route" onClick={actions.handleProcessRoute} disabled={!selectedOrder || loading} />
          <Action label="3) Compare Algorithms" onClick={actions.handleCompareAlgorithms} disabled={!selectedOrder?.plannedRoute || loading} />
          <Action label="4) Simulate Delivery" onClick={actions.handleSimulateDelivery} disabled={!selectedOrder?.plannedRoute || loading} />
          <Action label="5) Initiate Return" onClick={actions.handleInitiateReturn} disabled={selectedOrder?.status !== 'DELIVERED' || loading} />
          <Action label="6) Pickup & Return To Seller" onClick={actions.handleProcessReturn} disabled={!selectedOrder?.isReturn || selectedOrder?.status === 'RETURNED' || loading} />
        </div>
      </section>

      <section className="story-card p-5 space-y-4">
        <h2 className="text-xl font-black text-amber-900">Mission Log</h2>
        {selectedOrder ? (
          <div className="space-y-2 text-sm text-amber-950">
            <p><b>Order:</b> {selectedOrder.orderId}</p>
            <p><b>Status:</b> {selectedOrder.status}</p>
            <p><b>Return Status:</b> {selectedOrder.returnStatus || '-'}</p>
            <p><b>Pickup Node:</b> {selectedOrder.pickupNodeId}</p>
            <p><b>Delivery Node:</b> {selectedOrder.deliveryNodeId}</p>
            <p><b>Return Node:</b> {selectedOrder.returnNodeId || '-'}</p>
            <p><b>Algorithm:</b> {selectedOrder.routeAlgorithm || '-'}</p>
          </div>
        ) : (
          <p className="text-sm text-amber-900/70">No active mission yet.</p>
        )}

        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-1">Return Reason</label>
          <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <option>Not as described</option>
            <option>Damaged in transit</option>
            <option>Wrong item received</option>
            <option>Changed mind</option>
            <option>Other</option>
          </select>
        </div>
      </section>
    </div>
  );
}
