import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X, Upload } from 'lucide-react';

const API_URL = '';
const PLACEHOLDER = 'https://via.placeholder.com/300x150?text=No+Image';

const SliderTable = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    status: 'Active'
  });
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Fetch sliders from API
  useEffect(() => {
    fetchSliders();
    // eslint-disable-next-line
  }, []);

  const fetchSliders = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetch('/api/sliders', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sliders');
        return res.json();
      })
      .then(data => {
        setSliders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleAddNew = () => {
    setEditingSlider(null);
    setFormData({ title: '', image: '', link: '', status: 'Active' });
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      image: slider.image,
      link: slider.link,
      status: slider.status
    });
    setImagePreview(slider.image);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return;
    const token = localStorage.getItem('token');
    fetch(`/api/sliders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete slider');
        fetchSliders();
      })
      .catch(err => alert('Delete failed: ' + err.message));
  };

  const toggleStatus = (id) => {
    const slider = sliders.find(s => s.id === id);
    if (!slider) return;
    const token = localStorage.getItem('token');
    // Always default to 'Inactive' if status is missing
    const currentStatus = slider.status === 'Active' ? 'Active' : 'Inactive';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    fetch(`/api/sliders/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...slider, status: newStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update status');
        fetchSliders();
      })
      .catch(err => alert('Status update failed: ' + err.message));
  };

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setFormData({...formData, image: file}); // keep file for upload
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image || !formData.link) {
      alert('Please fill in all required fields');
      return;
    }
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('title', formData.title);
    form.append('link', formData.link);
    form.append('status', formData.status);
    if (formData.image && typeof formData.image !== 'string') {
      form.append('image', formData.image);
    }
    const method = editingSlider ? 'PUT' : 'POST';
    const url = editingSlider ? `/api/sliders/${editingSlider.id}` : '/api/sliders';
    fetch(url, {
      method,
      headers: { Authorization: 'Bearer ' + token },
      body: form
    })
      .then(res => {
        if (!res.ok) throw new Error(editingSlider ? 'Failed to update slider' : 'Failed to add slider');
        setShowModal(false);
        setFormData({ title: '', image: '', link: '', status: 'Active' });
        setImagePreview('');
        fetchSliders();
      })
      .catch(err => alert((editingSlider ? 'Update' : 'Add') + ' failed: ' + err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Sliders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Slider List</h3>
              <p className="text-gray-600 mt-1">View and manage all sliders</p>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Slider</span>
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
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Image</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Link</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sliders.map((slider) => (
                    <tr key={slider.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">{slider.id}</td>
                      <td className="py-4 px-6">{slider.title}</td>
                      <td className="py-4 px-6">
                        <img 
                          src={slider.image || PLACEHOLDER} 
                          alt={slider.title}
                          className="h-10 w-20 object-cover rounded"
                          onError={e => e.target.src=PLACEHOLDER}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <a 
                          href={slider.link} 
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {slider.link}
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleStatus(slider.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                            (slider.status === 'Active')
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {(slider.status === 'Active') ? <Eye size={14} className="mr-1" /> : <EyeOff size={14} className="mr-1" />}
                          {slider.status === 'Active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(slider)}
                            className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(slider.id)}
                            className="p-2 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Korean-style Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">
                    {editingSlider ? 'Edit Slider' : 'Add New Slider'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                    placeholder="Enter slider title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Upload
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
                      dragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {imagePreview ? (
                      <div className="text-center">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-24 w-40 object-cover rounded-lg shadow-md border border-gray-200 mb-3"
                        />
                        <p className="text-gray-600 text-sm">Image uploaded successfully!</p>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({...formData, image: ''});
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Drag & drop your image here
                        </p>
                        <p className="text-gray-500 text-xs mb-3">or</p>
                        <label className="cursor-pointer">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                            Choose File
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                    placeholder="/path-to-page"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium"
                  >
                    {editingSlider ? 'Update Slider' : 'Add Slider'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderTable; 