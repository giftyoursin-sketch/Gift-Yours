import React, { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Eye, ShoppingCart, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

function SaleForm({ onClose, onSave, products, customers }) {
  const [form, setForm] = useState({
    customerId: '',
    customerName: '',
    items: [],
    paymentMethod: 'Cash',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) && (p.status === 'active' || !p.status) && (p.stock || 0) > 0
  );

  const addItem = (product) => {
    setForm(f => {
      const existing = f.items.find(i => i.productId === product.id);
      if (existing) {
        return { ...f, items: f.items.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i) };
      }
      return { ...f, items: [...f.items, { productId: product.id, productName: product.name, price: product.sellingPrice || 0, qty: 1 }] };
    });
    setSearch('');
  };

  const updateItem = (productId, field, value) => {
    setForm(f => ({ ...f, items: f.items.map(i => i.productId === productId ? { ...i, [field]: value } : i) }));
  };

  const removeItem = (productId) => setForm(f => ({ ...f, items: f.items.filter(i => i.productId !== productId) }));

  const total = form.items.reduce((a, i) => a + (i.price || 0) * (i.qty || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) return;
    setSaving(true);
    await onSave({ ...form, total });
    setSaving(false);
  };

  const selectedCustomer = customers.find(c => c.id === form.customerId);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>New Sale</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Record a new sale transaction</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Customer + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Customer</label>
                <select className="input" value={form.customerId} onChange={e => set('customerId', e.target.value)}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            {/* Product Search */}
            <div>
              <label className="input-label mb-2" style={{ display: 'block', marginBottom: '0.5rem' }}>Add Products</label>
              <div className="search-bar" style={{ marginBottom: '0.75rem' }}>
                <Search size={15} color="var(--text-muted)" />
                <input placeholder="Search and add products..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {search && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', overflow: 'hidden', maxHeight: 200, overflowY: 'auto', marginBottom: '0.75rem', boxShadow: 'var(--shadow)' }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No products found</div>
                  ) : filteredProducts.slice(0, 6).map(p => (
                    <div key={p.id} onClick={() => addItem(p)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {p.stock}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--primary)' }}>₹{p.sellingPrice || 0}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Item list */}
              {form.items.length > 0 && (
                <div style={{ border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Product</th>
                        <th style={{ padding: '0.625rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: 70 }}>Qty</th>
                        <th style={{ padding: '0.625rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: 90 }}>Price</th>
                        <th style={{ padding: '0.625rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', width: 90 }}>Total</th>
                        <th style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map(item => (
                        <tr key={item.productId} style={{ borderTop: '1px solid var(--surface-border)' }}>
                          <td style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.productName}</td>
                          <td style={{ padding: '0.375rem' }}>
                            <input type="number" min="1" value={item.qty} onChange={e => updateItem(item.productId, 'qty', parseInt(e.target.value) || 1)}
                              style={{ width: '100%', padding: '0.375rem', border: '1px solid var(--surface-border)', borderRadius: '6px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }} />
                          </td>
                          <td style={{ padding: '0.375rem' }}>
                            <input type="number" min="0" value={item.price} onChange={e => updateItem(item.productId, 'price', parseFloat(e.target.value) || 0)}
                              style={{ width: '100%', padding: '0.375rem', border: '1px solid var(--surface-border)', borderRadius: '6px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600 }} />
                          </td>
                          <td style={{ padding: '0.625rem', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>₹{(item.price * item.qty).toFixed(0)}</td>
                          <td style={{ padding: '0.375rem' }}>
                            <button type="button" className="btn btn-ghost btn-icon-sm" onClick={() => removeItem(item.productId)} style={{ color: 'var(--error)' }}><X size={13} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '0.875rem 1rem', background: 'var(--surface-2)', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Payment Method</label>
                <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Notes</label>
                <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={saving || form.items.length === 0}>
              {saving ? 'Recording...' : `Record Sale · ₹${total.toLocaleString('en-IN')}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sales() {
  const { sales, products, customers, addSale, deleteSale } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [viewSale, setViewSale] = useState(null);

  const filtered = useMemo(() =>
    sales.filter(s => !search || s.id?.includes(search) || s.customerName?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [sales, search]);

  const totalRevenue = sales.reduce((a, s) => a + (s.total || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales</h2>
          <p className="page-subtitle">{sales.length} transactions · ₹{totalRevenue.toLocaleString('en-IN')} total revenue</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '1.25rem', maxWidth: 400 }}>
        <Search size={15} color="var(--text-muted)" />
        <input placeholder="Search sales..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ShoppingCart size={48} strokeWidth={1} /></div>
          <h3>No sales yet</h3>
          <p>Start recording sales to track your revenue</p>
          <button className="btn btn-accent" onClick={() => setShowForm(true)}><Plus size={16} /> New Sale</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const customer = customers.find(c => c.id === s.customerId);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)' }}>#{s.id?.slice(-6).toUpperCase()}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{s.date}</td>
                    <td style={{ fontSize: '0.875rem' }}>{customer?.name || 'Walk-in'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{(s.items || []).length} item(s)</td>
                    <td><span className="badge badge-primary">{s.paymentMethod}</span></td>
                    <td style={{ fontWeight: 700, fontSize: '0.9375rem' }}>₹{(s.total || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => setViewSale(s)} title="View"><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-icon-sm" onClick={() => { if (window.confirm('Delete this sale? Stock will be restored.')) deleteSale(s.id); }} title="Delete" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile FAB */}
      <button className="fab" onClick={() => setShowForm(true)} title="New Sale">
        <Plus size={24} />
      </button>

      {showForm && (
        <SaleForm
          products={products}
          customers={customers}
          onClose={() => setShowForm(false)}
          onSave={async (data) => { await addSale(data); setShowForm(false); }}
        />
      )}

      {/* View Sale Drawer */}
      {viewSale && (
        <div className="drawer-overlay" onClick={() => setViewSale(null)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Sale #{viewSale.id?.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{viewSale.date}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewSale(null)}><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUSTOMER</div><div style={{ fontWeight: 600 }}>{customers.find(c => c.id === viewSale.customerId)?.name || 'Walk-in'}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAYMENT</div><div style={{ fontWeight: 600 }}>{viewSale.paymentMethod}</div></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>ITEMS</div>
                  {(viewSale.items || []).map(item => (
                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--surface-border)' }}>
                      <div><div style={{ fontWeight: 600 }}>{item.productName}</div><div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>x{item.qty} @ ₹{item.price}</div></div>
                      <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem', background: 'var(--primary)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{(viewSale.total || 0).toLocaleString('en-IN')}</span>
                </div>
                {viewSale.notes && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NOTES</div><div style={{ fontSize: '0.875rem' }}>{viewSale.notes}</div></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
