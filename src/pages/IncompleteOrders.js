import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationToast from '../components/NotificationToast';

const IncompleteOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Incomplete');

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const navigate = useNavigate();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  useEffect(() => {
    fetchIncompleteOrders();
  }, []);

  const fetchIncompleteOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      // Try to fetch incomplete orders from the new endpoint
      let res = await fetch('/api/orders/incomplete', { headers });
      
      if (!res.ok) {
        // If the endpoint doesn't exist, fetch all orders and filter
        res = await fetch('/api/orders', { headers });
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const allOrders = await res.json();
        // Filter incomplete orders (orders with specific status)
        const incompleteOrders = allOrders.filter(order => 
          order.status === 'incomplete' || 
          order.status === 'abandoned'
        );
        setOrders(incompleteOrders);
      } else {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching incomplete orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.id}?`)) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: 'Bearer ' + token } : {};
        
        const res = await fetch(`/api/orders/${order.id}`, {
          method: 'DELETE',
          headers
        });
        
        if (!res.ok) throw new Error('Failed to delete order');
        
        setOrders(orders.filter(o => o.id !== order.id));
        // Remove from selected orders if it was selected
        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
        
        // Show success toast
        setToastMessage(`Order #${order.id} deleted successfully!`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        // Show error toast
        setToastMessage(`Delete failed: ${err.message}`);
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
      setSelectAll(false);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
      setSelectAll(true);
    }
  };



  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      setToastMessage('Please select orders to delete');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: 'Bearer ' + token } : {};
        
        // Delete all selected orders
        const deletePromises = selectedOrders.map(orderId =>
          fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers
          })
        );
        
        await Promise.all(deletePromises);
        
        // Remove deleted orders from state
        setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
        setSelectedOrders([]);
        setSelectAll(false);
        
        // Show success toast
        setToastMessage(`Successfully deleted ${selectedOrders.length} orders!`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        // Show error toast
        setToastMessage(`Bulk delete failed: ${err.message}`);
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleMoveToMainOrders = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };
      
      // Update order status to 'pending' to move it to main orders
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ 
          status: 'pending',
          payment_status: 'pending'
        })
      });
      
      if (!res.ok) throw new Error('Failed to move order');
      
      // Remove from incomplete orders list (since status is now 'pending')
      setOrders(orders.filter(o => o.id !== order.id));
      
      // Show success toast
      setToastMessage(`Order #${order.id} moved to main orders successfully!`);
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      // Show error toast
      setToastMessage(`Failed to move order: ${err.message}`);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'incomplete':
        return 'bg-red-100 text-red-800';
      case 'abandoned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status types for filter boxes
  const statusTypes = ['All Incomplete', 'Incomplete', 'Abandoned'];

  const getStatusCount = (status) => {
    if (status === 'All Incomplete') return orders.length;
    switch (status) {
      case 'Incomplete': return orders.filter(order => order.status === 'incomplete').length;
      case 'Abandoned': return orders.filter(order => order.status === 'abandoned').length;
      default: return 0;
    }
  };

  const filteredOrders = orders
    .filter(order => {
      // First apply search filter
      const matchesSearch = 
        order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Then apply status filter based on activeFilter
      let matchesStatus = true;
      if (activeFilter !== 'All Incomplete') {
        switch (activeFilter) {
          case 'Incomplete':
            matchesStatus = order.status === 'incomplete';
            break;
          case 'Abandoned':
            matchesStatus = order.status === 'abandoned';
            break;
          default:
            matchesStatus = true;
        }
      }
      
      return matchesSearch && matchesStatus;
    })
    .filter(order =>
      order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by created_at (latest first), then by id (latest first)
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // If created_at is not available, sort by id (latest first)
      return b.id - a.id;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Status Filter Boxes - HIDDEN */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusTypes.map((status) => (
          <button
            key={status}
            onClick={() => {
              setActiveFilter(status);
              setCurrentPage(1);
            }}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              activeFilter === status
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${
                activeFilter === status ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {getStatusCount(status)}
              </div>
              <div className={`text-sm font-medium ${
                activeFilter === status ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {status}
              </div>
            </div>
          </button>
        ))}
      </div> */}

      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {activeFilter}
                  <span className="ml-2 text-base font-semibold text-blue-600">
                    ({filteredOrders.length})
                  </span>
                </h3>
              </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </button>
              {selectedOrders.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedOrders.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Info</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Products</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Created Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(startIndex, endIndex).map((order, index) => (
                  <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        #{order.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {order.name || `Customer-${order.phone?.slice(-4)}` || 'N/A'}
                          </span>
                          {!order.name && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              নাম নেই
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{order.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-sm text-gray-500 max-w-xs truncate">
                            {order.address || (
                              <span className="text-yellow-600 italic">ঠিকানা দেওয়া হয়নি</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        {order.products && order.products.length > 0 ? (
                          order.products.map((product, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <img 
                                src={product.image || '/placeholder.png'} 
                                alt={product.name} 
                                className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  x{product.quantity} • ৳{product.price}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No</span>
                            </div>
                            <span className="text-gray-400 text-sm">No products</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-600">৳{order.total || 0}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || 'Incomplete'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMoveToMainOrders(order)}
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                          title="Move to Main Orders"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(order)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No incomplete orders found</div>
              <p className="text-gray-500">All orders have been completed or no orders match your search.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
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
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Notification Toast */}
      <NotificationToast 
        show={showToast} 
        message={toastMessage} 
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default IncompleteOrders; 