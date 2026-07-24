import React from 'react';

export default function InvoiceTemplate({ invoice }) {
  const {
    invoiceNumber, date, dueDate,
    customerName, customerPhone, customerAddress,
    businessName, businessAddress, businessPhone,
    items = [], subtotal = 0, discountAmt = 0, grandTotal = 0,
    paymentMethod, status, notes, terms,
  } = invoice || {};

  const STATUS_COLORS = { paid: '#10B981', pending: '#F59E0B', partial: '#EF4444' };
  const statusColor = STATUS_COLORS[status] || '#6B7280';

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: '#ffffff',
      width: '210mm', minHeight: '297mm',
      padding: '12mm 14mm',
      boxSizing: 'border-box',
      color: '#0F0D2E',
      fontSize: '11px',
      lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10mm', paddingBottom: '8mm', borderBottom: '2px solid #1E1B4B' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: 160, height: 60, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          {businessAddress && <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 4 }}>{businessAddress}</div>}
          {businessPhone && <div style={{ fontSize: 10.5, color: '#6B7280' }}>📞 {businessPhone}</div>}
        </div>

        {/* Invoice Info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.02em', marginBottom: 4 }}>INVOICE</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 8 }}>{invoiceNumber}</div>
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: statusColor + '20', color: statusColor, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {status || 'Pending'}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8mm', marginBottom: '8mm' }}>
        {/* Bill To */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{customerName || '—'}</div>
          {customerPhone && <div style={{ color: '#6B7280', fontSize: 10.5 }}>{customerPhone}</div>}
          {customerAddress && <div style={{ color: '#6B7280', fontSize: 10.5 }}>{customerAddress}</div>}
        </div>
        {/* Dates */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Invoice Date</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{date || '—'}</div>
          {dueDate && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, marginTop: 8 }}>Due Date</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#F59E0B' }}>{dueDate}</div>
            </>
          )}
        </div>
        {/* Payment */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Payment Method</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{paymentMethod || 'Cash'}</div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: '8mm' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1E1B4B' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>#</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Item Description</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Qty</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Unit Price</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: '#fff', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#F8F7FF', borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '8px 12px', fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>{idx + 1}</td>
                <td style={{ padding: '8px 12px', fontSize: 11.5, fontWeight: 600 }}>{item.productName || item.name}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, fontWeight: 700 }}>{item.qty}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11 }}>₹{(parseFloat(item.price) || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>₹{((parseFloat(item.price) || 0) * (parseInt(item.qty) || 0)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8mm' }}>
        <div style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 11, color: '#6B7280' }}>Subtotal</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E5E7EB', color: '#EF4444' }}>
              <span style={{ fontSize: 11 }}>Discount</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>-₹{discountAmt.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1E1B4B', borderRadius: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Grand Total</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#EF4444' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Notes + Terms */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', marginBottom: '8mm' }}>
        {notes && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Notes</div>
            <div style={{ fontSize: 10.5, color: '#374151' }}>{notes}</div>
          </div>
        )}
        {terms && (
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Terms & Conditions</div>
            <div style={{ fontSize: 10.5, color: '#374151' }}>{terms}</div>
          </div>
        )}
      </div>

      {/* Signature */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8mm' }}>
        <div style={{ textAlign: 'center', width: 160 }}>
          <div style={{ height: 40, borderBottom: '1.5px solid #1E1B4B', marginBottom: 4 }} />
          <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>Authorized Signature</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1E1B4B', marginTop: 2 }}>{businessName || 'Gift Yours'}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #1E1B4B', paddingTop: '5mm', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1E1B4B' }}>Thank you for choosing {businessName || 'Gift Yours'}! 🎁</div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>This is a computer-generated invoice. No signature required.</div>
      </div>
    </div>
  );
}
