import { useState, useEffect } from 'react';
import CommonButton from '../components/CommonButton.jsx';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export default function CourierTable() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCouriers();
  }, []);

  function fetchCouriers() {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch('/api/couriers', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setCouriers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this courier?')) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    fetch(`/api/couriers/${id}`, { method: 'DELETE', headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete');
        fetchCouriers();
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
    const url = editId ? `/api/couriers/${editId}` : '/api/couriers';
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
        if (!res.ok) throw new Error(editId ? 'Failed to update courier' : 'Failed to add courier');
        setShowModal(false);
        setForm({ name: '', contact: '', status: 'Active' });
        setEditId(null);
        fetchCouriers();
      })
      .catch(err => alert((editId ? 'Update' : 'Add') + ' failed: ' + err.message))
      .finally(() => setSaving(false));
  }

  function openEdit(courier) {
    setForm({
      name: courier.name || '',
      contact: courier.contact || '',
      status: courier.status || 'Active'
    });
    setEditId(courier.id);
    setShowModal(true);
  }

  function openAdd() {
    setForm({ name: '', contact: '', status: 'Active' });
    setEditId(null);
    setShowModal(true);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Couriers</h1>
        <CommonButton color="primary" icon={<FaPlus />} onClick={openAdd}>Add New Courier</CommonButton>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Contact</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {couriers.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-4">No couriers found.</td></tr>
              ) : (
                couriers.map(courier => (
                  <tr key={courier.id} className="border-b">
                    <td className="p-2">{courier.id}</td>
                    <td className="p-2">{courier.name}</td>
                    <td className="p-2">{courier.contact}</td>
                    <td className="p-2">{courier.status}</td>
                    <td className="p-2 flex gap-2">
                      <CommonButton color="warning" icon={<FaEdit />} onClick={() => openEdit(courier)}>
                        Edit
                      </CommonButton>
                      <CommonButton color="danger" icon={<FaTrash />} onClick={() => handleDelete(courier.id)}>
                        Delete
                      </CommonButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Courier' : 'Add New Courier'}</h2>
            <div className="mb-2">
              <input name="name" value={form.name} onChange={handleChange} required className="border p-2 rounded w-full" placeholder="Name" />
            </div>
            <div className="mb-2">
              <input name="contact" value={form.contact} onChange={handleChange} className="border p-2 rounded w-full" placeholder="Contact" />
            </div>
            <div className="mb-2">
              <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded border" onClick={() => { setShowModal(false); setEditId(null); }}>Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? (editId ? 'Updating...' : 'Saving...') : (editId ? 'Update' : 'Save')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 