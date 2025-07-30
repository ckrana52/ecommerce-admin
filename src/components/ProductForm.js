import React, { useRef } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

export default function ProductForm({ form, setForm, categories, onSubmit, saving, editMode }) {
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Image remove handler
  const handleRemoveImage = idx => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  // Image add handler
  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setForm(f => ({ ...f, images: [...(f.images || []), ...files] }));
    fileInputRef.current.value = '';
  };

  // ক্যাটাগরি অপশন ফরম্যাট
  const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
  // সিলেক্টেড ক্যাটাগরি (array of options)
  const selectedCategories = categoryOptions.filter(opt => (form.categories || []).includes(opt.value));

  // Description editor state
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        [{ color: [] }, { background: [] }],
        ['clean']
      ]
    },
    placeholder: 'Write a unique product description...'
  });
  // Editor value sync
  React.useEffect(() => {
    if (quill && form.description !== quill.root.innerHTML) {
      quill.root.innerHTML = form.description || '';
    }
    if (quill) {
      quill.on('text-change', () => {
        setForm(f => ({ ...f, description: quill.root.innerHTML }));
      });
    }
    // eslint-disable-next-line
  }, [quill]);

  // Select All/Deselect All for categories
  const handleSelectAllCategories = () => setForm(f => ({ ...f, categories: categoryOptions.map(opt => opt.value) }));
  const handleDeselectAllCategories = () => setForm(f => ({ ...f, categories: [] }));

  // Related Product (UI only, no backend)
  const relatedProductOptions = [];
  const selectedRelatedProducts = [];
  const handleSelectAllRelated = () => {};
  const handleDeselectAllRelated = () => {};

  // Slug জেনারেটর
  function generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/--+/g, '-');
  }

  // Product Name টাইপ করলে slug অটো জেনারেট
  function handleNameChange(e) {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));
  }
  // Slug ম্যানুয়ালি এডিট
  function handleSlugChange(e) {
    setForm(f => ({ ...f, slug: e.target.value }));
  }

  return (
    <div className="w-full max-w-full border border-gray-200 shadow-sm bg-white rounded-md">
      {/* হেডার কালার বক্স */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 rounded-t-md">
        <span className="text-base font-semibold text-blue-700">{editMode ? 'Edit Product' : 'Create Product'}</span>
      </div>
      <form onSubmit={onSubmit} className="w-full p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Name<span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleNameChange} required className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400" placeholder="Product Name" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Slug</label>
            <div className="relative w-full">
              <input
                name="slug"
                value={form.slug || ''}
                onChange={handleSlugChange}
                className="border border-gray-300 p-2 pl-60 rounded-md w-full bg-gray-100 text-gray-500 focus:bg-white focus:text-gray-900 focus:outline-none"
                placeholder="product-slug"
                style={{}}
              />
              <span className="absolute left-0 top-0 h-full flex items-center px-3 bg-gray-100 text-gray-500 text-sm border-r border-gray-300 rounded-l-md select-none" style={{width:'auto',minWidth:'220px'}}>
                https://yourdomain.com/product/
              </span>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Code <span className="text-red-500">*</span></label>
            <input name="code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400" placeholder="Product Code" />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Details</label>
            <div className="border border-gray-300 rounded-md" style={{ minHeight: 120 }}>
              <div ref={quillRef} />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Categories</label>
            <div className="flex gap-2 mb-1">
              <button type="button" className="bg-cyan-500 text-white px-2 py-1 rounded text-xs" onClick={handleSelectAllCategories}>Select All</button>
              <button type="button" className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs" onClick={handleDeselectAllCategories}>Deselect All</button>
            </div>
            <Select
              isMulti
              options={categoryOptions}
              value={selectedCategories}
              onChange={opts => setForm(f => ({ ...f, categories: opts ? opts.map(o => o.value) : [] }))}
              classNamePrefix="react-select"
              placeholder="Select a Category"
              styles={{
                control: base => ({ ...base, minHeight: 38, borderRadius: 6, borderColor: '#d1d5db', boxShadow: 'none' })
              }}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Related Product</label>
            <div className="flex gap-2 mb-1">
              <button type="button" className="bg-cyan-500 text-white px-2 py-1 rounded text-xs" onClick={handleSelectAllRelated}>Select All</button>
              <button type="button" className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs" onClick={handleDeselectAllRelated}>Deselect All</button>
            </div>
            <Select
              isMulti
              options={relatedProductOptions}
              value={selectedRelatedProducts}
              onChange={() => {}}
              classNamePrefix="react-select"
              placeholder="Select a Related Product"
              styles={{
                control: base => ({ ...base, minHeight: 38, borderRadius: 6, borderColor: '#d1d5db', boxShadow: 'none' })
              }}
            />
          </div>
          <div>
            {/* Price fields moved below images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Purchase Price <span className="text-red-500">*</span></label>
              <input name="purchase_price" type="number" step="0.01" value={form.purchase_price || ''} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))} required className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400" placeholder="Purchase Price" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Regular Price <span className="text-red-500">*</span></label>
              <input name="price" type="number" step="0.01" value={form.price || ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400" placeholder="Regular Price" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Sale Price</label>
              <input name="sale_price" type="number" step="0.01" value={form.sale_price || ''} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400" placeholder="Sale Price" />
            </div>
          </div>
            <label className="block font-semibold mb-1 text-gray-700">Product Images</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-2 flex flex-wrap items-center min-h-[120px] relative group cursor-pointer justify-center"
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('ring-2', 'ring-cyan-400'); }}
              onDragLeave={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('ring-2', 'ring-cyan-400'); }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('ring-2', 'ring-cyan-400');
                const files = Array.from(e.dataTransfer.files);
                setForm(f => ({ ...f, images: [...(f.images || []), ...files] }));
              }}
              style={{ minHeight: 120 }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {(form.images && form.images.length > 0) ? (
                <div className="flex flex-wrap gap-4 w-full">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center w-24">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                        <img
                          src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                          alt="Preview"
                          className="object-cover w-full h-full rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        className="text-blue-600 text-xs mt-1 hover:underline focus:outline-none"
                        onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
                      >Remove file</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center min-h-[80px] text-gray-500 select-none">
                  Drop files here to upload
                </div>
              )}
            </div>
          </div>
          
        </div>
        {/* Product Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
          {/* Color */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Color</label>
            <input
              type="text"
              name="color"
              value={form.color || ''}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400 mb-2"
              placeholder="Enter color or select below"
            />
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Red', value: '#FF0000' },
                { name: 'Blue', value: '#0000FF' },
                { name: 'Green', value: '#008000' },
                { name: 'Black', value: '#000000' },
                { name: 'White', value: '#FFFFFF' },
                { name: 'Gray', value: '#808080' },
                { name: 'Yellow', value: '#FFFF00' },
                { name: 'Orange', value: '#FFA500' },
                { name: 'Purple', value: '#800080' },
                { name: 'Pink', value: '#FFC0CB' },
                { name: 'Brown', value: '#A52A2A' },
                { name: 'Navy', value: '#000080' }
              ].map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: color.value }))}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {form.color && (
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm text-gray-600">Selected:</span>
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: form.color }}
                />
                <span className="text-sm text-gray-700">{form.color}</span>
              </div>
            )}
          </div>
          {/* Size */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Size</label>
            <input
              type="text"
              name="size"
              value={form.size || ''}
              onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
              className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400 mb-2"
              placeholder="Enter size or select below"
            />
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, size }))}
                  className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors ${form.size === size ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {/* Weight */}
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Product Weight</label>
            <div className="relative">
              <input
                type="number"
                name="weight"
                value={form.weight || ''}
                onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                className="border border-gray-300 p-2 pr-12 rounded-md w-full focus:ring-0 focus:border-blue-400"
                placeholder="Enter weight"
                min="0"
                step="0.01"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">kg</span>
            </div>
          </div>
        </div>
        {/* Metadata */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Product Metadata</label>
          <textarea
            name="metadata"
            value={form.metadata || ''}
            onChange={e => setForm(f => ({ ...f, metadata: e.target.value }))}
            rows={3}
            className="border border-gray-300 p-2 rounded-md w-full focus:ring-0 focus:border-blue-400"
            placeholder="Enter additional metadata, tags, or specifications (JSON format supported)"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can enter JSON format for structured metadata or simple text for tags and specifications
          </p>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap justify-end">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-semibold shadow-none w-full md:w-auto transition" disabled={saving}>{saving ? (editMode ? 'Updating...' : 'Saving...') : (editMode ? 'Update Product' : 'Add Product')}</button>
        </div>
      </form>
    </div>
  );
} 