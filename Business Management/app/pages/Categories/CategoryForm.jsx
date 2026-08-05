import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toSlug, optimizeImage } from '@shared/utils/imageUtils';

export default function CategoryForm({ category, parentCategories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    parentId: category?.parentId || '',
    description: category?.description || '',
    status: category?.status || 'active',
    sortOrder: category?.sortOrder || 0,
    bannerImage: category?.bannerImage || '',
    icon: category?.icon || ''
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
        slug: form.slug.trim() || toSlug(form.name),
        parentId: form.parentId || null,
        sortOrder: parseInt(form.sortOrder) || 0,
      });
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size exceeds 1MB.");
        e.target.value = '';
        return;
      }
      try {
        const optimizedDataUrl = await optimizeImage(file);
        set(field, optimizedDataUrl);
      } catch (err) {
        console.error("Failed to process image", err);
      }
    }
    e.target.value = '';
  };

  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{category ? 'Edit Category' : 'Add Category'}</h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="input-group">
              <label className="input-label">Category Name *</label>
              <input className="input" value={form.name} onChange={e => {
                set('name', e.target.value);
                if (!category) set('slug', toSlug(e.target.value));
              }} placeholder="e.g. Photo Frames" required />
            </div>

            <div className="input-group">
              <label className="input-label">Slug (URL friendly) *</label>
              <input className="input" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="e.g. photo-frames" required />
            </div>

            <div className="input-group">
              <label className="input-label">Parent Category</label>
              <select className="input" value={form.parentId} onChange={e => set('parentId', e.target.value)}>
                <option value="">None (Top Level Category)</option>
                {parentCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Sort Order</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
            </div>

            <div className="input-group">
              <label className="input-label">Banner Image (Optional)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="file" accept="image/*" className="input" onChange={e => handleImageUpload(e, 'bannerImage')} style={{ padding: '0.375rem' }} />
                {form.bannerImage && (
                  <div style={{ width: '60px', height: '40px', position: 'relative', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={form.bannerImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => set('bannerImage', '')} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={10} /></button>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
