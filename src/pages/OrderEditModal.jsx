import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit, Calendar, User, Phone, MapPin, FileText, CreditCard, X as XIcon } from 'lucide-react';
import Select from 'react-select';
import { useOrderContext } from '../contexts/OrderContext';

export default function OrderEditModal({ orderId, isNew, onClose, onSaved }) {
  const { updateOrder, createOrder } = useOrderContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [form, setForm] = useState({
    invoice: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerNote: '',
    orderNote: '',
    courier: '',
    city: '',
    zone: '',
    paymentMethod: 'Cash on Delivery', // Default value
    paymentNumber: '',
    trxNumber: '',
    memo: '',
    total: '',
    deliveryCharge: '',
    discount: '',
    advance: '',
    products: [],
    status: '',
  });
  const [additionalNotes, setAdditionalNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activeCouriers, setActiveCouriers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [courierLoading, setCourierLoading] = useState(false);
  const [orderStatusHistory, setOrderStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyItemsPerPage] = useState(5);
  const [historyInitialized, setHistoryInitialized] = useState(false);

  const fetchActiveCouriers = async () => {
    setCourierLoading(true);
    try {
      const response = await fetch('/api/couriers', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const couriers = await response.json();
        const activeCourierNames = couriers
          .filter(courier => courier.status === 'active')
          .map(courier => courier.name);
        setActiveCouriers(activeCourierNames);
      } else {
        setActiveCouriers([]);
      }
    } catch (error) {
      setActiveCouriers([]);
    } finally {
      setCourierLoading(false);
    }
  };

  const handleRefreshCouriers = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetchActiveCouriers();
  };

  // Initialize order status history (only once per order)
  const initializeOrderStatusHistory = async () => {
    if (!orderId || historyInitialized) {
      return;
    }
    
    setStatusHistoryLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      // Try to fetch from API first
      const res = await fetch(`/api/orders/${orderId}/status-history`, { headers });
      if (res.ok) {
        const historyData = await res.json();
        setOrderStatusHistory(historyData);
      } else {
        createInitialMockHistory();
      }
    } catch (error) {
      createInitialMockHistory();
    } finally {
      setStatusHistoryLoading(false);
      setHistoryInitialized(true);
    }
  };

  // Create initial mock status history (only called once)
  const createInitialMockHistory = () => {
    if (!order || !orderId) return;
    
    const mockHistory = [];
    const currentUser = localStorage.getItem('user') || 'Admin';
    const baseTime = new Date(order.created_at);
    
    // Add order creation entry for this specific order
    mockHistory.push({
      id: 1,
      order_id: orderId,
      created_at: baseTime.toISOString(),
      notes: `${order.id} Order Has Been Created by ${currentUser}`,
      user: currentUser
    });
    
    // Add status update entries if status changed (with slightly later timestamp)
    if (order.status && order.status !== 'pending') {
      const updateTime = new Date(baseTime.getTime() + 1000); // 1 second later
      mockHistory.push({
        id: 2,
        order_id: orderId,
        created_at: updateTime.toISOString(),
        notes: `${currentUser} Successfully Update ${order.id} Order status to ${order.status}`,
        user: currentUser
      });
    }
    
    // Add courier update if courier exists (with even later timestamp)
    if (order.courier) {
      const courierTime = new Date(baseTime.getTime() + 2000); // 2 seconds later
      mockHistory.push({
        id: 3,
        order_id: orderId,
        created_at: courierTime.toISOString(),
        notes: `${order.courier} Entry Success <br> Parcel ID : ${order.id}<br>Status : in_review<br>COD Amount : ${order.total}`,
        user: 'Courier System'
      });
    }
    
    // Add delivery entry if status is delivered (with latest timestamp)
    if (order.status === 'delivered') {
      const deliveryTime = new Date(baseTime.getTime() + 3000); // 3 seconds later
      mockHistory.push({
        id: 4,
        order_id: orderId,
        created_at: deliveryTime.toISOString(),
        notes: 'Order Automatically Delivered.',
        user: 'System'
      });
    }
    
    setOrderStatusHistory(mockHistory);
  };

  useEffect(() => {
    if (!isNew && orderId) fetchOrder();
    
    // Fetch active couriers from API with a small delay
    const timer = setTimeout(() => {
      fetchActiveCouriers();
    }, 100);
    
    // Fetch all products for selection
    const token = localStorage.getItem('token');
    fetch('/api/products', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [orderId, isNew]);

  // Initialize history when order data is loaded (only once)
  useEffect(() => {
    if (order && !historyInitialized) {
      initializeOrderStatusHistory();
    }
  }, [order, historyInitialized]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      const res = await fetch(`/api/orders/${orderId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data);
      
      // History will be initialized by useEffect when order is set
      
      setForm({
        invoice: data.invoice || '',
        customerName: data.customerName || data.customer_name || data.name || '',
        customerPhone: data.customerPhone || data.phone || data.customerPhone || '',
        customerAddress: data.customerAddress || data.address || data.customerAddress || '',
        customerNote: data.customerNote || data.customer_note || '',
        orderNote: data.orderNote || data.order_note || '',
        courier: data.courier || '',
        city: data.city || '',
        zone: data.zone || '',
        paymentMethod: data.paymentMethod || data.payment_method || 'Cash on Delivery',
        paymentNumber: data.paymentNumber || data.payment_number || '',
        trxNumber: data.trxNumber || data.trx_number || '',
        memo: data.memo || '',
        total: data.total || data.total || '',
        deliveryCharge: data.deliveryCharge || data.delivery_charge || '',
        discount: data.discount || '',
        advance: data.advance || '',
        products: data.products || [],
        status: data.status || '',
      });
    } catch (err) {
      setError(err.message);
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // If courier is being updated, add NEW entry to status history
    if (name === 'courier' && value && orderId) {
      const currentUser = localStorage.getItem('user') || 'Admin';
      const courierNote = {
        id: Date.now(),
        order_id: orderId,
        created_at: new Date().toISOString(),
        notes: `${value} Entry Success <br> Parcel ID : ${orderId}<br>Status : in_review<br>COD Amount : ${form.total || '0'}`,
        user: 'Courier System'
      };
      
      // Add to beginning of history (newest first)
      setOrderStatusHistory(prev => [courierNote, ...prev]);
    }
  };

  // Helper: get product by id
  const getProductById = (id) => allProducts.find(p => p.id === id);

  // Add product to order
  const handleAddProduct = (selected) => {
    if (!selected) return;
    const prod = getProductById(selected.value);
    if (!prod) return;
    // Default variant/price
    setForm(f => ({
      ...f,
      products: [
        ...f.products,
        {
          id: prod.id,
          name: prod.name,
          code: prod.code,
          quantity: 1,
          price: prod.price,
          color: prod.color || '',
          size: prod.size || '',
          // Add more variant fields if needed
        }
      ]
    }));
  };

  // Remove product from order
  const handleRemoveProduct = (idx) => {
    setForm(f => ({
      ...f,
      products: f.products.filter((_, i) => i !== idx)
    }));
  };

  // Update product variant/price/qty
  const handleProductChange = (idx, field, value) => {
    setForm(f => {
      const updated = f.products.map((p, i) => {
        if (i !== idx) return p;
        let newP = { ...p, [field]: value };
        // If variant changed, update price
        if (field === 'color' || field === 'size') {
          const prod = getProductById(p.id);
          if (prod && prod.variants) {
            const match = prod.variants.find(v =>
              (field === 'color' ? v.color === value : true) &&
              (field === 'size' ? v.size === value : true)
            );
            if (match) newP.price = match.price;
          }
        }
        return newP;
      });
      return { ...f, products: updated };
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    try {
      // Prepare data for API
      const orderData = {
        name: form.customerName,
        phone: form.customerPhone,
        address: form.customerAddress,
        total: grandTotal,
        status: form.status,
        courier: form.courier,
        note: form.orderNote,
        payment_status: form.paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid',
        products: form.products.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      if (isNew) {
        await createOrder(orderData);
      } else {
        await updateOrder(orderId, orderData);
      }
      
      // Show success message
      setSuccessMessage(isNew ? 'Order created successfully!' : 'Order updated successfully!');
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        // Don't refresh history, just close modal
        if (onSaved) onSaved();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add Note logic
  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };
      
      // Send note to API
      const res = await fetch(`/api/orders/${orderId}/status-history`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: newNote })
      });
      
      if (res.ok) {
        const newNoteData = await res.json();
        
        // Add NEW entry to local state (don't overwrite existing)
        setOrderStatusHistory(prev => [newNoteData, ...prev]);
        setNewNote('');
        
        // Show success message
        setSuccessMessage('Note added successfully! New entry added to history.');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        
        // Fallback: add to local state only
    const currentUser = localStorage.getItem('user') || 'Admin';
    const note = {
      id: Date.now(),
      order_id: orderId,
      created_at: new Date().toISOString(),
      notes: newNote,
      user: currentUser
    };
    
    setOrderStatusHistory(prev => [note, ...prev]);
    setNewNote('');
        setSuccessMessage('Note added locally (API not available)');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      
      // Fallback: add to local state only
      const currentUser = localStorage.getItem('user') || 'Admin';
      const note = {
        id: Date.now(),
        order_id: orderId,
        created_at: new Date().toISOString(),
        notes: newNote,
        user: currentUser
      };
      
      setOrderStatusHistory(prev => [note, ...prev]);
      setNewNote('');
      setSuccessMessage('Note added locally (API not available)');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  const removeNote = (noteId) => {
    setAdditionalNotes(prev => prev.filter(note => note.id !== noteId));
  };

  // Format date in "28-07-2025 07:30:51 PM" format
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  // Calculate subtotal
  const subtotal = form.products.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseFloat(item.quantity || 0)), 0);
  const deliveryCharge = parseFloat(form.deliveryCharge || 0);
  const discount = parseFloat(form.discount || 0);
  const advance = parseFloat(form.advance || 0);
  const grandTotal = subtotal + deliveryCharge - discount - advance;
  
  // Update form total when calculations change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      total: grandTotal.toString()
    }));
  }, [grandTotal]);

  // Product options for react-select with custom formatting
  const productOptions = allProducts.map(p => ({
    value: p.id,
    label: p.name,
    price: p.price,
    image: p.image || '/placeholder.png'
  }));

  // Custom option component for react-select
  const CustomOption = ({ data, innerProps }) => (
    <div {...innerProps} className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
      <img 
        src={data.image} 
        alt={data.label} 
        className="w-8 h-8 object-cover rounded border border-gray-200"
        onError={(e) => {
          e.target.src = '/placeholder.png';
        }}
      />
      <div className="flex-1">
        <div className="font-medium text-gray-900">{data.label}</div>
        <div className="text-sm text-gray-500">
          ৳{data.price}
        </div>
      </div>
    </div>
  );

  if (!isNew && (loading || !order)) return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[350px] min-h-[200px] flex items-center justify-center text-lg text-gray-500">Loading...</div>
    </div>
  );
  if (error) return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg min-w-[350px] min-h-[200px] flex items-center justify-center text-red-500">{error}</div>
    </div>
  );

  return (
    <div className="w-full fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl shadow-lg w-full max-w-7xl max-h-[95vh] p-8 relative overflow-y-auto">
        {/* Header */}
        <form id="order-form" onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button type="button" onClick={onClose} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Orders</span>
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{isNew ? 'Add New Order' : 'Edit Order'}</h1>
                {form.invoice && <p className="text-gray-600">{form.invoice}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2">
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
              <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ml-2">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Two main boxes side by side */}
          <div className="flex flex-col lg:flex-row gap-8 w-full flex-1">
            {/* 1st Box: Customer Details */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-0">
              <div className="border-b px-6 py-4 bg-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Customer Details</h2>
                  <div className="flex items-center space-x-2">
                    <button type="button" className="bg-gray-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-700">
                      Exchange
                    </button>
                    <button type="button" className="bg-orange-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-600">
                      Re-Order
                    </button>
                    <button type="button" className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600">
                      Block
                    </button>
                    <button type="button" className="bg-blue-400 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-500">
                      Complain
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
              {/* Invoice + Order ID */}
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  {/* Invoice (show orderId as value, read-only) */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
                    <input type="text" name="invoice" value={orderId ? `#${orderId}` : ''} readOnly className="w-full px-4 py-2 border border-primary-500 rounded-lg bg-gray-100 text-gray-700 font-mono focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                  </div>
                </div>
              </div>
              {/* Customer Name + Customer Phone (side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input type="text" name="customerName" value={form.customerName} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
                  <input type="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
              </div>
              {/* Customer Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Address</label>
                <textarea name="customerAddress" value={form.customerAddress} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
              </div>
              {/* Customer Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Note</label>
                <textarea name="customerNote" value={form.customerNote} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
              </div>
              {/* Order Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Note</label>
                <textarea name="orderNote" value={form.orderNote} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
              </div>
              {/* Courier */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Courier</label>
                  <button
                    type="button"
                    onClick={handleRefreshCouriers}
                    disabled={courierLoading}
                    className={`text-xs underline flex items-center space-x-1 ${
                      courierLoading 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {courierLoading && <span className="animate-spin">⟳</span>}
                    <span>{courierLoading ? 'Loading...' : 'Refresh'}</span>
                  </button>
                </div>
                <select 
                  name="courier" 
                  value={form.courier || ''} 
                  onChange={handleChange}
                  disabled={courierLoading}
                  className={`w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none ${
                    courierLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">
                    {courierLoading ? 'Loading couriers...' : 'Select a courier'}
                  </option>
                  {activeCouriers.map(courier => (
                    <option key={courier} value={courier}>{courier}</option>
                  ))}
                </select>
                {activeCouriers.length === 0 && !courierLoading && (
                  <p className="text-xs text-gray-500 mt-1">No active couriers found. Please activate couriers in Courier API settings.</p>
                )}
              </div>
              {/* City + Zone (side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <input type="text" name="zone" value={form.zone || ''} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
              </div>
              {/* Order Date, Delivery Date, Paid/Return Date (side by side) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <input type="date" name="orderDate" value={form.orderDate || ''} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <input type="date" name="deliveryDate" value={form.deliveryDate || ''} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid/Return Date</label>
                  <input type="date" name="paidReturnDate" value={form.paidReturnDate || ''} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" />
                </div>
              </div>
              </div>
            </div>

            {/* 2nd Box: Order Details */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-0 mb-0">
              <div className="border-b px-6 py-4 bg-gray-100 rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
              </div>
              <div className="p-8 space-y-6">
              {/* Product+Calculation Table */}
              <div className="w-full bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <table className="w-full border rounded mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {form.products.map((item, idx) => {
                      const prod = getProductById(item.id) || {};
                      return (
                        <tr key={item.id || idx}>
                          
                          <td className="px-3 py-2 text-sm">
                            <div className="flex items-center space-x-2">
                              {prod.image && <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded" />}
                              <span>{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <input type="number" min="1" value={item.quantity || 1} onChange={e => handleProductChange(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-16 px-2 py-2 border rounded" />
                          </td>
                          <td className="px-3 py-2 text-sm font-semibold">{item.price}</td>
                          <td className="px-3 py-2">
                            <button type="button" onClick={() => handleRemoveProduct(idx)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mb-2">
                  <Select
                    options={productOptions}
                    onChange={handleAddProduct}
                    placeholder="Select a Product"
                    isClearable
                    components={{
                      Option: CustomOption
                    }}
                    styles={{
                      option: (provided) => ({
                        ...provided,
                        padding: 0
                      })
                    }}
                  />
                </div>
              </div>
              {/* Payment and Calculation Fields in two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                    <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none">
                      <option value="">Select a payment Method</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Bkash">Bkash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Upay">Upay</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  {/* Payment Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Account <span className="text-red-500">*</span></label>
                    <input type="text" name="paymentNumber" value={form.paymentNumber} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" placeholder="Select a payment Number" />
                  </div>
                  {/* Trx Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input type="text" name="trxNumber" value={form.trxNumber} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" placeholder="Transaction ID" />
                  </div>
                  {/* Parcel ID/Courier ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parcel ID/ Courier ID</label>
                    <input type="text" name="memo" value={form.memo} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none" placeholder="Memo" />
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-right font-bold text-gray-800 shadow-sm">
                      ৳{subtotal.toFixed(2)}
                    </div>
                  </div>
                  {/* Delivery Charge */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge <span className="text-red-500">*</span></label>
                    <input type="number" name="deliveryCharge" value={form.deliveryCharge} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none text-right" />
                  </div>
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <input type="number" name="discount" value={form.discount} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none text-right" />
                  </div>
                  {/* Advance */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Advance</label>
                    <input type="number" name="advance" value={form.advance} onChange={handleChange} className="w-full px-4 py-2 border border-primary-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-primary-500 outline-none text-right" />
                  </div>
                  {/* Grand Total */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grand Total</label>
                    <div className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-right font-bold text-blue-800 shadow-md">
                      ৳{grandTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          {/* Order Status + Add Note Section (redesigned) এবং Quick Actions side by side */}
          <div className="w-full flex flex-col lg:flex-row gap-8 mt-8">
            <div className="w-full lg:w-1/2 bg-white rounded-xl border border-gray-200 p-0 mb-8 min-w-0">
              <div className="border-b px-6 py-4 bg-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Order Status History</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Total: {orderStatusHistory.length} entries
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderStatusHistory([]);
                        setHistoryInitialized(false);
                        initializeOrderStatusHistory();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                      title="Refresh History"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderStatusHistory([]);
                        setHistoryInitialized(false);
                      }}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                      title="Clear History"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add Notes"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={addNote}
                    className="px-6 py-2 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-md transition"
                  >
                    Update Note
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {statusHistoryLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading order status...</p>
                    </div>
                  ) : (
                    <table className="min-w-full border rounded">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Created At</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Notes</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderStatusHistory.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-4 text-center text-gray-400">No status history found.</td>
                          </tr>
                        ) : (
                          [...orderStatusHistory]
                            .sort((a, b) => {
                            // First sort by created_at (latest first)
                            const dateA = new Date(a.created_at);
                            const dateB = new Date(b.created_at);
                            if (dateA.getTime() !== dateB.getTime()) {
                              return dateB.getTime() - dateA.getTime();
                            }
                            // If timestamps are same, sort by id (higher id = more recent)
                            return (b.id || 0) - (a.id || 0);
                            })
                            .slice((currentHistoryPage - 1) * historyItemsPerPage, currentHistoryPage * historyItemsPerPage)
                            .map((history) => (
                            <tr key={history.id} className="bg-white border-t">
                              <td className="px-4 py-2 text-sm whitespace-nowrap">
                                {formatDateTime(history.created_at)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div dangerouslySetInnerHTML={{ __html: history.notes }} />
                              </td>
                              <td className="px-4 py-2 text-sm font-medium">
                                {history.user}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
                {/* Pagination */}
                {orderStatusHistory.length > historyItemsPerPage && (
                  <div className="flex justify-between items-center gap-2 mt-4">
                    <div className="text-sm text-gray-600">
                      Showing {((currentHistoryPage - 1) * historyItemsPerPage) + 1} to {Math.min(currentHistoryPage * historyItemsPerPage, orderStatusHistory.length)} of {orderStatusHistory.length} entries
                </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentHistoryPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentHistoryPage === 1}
                        className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                          currentHistoryPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 border rounded bg-blue-600 text-white font-semibold text-sm">
                        {currentHistoryPage}
                      </span>
                      <button 
                        onClick={() => setCurrentHistoryPage(prev => Math.min(prev + 1, Math.ceil(orderStatusHistory.length / historyItemsPerPage)))}
                        disabled={currentHistoryPage >= Math.ceil(orderStatusHistory.length / historyItemsPerPage)}
                        className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                          currentHistoryPage >= Math.ceil(orderStatusHistory.length / historyItemsPerPage)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 p-0 mb-8 min-w-0">
              <div className="border-b px-6 py-4 bg-gray-100 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        // Update order status
                        await updateOrder(orderId, { status: 'Completed' });
                        
                        // Add NEW entry to status history (don't overwrite existing)
                        const currentUser = localStorage.getItem('user') || 'Admin';
                        const statusNote = {
                          id: Date.now(),
                          order_id: orderId,
                          created_at: new Date().toISOString(),
                          notes: `${currentUser} Successfully Update ${orderId} Order status to Completed`,
                          user: currentUser
                        };
                        
                        // Add to beginning of history (newest first)
                        setOrderStatusHistory(prev => [statusNote, ...prev]);
                        
                        // Update form status
                        setForm(prev => ({ ...prev, status: 'Completed' }));
                        
                        setSuccessMessage('Order marked as Completed! New entry added to history.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (error) {
                        setError('Failed to update status');
                        setTimeout(() => setError(null), 5000);
                      }
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        // Update order status
                        await updateOrder(orderId, { status: 'Processing' });
                        
                        // Add NEW entry to status history (don't overwrite existing)
                        const currentUser = localStorage.getItem('user') || 'Admin';
                        const statusNote = {
                          id: Date.now(),
                          order_id: orderId,
                          created_at: new Date().toISOString(),
                          notes: `${currentUser} Successfully Update ${orderId} Order status to Processing`,
                          user: currentUser
                        };
                        
                        // Add to beginning of history (newest first)
                        setOrderStatusHistory(prev => [statusNote, ...prev]);
                        
                        // Update form status
                        setForm(prev => ({ ...prev, status: 'Processing' }));
                        
                        setSuccessMessage('Order marked as Processing! New entry added to history.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (error) {
                        setError('Failed to update status');
                        setTimeout(() => setError(null), 5000);
                      }
                    }}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Processing
                  </button>
                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        // Update order status
                        await updateOrder(orderId, { status: 'Canceled' });
                        
                        // Add NEW entry to status history (don't overwrite existing)
                        const currentUser = localStorage.getItem('user') || 'Admin';
                        const statusNote = {
                          id: Date.now(),
                          order_id: orderId,
                          created_at: new Date().toISOString(),
                          notes: `${currentUser} Successfully Update ${orderId} Order status to Canceled`,
                          user: currentUser
                        };
                        
                        // Add to beginning of history (newest first)
                        setOrderStatusHistory(prev => [statusNote, ...prev]);
                        
                        // Update form status
                        setForm(prev => ({ ...prev, status: 'Canceled' }));
                        
                        setSuccessMessage('Order marked as Canceled! New entry added to history.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (error) {
                        setError('Failed to update status');
                        setTimeout(() => setError(null), 5000);
                      }
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancel Order
                  </button>
                  <button 
                    type="button" 
                    onClick={async () => {
                      try {
                        // Update order status
                        await updateOrder(orderId, { status: 'Pending Payment' });
                        
                        // Add NEW entry to status history (don't overwrite existing)
                        const currentUser = localStorage.getItem('user') || 'Admin';
                        const statusNote = {
                          id: Date.now(),
                          order_id: orderId,
                          created_at: new Date().toISOString(),
                          notes: `${currentUser} Successfully Update ${orderId} Order status to Pending Payment`,
                          user: currentUser
                        };
                        
                        // Add to beginning of history (newest first)
                        setOrderStatusHistory(prev => [statusNote, ...prev]);
                        
                        // Update form status
                        setForm(prev => ({ ...prev, status: 'Pending Payment' }));
                        
                        setSuccessMessage('Order marked as Pending Payment! New entry added to history.');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (error) {
                        setError('Failed to update status');
                        setTimeout(() => setError(null), 5000);
                      }
                    }}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Mark as Pending Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 transform transition-all duration-300 ease-in-out">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 transform transition-all duration-300 ease-in-out">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
} 