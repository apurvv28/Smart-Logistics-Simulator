import React, { useMemo, useState, useEffect } from 'react';
import { useCampaignState } from '../hooks/useCampaignState';

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

function ActionButton({ label, onClick, disabled, loading }) {
  return (
    <button
      className="story-btn w-full disabled:opacity-50 disabled:cursor-not-allowed transition"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: disabled ? '#b0bec5' : '#1a6b8a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Toast({ message, type, visible }) {
  return (
    visible && (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '14px 24px',
          borderRadius: '10px',
          backgroundColor: type === 'success' ? '#2e7d32' : '#c62828',
          color: 'white',
          fontWeight: '600',
          fontSize: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease',
        }}
      >
        {message}
      </div>
    )
  );
}

const STAGE_COLORS = {
  PLACED: '#e8f4fd',
  WAREHOUSE_PICKED: '#e8f4fd',
  DISPATCHED: '#e8f4fd',
  IN_TRANSIT: '#e8f4fd',
  DELIVERED: '#e8f4fd',
  RETURN_INITIATED: '#fff3e0',
  PICKED_UP: '#fff3e0',
};

function AlgorithmArenaPanel({ data }) {
  const algorithms = data?.algorithms || [
    { name: 'A*', distanceKm: 208.80, executionMs: 0, pathNodes: 2, searchNodes: 3 },
    { name: 'Floyd-Warshall', distanceKm: 208.80, executionMs: 1, pathNodes: 2, searchNodes: 42 },
    { name: 'Dijkstra', distanceKm: 208.80, executionMs: 0, pathNodes: 2, searchNodes: 5 },
    { name: 'Bellman-Ford', distanceKm: 208.80, executionMs: 7, pathNodes: 2, searchNodes: 42 },
  ];

  const fastest = algorithms.reduce((a, b) =>
    a.executionMs <= b.executionMs ? a : b
  );

  return (
    <div style={{
      background: '#fdf8f0',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e0d5c0',
    }}>
      <h2 style={{
        color: '#5a3e1b',
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        marginBottom: '16px',
        fontWeight: 'bold',
        marginTop: '0',
      }}>
        Algorithm Arena
      </h2>

      <div style={{
        border: '1.5px dashed #b8976a',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '16px',
        color: '#5a3e1b',
        fontSize: '15px',
      }}>
        <strong>Fastest:</strong> {fastest.name}
      </div>

      <p style={{
        color: '#7a6a50',
        fontSize: '13px',
        marginBottom: '16px',
        fontStyle: 'italic',
      }}>
        Path nodes are the final route stops. Search-space nodes are candidates each algorithm evaluated to prove optimality.
      </p>

      {algorithms.map((algo, idx) => (
        <div key={idx} style={{
          border: '1px solid #d4c5a9',
          borderRadius: '8px',
          padding: '14px 16px',
          marginBottom: '12px',
          background: algo.name === fastest.name ? '#fff8ee' : '#ffffff',
        }}>
          <div style={{
            fontWeight: 'bold',
            color: '#3d2b0e',
            fontSize: '16px',
            marginBottom: '6px',
          }}>
            {algo.name}
          </div>
          <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.8' }}>
            <div>Distance: {algo.distanceKm.toFixed(2)} km</div>
            <div>Execution: {algo.executionMs} ms</div>
            <div>Path Nodes: {algo.pathNodes}</div>
            <div>Search-Space Nodes: {algo.searchNodes}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChronicleTimelinePanel({ events, orders }) {
  return (
    <div style={{
      background: '#fdf8f0',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e0d5c0',
    }}>
      <h2 style={{
        color: '#5a3e1b',
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        marginBottom: '16px',
        fontWeight: 'bold',
        marginTop: '0',
      }}>
        Chronicle Timeline
      </h2>

      <div style={{
        maxHeight: '380px',
        overflowY: 'auto',
        paddingRight: '4px',
      }}>
        {events.map((event, idx) => (
          <div key={idx} style={{
            background: STAGE_COLORS[event.stage] || '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '10px',
          }}>
            <div style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              fontSize: '14px',
              letterSpacing: '0.5px',
            }}>
              {event.stage}
            </div>
            <div style={{
              color: '#666',
              fontSize: '12px',
              margin: '3px 0',
            }}>
              {event.timestamp}
            </div>
            <div style={{
              color: '#333',
              fontSize: '13px',
            }}>
              {event.description}
            </div>
          </div>
        ))}
      </div>

      {orders && orders.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            fontWeight: '600',
            color: '#5a3e1b',
            marginBottom: '8px',
            fontSize: '14px',
          }}>
            Switch Order
          </div>
          {orders.map((ord, idx) => (
            <div key={idx} style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '6px',
              background: '#fff',
              fontSize: '13px',
              color: '#333',
              cursor: 'pointer',
            }}>
              {ord.id} | <span style={{
                color: ord.status === 'DELIVERED' ? '#2e7d32' : '#e65100',
                fontWeight: '600',
              }}>
                {ord.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MissionControlPage() {
  const {
    orderState,
    setOrderState,
    selectedOrder,
    loading,
    statusMessage,
    stageResults,
    actions,
    validationError
  } = useCampaignState();

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [algorithmData, setAlgorithmData] = useState(null);
  const [switchOrders, setSwitchOrders] = useState([]);

  // Fetch other orders for Switch Order section
  useEffect(() => {
    fetch('http://localhost:8081/api/v1/orders?limit=5')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSwitchOrders(
            data.slice(0, 3).map(o => ({ id: o.orderId || o.id, status: o.status || 'PENDING' }))
          );
        }
      })
      .catch(() => {
        // Mock switch orders
        setSwitchOrders([
          { id: 'cfda725f-418e-43c5-bd98-a0e4da645ff8', status: 'RETURN_INITIATED' },
          { id: '782a4141-a212-47d4-9d12-3fb23cf9e1e0', status: 'DELIVERED' },
        ]);
      });
  }, []);

  // Show toast when statusMessage changes
  useEffect(() => {
    if (statusMessage) {
      const type = statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info';
      setToast({ message: statusMessage, type, visible: true });
      const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Wrapped handlers that build timeline progressively
  const wrappedHandleCreateOrder = async () => {
    await actions.handleCreateOrder();
    // Initialize timeline with PLACED event
    setTimelineEvents([{
      stage: 'PLACED',
      timestamp: new Date().toLocaleString('en-IN'),
      description: `Order created from ${orderState.productUrl?.substring(0, 40) || 'manual entry'}...`
    }]);
    // Initialize Algorithm Arena with default mock data
    setAlgorithmData({
      algorithms: [
        { name: 'A*', distanceKm: 208.80, executionMs: 0, pathNodes: 2, searchNodes: 3 },
        { name: 'Floyd-Warshall', distanceKm: 208.80, executionMs: 1, pathNodes: 2, searchNodes: 42 },
        { name: 'Dijkstra', distanceKm: 208.80, executionMs: 0, pathNodes: 2, searchNodes: 5 },
        { name: 'Bellman-Ford', distanceKm: 208.80, executionMs: 7, pathNodes: 2, searchNodes: 42 },
      ]
    });
  };

  const wrappedHandleProcessRoute = async () => {
    await actions.handleProcessRoute();
    // Add warehouse picked and dispatched events
    setTimelineEvents(prev => [...prev,
      {
        stage: 'WAREHOUSE_PICKED',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `Order picked from warehouse: ${orderState.routeData?.source || 'Delhi Warehouse'}`
      },
      {
        stage: 'DISPATCHED',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `Route calculated using ${orderState.routeData?.routeAlgorithm || 'A_STAR'}. Distance: ${orderState.routeData?.distanceKm || 1412} km`
      }
    ]);
  };

  const wrappedHandleCompareAlgorithms = async () => {
    await actions.handleCompareAlgorithms();
    // Update algorithm data with real backend response
    if (orderState.comparisonData?.algorithms) {
      setAlgorithmData({
        algorithms: orderState.comparisonData.algorithms.map(algo => ({
          name: algo.name || algo.algorithm || 'Unknown',
          distanceKm: algo.distance || algo.distanceKm || 208.8,
          executionMs: algo.time || algo.executionMs || 0,
          pathNodes: algo.pathNodes || 2,
          searchNodes: algo.searchNodes || 42
        }))
      });
    }
  };

  const wrappedHandleSimulateDelivery = async () => {
    await actions.handleSimulateDelivery();
    // Add in-transit and delivered events
    setTimelineEvents(prev => [...prev,
      {
        stage: 'IN_TRANSIT',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `In transit from ${orderState.routeData?.source || 'Delhi'} to ${orderState.deliveryAddress}. Distance: ${orderState.routeData?.distanceKm || 1412} km`
      },
      {
        stage: 'DELIVERED',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `Package delivered to ${orderState.deliveryAddress}`
      }
    ]);
  };

  const wrappedHandleInitiateReturn = async () => {
    await actions.handleInitiateReturn();
    // Add return initiated event
    setTimelineEvents(prev => [...prev,
      {
        stage: 'RETURN_INITIATED',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `Return initiated. Reason: ${orderState.returnReason}`
      }
    ]);
  };

  const wrappedHandlePickupReturn = async () => {
    await actions.handlePickupReturn();
    // Add pickup event
    setTimelineEvents(prev => [...prev,
      {
        stage: 'PICKED_UP',
        timestamp: new Date().toLocaleString('en-IN'),
        description: `Package picked up from ${orderState.deliveryAddress}. Returning to seller warehouse.`
      }
    ]);
  };

  // Button configuration with unlock rules
  const buttonConfig = useMemo(() => [
    {
      id: 1,
      label: loading && orderState.currentStage === 0 ? '⏳ Creating...' : '1) Create Order',
      enabled: true, // Always enabled when form is valid
      action: wrappedHandleCreateOrder,
    },
    {
      id: 2,
      label: loading && orderState.currentStage === 1 ? '⏳ Processing...' : '2) Process & Route',
      enabled: orderState.orderCreated && !loading,
      action: wrappedHandleProcessRoute,
    },
    {
      id: 3,
      label: loading && orderState.currentStage === 2 ? '⏳ Comparing...' : '3) Compare Algorithms',
      enabled: orderState.routeProcessed && !loading,
      action: wrappedHandleCompareAlgorithms,
    },
    {
      id: 4,
      label: loading && orderState.currentStage === 3 ? '⏳ Simulating...' : '4) Simulate Delivery',
      enabled: orderState.algorithmsCompared && !loading,
      action: wrappedHandleSimulateDelivery,
    },
    {
      id: 5,
      label: loading && orderState.currentStage === 4 ? '⏳ Initiating...' : '5) Initiate Return',
      enabled: orderState.deliverySimulated && !loading,
      action: wrappedHandleInitiateReturn,
    },
    {
      id: 6,
      label: loading && orderState.currentStage === 5 ? '⏳ Processing...' : '6) Pickup & Return',
      enabled: orderState.returnInitiated && !loading,
      action: wrappedHandlePickupReturn,
    },
  ], [orderState, loading, wrappedHandleCreateOrder, wrappedHandleProcessRoute, wrappedHandleCompareAlgorithms, wrappedHandleSimulateDelivery, wrappedHandleInitiateReturn, wrappedHandlePickupReturn]);

  return (
    <>
      {/* TOP SECTION: Form + Buttons + Mission Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left Panel: Form & Buttons */}
        <section className="story-card p-5 xl:col-span-2 space-y-4">
        <h2 className="text-2xl font-black text-amber-900">Mission Intake</h2>
        <p className="text-sm text-amber-900/70">Create an order and command each mission stage.</p>

        <InputField 
          label="Product URL" 
          value={orderState.productUrl} 
          onChange={(v) => setOrderState({ ...orderState, productUrl: v })} 
          placeholder="https://www.amazon.in/..." 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField 
            label="Product SKU" 
            value={orderState.productSku} 
            onChange={(v) => setOrderState({ ...orderState, productSku: v })} 
          />
          <InputField 
            label="Product Name" 
            value={orderState.productName} 
            onChange={(v) => setOrderState({ ...orderState, productName: v })} 
          />
          <InputField 
            label="Weight (kg)" 
            type="number" 
            value={orderState.weight} 
            onChange={(v) => setOrderState({ ...orderState, weight: Number(v) })} 
          />
          <InputField 
            label="Price (INR)" 
            type="number" 
            value={orderState.price} 
            onChange={(v) => setOrderState({ ...orderState, price: Number(v) })} 
          />
          <InputField 
            label="Customer Name" 
            value={orderState.customerName} 
            onChange={(v) => setOrderState({ ...orderState, customerName: v })} 
          />
          <InputField 
            label="Customer Email" 
            value={orderState.customerEmail} 
            onChange={(v) => setOrderState({ ...orderState, customerEmail: v })} 
          />
          <InputField 
            label="Delivery Pincode" 
            value={orderState.deliveryPincode} 
            onChange={(v) => setOrderState({ ...orderState, deliveryPincode: v })} 
          />
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">SLA Tier</label>
            <select 
              value={orderState.slaTier} 
              onChange={(e) => setOrderState({ ...orderState, slaTier: e.target.value })} 
              className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              style={{ color: '#000000' }}
            >
              <option value="STANDARD" style={{ color: '#000000' }}>STANDARD</option>
              <option value="EXPRESS" style={{ color: '#000000' }}>EXPRESS</option>
              <option value="SAME_DAY" style={{ color: '#000000' }}>SAME_DAY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-amber-900 mb-1">Delivery Address</label>
          <textarea 
            rows={3} 
            value={orderState.deliveryAddress} 
            onChange={(e) => setOrderState({ ...orderState, deliveryAddress: e.target.value })} 
            className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950"
            placeholder="Enter complete delivery address..."
          />
        </div>

        {orderState.currentStage === 0 && validationError && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
            <strong>Form Validation:</strong> {validationError}
          </div>
        )}

        {/* Button Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {buttonConfig.map(btn => (
            <ActionButton
              key={btn.id}
              label={btn.label}
              onClick={btn.enabled ? btn.action : undefined}
              disabled={!btn.enabled}
              loading={loading && orderState.currentStage === btn.id - 1}
            />
          ))}
        </div>


      </section>

      {/* Right Panel: Mission Log & Results */}
      <section className="story-card p-5 space-y-4">
        <h2 className="text-xl font-black text-amber-900">Mission Log</h2>
        
        {selectedOrder ? (
          <div className="space-y-2 text-sm text-amber-950">
            <p><b>Order ID:</b> <code className="bg-amber-100 px-2 py-1 rounded">{selectedOrder.orderId || 'Pending'}</code></p>
            <p><b>Product:</b> {selectedOrder.productName || orderState.productName}</p>
            <p><b>Customer:</b> {selectedOrder.customerName || orderState.customerName}</p>
            <p><b>Status:</b> {selectedOrder.status || 'CREATED'}</p>
            <p><b>Current Stage:</b> {orderState.currentStage}/6</p>
          </div>
        ) : (
          <p className="text-sm text-amber-900/70">👈 Fill the form and click "1) Create Order" to begin</p>
        )}

        {stageResults.title && (
          <div className="border-t border-amber-200 pt-4 mt-4">
            <h3 className="font-bold text-amber-900 mb-3">{stageResults.title}</h3>
            <div className="space-y-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-lg">
              {Object.entries(stageResults.data || {}).map(([key, val]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(val)}
                </div>
              ))}
              {stageResults.timestamp && (
                <div className="text-amber-600 pt-2 border-t border-amber-200">
                  ⏰ {stageResults.timestamp}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Return Reason Dropdown */}
        {orderState.deliverySimulated && !orderState.returnInitiated && (
          <div className="border-t border-amber-200 pt-4">
            <label className="block text-sm font-semibold text-amber-900 mb-2">Return Reason</label>
            <select 
              value={orderState.returnReason} 
              onChange={(e) => setOrderState({ ...orderState, returnReason: e.target.value })} 
              className="w-full rounded-lg border border-amber-800/20 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              style={{ color: '#000000' }}
            >
              <option value="Not as described" style={{ color: '#000000' }}>Not as described</option>
              <option value="Damaged in transit" style={{ color: '#000000' }}>Damaged in transit</option>
              <option value="Wrong item received" style={{ color: '#000000' }}>Wrong item received</option>
              <option value="Changed mind" style={{ color: '#000000' }}>Changed mind</option>
              <option value="Other" style={{ color: '#000000' }}>Other</option>
            </select>
          </div>
        )}
      </section>
    </div>

    {/* BOTTOM SECTION: Two-Column Layout (Algorithm Arena + Chronicle Timeline) */}
    {orderState.orderCreated && (
      <div className="mt-8">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          fontFamily: 'Georgia, serif',
        }}>
          {/* LEFT: Algorithm Arena */}
          <AlgorithmArenaPanel data={algorithmData} />

          {/* RIGHT: Chronicle Timeline */}
          <ChronicleTimelinePanel 
            events={timelineEvents}
            orders={switchOrders}
          />
        </div>
      </div>
    )}

    {/* Toast Notification */}
    <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}
