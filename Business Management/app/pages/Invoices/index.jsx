import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, Download, Share2, Copy, FileText, X, Printer, Edit } from 'lucide-react';
import { useApp } from '@business/app/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import MonthSelector from '@business/components/MonthSelector';
import InvoiceTemplate from './InvoiceTemplate';

const STATUS_COLORS = { paid: 'success', unpaid: 'warning', partial: 'accent' };

export default function Invoices() {
  const { invoices, customers, deleteInvoice, globalMonth, settings } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewInvoiceId, setPreviewInvoiceId] = useState(null);
  const navigate = useNavigate();

  const previewInvoice = useMemo(() => {
    if (!previewInvoiceId) return null;
    const inv = invoices.find(i => i.id === previewInvoiceId);
    if (!inv) return null;
    return {
      ...inv,
      businessName: settings?.businessName || 'Gift Yours',
      businessAddress: settings?.address,
      businessPhone: settings?.phone,
    };
  }, [previewInvoiceId, invoices, settings]);

  const filtered = useMemo(() =>
    invoices
      .filter(inv => inv.date?.startsWith(globalMonth))
      .filter(inv => {
        const matchSearch = !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        return dateDiff !== 0 ? dateDiff : new Date(b.createdAt) - new Date(a.createdAt);
      })
  , [invoices, search, statusFilter, globalMonth]);

  const totalPaid = filtered.filter(i => i.status === 'paid').reduce((a, i) => a + (i.grandTotal || 0), 0);
  const totalUnpaid = filtered.filter(i => i.status === 'unpaid').reduce((a, i) => a + (i.grandTotal || 0), 0);
  const monthObj = parse(globalMonth, 'yyyy-MM', new Date());

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Invoices</h2>
          <p className="page-subtitle">{format(monthObj, 'MMMM yyyy')} · {filtered.length} invoices · ₹{totalPaid.toLocaleString('en-IN')} collected</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <MonthSelector />
          <Link to={`${window.location.hostname.includes('e-commerce') ? '/business' : ''}/invoices/new`} className="btn btn-primary"><Plus size={16} /> Create</Link>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total Invoices', value: filtered.length, color: 'var(--primary)', bg: 'var(--primary-alpha-10)' },
          { label: 'Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: 'var(--success)', bg: 'var(--success-light)' },
          { label: 'Unpaid', value: `₹${totalUnpaid.toLocaleString('en-IN')}`, color: 'var(--warning)', bg: 'var(--warning-light)' },
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
          {[['all', 'All'], ['paid', 'Paid'], ['unpaid', 'Unpaid'], ['partial', 'Partial']].map(([k, l]) => (
            <button key={k} className={`tab ${statusFilter === k ? 'active' : ''}`} onClick={() => setStatusFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={48} strokeWidth={1} /></div>
          <h3>No invoices found</h3>
          <p>Create your first professional invoice</p>
          <Link to={`${window.location.hostname.includes('e-commerce') ? '/business' : ''}/invoices/new`} className="btn btn-primary"><Plus size={16} /> Create Invoice</Link>
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
                <tr key={inv.id} onClick={() => setPreviewInvoiceId(inv.id)} style={{ cursor: 'pointer' }} className="table-row-hover">
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{inv.invoiceNumber}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{format(new Date(inv.date), 'dd-MM-yyyy')}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inv.customerName || '—'}</div>
                    {inv.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customerPhone}</div>}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{(inv.items || []).length} item(s)</td>
                  <td style={{ fontWeight: 700, fontSize: '0.9375rem' }}>₹{(inv.grandTotal || 0).toLocaleString('en-IN')}</td>
                  <td><span className={`badge badge-${STATUS_COLORS[inv.status] || 'muted'}`}>{inv.status || 'unpaid'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => setPreviewInvoiceId(inv.id)} title="Preview Invoice">
                        <Eye size={14} />
                      </button>
                      <Link to={`${window.location.hostname.includes('e-commerce') ? '/business' : ''}/invoices/${inv.id}/edit`} className="btn btn-ghost btn-icon-sm" title="Edit Invoice">
                        <Edit size={14} />
                      </Link>
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

      <Link to={`${window.location.hostname.includes('e-commerce') ? '/business' : ''}/invoices/new`} className="fab" style={{ display: 'flex', textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }} title="Create Invoice">
        <Plus size={24} />
      </Link>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', padding: '2rem'
        }} onClick={() => setPreviewInvoiceId(null)}>
          <div style={{
            background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', 
            maxWidth: '100%', maxHeight: '100%', overflow: 'auto',
            position: 'relative', boxShadow: 'var(--shadow-lg)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Invoice Preview</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`${window.location.hostname.includes('e-commerce') ? '/business' : ''}/invoices/${previewInvoice.id}/edit`)}>
                  Edit Invoice
                </button>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => setPreviewInvoiceId(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Template Container */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: '#e5e7eb', overflowX: 'auto' }}>
              <div style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                <InvoiceTemplate invoice={previewInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
