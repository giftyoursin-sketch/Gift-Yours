import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import { ArrowLeft, Package, Users, IndianRupee, ShoppingCart, TrendingUp, RefreshCw } from 'lucide-react';
import DataTable from '@business/components/analytics/DataTable';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

function StatCard({ label, value, color = 'var(--text-primary)', sub }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch product details
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
      setProduct(prod);

      // Fetch all orders and find buyers of this product
      const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const safeOrders = allOrders || [];

      const buyerList = [];
      let totalUnitsSold = 0;
      let totalRevenue = 0;
      const buyerPhones = new Set();

      safeOrders.forEach(order => {
        const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
        const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address || '{}') : (order.shipping_address || {});

        items.forEach(item => {
          const isThisProduct = item.id === id || item.name === prod?.name;
          if (isThisProduct) {
            totalUnitsSold += (item.qty || 1);
            totalRevenue += (item.price || 0) * (item.qty || 1);
            buyerList.push({
              id: `${order.id}-${item.name}`,
              customerName: addr.full_name || '—',
              phone: addr.phone || '—',
              email: addr.email || '—',
              orderId: order.id,
              qty: item.qty || 1,
              amountPaid: (item.price || 0) * (item.qty || 1),
              amountPaidStr: fmtCur((item.price || 0) * (item.qty || 1)),
              purchaseDate: new Date(order.created_at).toLocaleDateString('en-IN'),
              purchaseDateRaw: new Date(order.created_at),
              city: addr.city || '—',
              orderStatus: order.status || 'pending',
              isRepeat: buyerPhones.has(addr.phone),
            });
            buyerPhones.add(addr.phone);
          }
        });
      });

      setBuyers(buyerList);
      setStats({
        totalUnitsSold,
        totalRevenue,
        totalOrders: buyerList.length,
        uniqueBuyers: buyerPhones.size,
      });
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const columns = [
    { header: 'Customer', accessor: 'customerName', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
      </div>
    )},
    { header: 'Phone', accessor: 'phone', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { header: 'Order ID', accessor: 'orderId', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>{v}</span> },
    { header: 'Qty', accessor: 'qty', render: (v) => <span style={{ fontWeight: 700, textAlign: 'center', display: 'block' }}>{v}</span> },
    { header: 'Amount Paid', accessor: 'amountPaid', render: (_, row) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{row.amountPaidStr}</span> },
    { header: 'City', accessor: 'city', render: (v) => <span style={{ color: 'var(--text-muted)' }}>{v}</span> },
    { header: 'Date', accessor: 'purchaseDate', render: (v) => <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{v}</span> },
    { header: 'Order Status', accessor: 'orderStatus', render: (v) => {
      const map = { pending: { bg: '#FEF3C7', color: '#D97706' }, delivered: { bg: '#D1FAE5', color: '#059669' }, cancelled: { bg: '#FEE2E2', color: '#DC2626' }, confirmed: { bg: '#DBEAFE', color: '#2563EB' }, processing: { bg: '#EDE9FE', color: '#7C3AED' } };
      const s = map[v] || map.pending;
      return <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>{v}</span>;
    }},
    { header: 'Repeat', accessor: 'isRepeat', render: (v) => v ? <span style={{ color: '#059669', fontWeight: 600 }}>✓ Yes</span> : <span style={{ color: 'var(--text-muted)' }}>No</span> },
  ];

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading product details...</div>;
  if (!product) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Product not found.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <ArrowLeft size={15} /> Back to Products
        </button>
      </div>

      {/* Product Info */}
      <div style={{ display: 'flex', gap: '1.5rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 100, height: 100, borderRadius: 'var(--radius)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Package size={40} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{product.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{product.category} • SKU: {product.sku || '—'}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Selling Price: <strong style={{ color: 'var(--text-primary)' }}>{fmtCur(product.selling_price)}</strong></span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Stock: <strong style={{ color: product.stock === 0 ? 'var(--error)' : 'var(--success)' }}>{product.stock}</strong></span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Revenue" value={fmtCur(stats.totalRevenue)} color="var(--success)" />
        <StatCard label="Profit (Est.)" value={fmtCur(stats.totalRevenue * 0.3)} color="var(--primary)" sub="~30% margin" />
        <StatCard label="Total Orders" value={stats.totalOrders} color="var(--info, #3B82F6)" />
        <StatCard label="Units Sold" value={stats.totalUnitsSold} color="var(--text-primary)" />
        <StatCard label="Unique Buyers" value={stats.uniqueBuyers} color="var(--warning)" />
        <StatCard label="Current Stock" value={product.stock || 0} color={product.stock === 0 ? 'var(--error)' : 'var(--success)'} />
      </div>

      {/* Who Purchased This Product */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: 'var(--primary)' }} />
          Who Purchased This Product
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({buyers.length} purchase{buyers.length !== 1 ? 's' : ''})</span>
        </h2>
        <DataTable
          columns={columns}
          data={buyers}
          loading={loading}
          searchPlaceholder="Search by customer name, phone, email, city..."
          emptyMessage="No one has purchased this product yet."
          onRowClick={(row) => navigate(`/analytics/customers/${encodeURIComponent(row.phone)}`)}
        />
      </div>
    </div>
  );
}
