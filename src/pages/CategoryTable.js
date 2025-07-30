import { useState, useEffect, useRef } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NotificationToast from '../components/NotificationToast';
import CommonButton from '../components/CommonButton.jsx';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef();
  const [descModal, setDescModal] = useState({ open: false, text: '' });

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/categories', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function handleDelete(id) {
    setDeleteId(id);
  }

  function confirmDelete() {
    const id = deleteId;
    setDeleteId(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch(`/api/categories/${id}`, { method: 'DELETE', headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchCategories();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch(err => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }));
    }
  }

  function handleRemoveImage() {
    setForm(f => ({ ...f, image: '', imagePreview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function openEdit(category) {
    setForm({ name: category.name, description: category.description, image: category.image || '' });
    setEditId(category.id);
    setShowModal(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    let body, headers;
    if (!form.name || form.name.trim() === '') {
      alert('Category name is required!');
      setSaving(false);
      return;
    }
    if (form.image && typeof form.image !== 'string') {
      body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description || '');
      body.append('image', form.image);
      headers = { Authorization: 'Bearer ' + token };
    } else {
      body = JSON.stringify({ name: form.name, description: form.description || '', image: form.image });
      headers = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };
    }
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/categories/${editId}` : '/api/categories';
    fetch(url, {
      method,
      headers,
      body
    })
      .then(res => {
        if (!res.ok) throw new Error(editId ? 'Failed to update category' : 'Failed to add category');
        setShowModal(false);
        setForm({ name: '', description: '', image: '' });
        setEditId(null);
        fetchCategories();
      })
      .catch(err => alert((editId ? 'Update' : 'Add') + ' failed: ' + err.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Categories Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Category List</h3>
              <p className="text-gray-600 mt-1">View and manage all categories</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaPlus className="w-5 h-5" />
              <span>Add New Category</span>
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Image</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Category Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-4">No categories found.</td></tr>
                ) : (
                  categories.map(category => (
                    <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">{category.id}</td>
                      <td className="py-4 px-6">
                        {category.image && typeof category.image === 'string' && category.image.trim() !== '' && category.image !== 'null' && category.image !== 'undefined' && category.image !== '/placeholder.png' ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <img
                              src={category.image}
                              alt="Category"
                              className="object-cover rounded border border-gray-200 bg-gray-100 w-12 h-12"
                              onError={e => { e.target.onerror=null; e.target.style.display='none'; }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border border-gray-200 text-gray-400 text-xs select-none">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">{category.name}</td>
                      <td className="py-4 px-6">
                        {(() => {
                          if (!category.description) return '';
                          const words = category.description.trim().split(/\s+/);
                          if (words.length > 1) {
                            return <>
                              {words.slice(0,1).join(' ')}
                              <CommonButton color="primary" icon={<FaEye />} className="text-xs ml-2 underline hover:no-underline focus:outline-none px-2 py-1 h-6" style={{fontSize:'12px'}} type="button" onClick={() => setDescModal({ open: true, text: category.description })}>
                                See More..
                              </CommonButton>
                            </>;
                          } else {
                            return category.description;
                          }
                        })()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEdit(category)}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
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
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Category' : 'Add New Category'}</h2>
              <div className="mb-4">
                <input name="name" value={form.name} onChange={handleChange} required className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Category Name" />
              </div>
              <div className="mb-4">
                <input name="description" value={form.description} onChange={handleChange} className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Description" />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1 text-gray-700">Category Image</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-row items-center min-h-[120px] gap-4 cursor-pointer group"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('ring-2', 'ring-cyan-400'); }}
                  onDragLeave={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('ring-2', 'ring-cyan-400'); }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('ring-2', 'ring-cyan-400');
                    const file = e.dataTransfer.files && e.dataTransfer.files[0];
                    if (file) setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }));
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {form.imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="object-cover w-24 h-24 rounded-xl border border-gray-200 mb-2"
                      />
                      <button
                        type="button"
                        className="text-blue-600 text-xs hover:underline focus:outline-none"
                        onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
                      >Remove file</button>
                    </div>
                  ) : form.image && typeof form.image === 'string' && form.image.trim() !== '' && form.image !== 'null' && form.image !== 'undefined' && form.image !== '/placeholder.png' ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="object-cover w-24 h-24 rounded-xl border border-gray-200 mb-2"
                        onError={e => { e.target.onerror=null; e.target.style.display='none'; }}
                      />
                      <button
                        type="button"
                        className="text-blue-600 text-xs hover:underline focus:outline-none"
                        onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
                      >Remove file</button>
                    </div>
                  ) : (
                    <div className="text-gray-500 select-none">Drop file here to upload</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <button type="button" className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium" onClick={() => { setShowModal(false); setEditId(null); setForm({ name: '', description: '', image: '', imagePreview: null }); }}>Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium" disabled={saving}>{saving ? (editId ? 'Updating...' : 'Saving...') : (editId ? 'Update' : 'Save')}</button>
              </div>
            </form>
          </div>
        )}
        <DeleteConfirmModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={confirmDelete} />
        <NotificationToast show={showToast} message="Category deleted successfully!" />
        {descModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full">
              <h3 className="font-bold mb-2">Full Description</h3>
              <div className="whitespace-pre-line text-gray-800 mb-4">{descModal.text}</div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setDescModal({ open: false, text: '' })}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 