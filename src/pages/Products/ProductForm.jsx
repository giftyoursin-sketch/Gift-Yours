import React, { useState } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Photo Frames', 'Gift Items', 'Personalized Gifts', 'Home Decor', 'Photo Gifts', 'Customized Products', 'Other'];

export default function ProductForm({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || CATEGORIES[0],
    sku: product?.sku || '',
    description: product?.description || '',
    purchasePrice: product?.purchasePrice || '',
    sellingPrice: product?.sellingPrice || '',
    stock: product?.stock || '',
    minStock: product?.minStock || 5,
    supplier: product?.supplier || '',
    notes: product?.notes || '',
    status: product?.status || 'active',
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
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
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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

              {/* Pricing */}
              <div className="input-group">
                <label className="input-label">Purchase Price (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Selling Price (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} placeholder="0.00" />
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
