import React, { useState, useEffect } from 'react';
import { Plus, Send, Edit2, Trash2, Search, Phone, MessageSquare, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import NotificationToast from '../components/NotificationToast';

export default function SMSTable() {
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSms, setEditingSms] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showTemplates, setShowTemplates] = useState(false);

  // Form state for new SMS
  const [formData, setFormData] = useState({
    customerNumber: '',
    content: '',
    status: 'Pending'
  });

  // Auto-message templates
  const autoMessageTemplates = [
    {
      name: 'Order Confirmation',
      template: '{customerName} অর্ডারের জন্য ধন্যবাদ । অর্ডার নম্বর - {orderId}, কল করা হবে - {phoneNumber}'
    },
    {
      name: 'Order Processing',
      template: 'আপনার অর্ডার {orderId} প্রসেসিং এ আছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।'
    },
    {
      name: 'Order Shipped',
      template: 'আপনার অর্ডার {orderId} পাঠানো হয়েছে। ট্র্যাকিং নম্বর: {trackingNumber}'
    },
    {
      name: 'Order Delivered',
      template: 'আপনার অর্ডার {orderId} সফলভাবে ডেলিভারি হয়েছে। ধন্যবাদ!'
    }
  ];

  useEffect(() => {
    fetchSmsLogs();
  }, []);

  const fetchSmsLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      const res = await fetch('/api/sms', { headers });
      if (!res.ok) throw new Error('Failed to fetch SMS logs');
      const data = await res.json();
      setSmsLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };
      
      const url = editingSms ? `/api/sms/${editingSms.id}` : '/api/sms';
      const method = editingSms ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save SMS');
      
      setToast({ show: true, message: `SMS ${editingSms ? 'updated' : 'added'} successfully!` });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
      
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingSms(null);
      setFormData({ customerNumber: '', content: '', status: 'Pending' });
      fetchSmsLogs();
    } catch (err) {
      setToast({ show: true, message: 'Error: ' + err.message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      await fetch(`/api/sms/${id}`, { method: 'DELETE', headers });
      setToast({ show: true, message: 'SMS deleted successfully!' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
      setDeleteId(null);
      fetchSmsLogs();
    } catch (err) {
      setToast({ show: true, message: 'Error deleting SMS: ' + err.message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  const handleEdit = (sms) => {
    setEditingSms(sms);
    setFormData({
      customerNumber: sms.customerNumber || sms.phone || '',
      content: sms.content || sms.message || '',
      status: sms.status || 'Pending'
    });
    setShowEditModal(true);
  };

  const sendAutoMessage = async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      };
      
      // Generate message using template
      const message = autoMessageTemplates[0].template
        .replace('{customerName}', orderData.name || 'Customer')
        .replace('{orderId}', orderData.id)
        .replace('{phoneNumber}', orderData.phone || 'N/A');
      
      const smsData = {
        customerNumber: orderData.phone,
        content: message,
        status: 'Sent',
        orderId: orderData.id,
        customerName: orderData.name
      };
      
      await fetch('/api/sms', {
        method: 'POST',
        headers,
        body: JSON.stringify(smsData)
      });
      
      setToast({ show: true, message: 'Auto message sent successfully!' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
      fetchSmsLogs();
    } catch (err) {
      setToast({ show: true, message: 'Error sending auto message: ' + err.message });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    }
  };

  const filteredSms = smsLogs.filter(sms =>
    sms.customerNumber?.includes(search) || 
    sms.content?.toLowerCase().includes(search.toLowerCase()) ||
    sms.id?.toString().includes(search)
  );

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Auto Message Templates Section - Moved to Top */}
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Auto Message Templates</h3>
              <p className="text-gray-600 mt-1">Predefined message templates for automatic order notifications</p>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
              title={showTemplates ? 'Hide Templates' : 'Show Templates'}
            >
              {showTemplates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          {showTemplates && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {autoMessageTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFormData({
                        customerNumber: '',
                        content: template.template,
                        status: 'Pending'
                      });
                      setShowAddModal(true);
                    }}
                    className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-700">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.template}</p>
                    <span className="text-blue-600 group-hover:text-blue-800 text-sm font-medium">
                      Use Template →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SMS Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">SMS Management</h3>
              <p className="text-gray-600 mt-1">View and manage all SMS logs and auto-messages</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, phone, or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add SMS</span>
              </button>
            </div>
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
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer Number</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">SMS Content</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No SMS logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredSms.map((sms) => (
                      <tr key={sms.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            #{sms.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{sms.customerNumber || sms.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-md">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                              <div className="text-sm text-gray-700 leading-relaxed">
                                {sms.content || sms.message}
                              </div>
                            </div>
                            {sms.created_at && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(sms.created_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(sms.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sms.status)}`}>
                              {sms.status || 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(sms)}
                              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300"
                              title="Edit SMS"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(sms.id)}
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300"
                              title="Delete SMS"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add SMS Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[500px] max-w-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-6">Add New SMS</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerNumber}
                    onChange={(e) => setFormData({...formData, customerNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    rows={4}
                    placeholder="Enter your message here..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Sent">Sent</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ customerNumber: '', content: '', status: 'Pending' });
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Send SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SMS Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[500px] max-w-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-6">Edit SMS</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerNumber}
                    onChange={(e) => setFormData({...formData, customerNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    rows={4}
                    placeholder="Enter your message here..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Sent">Sent</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSms(null);
                    setFormData({ customerNumber: '', content: '', status: 'Pending' });
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Update SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[400px] max-w-md border border-gray-200 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Delete SMS?</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this SMS? This action cannot be undone.
              </p>
              <p className="text-gray-500 text-sm">
                নিশ্চিতভাবে এই SMS ডিলিট করতে চান?
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                onClick={() => handleDelete(deleteId)}
              >
                Delete SMS
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationToast show={toast.show} message={toast.message} />
    </div>
  );
} 