import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@business/app/AppContext';
import { optimizeImage } from '@shared/utils/imageUtils';

export default function ProductForm({ product, onClose, onSave }) {
  const { settings } = useApp();
  const categoriesList = (settings.productCategories || 'Photo Frames, Gift Items, Personalized Gifts, Home Decor, Photo Gifts, Customized Products, Other')
    .split(',').map(c => c.trim()).filter(Boolean);

  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || categoriesList[0] || 'Other',
    sku: product?.sku || '',
    description: product?.description || '',
    purchasePrice: product?.purchasePrice || '',
    sellingPrice: product?.sellingPrice || '',
    designerCost: product?.designerCost || '',
    printLaminationDefaultPrice: product?.printLaminationDefaultPrice || '',
    stock: product?.stock || '',
    minStock: product?.minStock || 5,
    supplier: product?.supplier || '',
    notes: product?.notes || '',
    status: product?.status || 'active',
    imageUrl: product?.imageUrl || '',
    extraImages: product?.extraImages || [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        designerCost: parseFloat(form.designerCost) || 0,
        printLaminationDefaultPrice: parseFloat(form.printLaminationDefaultPrice) || 0,
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 5,
      });
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{product ? 'Edit Product' : 'Add Product'}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              {product ? 'Update product details' : 'Add a new product to your catalog'}
            </p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          <div className="modal-body">
            <div className="grid-2" style={{ gap: '1rem' }}>
              {/* Product Name */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Product Name *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Wooden Photo Frame 5x7" required />
              </div>

              {/* Category + Status */}
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              {/* SKU */}
              <div className="input-group">
                <label className="input-label">SKU / Product Code</label>
                <input className="input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. PF-5X7-001" />
              </div>
              {/* Supplier */}
              <div className="input-group">
                <label className="input-label">Supplier</label>
                <input className="input" value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="Supplier name" />
              </div>

              {/* Image Upload */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Product Images (Ratio 1:1)</label>
                
                {/* Main Image */}
                <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                  <label className="input-label" style={{ marginBottom: '0.5rem' }}>Main Image *</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        id="mainImageInput"
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        className="input" 
                        style={{ padding: '0.375rem' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert("File size exceeds 1MB. Please upload a smaller image.");
                              e.target.value = '';
                              return;
                            }
                            try {
                              const optimizedDataUrl = await optimizeImage(file);
                              set('imageUrl', optimizedDataUrl);
                            } catch (err) {
                              console.error("Failed to optimize image", err);
                              alert("Failed to process image.");
                            }
                          }
                          e.target.value = '';
                        }} 
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                        This is the primary image shown everywhere. Max size: 1MB.
                      </div>
                    </div>
                    {form.imageUrl && (
                      <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
                        <img src={form.imageUrl} alt="Main Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => {
                            set('imageUrl', '');
                            const el = document.getElementById('mainImageInput');
                            if (el) el.value = '';
                          }}
                          title="Remove image"
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extra Images */}
                <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius)' }}>
                  <label className="input-label" style={{ marginBottom: '0.5rem' }}>Extra Images (Gallery thumbnails)</label>
                  <input 
                    id="extraImagesInput"
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    className="input" 
                    multiple
                    style={{ padding: '0.375rem', marginBottom: '1rem' }}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      for (const file of files) {
                        if (file.size > 1024 * 1024) {
                          alert(`File ${file.name} exceeds 1MB and will be skipped.`);
                          continue;
                        }
                        try {
                          const optimizedDataUrl = await optimizeImage(file);
                          setForm(prev => ({ ...prev, extraImages: [...prev.extraImages, optimizedDataUrl] }));
                        } catch (err) {
                          console.error("Failed to optimize extra image", err);
                        }
                      }
                      e.target.value = ''; // reset so they can add more
                    }} 
                  />
                  
                  {form.extraImages && form.extraImages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {form.extraImages.map((img, idx) => (
                        <div key={idx} style={{ width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                          <img src={img} alt={`Extra ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => {
                              setForm(prev => ({ ...prev, extraImages: prev.extraImages.filter((_, i) => i !== idx) }));
                              const el = document.getElementById('extraImagesInput');
                              if (el) el.value = '';
                            }}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="input-group">
                <label className="input-label">Raw Material (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Selling Price (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Designer Cost (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.designerCost} onChange={e => set('designerCost', e.target.value)} placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Print & Lam Default (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.printLaminationDefaultPrice} onChange={e => set('printLaminationDefaultPrice', e.target.value)} placeholder="0.00" />
              </div>

              {/* Stock */}
              <div className="input-group">
                <label className="input-label">Current Stock (Qty)</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
              </div>
              <div className="input-group">
                <label className="input-label">Minimum Stock Alert</label>
                <input className="input" type="number" min="0" value={form.minStock} onChange={e => set('minStock', e.target.value)} placeholder="5" />
              </div>

              {/* Description */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Description</label>
                <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product description..." rows={2} />
              </div>

              {/* Notes */}
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Notes</label>
                <textarea className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." rows={2} />
              </div>
            </div>

            {/* Profit Preview */}
            {form.purchasePrice && form.sellingPrice && (
              <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>PROFIT PER UNIT</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{(parseFloat(form.sellingPrice || 0) - parseFloat(form.purchasePrice || 0)).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>MARGIN</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {form.sellingPrice > 0 ? (((parseFloat(form.sellingPrice) - parseFloat(form.purchasePrice)) / parseFloat(form.sellingPrice)) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
