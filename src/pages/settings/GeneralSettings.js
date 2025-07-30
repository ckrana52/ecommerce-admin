import React, { useState, useEffect } from 'react';

export default function GeneralSettings() {
  const [form, setForm] = useState({
    site_name: '',
    site_title: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    homepage_template: 'all',
    invoice_string: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('/api/settings?group=general', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        const obj = {};
        data.forEach(item => { obj[item.key] = item.value; });
        setForm(f => ({ ...f, ...obj }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    const token = localStorage.getItem('token');
    // একাধিক ফিল্ড একাধিক API call (bulk update না থাকলে)
    Promise.all(Object.entries(form).map(([key, value]) =>
      fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ group: 'general', key, value })
      })
    ))
      .then(() => { setSuccess(true); setSaving(false); })
      .catch(() => { setError('Save failed'); setSaving(false); });
  }

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label>Site Name</label>
        <input name="site_name" value={form.site_name} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>Site Title</label>
        <input name="site_title" value={form.site_title} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>Phone Number</label>
        <input name="phone" value={form.phone} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>WhatsApp Number</label>
        <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>Address</label>
        <input name="address" value={form.address} onChange={handleChange} className="border p-2 rounded w-full" />
      </div>
      <div>
        <label>Home Page Template</label>
        <select name="homepage_template" value={form.homepage_template} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="all">All Product</option>
          <option value="category">Category Wise</option>
        </select>
      </div>
      <div>
        <label>Invoice String</label>
        <input name="invoice_string" value={form.invoice_string} onChange={handleChange} className="border p-2 rounded w-full" placeholder="Enter invoice string" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      {success && <div className="text-green-600">Saved!</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
} 