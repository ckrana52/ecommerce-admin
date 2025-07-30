import { useState, useEffect } from 'react';
import TablePagination from '../components/TablePagination';
import ProductForm from '../components/ProductForm';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NotificationToast from '../components/NotificationToast';
import CommonButton from '../components/CommonButton.jsx';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', code: '', price: '', stock: '', category: '', image: '', images: [], description: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  function fetchProducts() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/products', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function fetchCategories() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/categories', { headers })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }

  function handleDelete(id) {
    setDeleteId(id);
  }

  function confirmDelete() {
    const id = deleteId;
    setDeleteId(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch(`/api/products/${id}`, { method: 'DELETE', headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchProducts();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch(err => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
  }

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (e.target.multiple) {
        setForm(f => ({ ...f, images: Array.from(files) }));
      } else {
        setForm(f => ({ ...f, [name]: files && files.length > 0 ? files[0] : '' }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || form.name.trim() === '') {
      alert('Product name is required!');
      setSaving(false);
      return;
    }
    setSaving(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', form.name || '');
    formData.append('sku', form.sku || '');
    formData.append('code', form.code || '');
    formData.append('price', form.price || '');
    formData.append('stock', form.stock || '');
    formData.append('category_id', form.category || '');
    formData.append('description', form.description || '');
    if (form.image && typeof form.image !== 'string') {
      formData.append('image', form.image);
    }
    if (form.images && form.images.length > 0) {
      form.images.forEach(img => {
        if (img && typeof img !== 'string') formData.append('images', img);
      });
    }
    fetch(url, {
      method,
      headers: { Authorization: 'Bearer ' + token },
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error(editId ? 'Failed to update product' : 'Failed to add product');
        setShowModal(false);
        setForm({ name: '', sku: '', code: '', price: '', stock: '', category: '', image: '', images: [], description: '' });
        setEditId(null);
        fetchProducts();
      })
      .catch(err => alert((editId ? 'Update' : 'Add') + ' failed: ' + err.message))
      .finally(() => setSaving(false));
  }

  function openEdit(product) {
    navigate(`/products/edit/${product.id}`);
  }

  function openAdd() {
    navigate('/products/add');
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const pagedProducts = filteredProducts.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Product List</h3>
              <p className="text-gray-600 mt-1">View and manage all products</p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                className="border border-gray-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select 
                className="border border-gray-200 px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                onClick={openAdd}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaPlus className="w-5 h-5" />
                <span>Add New Product</span>
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
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Product Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Product Code</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Variation</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Categories</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Image</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Other</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-8 text-gray-500">No products found.</td></tr>
                  ) : (
                    pagedProducts.map(product => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">{product.id}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                        </td>
                        <td className="py-4 px-6">{product.code}</td>
                        <td className="py-4 px-6">{product.variation || '-'}</td>
                        <td className="py-4 px-6">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {(() => {
                              let cats = [];
                              try { cats = product.categories ? JSON.parse(product.categories) : []; } catch { cats = []; }
                              if (!Array.isArray(cats)) cats = [cats];
                              return cats.map(cid => {
                                const cat = categories.find(c => c.id == cid);
                                return cat ? cat.name : cid;
                              }).join(', ');
                            })()}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-green-600">৳{product.price}</td>
                        <td className="py-4 px-6">
                          <img 
                            src={product.image || '/placeholder.png'} 
                            alt="Product" 
                            className="w-12 h-12 object-cover rounded border border-gray-200" 
                          />
                        </td>
                        <td className="py-4 px-6">{product.stock ?? '-'}</td>
                        <td className="py-4 px-6">{product.priority}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{product.other || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300"
                            >
                              <FaTrash className="w-4 h-4" />
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
        
        <div className="mt-6">
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={filteredProducts.length}
            onPageChange={setPage}
            onPageSizeChange={size => { setPageSize(size); setPage(1); }}
          />
        </div>
        
        <DeleteConfirmModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
        <NotificationToast show={showToast} message="Product deleted successfully!" />
      </div>
    </div>
  );
} 