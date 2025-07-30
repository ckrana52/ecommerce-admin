import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Users, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    ip_address: '',
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const itemsPerPage = 50;
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
    const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      const res = await fetch('/api/customers', { headers });
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
        setCustomers(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
      });
  };

  const handleAdd = async () => {
    if (formData.name && formData.email && formData.ip_address) {
      try {
    const token = localStorage.getItem('token');
    const headers = { 
      'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
    };
        const res = await fetch('/api/customers', {
          method: 'POST',
      headers,
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to add customer');
        setFormData({ ip_address: '', name: '', email: '', phone: '', address: '' });
        setShowAddForm(false);
        fetchCustomers();
      } catch (err) {
        alert('Add failed: ' + err.message);
  }
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      ip_address: customer.ip_address || '',
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };
      const res = await fetch(`/api/customers/${editingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to update customer');
      setEditingId(null);
      setFormData({ ip_address: '', name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      alert('Update failed: ' + err.message);
  }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      fetchCustomers();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ ip_address: '', name: '', email: '', phone: '', address: '' });
  };

  const handleView = (customer) => {
    alert(`Customer Details:\n\nID: ${customer.id}\nIP: ${customer.ip_address}\nName: ${customer.name}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAddress: ${customer.address}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Customer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="ip_address"
                placeholder="IP Address"
                value={formData.ip_address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="text"
                name="name"
                placeholder="Customer Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
        <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="mb-4">
              <textarea
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
            <div className="flex space-x-3">
        <button
                onClick={handleAdd}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
        >
                <Save className="w-4 h-4" />
                <span>Save Customer</span>
        </button>
        <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Customer List</h3>
              <p className="text-gray-600 mt-1 text-sm md:text-base">View and manage all customer information</p>
            </div>
                          <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-medium flex items-center space-x-1 md:space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-3 h-3 md:w-5 md:h-5" />
                <span>Add New Customer</span>
        </button>
      </div>
          <div className="overflow-x-auto">
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
              <table className="w-full">
            <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">IP Address</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Address</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {editingId === customer.id ? (
                        <>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{customer.id}</span>
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              name="ip_address"
                              value={formData.ip_address}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleUpdate}
                                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{customer.id}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{customer.ip_address}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{customer.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                              {customer.email}
                            </a>
                          </td>
                          <td className="py-4 px-6">
                            <a href={`tel:${customer.phone}`} className="text-green-600 hover:text-green-800 hover:underline">
                              {customer.phone}
                            </a>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs truncate text-gray-600" title={customer.address}>
                              {customer.address}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(customer)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(customer)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                                title="Edit Customer"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                    </td>
                        </>
                      )}
                  </tr>
                  ))}
            </tbody>
          </table>
            )}
        </div>

          {customers.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No customers found</div>
              <p className="text-gray-500">Add your first customer to get started.</p>
            </div>
          )}
          
          {/* Pagination */}
          {customers.length > itemsPerPage && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, customers.length)} of {customers.length} customers
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
                    <ChevronLeft className="w-5 h-5" />
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
                    <ChevronRight className="w-5 h-5" />
                  </button>
            </div>
            </div>
            </div>
          )}
            </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>Customer Management System</p>
        </div>
      </div>
    </div>
  );
};

export default Customer;