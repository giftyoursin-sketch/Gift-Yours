import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CONFIG_TYPES = [
  'Size', 'Color', 'Margin', 'PaperType', 'CanvasType', 
  'Thickness', 'Wrap', 'Border', 'Orientation', 'Finish'
];

export default function ConfigModal({ isOpen, onClose, config, onSave }) {
  const [formData, setFormData] = useState({
    type: 'Size',
    name: '',
    value: '',
    price: 0,
    offerPrice: '',
    thumbnailUrl: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        type: config.type || 'Size',
        name: config.name || '',
        value: config.value || '',
        price: config.price || 0,
        offerPrice: config.offerPrice || '',
        thumbnailUrl: config.thumbnailUrl || '',
        sortOrder: config.sortOrder || 0,
        isActive: config.isActive !== false,
      });
    } else {
      setFormData({
        type: 'Size', name: '', value: '', price: 0, offerPrice: '',
        thumbnailUrl: '', sortOrder: 0, isActive: true,
      });
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      offerPrice: formData.offerPrice ? parseFloat(formData.offerPrice) : null,
      sortOrder: parseInt(formData.sortOrder) || 0,
    });
  };

  return (
    <div className="modal-overlay flex-center">
      <div className="modal-content" style={{ width: '500px', maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="h3">{config ? 'Edit Configuration' : 'Add Configuration'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Type</label>
            <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
              {CONFIG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Name</label>
            <input className="input" type="text" placeholder="e.g. 12x8, Matte Black" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="label">Value (Hex code, dimensions, etc.)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {formData.type === 'Color' && (
                <input type="color" value={formData.value || '#000000'} onChange={e => setFormData({ ...formData, value: e.target.value })} style={{ width: '40px', height: '40px', padding: '0', border: 'none' }} />
              )}
              <input className="input" style={{ flex: 1 }} type="text" placeholder="e.g. #000000 or 12x8" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Price (Modifier)</label>
              <input className="input" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Offer Price (Optional)</label>
              <input className="input" type="number" step="0.01" value={formData.offerPrice} onChange={e => setFormData({ ...formData, offerPrice: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Thumbnail URL (Optional)</label>
            <input className="input" type="url" placeholder="https://..." value={formData.thumbnailUrl} onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Sort Order</label>
              <input className="input" type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: e.target.value })} required />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, marginTop: '1rem' }}>
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '20px', height: '20px' }} />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{config ? 'Save Changes' : 'Add Configuration'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
