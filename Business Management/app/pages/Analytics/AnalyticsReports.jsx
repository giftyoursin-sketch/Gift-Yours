import React, { useState } from 'react';
import { supabase } from '@supabaseClient';
import { Download, FileText, Table, AlertCircle } from 'lucide-react';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

export default function AnalyticsReports() {
  const [range, setRange] = useState('30d');
  const [generating, setGenerating] = useState('');
  const [message, setMessage] = useState('');

  const generateCSV = async (type) => {
    setGenerating(type);
    setMessage('');

    try {
      const { from } = getDateRange(range);
      let csvContent = '';
      let filename = `gift-yours-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

      if (type === 'orders') {
        const { data } = await supabase.from('orders').select('*').gte('created_at', from.toISOString()).order('created_at', { ascending: false });
        const orders = data || [];
        const rows = orders.map(o => {
          const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
          const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
          return [
            o.id,
            addr.full_name || '',
            addr.phone || '',
            addr.email || '',
            items.map(i => i.name).join('; '),
            items.reduce((s, i) => s + (i.qty || 1), 0),
            o.grand_total || 0,
            o.payment_method || '',
            o.status || '',
            new Date(o.created_at).toLocaleDateString('en-IN'),
            `${addr.city || ''} ${addr.state || ''}`.trim(),
          ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });
        csvContent = ['Order ID,Customer Name,Phone,Email,Products,Quantity,Amount,Payment Method,Status,Date,Location', ...rows].join('\n');
      } else if (type === 'customers') {
        const { data } = await supabase.from('orders').select('*').gte('created_at', from.toISOString());
        const orders = data || [];
        const custMap = {};
        orders.forEach(o => {
          const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
          const phone = addr.phone || 'unknown';
          if (!custMap[phone]) custMap[phone] = { name: addr.full_name || '', phone, email: addr.email || '', city: addr.city || '', state: addr.state || '', orders: 0, total: 0 };
          custMap[phone].orders++;
          custMap[phone].total += (o.grand_total || 0);
        });
        const rows = Object.values(custMap).map(c => [c.name, c.phone, c.email, c.city, c.state, c.orders, c.total].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        csvContent = ['Customer Name,Phone,Email,City,State,Total Orders,Total Spent', ...rows].join('\n');
      } else if (type === 'products') {
        const { data: products } = await supabase.from('products').select('*');
        const { data: orders } = await supabase.from('orders').select('items');
        const orderItems = (orders || []).flatMap(o => {
          const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
          return items;
        });
        const rows = (products || []).map(p => {
          const sold = orderItems.filter(i => i.id === p.id || i.name === p.name).reduce((s, i) => s + (i.qty || 1), 0);
          return [p.name, p.category, p.sku, p.selling_price, p.stock, sold].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
        });
        csvContent = ['Product Name,Category,SKU,Price,Current Stock,Units Sold', ...rows].join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      a.click(); URL.revokeObjectURL(url);
      setMessage(`✅ ${filename} downloaded successfully!`);
    } catch (err) {
      setMessage(`❌ Error generating report: ${err.message}`);
    }
    setGenerating('');
  };

  const REPORT_TYPES = [
    { id: 'orders', icon: FileText, title: 'Orders Report', description: 'Complete list of all orders with customer details, products, amount, and status', color: 'var(--primary)' },
    { id: 'customers', icon: Table, title: 'Customers Report', description: 'All customers with their contact info, city, total orders, and spending', color: '#3B82F6' },
    { id: 'products', icon: Table, title: 'Products Report', description: 'All products with stock levels, prices, and units sold', color: '#10B981' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Export data for the selected period</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {message && (
        <div style={{ padding: '0.875rem 1.25rem', background: message.startsWith('✅') ? '#D1FAE5' : '#FEE2E2', color: message.startsWith('✅') ? '#059669' : '#DC2626', borderRadius: 'var(--radius)', fontWeight: 500, fontSize: '0.9375rem' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {REPORT_TYPES.map(report => (
          <div key={report.id} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: `${report.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <report.icon size={20} style={{ color: report.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem', fontSize: '1rem' }}>{report.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.5, margin: 0 }}>{report.description}</p>
              </div>
            </div>
            <button
              onClick={() => generateCSV(report.id)}
              disabled={generating === report.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: report.color, color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: generating === report.id ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', opacity: generating === report.id ? 0.7 : 1, transition: 'opacity 0.2s' }}
            >
              <Download size={15} />
              {generating === report.id ? 'Generating...' : 'Export CSV'}
            </button>
          </div>
        ))}
      </div>

      {/* Future: PDF export */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🔜 Coming Soon</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {['PDF Export', 'Excel (.xlsx) Export', 'Scheduled Reports', 'Email Reports', 'WhatsApp Reports'].map(f => (
            <div key={f} style={{ padding: '0.75rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--surface-border)', flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
