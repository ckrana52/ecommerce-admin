import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Save, X, Package, Calendar, User, ChevronDown, Filter, ChevronLeft, ChevronRight, MapPin, StickyNote, Phone, Image, Settings, CheckCircle, Clock, AlertTriangle, DollarSign, RotateCcw, XCircle, Layers, RefreshCw, Loader2, ArrowLeft, Printer, Tag } from 'lucide-react';
import { MdReceipt, MdCheckCircle } from 'react-icons/md';
import { useNavigate, useLocation } from 'react-router-dom';
import OrderEditModal from './OrderEditModal';
import NotificationToast from '../components/NotificationToast';
import StickerPrint from '../components/StickerPrint';
import InvoicePrint from '../components/InvoicePrint';

const Order = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Print states
  const [showStickerPrint, setShowStickerPrint] = useState(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  
  // Get unique couriers, statuses, and users from orders
  const uniqueCouriers = [...new Set(orders.map(order => order.courier).filter(Boolean))];
  const uniqueStatuses = [...new Set(orders.map(order => order.status).filter(Boolean))];
  const uniqueUsers = [...new Set(orders.map(order => order.user_id).filter(Boolean))];
  const [editOrderId, setEditOrderId] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [statusLoading, setStatusLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [orderStatusHistory, setOrderStatusHistory] = useState({});
  const [currentOrderStatus, setCurrentOrderStatus] = useState({});
  const [showRegularStatusBoxes, setShowRegularStatusBoxes] = useState(false);
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [changeStatusLoading, setChangeStatusLoading] = useState(false);
  const [invoiceString, setInvoiceString] = useState('');

  
  // Date picker states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle order selection
  const handleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle select all orders on current page
  const handleSelectAll = () => {
    const currentOrderIds = currentOrders.map(order => order.id);
    setSelectedOrders(prev => {
      const allSelected = currentOrderIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !currentOrderIds.includes(id));
      } else {
        const newSelected = [...prev];
        currentOrderIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setShowDeleteModal(true);
    setDeleteOrderId(null); // null means bulk delete
  };

  // Fetch invoice string
  const fetchInvoiceString = async () => {
    try {
      const response = await fetch('/api/settings/invoice-string');
      if (response.ok) {
        const data = await response.json();
        setInvoiceString(data.invoiceString || '');
      }
    } catch (error) {
      console.error('Error fetching invoice string:', error);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (status) => {
    if (!status) {
      setToast({ show: true, message: 'Please select a status' });
      return;
    }

    try {
      setChangeStatusLoading(true);
      const token = localStorage.getItem('token');
      
      // Update all selected orders
      const updatePromises = selectedOrders.map(orderId => 
        fetch(`http://localhost:5000/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: status })
        })
      );

      await Promise.all(updatePromises);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        selectedOrders.includes(order.id) ? { ...order, status: status } : order
      ));
      
      // Clear selection and close dropdown
      setSelectedOrders([]);
      setShowChangeStatusModal(false);
      setSelectedStatus('');
      
      setToast({ show: true, message: `${selectedOrders.length} orders status updated to ${status}` });
    } catch (error) {
      console.error('Error updating order statuses:', error);
      setToast({ show: true, message: `Error: ${error.message}` });
    } finally {
      setChangeStatusLoading(false);
    }
  };

  // Status types and colors
  const statusTypes = ['All Orders', 'Processing', 'Pending Payment', 'On Hold', 'Canceled', 'Completed'];
  const statusBoxColors = {
    'All Orders': 'border-gray-300 bg-gray-50 text-gray-800',
    'Processing': 'border-blue-300 bg-blue-50 text-blue-800',
    'Pending Payment': 'border-yellow-300 bg-yellow-50 text-yellow-800',
    'On Hold': 'border-orange-300 bg-orange-50 text-orange-800',
    'Canceled': 'border-red-300 bg-red-50 text-red-800',
    'Completed': 'border-green-300 bg-green-50 text-green-800',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'All Orders': return <Layers className="w-5 h-5" />;
      case 'Processing': return <Clock className="w-5 h-5" />;
      case 'Pending Payment': return <DollarSign className="w-5 h-5" />;
      case 'On Hold': return <AlertTriangle className="w-5 h-5" />;
      case 'Canceled': return <XCircle className="w-5 h-5" />;
      case 'Completed': return <CheckCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusCount = (status) => {
    if (status === 'All Orders') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // API returns orders directly, not wrapped in success/orders structure
      if (Array.isArray(data)) {
        setOrders(data);
        
        // Fetch status history for each order
        data.forEach(order => {
          fetchOrderStatusHistory(order.id);
        });
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToast({ show: true, message: `Error: ${error.message}` });
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  };

  // Fetch order status history
  const fetchOrderStatusHistory = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrderStatusHistory(prev => ({
          ...prev,
          [orderId]: data
        }));
      } else {
        console.log(`Failed to fetch status history for order ${orderId}:`, response.status);
      }
    } catch (error) {
      console.error('Error fetching order status history:', error);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setStatusLoading(prev => ({ ...prev, [orderId]: true }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Update current order status for immediate UI update
        setCurrentOrderStatus(prev => ({
          ...prev,
          [orderId]: newStatus
        }));

        // Fetch updated status history
        await fetchOrderStatusHistory(orderId);
        
        // Navigate to specific URL for certain statuses
        if (newStatus === 'Pending Invoiced') {
          console.log('Navigating to Pending Invoiced page');
          navigate('/orders/status/Pending%20Invoiced');
        } else if (newStatus === 'Invoice Checked') {
          console.log('Navigating to Invoice Checked page');
          navigate('/orders/status/Invoice%20Checked');
        } else if (newStatus === 'Invoiced') {
          console.log('Navigating to Invoiced page');
          navigate('/orders/status/Invoiced');
        } else if (newStatus === 'Stock Out') {
          console.log('Navigating to Stock Out page');
          navigate('/orders/status/Stock%20Out');
        } else if (newStatus === 'Schedule Delivery') {
          console.log('Navigating to Schedule Delivery page');
          navigate('/orders/status/Schedule%20Delivery');
        }
        
        setToast({ show: true, message: `Order status updated to ${newStatus}` });
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setToast({ show: true, message: `Error: ${error.message}` });
    } finally {
      setStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };



  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(t => ({ ...t, show: false })), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Date picker helper functions
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        day: prevDate.getDate(),
        isCurrentMonth: false
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        day: i,
        isCurrentMonth: true
      });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        day: nextDate.getDate(),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setIsOpen(false);
  };

  const isSelected = (date) => {
    return selectedDate === date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const clearDate = () => {
    setSelectedDate('');
    setIsOpen(false);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    setCurrentMonth(today);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChangeStatusModal && !event.target.closest('.change-status-dropdown')) {
        console.log('Clicking outside, closing dropdown');
        setShowChangeStatusModal(false);
      }
      
      // Close date picker dropdown
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChangeStatusModal, isOpen]);

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchInvoiceString();
  }, []);

  // Auto reload data when page is visited/focused
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders();
      }
    };

    const handleFocus = () => {
      fetchOrders();
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window focus (when user switches back to tab)
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);



  // Sync activeFilter with URL status param
  useEffect(() => {
    const match = location.pathname.match(/\/orders\/status\/(.+)$/);
    if (match) {
      const urlStatus = decodeURIComponent(match[1]);
      console.log('URL Status detected:', urlStatus);
      if (urlStatus === 'Pending Invoiced') {
        console.log('Setting activeFilter to Pending Invoiced');
        setActiveFilter('Pending Invoiced');
      } else if (urlStatus === 'Invoice Checked') {
        setActiveFilter('Invoice Checked');
      } else if (urlStatus === 'Invoiced') {
        setActiveFilter('Invoiced');
      } else if (urlStatus === 'Stock Out') {
        setActiveFilter('Stock Out');
      } else if (urlStatus === 'Schedule Delivery') {
        setActiveFilter('Schedule Delivery');
      } else if (urlStatus === 'Delivered') {
        setActiveFilter('Delivered');
      } else if (urlStatus === 'Courier Hold') {
        setActiveFilter('Courier Hold');
      } else if (urlStatus === 'Courier Return') {
        setActiveFilter('Courier Return');
      } else if (urlStatus === 'Paid') {
        setActiveFilter('Paid');
      } else if (urlStatus === 'Return') {
        setActiveFilter('Return');
      } else if (urlStatus === 'Damaged') {
        setActiveFilter('Damaged');
      } else if (statusTypes.includes(urlStatus)) {
        setActiveFilter(urlStatus);
      } else {
        setActiveFilter('All Orders');
      }
    } else {
      setActiveFilter('All Orders');
    }
    setCurrentPage(1);
  }, [location.pathname]);

  // Filter orders based on activeFilter
  const filteredOrders = orders.filter(order => {
    let matchesStatus;
    if (activeFilter === 'All Orders') {
      matchesStatus = true;
    } else if (activeFilter === 'Pending Invoice') {
      matchesStatus = order.status === 'Completed';
    } else if (activeFilter === 'Delivered') {
      matchesStatus = order.status === 'Delivered';
    } else if (['Pending Invoiced', 'Invoice Checked', 'Invoiced', 'Stock Out', 'Schedule Delivery', 'Canceled'].includes(activeFilter)) {
      if (activeFilter === 'Pending Invoiced') {
        matchesStatus = order.status === 'Completed';
      } else {
        matchesStatus = order.status === activeFilter;
      }
    } else {
      matchesStatus = order.status === activeFilter;
    }

    const matchesOrderId = !searchOrderId || order.id.toString().includes(searchOrderId);
    const matchesPhone = !searchPhone || order.phone?.includes(searchPhone);
    const matchesCourier = !courierFilter || order.courier === courierFilter;
    const matchesStatusFilter = !statusFilter || order.status === statusFilter;
    const matchesUser = !userFilter || order.user_id?.toString() === userFilter;
    const matchesDate = !selectedDate || (order.created_at && new Date(order.created_at).toISOString().split('T')[0] === selectedDate);

    // Debug logging for Pending Invoiced
    if (activeFilter === 'Pending Invoiced') {
      console.log('Filtering order:', order.id, 'Status:', order.status, 'Matches:', matchesStatus);
    }

    return matchesStatus && matchesOrderId && matchesPhone && matchesCourier && matchesStatusFilter && matchesUser && matchesDate;
  });

  // Debug logging
  if (activeFilter === 'Pending Invoiced') {
    console.log('Active Filter:', activeFilter);
    console.log('Total Orders:', orders.length);
    console.log('Filtered Orders:', filteredOrders.length);
    console.log('All Order Statuses:', orders.map(o => ({ id: o.id, status: o.status })));
  }

  // Pagination
  const ordersPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen p-2">
      <div className="p-3 sm:p-6">
        {/* Delivered Status Boxes */}
        {['Delivered', 'Courier Hold', 'Courier Return', 'Paid', 'Return', 'Damaged'].includes(activeFilter) && !showRegularStatusBoxes && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { status: 'Delivered', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-5 h-5" />, count: orders.filter(order => order.status === 'Delivered').length, url: '/orders/status/Delivered' },
              { status: 'Courier Hold', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="w-5 h-5" />, count: orders.filter(order => order.status === 'Courier Hold').length, url: '/orders/status/Courier%20Hold' },
              { status: 'Courier Return', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <ArrowLeft className="w-5 h-5" />, count: orders.filter(order => order.status === 'Courier Return').length, url: '/orders/status/Courier%20Return' },
              { status: 'Paid', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <DollarSign className="w-5 h-5" />, count: orders.filter(order => order.status === 'Paid').length, url: '/orders/status/Paid' },
              { status: 'Return', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <RefreshCw className="w-5 h-5" />, count: orders.filter(order => order.status === 'Return').length, url: '/orders/status/Return' },
              { status: 'Damaged', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-5 h-5" />, count: orders.filter(order => order.status === 'Damaged').length, url: '/orders/status/Damaged' }
            ].map((item) => (
              <button
                key={item.status}
                onClick={async () => {
                  await fetchOrders();
                  navigate(item.url);
                }}
                className={`p-4 rounded-xl border-2 ${item.color} flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                  activeFilter === item.status ? 'shadow-lg scale-105' : ''
                }`}
              >
                <div className="text-left">
                  <div className="text-2xl font-bold mb-1">{item.count}</div>
                  <div className="text-sm font-medium">{item.status}</div>
                </div>
                <div>{item.icon}</div>
              </button>
            ))}
          </div>
        )}

        {/* Invoice Status Boxes */}
        {['Pending Invoice', 'Pending Invoiced', 'Invoice Checked', 'Invoiced', 'Stock Out', 'Schedule Delivery', 'Canceled'].includes(activeFilter) && !showRegularStatusBoxes && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { status: 'Pending Invoiced', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Clock className="w-5 h-5" />, count: orders.filter(order => order.status === 'Completed').length, url: '/orders/status/Pending%20Invoiced' },
              { status: 'Invoice Checked', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle className="w-5 h-5" />, count: orders.filter(order => order.status === 'Invoice Checked').length, url: '/orders/status/Invoice%20Checked' },
              { status: 'Invoiced', color: 'bg-green-100 text-green-800 border-green-300', icon: <Package className="w-5 h-5" />, count: orders.filter(order => order.status === 'Invoiced').length, url: '/orders/status/Invoiced' },
              { status: 'Stock Out', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-5 h-5" />, count: orders.filter(order => order.status === 'Stock Out').length, url: '/orders/status/Stock%20Out' },
              { status: 'Schedule Delivery', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <Calendar className="w-5 h-5" />, count: orders.filter(order => order.status === 'Schedule Delivery').length, url: '/orders/status/Schedule%20Delivery' },
              { status: 'Canceled', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-5 h-5" />, count: orders.filter(order => order.status === 'Canceled').length, url: '/orders/status/Canceled' }
            ].map((item) => (
              <button
                key={item.status}
                onClick={async () => {
                  await fetchOrders();
                  navigate(item.url);
                }}
                className={`p-4 rounded-xl border-2 ${item.color} flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                  activeFilter === item.status ? 'shadow-lg scale-105' : ''
                }`}
              >
                <div className="text-left">
                  <div className="text-2xl font-bold mb-1">{item.count}</div>
                  <div className="text-sm font-medium">{item.status}</div>
                </div>
                <div>{item.icon}</div>
              </button>
            ))}
          </div>
        )}

        {/* Regular Status Boxes */}
        {!['Pending Invoice', 'Pending Invoiced', 'Invoice Checked', 'Invoiced', 'Stock Out', 'Schedule Delivery', 'Canceled', 'Delivered', 'Courier Hold', 'Courier Return', 'Paid', 'Return', 'Damaged'].includes(activeFilter) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statusTypes.map((status) => (
              <button
                key={status}
                onClick={async () => {
                  await fetchOrders();
                  if (status === 'All Orders') {
                    navigate('/orders');
                  } else {
                    navigate(`/orders/status/${encodeURIComponent(status)}`);
                  }
                }}
                className={`p-4 rounded-xl border-2 ${statusBoxColors[status]} flex items-center justify-between transition-all duration-300 hover:shadow-md ${
                  activeFilter === status ? 'shadow-lg scale-105' : ''
                }`}
              >
                <div className="text-left">
                  <div className="text-2xl font-bold mb-1">{getStatusCount(status)}</div>
                  <div className="text-sm font-medium">{status}</div>
                </div>
                <div>{getStatusIcon(status)}</div>
              </button>
            ))}
          </div>
        )}

        {/* Order Management Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {['Pending Invoice', 'Pending Invoiced', 'Invoice Checked', 'Invoiced', 'Stock Out', 'Schedule Delivery'].includes(activeFilter) ? (
                  <span className="flex items-center gap-2">
                    <MdReceipt className="w-6 h-6 text-purple-600" />
                    <span>{activeFilter === 'Pending Invoice' ? 'Invoice Management' : `${activeFilter} Orders`}</span>
                    <span className="ml-2 text-base font-semibold text-purple-600">
                      ({activeFilter === 'Pending Invoiced' 
                        ? orders.filter(order => order.status === 'Completed').length
                        : orders.filter(order => order.status === activeFilter).length
                      })
                    </span>
                  </span>
                ) : ['Delivered', 'Courier Hold', 'Courier Return', 'Paid', 'Return', 'Damaged'].includes(activeFilter) ? (
                  <span className="flex items-center gap-2">
                    <MdCheckCircle className="w-6 h-6 text-green-600" />
                    <span>{activeFilter} Orders</span>
                    <span className="ml-2 text-base font-semibold text-green-600">
                      ({orders.filter(order => order.status === activeFilter).length})
                    </span>
                  </span>
                ) : (
                  <>
                    {activeFilter}
                    {['All Orders', 'Processing', 'Pending Payment', 'On Hold', 'Canceled', 'Completed'].includes(activeFilter) && (
                      <span className="ml-2 text-base font-semibold text-blue-600">
                        ({activeFilter === 'All Orders'
                          ? orders.length
                          : orders.filter(order => order.status === activeFilter).length
                        })
                      </span>
                    )}
                  </>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewOrder(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Order
              </button>
              
              {selectedOrders.length > 0 && (
                <>
                  {['Pending Invoice', 'Pending Invoiced', 'Invoice Checked', 'Invoiced', 'Stock Out', 'Schedule Delivery', 'Canceled'].includes(activeFilter) && (
                    <>
                      <button
                        onClick={() => {
                          if (selectedOrders.length === 0) {
                            setToast({ show: true, message: 'Please select orders to print' });
                            return;
                          }
                          setShowInvoicePrint(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print Invoice ({selectedOrders.length})
                      </button>
                      <button
                        onClick={() => {
                          if (selectedOrders.length === 0) {
                            setToast({ show: true, message: 'Please select orders to print stickers' });
                            return;
                          }
                          setShowStickerPrint(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Sticker Print ({selectedOrders.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {}}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    User Assign
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        console.log('Dropdown clicked, current state:', showChangeStatusModal);
                        setShowChangeStatusModal(!showChangeStatusModal);
                      }}
                      className="change-status-dropdown px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Change Status
                    </button>
                    
                    {/* Status Dropdown */}
                    {showChangeStatusModal && (
                      <div className="change-status-dropdown absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-[200px]" style={{display: 'block'}}>
                        <div className="py-2">
                          {[
                            'Processing',
                            'On Hold', 
                            'Pending Payment',
                            'Schedule Delivery',
                            'Canceled',
                            'Completed'
                          ].map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setSelectedStatus(status);
                                handleBulkStatusChange(status);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedOrders.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Phone"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Date Picker - Highlighted with red border */}
            <div className="relative" ref={dropdownRef}>
              <div className="border border-gray-300 rounded-lg">
                <input
                  ref={inputRef}
                  type="text"
                  value={selectedDate}
                  placeholder="Select Date"
                  onClick={() => setIsOpen(!isOpen)}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Calendar size={18} />
                </div>
              </div>

              {/* Calendar Dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 h-80 flex flex-col">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    
                    <div className="text-sm font-semibold text-gray-900">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={clearDate}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={goToToday}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex-1 p-3 flex flex-col">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-0 mb-1 flex-shrink-0">
                      {weekdays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-0 flex-1">
                      {days.map((dayObj, index) => (
                        <button
                          key={index}
                          onClick={() => dayObj.isCurrentMonth && handleDateSelect(dayObj.date)}
                          disabled={!dayObj.isCurrentMonth}
                          className={`
                            flex items-center justify-center text-xs rounded transition-all duration-200 min-h-[32px]
                            ${!dayObj.isCurrentMonth 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                            }
                            ${isSelected(dayObj.date) 
                              ? 'bg-blue-600 text-white hover:bg-blue-700' 
                              : ''
                            }
                            ${isToday(dayObj.date) && !isSelected(dayObj.date)
                              ? 'bg-blue-100 text-blue-600 font-semibold' 
                              : ''
                            }
                          `}
                        >
                          {dayObj.day}
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              )}
            </div>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={courierFilter}
                onChange={(e) => setCourierFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Couriers</option>
                {uniqueCouriers.map(courier => (
                  <option key={courier} value={courier}>
                    {courier.charAt(0).toUpperCase() + courier.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(userId => (
                <option key={userId} value={userId}>
                  User {userId}
                </option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={currentOrders.length > 0 && currentOrders.every(order => selectedOrders.includes(order.id))}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Products</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Courier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Note</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleOrderSelection(order.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-blue-600 font-medium">
                            {invoiceString && `${invoiceString}${order.id}`}
                            {!invoiceString && `#${order.id}`}
                          </span>
                          <div className="text-xs text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }).replace(',', '') : 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{order.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="w-4 h-4" />
                            <span>{order.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-xs" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'normal' }}>{order.address || 'No address'}</span>
                          </div>
                          {order.note && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <StickyNote className="w-4 h-4" />
                              <span className="truncate max-w-xs">{order.note}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {order.products && order.products.length > 0 ? (
                            order.products.map((product, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden relative">
                                  {product.image && product.image.trim() !== '' ? (
                                    <img 
                                      src={`http://localhost:5000${product.image}`} 
                                      alt={product.name || 'Product'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.log('Image failed to load:', product.image, 'URL:', `http://localhost:5000${product.image}`);
                                        e.target.style.display = 'none';
                                        const fallback = e.target.parentNode.querySelector('.fallback-icon');
                                        if (fallback) {
                                          fallback.style.display = 'flex';
                                        }
                                      }}
                                      onLoad={(e) => {
                                        console.log('Image loaded successfully:', product.image);
                                        const fallback = e.target.parentNode.querySelector('.fallback-icon');
                                        if (fallback) {
                                          fallback.style.display = 'none';
                                        }
                                      }}
                                    />
                                  ) : null}
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center fallback-icon absolute inset-0" style={{ display: (product.image && product.image.trim() !== '') ? 'none' : 'flex' }}>
                                    <Package className="w-4 h-4 text-gray-500" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'normal' }}>
                                    {product.name || 'Unknown Product'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Qty: {product.quantity} × ৳{Math.floor(product.price)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-500">No products</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium"><span className="text-sm font-extrabold">৳</span>{Math.floor(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.courier === 'pathao' ? 'bg-green-100 text-green-800' :
                          order.courier === 'steadfast' ? 'bg-blue-100 text-blue-800' :
                          order.courier === 'paperfly' ? 'bg-yellow-100 text-yellow-800' :
                          order.courier === 'parceldex' ? 'bg-purple-100 text-purple-800' :
                          order.courier === 'bahok' ? 'bg-orange-100 text-orange-800' :
                          'bg-orange-200  text-gray-800'
                        }`}>
                          {order.courier ? order.courier.charAt(0).toUpperCase() + order.courier.slice(1) : 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentOrderStatus[order.id] || order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={statusLoading[order.id]}
                          className={`px-2 py-1 rounded text-xs font-medium border ${
                            order.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.status === 'Canceled' ? 'bg-red-100 text-red-800 border-red-300' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.status === 'Paid' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            order.status === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            order.status === 'Pending Payment' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            order.status === 'On Hold' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {['Pending Invoiced', 'Schedule Delivery', 'Stock Out', 'Invoiced', 'Invoice Checked'].includes(activeFilter) ? (
                            <>
                              <option value="Pending Invoiced">Pending Invoiced</option>
                              <option value="Invoice Checked">Invoice Checked</option>
                              <option value="Invoiced">Invoiced</option>
                              <option value="Stock Out">Stock Out</option>
                              <option value="Schedule Delivery">Schedule Delivery</option>
                              <option value="Canceled">Canceled</option>
                              <option value="Delivered">Delivered</option>
                            </>
                          ) : (
                            <>
                              <option value="On Hold">On Hold</option>
                              <option value="Pending Payment">Pending Payment</option>
                              <option value="Schedule Delivery">Schedule Delivery</option>
                              <option value="Canceled">Canceled</option>
                              <option value="Completed">Completed</option>
                            </>
                          )}
                        </select>
                        {statusLoading[order.id] && (
                          <Loader2 className="w-3 h-3 animate-spin ml-1 inline" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 max-w-xs">
                          {orderStatusHistory[order.id] && orderStatusHistory[order.id].length > 0 ? (
                            <div>
                              <div className="font-medium text-gray-800">
                                {orderStatusHistory[order.id][orderStatusHistory[order.id].length - 1].notes}
                              </div>
                              <div className="text-gray-500 mt-1">
                                Updated {new Date(orderStatusHistory[order.id][orderStatusHistory[order.id].length - 1].created_at).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500">No notes</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditOrderId(order.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteOrderId(order.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      {loading ? 'Loading orders...' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editOrderId && (
        <OrderEditModal orderId={editOrderId} onClose={() => setEditOrderId(null)} onSaved={fetchOrders} />
      )}
      {showNewOrder && (
        <OrderEditModal isNew={true} onClose={() => setShowNewOrder(false)} onSaved={fetchOrders} />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[400px] max-w-md border border-gray-200 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {deleteOrderId ? 'Delete Order?' : `Delete ${selectedOrders.length} Orders?`}
              </h3>
              <p className="text-gray-600 mb-2">
                {deleteOrderId 
                  ? 'Are you sure you want to delete this order? This action cannot be undone.'
                  : `Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone.`
                }
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                onClick={() => { 
                  setShowDeleteModal(false); 
                  setDeleteOrderId(null); 
                }}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteOrderId(null);
                }}
                disabled={deleteLoading}
              >
                {deleteLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                {deleteOrderId ? 'Delete Order' : `Delete ${selectedOrders.length} Orders`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Print Modals */}
      {showStickerPrint && (
        <StickerPrint
          selectedOrders={selectedOrders}
          orders={orders}
          onClose={() => setShowStickerPrint(false)}
          invoiceString={invoiceString}
        />
      )}

      {showInvoicePrint && (
        <InvoicePrint
          selectedOrders={selectedOrders}
          orders={orders}
          onClose={() => setShowInvoicePrint(false)}
          invoiceString={invoiceString}
        />
      )}
      
      <NotificationToast show={toast.show} message={toast.message} />
    </div>
  );
};


export default Order;