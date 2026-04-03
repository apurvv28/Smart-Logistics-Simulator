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

  // Show toast when statusMessage changes
  useEffect(() => {
    if (statusMessage) {
      const type = statusMessage.includes('✅') ? 'success' : statusMessage.includes('❌') ? 'error' : 'info';
      setToast({ message: statusMessage, type, visible: true });
      const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Button configuration with unlock rules
  const buttonConfig = useMemo(() => [
    {
      id: 1,
      label: loading && orderState.currentStage === 0 ? '⏳ Creating...' : '1) Create Order',
      enabled: true, // Always enabled when form is valid
      action: actions.handleCreateOrder,
    },
    {
      id: 2,
      label: loading && orderState.currentStage === 1 ? '⏳ Processing...' : '2) Process & Route',
      enabled: orderState.orderCreated && !loading,
      action: actions.handleProcessRoute,
    },
    {
      id: 3,
      label: loading && orderState.currentStage === 2 ? '⏳ Comparing...' : '3) Compare Algorithms',
      enabled: orderState.routeProcessed && !loading,
      action: actions.handleCompareAlgorithms,
    },
    {
      id: 4,
      label: loading && orderState.currentStage === 3 ? '⏳ Simulating...' : '4) Simulate Delivery',
      enabled: orderState.algorithmsCompared && !loading,
      action: actions.handleSimulateDelivery,
    },
    {
      id: 5,
      label: loading && orderState.currentStage === 4 ? '⏳ Initiating...' : '5) Initiate Return',
      enabled: orderState.deliverySimulated && !loading,
      action: actions.handleInitiateReturn,
    },
    {
      id: 6,
      label: loading && orderState.currentStage === 5 ? '⏳ Processing...' : '6) Pickup & Return',
      enabled: orderState.returnInitiated && !loading,
      action: actions.handlePickupReturn,
    },
  ], [orderState, loading, actions]);

  return (
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

        {/* Stage Result Display Panel */}
        {stageResults.title && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e8f5e9, #f1f8ff)',
            border: '2px solid #1a6b8a',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              color: '#1a6b8a', 
              marginBottom: '12px',
              marginTop: '0',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              📋 {stageResults.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stageResults.data || {}).map(([key, val]) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #d0e8f2',
                  color: '#000'
                }}>
                  <span style={{ fontWeight: '600', color: '#444', flex: '0 0 40%' }}>{key}:</span>
                  <span style={{ color: '#1a1a1a', flex: '1', textAlign: 'right', wordBreak: 'break-word' }}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
            {stageResults.timestamp && (
              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px solid #d0e8f2',
                fontSize: '12px',
                color: '#1a6b8a'
              }}>
                ⏰ {stageResults.timestamp}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

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
  );
}
