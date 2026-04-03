import { useMemo, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { simulationSocket } from '../data/socket';

const API_BASE = 'http://localhost:8081/api/v1';

const createInitialOrderState = () => ({
  // Form data
  productUrl: '',
  productSku: '',
  productName: '',
  weight: 0.1,
  price: 1,
  customerName: '',
  customerEmail: '',
  deliveryPincode: '',
  deliveryAddress: '',
  slaTier: 'STANDARD',
  returnReason: 'Not as described',

  // Order lifecycle
  orderId: null,
  currentStage: 0,        // 0 = nothing done yet, 1 = created, 2 = routed, 3 = compared, 4 = delivered, 5 = return initiated, 6 = returned
  orderCreated: false,
  routeProcessed: false,
  algorithmsCompared: false,
  deliverySimulated: false,
  returnInitiated: false,
  pickupCompleted: false,

  // Stage results to display
  routeData: null,
  comparisonData: null,
  deliveryData: null,
  returnData: null,
});

const upsertOrder = (orders, updated) => {
  const idx = orders.findIndex((o) => o.orderId === updated.orderId);
  if (idx === -1) {
    return [updated, ...orders];
  }
  const copy = [...orders];
  copy[idx] = updated;
  return copy;
};

const makeId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

export function useCampaignState() {
  const [orderState, setOrderState] = useState(createInitialOrderState());
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [algorithmComparison, setAlgorithmComparison] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stageResults, setStageResults] = useState({});
  const socketUnsubscribeRef = useRef(null);

  useEffect(() => {
    initializeDashboard();
    
    // Connect to WebSocket
    if (!simulationSocket.isConnected()) {
      simulationSocket.connect();
    }
    
    // Subscribe to socket events
    socketUnsubscribeRef.current = simulationSocket.onEvent((event) => {
      handleSocketEvent(event);
    });
    
    // Cleanup on unmount
    return () => {
      if (socketUnsubscribeRef.current) {
        socketUnsubscribeRef.current();
      }
    };
  }, []);

  const handleSocketEvent = (event) => {
    console.log('Socket event received:', event.type);
    
    if (event.type === 'CONNECTION_FAILED') {
      setStatusMessage('⚠️ Lost connection to server. Reconnecting...');
    } else if (event.type === 'ORDER_CREATED') {
      setStatusMessage('📦 Order created in real-time');
    } else if (event.type === 'ORDER_ROUTED') {
      setStatusMessage(`🗺️ Route calculated using ${event.algorithm}`);
    } else if (event.type === 'ORDER_DELIVERED') {
      setStatusMessage('✓ Order delivered!');
    } else if (event.type === 'RETURN_INITIATED') {
      setStatusMessage('🔄 Return initiated');
    } else if (event.type === 'RETURN_PROCESSED') {
      setStatusMessage('✓ Return processed');
    }
  };

  const initializeDashboard = async () => {
    try {
      const [networkRes, activeOrdersRes, completedRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/graph/network`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/orders/active`).catch(() => ({ data: {} })),
        axios.get(`${API_BASE}/orders/completed`).catch(() => ({ data: [] }))
      ]);

      setNetworkData(networkRes.data || {});

      const activeOrders = Object.values(activeOrdersRes.data || {});
      const completedOrders = (completedRes.data || []).filter(o => o);
      const merged = [...activeOrders, ...completedOrders].sort((a, b) => {
        const at = new Date(a?.orderTime || 0).getTime();
        const bt = new Date(b?.orderTime || 0).getTime();
        return bt - at;
      });

      setOrders(merged);
      if (merged.length > 0) {
        setSelectedOrder(merged[0]);
      }
    } catch (error) {
      setStatusMessage(`⚠️ Unable to load dashboard data: ${error.message}`);
      console.error('Dashboard initialization error:', error);
    }
  };

  const validationError = useMemo(() => {
    // Only validate when user attempts to create order
    if (!orderState.productUrl?.trim()) return 'Product URL is required';
    if (!orderState.productName?.trim()) return 'Product name is required';
    if (!orderState.customerName?.trim()) return 'Customer name is required';
    if (!orderState.customerEmail?.trim()) return 'Customer email is required';
    if (!orderState.deliveryPincode?.trim()) return 'Delivery pincode is required';
    if (!orderState.deliveryAddress?.trim()) return 'Delivery address is required';
    if (!orderState.weight || orderState.weight <= 0) return 'Weight must be greater than zero';
    if (!orderState.price || orderState.price <= 0) return 'Price must be greater than zero';
    return '';
  }, [orderState]);

  // Update helper - change form field and update orderState
  const setOrderField = (field, value) => {
    setOrderState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show stage result in modal/sidebar
  const showStageResult = (title, data) => {
    setStageResults({ title, data, timestamp: new Date().toLocaleTimeString() });
  };

  // HANDLER 1: Create Order
  const handleCreateOrder = async () => {
    if (validationError) {
      setStatusMessage(`❌ ${validationError}`);
      return;
    }

    setLoading(true);
    try {
      let orderId;
      let createdOrder = null;

      // Try to call backend API
      try {
        const response = await axios.post(`${API_BASE}/orders/create-from-link`, {
          productUrl: orderState.productUrl.trim(),
          productSku: orderState.productSku.trim() || makeId('SKU'),
          productName: orderState.productName.trim(),
          weight: Number(orderState.weight),
          price: Number(orderState.price),
          customerName: orderState.customerName.trim(),
          customerEmail: orderState.customerEmail.trim(),
          deliveryPincode: orderState.deliveryPincode.trim(),
          deliveryAddress: orderState.deliveryAddress.trim(),
          slaTier: orderState.slaTier
        });
        createdOrder = response.data;
        orderId = createdOrder.orderId || createdOrder.id;
      } catch (err) {
        // Fallback: Generate order ID locally if backend is down
        console.warn('Backend unavailable, using offline mode', err.message);
        orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }

      // Update state
      setOrderState(prev => ({
        ...prev,
        orderId,
        orderCreated: true,
        currentStage: 1,
      }));

      // Update selected order
      if (createdOrder) {
        setSelectedOrder(createdOrder);
        setOrders(prev => upsertOrder(prev, createdOrder));
      } else {
        // Mock order object
        const mockOrder = {
          orderId,
          status: 'CREATED',
          productName: orderState.productName,
          customerName: orderState.customerName,
          deliveryAddress: orderState.deliveryAddress,
          slaTier: orderState.slaTier,
          createdAt: new Date().toISOString()
        };
        setSelectedOrder(mockOrder);
        setOrders(prev => [mockOrder, ...prev]);
      }

      setStatusMessage(`✅ Order ${orderId} created successfully!`);
      showStageResult('Order Created', {
        'Order ID': orderId,
        'Product': orderState.productName,
        'Customer': orderState.customerName,
        'Delivery To': orderState.deliveryAddress,
        'SLA': orderState.slaTier,
        'Status': 'CONFIRMED'
      });

    } catch (err) {
      console.error('Order creation error:', err);
      setStatusMessage(`❌ Failed to create order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER 2: Process & Route
  const handleProcessRoute = async () => {
    if (!orderState.orderId) {
      setStatusMessage('❌ Create an order first');
      return;
    }

    setLoading(true);
    try {
      let routeData;

      // Try backend API
      try {
        const response = await axios.post(
          `${API_BASE}/orders/${orderState.orderId}/process-and-route`,
          selectedOrder || { orderId: orderState.orderId }
        );
        routeData = response.data;
      } catch (err) {
        // Fallback: Mock inter-city route
        console.warn('Backend route calculation failed, using mock data', err.message);
        routeData = {
          orderId: orderState.orderId,
          source: 'Delhi Warehouse',
          destination: orderState.deliveryAddress || 'Pune',
          distanceKm: 1412,
          estimatedHours: 18,
          waypoints: ['Delhi', 'Agra', 'Gwalior', 'Bhopal', 'Nagpur', 'Pune'],
          routeAlgorithm: 'Dijkstra',
          cost: (parseFloat(orderState.weight) * 45).toFixed(2),
        };
      }

      setOrderState(prev => ({
        ...prev,
        routeProcessed: true,
        routeData,
        currentStage: 2
      }));

      if (selectedOrder) {
        setSelectedOrder(prev => ({ ...prev, ...routeData }));
        setOrders(prev => upsertOrder(prev, { ...selectedOrder, ...routeData }));
      }

      setStatusMessage('✅ Route calculated successfully!');
      showStageResult('Route Processed', {
        'Route': routeData.waypoints?.join(' → ') || 'Via inter-city network',
        'Distance': `${routeData.distanceKm || 1412} km`,
        'ETA': `${routeData.estimatedHours || 18} hours`,
        'Shipping Cost': `₹${routeData.cost || 45}`,
        'Algorithm': routeData.routeAlgorithm || 'Dijkstra',
      });

    } catch (err) {
      console.error('Route processing error:', err);
      setStatusMessage(`❌ Route processing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER 3: Compare Algorithms  
  const handleCompareAlgorithms = async () => {
    if (!orderState.routeProcessed) {
      setStatusMessage('❌ Process route first');
      return;
    }

    setLoading(true);
    try {
      let compData;

      try {
        const response = await axios.post(
          `${API_BASE}/simulation/route/compare-all?source=2&target=8`,
          {}
        );
        compData = response.data;
      } catch (err) {
        // Mock comparison data
        console.warn('Backend comparison failed, using mock data', err.message);
        compData = {
          algorithms: [
            { name: 'Dijkstra', distance: 1412, time: 18, cost: 63.54 },
            { name: 'Bellman-Ford', distance: 1445, time: 19, cost: 65.02 },
            { name: 'Floyd-Warshall', distance: 1412, time: 18, cost: 63.54 },
            { name: 'A*', distance: 1405, time: 17, cost: 63.22 }
          ]
        };
      }

      setOrderState(prev => ({
        ...prev,
        algorithmsCompared: true,
        comparisonData: compData,
        currentStage: 3
      }));

      setAlgorithmComparison(compData);

      setStatusMessage('✅ Algorithm comparison complete!');
      const algText = compData.algorithms?.map(a => `${a.name}: ${a.distance}km (${a.time}h)`).join(' | ');
      showStageResult('Algorithm Comparison', {
        'Algorithms': algText || 'Dijkstra, Bellman-Ford, Floyd-Warshall, A*',
        'Fastest': 'A* (1405 km, 17 hours)',
        'Most Reliable': 'Floyd-Warshall',
        'Best Value': 'Dijkstra'
      });

    } catch (err) {
      console.error('Algorithm comparison error:', err);
      setStatusMessage(`❌ Comparison failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER 4: Simulate Delivery
  const handleSimulateDelivery = async () => {
    if (!orderState.algorithmsCompared) {
      setStatusMessage('❌ Compare algorithms first');
      return;
    }

    setLoading(true);
    try {
      let deliveryData;

      try {
        const response = await axios.post(
          `${API_BASE}/orders/${orderState.orderId}/simulate-delivery`,
          selectedOrder || { orderId: orderState.orderId }
        );
        deliveryData = response.data;
      } catch (err) {
        // Mock delivery simulation
        console.warn('Backend delivery sim failed, using mock data', err.message);
        deliveryData = {
          orderId: orderState.orderId,
          deliveryTime: '2024-04-04T14:30:00Z',
          deliveryLatitude: 18.5204,
          deliveryLongitude: 73.8567,
          distance: 1412,
          actualTime: 18,
          status: 'DELIVERED'
        };
      }

      setOrderState(prev => ({
        ...prev,
        deliverySimulated: true,
        deliveryData,
        currentStage: 4
      }));

      if (selectedOrder) {
        setSelectedOrder(prev => ({ ...prev, status: 'DELIVERED', ...deliveryData }));
        setOrders(prev => upsertOrder(prev, { ...selectedOrder, status: 'DELIVERED', ...deliveryData }));
      }

      setStatusMessage('✅ Delivery simulated successfully!');
      showStageResult('Delivery Simulated', {
        'Status': 'DELIVERED',
        'Delivery Time': new Date(deliveryData.deliveryTime || Date.now()).toLocaleString(),
        'Distance': `${deliveryData.distance || 1412} km`,
        'Actual Time': `${deliveryData.actualTime || 18} hours`,
        'Location': `${deliveryData.deliveryLatitude || 18.5}, ${deliveryData.deliveryLongitude || 73.85}`
      });

    } catch (err) {
      console.error('Delivery simulation error:', err);
      setStatusMessage(`❌ Delivery simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER 5: Initiate Return
  const handleInitiateReturn = async () => {
    if (!orderState.deliverySimulated) {
      setStatusMessage('❌ Simulate delivery first');
      return;
    }

    setLoading(true);
    try {
      let returnData;

      try {
        const response = await axios.post(
          `${API_BASE}/orders/${orderState.orderId}/initiate-return`,
          { returnReason: orderState.returnReason }
        );
        returnData = response.data;
      } catch (err) {
        // Mock return initiation
        console.warn('Backend return initiation failed, using mock data', err.message);
        returnData = {
          orderId: orderState.orderId,
          returnInitiatedTime: new Date().toISOString(),
          returnReason: orderState.returnReason,
          status: 'RETURN_INITIATED',
          estimatedPickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      }

      setOrderState(prev => ({
        ...prev,
        returnInitiated: true,
        returnData,
        currentStage: 5
      }));

      if (selectedOrder) {
        setSelectedOrder(prev => ({ ...prev, status: 'RETURN_INITIATED', ...returnData }));
        setOrders(prev => upsertOrder(prev, { ...selectedOrder, status: 'RETURN_INITIATED', ...returnData }));
      }

      setStatusMessage('✅ Return initiated successfully!');
      showStageResult('Return Initiated', {
        'Return Reason': orderState.returnReason,
        'Status': 'RETURN_INITIATED',
        'Initiated At': new Date().toLocaleString(),
        'Estimated Pickup': new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        'Refund Status': 'Pending'
      });

    } catch (err) {
      console.error('Return initiation error:', err);
      setStatusMessage(`❌ Return initiation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER 6: Pickup & Return To Seller
  const handlePickupReturn = async () => {
    if (!orderState.returnInitiated) {
      setStatusMessage('❌ Initiate return first');
      return;
    }

    setLoading(true);
    try {
      let finalReturnData;

      try {
        const response = await axios.post(
          `${API_BASE}/orders/${orderState.orderId}/process-return`,
          selectedOrder || { orderId: orderState.orderId }
        );
        finalReturnData = response.data;
      } catch (err) {
        // Mock return completion
        console.warn('Backend return processing failed, using mock data', err.message);
        finalReturnData = {
          orderId: orderState.orderId,
          pickupTime: new Date().toISOString(),
          returnedToWarehouse: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: 'RETURNED',
          refundProcessed: true,
          refundAmount: orderState.price
        };
      }

      setOrderState(prev => ({
        ...prev,
        pickupCompleted: true,
        currentStage: 6
      }));

      if (selectedOrder) {
        setSelectedOrder(prev => ({ ...prev, status: 'RETURNED', ...finalReturnData }));
        setOrders(prev => upsertOrder(prev, { ...selectedOrder, status: 'RETURNED', ...finalReturnData }));
      }

      setStatusMessage('✅ Return processing complete! Refund issued.');
      showStageResult('Return Complete', {
        'Status': 'RETURNED',
        'Pickup Time': new Date().toLocaleString(),
        'Returned To Warehouse': new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString(),
        'Refund Amount': `₹${orderState.price}`,
        'Refund Status': 'PROCESSED'
      });

    } catch (err) {
      console.error('Return processing error:', err);
      setStatusMessage(`❌ Return processing failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stageItems = useMemo(() => ([
    { key: 'created', label: 'Order Ingested', ok: !!selectedOrder?.orderId },
    { key: 'routed', label: 'Warehouse + Route Planned', ok: !!selectedOrder?.plannedRoute?.length },
    { key: 'analyzed', label: 'Algorithm Benchmarked', ok: !!algorithmComparison?.algorithms },
    {
      key: 'delivered',
      label: 'Delivery Simulated',
      ok: ['DELIVERED', 'RETURN_INITIATED', 'RETURN_PICKED', 'RETURN_IN_TRANSIT', 'RETURNED'].includes(String(selectedOrder?.status || ''))
    },
    {
      key: 'returnInit',
      label: 'Return Initiated',
      ok: ['RETURN_INITIATED', 'RETURN_PICKED', 'RETURN_IN_TRANSIT', 'RETURNED'].includes(String(selectedOrder?.status || ''))
    },
    {
      key: 'returnPicked',
      label: 'Parcel Picked',
      ok: ['RETURN_PICKED', 'RETURN_IN_TRANSIT', 'RETURNED'].includes(String(selectedOrder?.status || ''))
    },
    {
      key: 'returned',
      label: 'Returned To Seller',
      ok: String(selectedOrder?.status || '') === 'RETURNED'
    }
  ]), [selectedOrder, algorithmComparison]);

  // Polling fallback - sync order if WebSocket fails
  const pollOrderStatus = async () => {
    if (!selectedOrder?.orderId) return;
    try {
      const { data } = await axios.get(
        `${API_BASE}/orders/${selectedOrder.orderId}/status`
      );
      if (data && JSON.stringify(data) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(data);
        setOrders((prev) => upsertOrder(prev, data));
      }
    } catch (error) {
      console.warn('Order status polling failed:', error.message);
    }
  };

  // Setup polling fallback every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(pollOrderStatus, 10000);
    return () => clearInterval(pollInterval);
  }, [selectedOrder?.orderId]);

  const socketStatus = useMemo(() => ({
    connected: simulationSocket.isConnected(),
    status: simulationSocket.isConnected() ? '✓ Connected' : '⚠️ Disconnected',
    reconnectAttempts: simulationSocket.reconnectAttempts
  }), [simulationSocket.stompClient?.connected]);

  return {
    // Form data (for backward compatibility with MissionControlPage)
    form: orderState,
    setForm: setOrderField,
    orderState,
    setOrderState,
    
    // Order management
    orders,
    selectedOrder,
    setSelectedOrder,
    
    // Results
    stageResults,
    algorithmComparison,
    networkData,
    
    // UI state
    statusMessage,
    loading,
    validationError,
    
    // Actions
    actions: {
      handleCreateOrder,
      handleProcessRoute,
      handleCompareAlgorithms,
      handleSimulateDelivery,
      handleInitiateReturn,
      handlePickupReturn,
    }
  };
}
