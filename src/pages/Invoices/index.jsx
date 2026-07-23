import React, { useState, useMemo } from 'react';
import { Plus, Search, Eye, Trash2, Download, Share2, Copy, FileText, X, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const STATUS_COLORS = { paid: 'success', pending: 'warning', partial: 'accent' };

export default function Invoices() {
  const { invoices, customers, deleteInvoice } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = useMemo(() =>
    invoices
      .filter(inv => {
        const matchSearch = !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [invoices, search, statusFilter]);

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + (i.grandTotal || 0), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((a, i) => a + (i.grandTotal || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-subtitle">{invoices.length} invoices · ₹{totalPaid.toLocaleString('en-IN')} collected</p>
        </div>
        <Link to="/invoices/new" className="btn btn-primary"><Plus size={16} /> Create Invoice</Link>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Invoices', value: invoices.length, color: 'var(--primary)', bg: 'rgba(30,27,75,0.08)' },
          { label: 'Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Pending', value: `₹${totalPending.toLocaleString('en-IN')}`, color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} color="var(--text-muted)" />
          <input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs">
          {[['all', 'All'], ['paid', 'Paid'], ['pending', 'Pending'], ['partial', 'Partial']].map(([k, l]) => (
            <button key={k} className={`tab ${statusFilter === k ? 'active' : ''}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={48} strokeWidth={1} /></div>
          <h3>No invoices found</h3>
          <p>Create your first professional invoice</p>
          <Link to="/invoices/new" className="btn btn-primary"><Plus size={16} /> Create Invoice</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{inv.invoiceNumber}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{inv.date}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inv.customerName || '—'}</div>
                    {inv.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customerPhone}</div>}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{(inv.items || []).length} item(s)</td>
                  <td style={{ fontWeight: 700, fontSize: '0.9375rem' }}>₹{(inv.grandTotal || 0).toLocaleString('en-IN')}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[inv.status] || 'muted'}`}>{inv.status || 'pending'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <Link to={`/invoices/${inv.id}/edit`} className="btn btn-ghost btn-icon-sm" title="Edit/View"><Eye size={14} /></Link>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => { if (window.confirm('Delete this invoice?')) deleteInvoice(inv.id); }} title="Delete" style={{ color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/invoices/new" className="fab" style={{ display: 'flex', textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }} title="Create Invoice">
        <Plus size={24} />
      </Link>
    </div>
  );
}
