import { useState, useEffect } from 'react';
import CommonButton from '../components/CommonButton.jsx';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

export default function ReviewTable() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    customerName: '', 
    customerPhone: '', 
    customerAddress: '', 
    productId: '', 
    review: '', 
    rating: '' 
  });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  function fetchReviews() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/reviews', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function fetchProducts() {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Failed to fetch products:', err));
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch(`/api/reviews/${id}`, { method: 'DELETE', headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchReviews();
      })
      .catch(err => alert('Delete failed: ' + err.message));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/reviews/${editId}` : '/api/reviews';
    const token = localStorage.getItem('token');
    const headers = { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token 
    };
    fetch(url, {
      method,
      headers,
      body: JSON.stringify(form)
    })
      .then(res => {
        if (!res.ok) throw new Error(editId ? 'Failed to update review' : 'Failed to add review');
        setShowModal(false);
        setForm({ customerName: '', customerPhone: '', customerAddress: '', productId: '', review: '', rating: '' });
        setEditId(null);
        fetchReviews();
      })
      .catch(err => alert((editId ? 'Update' : 'Add') + ' failed: ' + err.message))
      .finally(() => setSaving(false));
  }

  function openEdit(review) {
    setForm({
      customerName: review.customerName || review.customer_name || '',
      customerPhone: review.customerPhone || review.customer_phone || '',
      customerAddress: review.customerAddress || review.customer_address || '',
      productId: review.productId || review.product_id || '',
      review: review.review || review.comment || '',
      rating: review.rating || ''
    });
    setEditId(review.id);
    setShowModal(true);
  }

  function openAdd() {
    setForm({ customerName: '', customerPhone: '', customerAddress: '', productId: '', review: '', rating: '' });
    setEditId(null);
    setShowModal(true);
  }

  const filteredReviews = reviews.filter(review => 
    review.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    review.productName?.toLowerCase().includes(search.toLowerCase()) ||
    review.review?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> 
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
                <p className="text-gray-600 mt-1">Manage customer reviews and ratings for products</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <CommonButton color="primary" icon={<FaPlus />} onClick={openAdd}>
                  Add New Review
                </CommonButton>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Review</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-red-500">{error}</td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No reviews found.</td>
                  </tr>
                ) : (
                  filteredReviews.map(review => (
                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{review.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{review.productName || review.product_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{review.customerName || review.customer_name}</div>
                          <div className="text-gray-500 text-xs">{review.customerPhone || review.customer_phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {review.review || review.comment}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-medium">{review.rating}</span>
                          <span className="text-yellow-500 ml-1">★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {review.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CommonButton color="warning" icon={<FaEdit />} onClick={() => openEdit(review)}>
                            Edit
                          </CommonButton>
                          <CommonButton color="danger" icon={<FaTrash />} onClick={() => handleDelete(review.id)}>
                            Delete
                          </CommonButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Review' : 'Add New Review'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input 
                  name="customerName" 
                  value={form.customerName} 
                  onChange={handleChange} 
                  required 
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Enter customer name" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                <input 
                  name="customerPhone" 
                  value={form.customerPhone} 
                  onChange={handleChange} 
                  required 
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Enter customer phone" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address</label>
                <textarea 
                  name="customerAddress" 
                  value={form.customerAddress} 
                  onChange={handleChange} 
                  required 
                  rows={2}
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Enter customer address" 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select 
                  name="productId" 
                  value={form.productId} 
                  onChange={handleChange} 
                  required 
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select One</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea 
                  name="review" 
                  value={form.review} 
                  onChange={handleChange} 
                  required 
                  rows={3}
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors" 
                  placeholder="Enter review content" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select 
                  name="rating" 
                  value={form.rating} 
                  onChange={handleChange} 
                  required 
                  className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                type="button" 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" 
                onClick={() => { setShowModal(false); setEditId(null); }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
                disabled={saving}
              >
                {saving ? (editId ? 'Updating...' : 'Saving...') : (editId ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 