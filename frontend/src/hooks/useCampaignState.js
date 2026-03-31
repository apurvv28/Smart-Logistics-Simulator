import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/v1';

const createInitialForm = () => ({
  productUrl: '',
  productSku: '',
  productName: '',
  weight: 0.1,
  price: 1,
  customerId: '',
  customerName: '',
  customerEmail: '',
  deliveryPincode: '',
  deliveryAddress: '',
  slaTier: 'STANDARD'
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
  const [form, setForm] = useState(createInitialForm());
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [algorithmComparison, setAlgorithmComparison] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [returnReason, setReturnReason] = useState('Not as described');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const [networkRes, activeOrdersRes, completedRes] = await Promise.all([
        axios.get(`${API_BASE}/orders/graph/network`),
        axios.get(`${API_BASE}/orders/active`),
        axios.get(`${API_BASE}/orders/completed`)
      ]);

      setNetworkData(networkRes.data);

      const activeOrders = Object.values(activeOrdersRes.data || {});
      const completedOrders = completedRes.data || [];
      const merged = [...activeOrders, ...completedOrders].sort((a, b) => {
        const at = new Date(a.orderTime || 0).getTime();
        const bt = new Date(b.orderTime || 0).getTime();
        return bt - at;
      });

      setOrders(merged);
      if (merged.length > 0) {
        setSelectedOrder(merged[0]);
      }
    } catch (error) {
      setStatusMessage(`Unable to load dashboard data: ${error.message}`);
    }
  };

  const validationError = useMemo(() => {
    if (!form.productUrl.trim()) return 'Product URL is required';
    if (!form.productName.trim()) return 'Product name is required';
    if (!form.customerName.trim()) return 'Customer name is required';
    if (!form.customerEmail.trim()) return 'Customer email is required';
    if (!form.deliveryPincode.trim()) return 'Delivery pincode is required';
    if (!form.deliveryAddress.trim()) return 'Delivery address is required';
    if (!form.weight || form.weight <= 0) return 'Weight must be greater than zero';
    if (!form.price || form.price <= 0) return 'Price must be greater than zero';
    return '';
  }, [form]);

  const handleCreateOrder = async () => {
    if (validationError) {
      setStatusMessage(validationError);
      return;
    }

    setLoading(true);
    setStatusMessage('');
    try {
      const payload = {
        productUrl: form.productUrl.trim(),
        productSku: form.productSku.trim() || makeId('SKU'),
        productName: form.productName.trim(),
        weight: Number(form.weight),
        price: Number(form.price),
        customerId: form.customerId.trim() || makeId('CUST'),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        deliveryPincode: form.deliveryPincode.trim(),
        deliveryAddress: form.deliveryAddress.trim(),
        slaTier: form.slaTier
      };

      const { data } = await axios.post(`${API_BASE}/orders/create-from-link`, payload);
      setSelectedOrder(data);
      setOrders((prev) => upsertOrder(prev, data));
      setStatusMessage(`Order created: ${data.orderId}`);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  const compareAlgorithms = async (order = selectedOrder) => {
    if (!order?.pickupNodeId || !order?.deliveryNodeId) {
      return;
    }
    const { data } = await axios.post(
      `${API_BASE}/simulation/route/compare-all?source=${order.pickupNodeId}&target=${order.deliveryNodeId}`
    );
    setAlgorithmComparison(data);
  };

  const handleProcessRoute = async () => {
    if (!selectedOrder?.orderId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/orders/${selectedOrder.orderId}/process-and-route`,
        selectedOrder
      );
      setSelectedOrder(data);
      setOrders((prev) => upsertOrder(prev, data));
      setStatusMessage(`Route planned with ${data.routeAlgorithm}.`);
      await compareAlgorithms(data);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  const handleCompareAlgorithms = async () => {
    setLoading(true);
    try {
      await compareAlgorithms();
      setStatusMessage('Algorithm comparison refreshed.');
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  const handleSimulateDelivery = async () => {
    if (!selectedOrder?.orderId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/orders/${selectedOrder.orderId}/simulate-delivery`,
        selectedOrder
      );
      setSelectedOrder(data);
      setOrders((prev) => upsertOrder(prev, data));
      setStatusMessage(`Delivery simulated for ${data.orderId}.`);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  const handleInitiateReturn = async () => {
    if (!selectedOrder?.orderId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/orders/${selectedOrder.orderId}/initiate-return`,
        { returnReason }
      );
      setSelectedOrder(data);
      setOrders((prev) => upsertOrder(prev, data));
      setStatusMessage('Return initiated. Waiting for return pickup dispatch.');
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
  };

  const handleProcessReturn = async () => {
    if (!selectedOrder?.orderId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/orders/${selectedOrder.orderId}/process-return`,
        selectedOrder
      );
      setSelectedOrder(data);
      setOrders((prev) => upsertOrder(prev, data));
      setStatusMessage('Parcel picked and returned to seller warehouse.');
    } catch (error) {
      setStatusMessage(error.response?.data?.error || error.message);
    }
    setLoading(false);
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

  return {
    form,
    setForm,
    orders,
    selectedOrder,
    setSelectedOrder,
    algorithmComparison,
    networkData,
    returnReason,
    setReturnReason,
    statusMessage,
    loading,
    stageItems,
    actions: {
      handleCreateOrder,
      handleProcessRoute,
      handleCompareAlgorithms,
      handleSimulateDelivery,
      handleInitiateReturn,
      handleProcessReturn,
      initializeDashboard
    }
  };
}
