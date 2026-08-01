import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import { Eye, Download, MessageSquare } from 'lucide-react';
import DataTable from '@business/components/analytics/DataTable';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';
import KpiCard from '@business/components/analytics/KpiCard';
import { ShoppingCart, Clock, XCircle, CheckCircle } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#D97706' },
  confirmed: { bg: '#DBEAFE', color: '#2563EB' },
  processing: { bg: '#EDE9FE', color: '#7C3AED' },
  delivered: { bg: '#D1FAE5', color: '#059669' },
  cancelled: { bg: '#FEE2E2', color: '#DC2626' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [kpis, setKpis] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, [range]);

  const fetchOrders = async () => {
    setLoading(true);
    const { from } = getDateRange(range);
    const { data } = await supabase.from('orders').select('*').gte('created_at', from.toISOString()).order('created_at', { ascending: false });
    const safeData = data || [];

    // Flatten orders for table
    const tableRows = safeData.map(o => {
      const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
      const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
      const productNames = items.map(i => i.name).join(', ');
      const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
      return {
        id: o.id,
        orderId: o.id,
        customerName: addr.full_name || '—',
        customerPhone: addr.phone || '—',
        customerEmail: addr.email || '—',
        product: productNames || '—',
        quantity: totalQty,
        amount: o.grand_total || 0,
        amountStr: fmtCur(o.grand_total),
        paymentMethod: o.payment_method || '—',
        status: o.status || 'pending',
        date: new Date(o.created_at).toLocaleDateString('en-IN'),
        _raw: o,
      };
    });
    setOrders(tableRows);

    // KPIs
    setKpis({
      total: safeData.length,
      pending: safeData.filter(o => o.status === 'pending').length,
      delivered: safeData.filter(o => o.status === 'delivered').length,
      cancelled: safeData.filter(o => o.status === 'cancelled').length,
    });
    setLoading(false);
  };

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const columns = [
    { header: 'Order ID', accessor: 'orderId', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>{v}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Phone', accessor: 'customerPhone', render: (v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span> },
    { header: 'Product', accessor: 'product', render: (v) => <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{v}</span> },
    { header: 'Qty', accessor: 'quantity', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { header: 'Amount', accessor: 'amount', render: (_, row) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.amountStr}</span> },
    { header: 'Payment', accessor: 'paymentMethod' },
    { header: 'Status', accessor: 'status', render: (v) => <StatusBadge status={v} /> },
    { header: 'Date', accessor: 'date', render: (v) => <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{v}</span> },
    {
      header: 'Actions', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/analytics/orders/${row.orderId}`); }}
            style={{ padding: '0.35rem 0.625rem', background: 'var(--primary-alpha-10)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const addr = row._raw?.shipping_address || {};
              const safeAddr = typeof addr === 'string' ? JSON.parse(addr) : addr;
              const items = typeof row._raw?.items === 'string' ? JSON.parse(row._raw?.items || '[]') : (row._raw?.items || []);
              const msg = `Hi Gift Yours 👋\n\nOrder Update Required\n\nOrder ID: ${row.orderId}\nCustomer: ${row.customerName}\nPhone: ${row.customerPhone}\nProducts: ${row.product}\nTotal: ${row.amountStr}\nStatus: ${row.status}`;
              window.open(`https://wa.me/919363911273?text=${encodeURIComponent(msg)}`, '_blank');
            }}
            style={{ padding: '0.35rem 0.625rem', background: 'rgba(37,211,102,0.1)', color: '#25D366', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <MessageSquare size={13} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Complete order management and analytics</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Orders" value={kpis.total ?? '—'} icon={ShoppingCart} color="info" loading={loading} />
        <KpiCard title="Pending" value={kpis.pending ?? '—'} icon={Clock} color="warning" loading={loading} />
        <KpiCard title="Delivered" value={kpis.delivered ?? '—'} icon={CheckCircle} color="success" loading={loading} />
        <KpiCard title="Cancelled" value={kpis.cancelled ?? '—'} icon={XCircle} color="primary" loading={loading} />
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--surface-border)', background: statusFilter === s ? 'var(--primary)' : 'var(--surface)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)', fontWeight: statusFilter === s ? 600 : 400, cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {s === 'all' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder="Search by customer, order ID, product..."
          onRowClick={(row) => navigate(`/analytics/orders/${row.orderId}`)}
          emptyMessage="No orders found in the selected period."
        />
      </div>
    </div>
  );
}
