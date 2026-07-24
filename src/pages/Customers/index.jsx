import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Phone, MapPin, X, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function CustomerForm({ customer, onClose, onSave }) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{customer ? 'Edit Customer' : 'Add Customer'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Customer name" required />
            </div>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email address" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Address</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Address" />
            </div>
            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes..." rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : customer ? 'Save Changes' : 'Add Customer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const { customers, sales, invoices, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);

  const filtered = useMemo(() =>
    customers.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  , [customers, search]);

  const getCustomerStats = (customerId) => {
    const customerSales = sales.filter(s => s.customerId === customerId);
    const customerInvoices = invoices.filter(i => i.customerId === customerId);
    const lifetimeValue = customerSales.reduce((a, s) => a + (s.total || 0), 0);
    const pendingAmount = customerInvoices.filter(i => i.status === 'pending').reduce((a, i) => a + (i.grandTotal || 0), 0);
    return { orders: customerSales.length, lifetimeValue, pendingAmount, invoices: customerInvoices.length };
  };

  const handleEdit = (c) => { setEditCustomer(c); setShowForm(true); };
  const handleDelete = (id) => { if (window.confirm('Delete this customer?')) deleteCustomer(id); };

  const initials = (name) => (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colorFromName = (name) => {
    const colors = ['#1E1B4B', '#312E81', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626'];
    const idx = (name || '').charCodeAt(0) % colors.length;
    return colors[idx];
  };

  const viewStats = viewCustomer ? getCustomerStats(viewCustomer.id) : null;
  const viewSales = viewCustomer ? sales.filter(s => s.customerId === viewCustomer.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditCustomer(null); setShowForm(true); }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 400 }}>
        <Search size={15} color="var(--text-muted)" />
        <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={48} strokeWidth={1} /></div>
          <h3>No customers yet</h3>
          <p>Add your customers to track purchase history and lifetime value</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Customer</button>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(c => {
            const stats = getCustomerStats(c.id);
            const isRepeat = stats.orders > 1;
            return (
              <div key={c.id} className="card card-hover" style={{ padding: '1.25rem', cursor: 'pointer' }} onClick={() => setViewCustomer(c)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div className="avatar avatar-lg" style={{ background: colorFromName(c.name), color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
                    {initials(c.name)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{c.name}</h3>
                      {isRepeat && <span className="badge badge-accent" style={{ fontSize: '0.625rem' }}>🔄 Repeat</span>}
                    </div>
                    {c.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={11} /> {c.phone}</div>}
                    {c.address && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address}</div>}
                  </div>
                  <button className="btn btn-ghost btn-icon-sm" onClick={e => { e.stopPropagation(); handleDelete(c.id); }} style={{ color: 'var(--error)', flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid-3" style={{ gap: '0.5rem' }}>
                  <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.orders}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDERS</div>
                  </div>
                  <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--success)' }}>₹{stats.lifetimeValue.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>LIFETIME</div>
                  </div>
                  <div style={{ background: stats.pendingAmount > 0 ? 'var(--error-light)' : 'var(--surface-2)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: stats.pendingAmount > 0 ? 'var(--error)' : 'var(--text-muted)' }}>₹{stats.pendingAmount.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="fab" onClick={() => { setEditCustomer(null); setShowForm(true); }}><Plus size={24} /></button>

      {showForm && (
        <CustomerForm
          customer={editCustomer}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editCustomer) await updateCustomer(editCustomer.id, data);
            else await addCustomer(data);
            setShowForm(false);
          }}
        />
      )}

      {/* Customer Detail Drawer */}
      {viewCustomer && (
        <div className="drawer-overlay" onClick={() => setViewCustomer(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="avatar avatar-lg" style={{ background: colorFromName(viewCustomer.name), color: '#fff', fontWeight: 700 }}>
                {initials(viewCustomer.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{viewCustomer.name}</div>
                {viewCustomer.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{viewCustomer.phone}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setViewCustomer(null); handleEdit(viewCustomer); }}><Edit2 size={13} /></button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewCustomer(null)}><X size={18} /></button>
              </div>
            </div>
            <div className="drawer-body">
              <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total Orders', value: viewStats.orders },
                  { label: 'Lifetime Value', value: `₹${viewStats.lifetimeValue.toLocaleString('en-IN')}`, color: 'var(--success)' },
                  { label: 'Total Invoices', value: viewStats.invoices },
                  { label: 'Pending', value: `₹${viewStats.pendingAmount.toLocaleString('en-IN')}`, color: viewStats.pendingAmount > 0 ? 'var(--error)' : 'var(--text-secondary)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.875rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {viewCustomer.email && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>EMAIL</div>
                  <div style={{ fontSize: '0.875rem' }}>{viewCustomer.email}</div>
                </div>
              )}
              {viewCustomer.address && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>ADDRESS</div>
                  <div style={{ fontSize: '0.875rem' }}>{viewCustomer.address}</div>
                </div>
              )}

              {viewSales.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Purchase History</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {viewSales.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Sale #{s.id?.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.date} · {(s.items || []).length} item(s)</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(s.total || 0).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
