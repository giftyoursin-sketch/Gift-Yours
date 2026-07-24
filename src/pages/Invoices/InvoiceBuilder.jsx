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
    customerPhone: existing?.customerPhone || '+91 ',
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
  const printRef = useRef();

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

  const generatePDFBlob = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  };

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const blob = await generatePDFBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${invoiceData.invoiceNumber || 'invoice'}.pdf`; a.click();
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const handleWhatsApp = async () => {
    setGenerating(true);
    try {
      // 1. Generate PDF
      const blob = await generatePDFBlob();

      // 2. Format products
      const productList = form.items.map(item => `- ${item.productName} (x${item.qty})`).join('\n');

      // 3. Prepare message
      const msg = `Hello ${form.customerName || 'Customer'},

Thank you for shopping with Gift Yours! ❤️

Your invoice has been generated successfully.

Invoice Number: ${invoiceData.invoiceNumber}
Invoice Date: ${format(new Date(invoiceData.date), 'dd MMM yyyy')}

Products Purchased:
${productList}

Discount: ₹${discountAmt.toLocaleString('en-IN')}
Grand Total: ₹${grandTotal.toLocaleString('en-IN')}

Payment Status: ${form.status.charAt(0).toUpperCase() + form.status.slice(1)}

Thank you for choosing Gift Yours.

Business Contact:
+91 93639 11273`;

      const cleanPhone = form.customerPhone.replace(/\D/g, '');
      const file = new File([blob], `${invoiceData.invoiceNumber || 'invoice'}.pdf`, { type: 'application/pdf' });

      // 4. Try native Web Share API (OS-level sharing which can auto-attach to WhatsApp)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `Invoice ${invoiceData.invoiceNumber}`,
            text: msg,
            files: [file]
          });
          setGenerating(false);
          return;
        } catch (e) {
          console.log('Native share failed or cancelled, falling back', e);
        }
      }

      // 5. Fallback: Download the PDF to file explorer and launch WhatsApp directly
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${invoiceData.invoiceNumber || 'invoice'}.pdf`; a.click();
      
      // api.whatsapp.com automatically tries to launch the Desktop App first, then falls back to Web
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
      
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const isValidPhone = (phone) => {
    const clean = (phone || '').replace(/\D/g, '');
    return clean.length >= 10;
  };
  const isWhatsAppValid = isValidPhone(form.customerPhone);

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
      <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Customer Details */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Customer Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
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
            <div className="grid-2" style={{ gap: '0.75rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-success" onClick={handleWhatsApp} disabled={!isWhatsAppValid || generating} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              {generating ? 'Preparing Invoice...' : 'Send Invoice via WhatsApp'}
            </button>
            {!isWhatsAppValid && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--error)', textAlign: 'center', marginTop: '0.25rem' }}>
                Please enter a valid WhatsApp number.
              </p>
            )}
          </div>
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

      {/* Hidden full-scale A4 template for PDF generation */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={printRef} style={{ width: '210mm', minHeight: '297mm', background: '#fff' }}>
          <InvoiceTemplate invoice={invoiceData} />
        </div>
      </div>
    </div>
  );
}
