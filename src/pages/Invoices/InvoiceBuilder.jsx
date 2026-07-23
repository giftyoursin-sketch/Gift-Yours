import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Printer, Download, Search, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import InvoiceTemplate from './InvoiceTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
const STATUS_OPTIONS = ['paid', 'pending', 'partial'];

export default function InvoiceBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, products, customers, addInvoice, updateInvoice, settings } = useApp();

  const existing = id && id !== 'new' ? invoices.find(inv => inv.id === id) : null;

  const [form, setForm] = useState({
    customerName: existing?.customerName || '',
    customerPhone: existing?.customerPhone || '',
    customerAddress: existing?.customerAddress || '',
    date: existing?.date || format(new Date(), 'yyyy-MM-dd'),
    dueDate: existing?.dueDate || '',
    items: existing?.items || [],
    discount: existing?.discount || 0,
    notes: existing?.notes || '',
    terms: existing?.terms || 'Thank you for your business!',
    paymentMethod: existing?.paymentMethod || 'Cash',
    status: existing?.status || 'pending',
  });

  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) && productSearch
  ).slice(0, 6);

  const addItem = (product) => {
    setForm(f => {
      const existing = f.items.find(i => i.productId === product.id);
      if (existing) return { ...f, items: f.items.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i) };
      return { ...f, items: [...f.items, { productId: product.id, productName: product.name, price: product.sellingPrice || 0, qty: 1 }] };
    });
    setProductSearch('');
  };

  const addCustomItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { productId: `custom-${Date.now()}`, productName: '', price: 0, qty: 1 }] }));
  };

  const updateItem = (idx, field, value) => {
    setForm(f => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));
  };

  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((a, i) => a + (parseFloat(i.price) || 0) * (parseInt(i.qty) || 0), 0);
  const discountAmt = parseFloat(form.discount) || 0;
  const grandTotal = subtotal - discountAmt;

  const invoiceData = { ...form, subtotal, discountAmt, grandTotal, invoiceNumber: existing?.invoiceNumber || `${settings.invoicePrefix || 'INV'}-PREVIEW`, businessName: settings.businessName || 'Gift Yours', businessAddress: settings.address, businessPhone: settings.phone };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, subtotal, discountAmt, grandTotal };
    if (existing) await updateInvoice(existing.id, data);
    else { const inv = await addInvoice(data); navigate(`/invoices/${inv.id}/edit`); }
    setSaving(false);
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceData.invoiceNumber || 'invoice'}.pdf`);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleWhatsApp = () => {
    const msg = `Invoice ${invoiceData.invoiceNumber}\nCustomer: ${form.customerName}\nAmount: ₹${grandTotal.toLocaleString('en-IN')}\nStatus: ${form.status}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/invoices')}><ArrowLeft size={18} /></button>
          <div>
            <h2 className="page-title">{existing ? `Edit ${existing.invoiceNumber}` : 'Create Invoice'}</h2>
            <p className="page-subtitle">Professional invoice for your customers</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handlePrint}><Printer size={15} /> Print</button>
          <button className="btn btn-secondary" onClick={handleDownloadPDF} disabled={generating}>
            <Download size={15} /> {generating ? 'Generating...' : 'PDF'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Customer Details */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Customer Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Customer Name</label>
                  <input className="input" value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="Customer name" />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input className="input" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} placeholder="Phone number" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <input className="input" value={form.customerAddress} onChange={e => set('customerAddress', e.target.value)} placeholder="Customer address" />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Invoice Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Invoice Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Payment Method</label>
                <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Items</h4>

            {/* Search products */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div className="search-bar">
                <Search size={15} color="var(--text-muted)" />
                <input placeholder="Search products to add..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => addItem(p)} style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>₹{p.sellingPrice || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items Table */}
            {form.items.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                {form.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px 30px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <input className="input" value={item.productName} onChange={e => updateItem(idx, 'productName', e.target.value)} placeholder="Item name" style={{ fontSize: '0.8125rem' }} />
                    <input className="input" type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 1)} placeholder="Qty" style={{ textAlign: 'center', fontSize: '0.8125rem' }} />
                    <input className="input" type="number" min="0" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="Price" style={{ textAlign: 'right', fontSize: '0.8125rem' }} />
                    <button type="button" className="btn btn-ghost btn-icon-sm" onClick={() => removeItem(idx)} style={{ color: 'var(--error)' }}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="btn btn-secondary btn-sm" onClick={addCustomItem} style={{ width: '100%' }}>
              <Plus size={13} /> Add Custom Item
            </button>
          </div>

          {/* Totals + Notes */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Summary & Notes</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Discount (₹)</label>
                <input className="input" type="number" min="0" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" />
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>Subtotal</span><span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--error)' }}>
                    <span>Discount</span><span>-₹{discountAmt.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.0625rem', fontWeight: 800, borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem', color: 'var(--primary)' }}>
                  <span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Notes</label>
                <textarea className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes for customer..." rows={2} />
              </div>
              <div className="input-group">
                <label className="input-label">Terms & Conditions</label>
                <textarea className="input" value={form.terms} onChange={e => set('terms', e.target.value)} placeholder="Terms..." rows={2} />
              </div>
            </div>
          </div>

          {/* WhatsApp Share */}
          <button className="btn btn-success" onClick={handleWhatsApp} style={{ width: '100%' }}>
            <span style={{ fontSize: '1rem' }}>📱</span> Share via WhatsApp
          </button>
        </div>

        {/* Live Preview */}
        <div className="desktop-only" style={{ position: 'sticky', top: '5rem' }}>
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invoice Preview</div>
            <div ref={previewRef} style={{ transform: 'scale(0.65)', transformOrigin: 'top center', width: '154%', marginLeft: '-27%' }}>
              <InvoiceTemplate invoice={invoiceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
