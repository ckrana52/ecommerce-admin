import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { FaArrowLeft } from 'react-icons/fa';

export default function ProductEditPage() {
  const { id } = useParams(); // id থাকলে edit, না থাকলে add
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', sku: '', code: '', price: '', stock: '', category: '', image: '', images: [], description: '',
    sizeList: [], colorList: [], weightList: []
  });
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const editMode = !!id;

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  function fetchCategories() {
    const token = localStorage.getItem('token');
    fetch('/api/categories', { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }

  function fetchProduct() {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`/api/products/${id}`, { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.json())
      .then(product => {
        let imagesArr = [];
        try { imagesArr = product.images ? JSON.parse(product.images) : []; } catch { imagesArr = []; }
        let categoriesArr = [];
        if (Array.isArray(product.categories)) {
          categoriesArr = product.categories;
        } else if (product.categories) {
          try { categoriesArr = JSON.parse(product.categories); } catch { categoriesArr = [product.category_id].filter(Boolean); }
        } else if (product.category_id) {
          categoriesArr = [product.category_id];
        } else {
          categoriesArr = [];
        }
        setForm({
          name: product.name ?? '',
          sku: product.sku ?? '',
          code: product.code ?? '',
          price: product.price !== undefined && product.price !== null ? String(product.price) : '',
          stock: product.stock !== undefined && product.stock !== null ? String(product.stock) : '',
          categories: categoriesArr,
          image: '',
          images: imagesArr,
          description: product.description ?? '',
          sizeList: typeof product.sizeList === 'string' ? (product.sizeList ? JSON.parse(product.sizeList) : []) : (product.sizeList || []),
          colorList: typeof product.colorList === 'string' ? (product.colorList ? JSON.parse(product.colorList) : []) : (product.colorList || []),
          weightList: typeof product.weightList === 'string' ? (product.weightList ? JSON.parse(product.weightList) : []) : (product.weightList || [])
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const method = editMode ? 'PUT' : 'POST';
    const url = editMode ? `/api/products/${id}` : '/api/products';
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', form.name || '');
    formData.append('sku', form.sku || '');
    formData.append('code', form.code || '');
    formData.append('price', form.price || '');
    formData.append('stock', form.stock || '0');
    formData.append('category_id', (form.categories && form.categories[0]) ? form.categories[0] : '');
    formData.append('categories', JSON.stringify(form.categories || []));
    formData.append('description', form.description || '');
    formData.append('sizeList', JSON.stringify(form.sizeList || []));
    formData.append('colorList', JSON.stringify(form.colorList || []));
    formData.append('weightList', JSON.stringify(form.weightList || []));
    formData.append('variants', JSON.stringify(form.variants || []));
    formData.append('purchase_price', form.purchase_price && form.purchase_price !== '' ? form.purchase_price : null);
    if (form.image && typeof form.image !== 'string') {
      formData.append('image', form.image);
    }
    const existingImageUrls = (form.images || []).filter(img => typeof img === 'string');
    if (existingImageUrls.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImageUrls));
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
        if (!res.ok) throw new Error(editMode ? 'Failed to update product' : 'Failed to add product');
        // After add/edit, reload the product data to ensure lists persist
        if (editMode) {
          fetchProduct();
          setTimeout(() => navigate('/products'), 500); // Give time for state to update
        } else {
        navigate('/products');
        }
      })
      .catch(err => alert((editMode ? 'Update' : 'Add') + ' failed: ' + err.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className="p-0 w-full">
      <div className="">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <ProductForm
            form={form}
            setForm={setForm}
            categories={categories}
            onSubmit={handleSubmit}
            saving={saving}
            editMode={editMode}
          />
        )}
      </div>
    </div>
  );
} 