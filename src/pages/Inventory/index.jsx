import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, RefreshCw, AlertTriangle, Package, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

export default function Inventory() {
  const { products, stockHistory, updateProductStock } = useApp();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // all | low | out
  const [adjusting, setAdjusting] = useState(null); // product id being adjusted
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('restock');

  const filtered = useMemo(() => {
    let list = products;
    if (search) list = list.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    if (tab === 'low') list = list.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5));
    if (tab === 'out') list = list.filter(p => !p.stock || p.stock <= 0);
    return list;
  }, [products, search, tab]);

  const totalValue = products.reduce((a, p) => a + (p.stock || 0) * (p.purchasePrice || 0), 0);
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5)).length;
  const outCount = products.filter(p => !p.stock || p.stock <= 0).length;

  const handleAdjust = async () => {
    const qty = parseInt(adjustQty);
    if (!qty || !adjusting) return;
    await updateProductStock(adjusting, qty, adjustReason);
    setAdjusting(null);
    setAdjustQty('');
  };

  const recentHistory = useMemo(() =>
    [...stockHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20)
  , [stockHistory]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">Manage stock levels across all products</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(30,27,75,0.08)', color: 'var(--primary)' }}><Package size={20} /></div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><RefreshCw size={20} /></div>
          <div className="stat-value">₹{totalValue.toLocaleString('en-IN')}</div>
          <div className="stat-label">Inventory Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><AlertTriangle size={20} /></div>
          <div className="stat-value">{lowCount}</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}><AlertTriangle size={20} /></div>
          <div className="stat-value">{outCount}</div>
          <div className="stat-label">Out of Stock</div>
        </div>
      </div>

      <div className="content-grid grid-2" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        {/* Main Table */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 180 }}>
              <Search size={15} color="var(--text-muted)" />
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="tabs">
              {[['all', 'All'], ['low', `Low (${lowCount})`], ['out', `Out (${outCount})`]].map(([k, l]) => (
                <button key={k} className={`tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No products found</td></tr>
                ) : filtered.map(p => {
                  const stockStatus = !p.stock || p.stock <= 0 ? 'out' : p.stock <= (p.minStock || 5) ? 'low' : 'ok';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                        {p.sku && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.sku}</div>}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{p.category || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => updateProductStock(p.id, -1, 'manual')} disabled={!p.stock || p.stock <= 0}>
                            <Minus size={13} />
                          </button>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', minWidth: 28, textAlign: 'center' }}>{p.stock || 0}</span>
                          <button className="btn btn-ghost btn-icon-sm" onClick={() => updateProductStock(p.id, 1, 'manual')}>
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        ₹{((p.stock || 0) * (p.purchasePrice || 0)).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge badge-${stockStatus === 'ok' ? 'success' : stockStatus === 'low' ? 'warning' : 'error'}`}>
                          {stockStatus === 'ok' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        {adjusting === p.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              className="input"
                              type="number"
                              value={adjustQty}
                              onChange={e => setAdjustQty(e.target.value)}
                              placeholder="±Qty"
                              style={{ width: 70, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                              autoFocus
                            />
                            <button className="btn btn-success btn-sm" onClick={handleAdjust}>✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setAdjusting(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="btn btn-secondary btn-sm" onClick={() => { setAdjusting(p.id); setAdjustQty(''); }}>
                            Adjust
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock History */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <History size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Stock History</span>
          </div>
          {recentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No history yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: 500, overflowY: 'auto' }}>
              {recentHistory.map(h => (
                <div key={h.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.625rem', borderBottom: '1px solid var(--surface-border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', background: h.delta > 0 ? 'var(--success-light)' : 'var(--error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8125rem', fontWeight: 700, color: h.delta > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {h.delta > 0 ? '+' : ''}{h.delta}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{h.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.reason} · {h.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
