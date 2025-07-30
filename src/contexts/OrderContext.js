import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch all orders
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const devMode = localStorage.getItem('devMode') === 'true';
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      console.log('Fetching orders with token:', token ? 'Present' : 'Missing');
      console.log('Development mode:', devMode);
      
      // If no token and not in dev mode, show authentication error
      if (!token && !devMode) {
        throw new Error('Authentication required. Please log in or enable development mode.');
      }
      
      const res = await fetch('/api/orders', { headers });
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', errorText);
        
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (res.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else {
          throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
        }
      }
      
      let data = await res.json();
      console.log('Orders data:', data);
      
      // লেটেস্ট অর্ডার আগে দেখানোর জন্য sort করুন
      data = data.sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return (b.id || 0) - (a.id || 0);
      });
      
      setOrders(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all invoices - REMOVED (invoices functionality deleted)
  const fetchAllInvoices = async () => {
    // This function is kept for compatibility but does nothing
    // since invoices functionality has been removed
  };

  // Fetch delivered orders
  const fetchDeliveredOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      
      const res = await fetch('/api/orders/delivered', { headers });
      if (res.ok) {
        const data = await res.json();
        setDeliveredOrders(data);
      } else {
        // If endpoint doesn't exist, fetch all orders and filter
        const allRes = await fetch('/api/orders', { headers });
        if (allRes.ok) {
          const allOrders = await allRes.json();
          const deliveredOrders = allOrders.filter(order => 
            order.status === 'delivered' || 
            order.status === 'courier_hold' || 
            order.status === 'courier_return' || 
            order.status === 'paid' || 
            order.status === 'return' || 
            order.status === 'damaged'
          );
          setDeliveredOrders(deliveredOrders);
        }
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order in all lists
  const updateOrder = async (orderId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        
        // Update in orders list
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        ));

        // Update in delivered orders list if it exists there
        setDeliveredOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, ...updatedOrder } : order
        ));

        // Update in invoices list if it exists there
        setInvoices(prev => prev.map(invoice => 
          invoice.order_id === orderId ? { ...invoice, ...updatedOrder } : invoice
        ));

        setLastUpdate(new Date());
        return updatedOrder;
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        setLastUpdate(new Date());
        return newOrder;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Delete order from all lists
  const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        // Remove from orders list
        setOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Remove from delivered orders list
        setDeliveredOrders(prev => prev.filter(order => order.id !== orderId));
        
        // Remove from invoices list
        setInvoices(prev => prev.filter(invoice => invoice.order_id !== orderId));
        
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([
      fetchAllOrders(),
      fetchAllInvoices(),
      fetchDeliveredOrders()
    ]);
  };

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, []);

  const value = {
    orders,
    invoices,
    deliveredOrders,
    loading,
    lastUpdate,
    updateOrder,
    createOrder,
    deleteOrder,
    refreshAllData,
    fetchAllOrders,
    fetchAllInvoices,
    fetchDeliveredOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}; 