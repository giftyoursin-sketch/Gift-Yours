import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import { Package, AlertCircle, TrendingUp, Eye, BarChart2, RefreshCw } from 'lucide-react';
import KpiCard from '@business/components/analytics/KpiCard';
import DataTable from '@business/components/analytics/DataTable';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

export default function ProductsAnalytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { from } = getDateRange(range);

    const [{ data: dbProducts }, { data: orders }] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('orders').select('*').gte('created_at', from.toISOString()),
    ]);

    const safeProducts = dbProducts || [];
    const safeOrders = orders || [];

    // Build product analytics from orders
    const prodMap = {};
    safeOrders.forEach(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
      items.forEach(item => {
        const key = item.id || item.name;
        if (!prodMap[key]) {
          prodMap[key] = { id: key, name: item.name, category: item.category || '—', orders: 0, unitsSold: 0, revenue: 0, buyers: new Set() };
        }
        prodMap[key].orders += 1;
        prodMap[key].unitsSold += (item.qty || 1);
        prodMap[key].revenue += (item.price || 0) * (item.qty || 1);
        const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
        if (addr.phone) prodMap[key].buyers.add(addr.phone);
      });
    });

    // Merge with DB product data
    const enrichedProducts = safeProducts.map(p => {
      const stats = prodMap[p.id] || prodMap[p.name] || { orders: 0, unitsSold: 0, revenue: 0, buyers: new Set() };
      return {
        id: p.id,
        name: p.name,
        category: p.category || '—',
        stock: p.stock || 0,
        minStock: p.min_stock || 5,
        sellingPrice: p.selling_price || 0,
        orders: stats.orders,
        unitsSold: stats.unitsSold,
        revenue: stats.revenue,
        profit: stats.revenue * 0.3,
        uniqueBuyers: stats.buyers.size,
        revenueStr: fmtCur(stats.revenue),
        profitStr: fmtCur(stats.revenue * 0.3),
        stockStatus: (p.stock || 0) === 0 ? 'out' : (p.stock || 0) <= (p.min_stock || 5) ? 'low' : 'ok',
      };
    }).sort((a, b) => b.revenue - a.revenue);

    setProducts(enrichedProducts);
    setKpis({
      total: safeProducts.length,
      outOfStock: safeProducts.filter(p => (p.stock || 0) === 0).length,
      lowStock: safeProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5)).length,
      totalRevenue: enrichedProducts.reduce((s, p) => s + p.revenue, 0),
    });
    setLoading(false);
  };

  const StockBadge = ({ status }) => {
    const map = { out: { bg: '#FEE2E2', color: '#DC2626', label: 'Out of Stock' }, low: { bg: '#FEF3C7', color: '#D97706', label: 'Low Stock' }, ok: { bg: '#D1FAE5', color: '#059669', label: 'In Stock' } };
    const s = map[status];
    return <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>;
  };

  const columns = [
    { header: 'Product', accessor: 'name', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.category}</div>
      </div>
    )},
    { header: 'Stock', accessor: 'stock', render: (v) => <span style={{ fontWeight: 700 }}>{v}</span> },
    { header: 'Status', accessor: 'stockStatus', render: (v) => <StockBadge status={v} /> },
    { header: 'Orders', accessor: 'orders', render: (v) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span> },
    { header: 'Units Sold', accessor: 'unitsSold', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { header: 'Revenue', accessor: 'revenue', render: (_, row) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{row.revenueStr}</span> },
    { header: 'Profit (Est.)', accessor: 'profit', render: (_, row) => <span style={{ color: 'var(--text-secondary)' }}>{row.profitStr}</span> },
    { header: 'Unique Buyers', accessor: 'uniqueBuyers', render: (v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span> },
    { header: 'Actions', sortable: false, render: (_, row) => (
      <button onClick={(e) => { e.stopPropagation(); navigate(`/analytics/products/${row.id}`); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.625rem', background: 'var(--primary-alpha-10)', color: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
        <Eye size={13} /> View
      </button>
    )},
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Product performance, sales, and inventory analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Products" value={kpis.total ?? '—'} icon={Package} color="info" loading={loading} />
        <KpiCard title="Out of Stock" value={kpis.outOfStock ?? '—'} icon={AlertCircle} color="primary" loading={loading} />
        <KpiCard title="Low Stock" value={kpis.lowStock ?? '—'} icon={AlertCircle} color="warning" loading={loading} />
        <KpiCard title="Total Revenue" value={fmtCur(kpis.totalRevenue)} icon={TrendingUp} color="success" loading={loading} />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          searchPlaceholder="Search by product name or category..."
          onRowClick={(row) => navigate(`/analytics/products/${row.id}`)}
          emptyMessage="No product data found."
        />
      </div>
    </div>
  );
}
