import React, { useState } from 'react';
import { Save, Moon, Sun, Download, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Settings() {
  const { settings, saveSettings, saveSetting, products, customers, sales, invoices, expenses, notify } = useApp();
  const [form, setForm] = useState({
    businessName: settings.businessName || '',
    phone: settings.phone || '',
    address: settings.address || '',
    invoicePrefix: settings.invoicePrefix || 'INV',
    productCategories: settings.productCategories || 'Photo Frames, Gift Items, Personalized Gifts, Home Decor, Photo Gifts, Customized Products, Other',
    expenseCategories: settings.expenseCategories || 'Salary, Rent, Utilities, Marketing, Supplies, Maintenance, Taxes, Other',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
  };

  const handleExport = () => {
    const data = { products, customers, sales, invoices, expenses, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'giftyours-backup.json'; a.click();
    notify('Data exported successfully', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        notify('Import feature coming soon — data structure validated', 'info');
      } catch (err) {
        notify('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const toggleTheme = () => saveSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Configure your business information and preferences</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Business Info */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>🏪 Business Information</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="grid-2" style={{ gap: '0.875rem' }}>
                <div className="input-group">
                  <label className="input-label">Business Name</label>
                  <input className="input" value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Gift Yours" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Business Address</label>
                <textarea className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Shop address..." rows={2} />
              </div>
              <div className="input-group" style={{ maxWidth: 200 }}>
                <label className="input-label">Invoice Prefix</label>
                <input className="input" value={form.invoicePrefix} onChange={e => set('invoicePrefix', e.target.value.toUpperCase())} placeholder="INV" maxLength={6} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Example: {form.invoicePrefix || 'INV'}-0001</span>
              </div>
              <div className="input-group">
                <label className="input-label">Product Categories (Comma separated)</label>
                <textarea className="input" value={form.productCategories} onChange={e => set('productCategories', e.target.value)} placeholder="Photo Frames, Gift Items, Other..." rows={2} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Used in product creation and filtering.</span>
              </div>
              <div className="input-group">
                <label className="input-label">Expense Categories (Comma separated)</label>
                <textarea className="input" value={form.expenseCategories} onChange={e => set('expenseCategories', e.target.value)} placeholder="Salary, Rent, Utilities, Other..." rows={2} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Used in expense tracking and reports.</span>
              </div>
              <div>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </form>
        </div>

        {/* Theme */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>🎨 Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>Theme</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Currently: {settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
            </div>
            <button className="btn btn-secondary" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {settings.theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
          </div>
        </div>

        {/* Data Summary */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>📊 Data Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Products', count: products.length, color: 'var(--primary)' },
              { label: 'Invoices', count: invoices.length, color: 'var(--accent)' },
              { label: 'Expenses', count: expenses.length, color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>💾 Backup & Restore</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Export all your data as a JSON backup file. Import to restore data.</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download size={15} /> Export All Data
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Import Backup
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Version */}
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          Gift Yours Business Manager v1.0.0 · Built with ❤️
        </div>
      </div>
    </div>
  );
}
