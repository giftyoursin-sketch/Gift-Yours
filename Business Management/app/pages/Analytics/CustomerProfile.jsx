import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import { ArrowLeft, MessageSquare, Phone, Mail, MapPin, ShoppingCart, IndianRupee, Package, Star } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

function StatBadge({ label, value, color = 'var(--primary)' }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

export default function CustomerProfile() {
  const { phone } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      // Fetch all orders
      const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const safeOrders = allOrders || [];

      // Filter by phone number from shipping address
      const decodedPhone = decodeURIComponent(phone);
      const customerOrders = safeOrders.filter(o => {
        const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
        return addr.phone === decodedPhone;
      });

      setOrders(customerOrders);

      if (customerOrders.length > 0) {
        const firstOrder = customerOrders[customerOrders.length - 1];
        const addr = typeof firstOrder.shipping_address === 'string' ? JSON.parse(firstOrder.shipping_address || '{}') : (firstOrder.shipping_address || {});
        const totalSpent = customerOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
        const avgOrder = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;

        // Count products
        const productMap = {};
        customerOrders.forEach(o => {
          const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
          items.forEach(item => {
            if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
            productMap[item.name].qty += (item.qty || 1);
            productMap[item.name].revenue += (item.price || 0) * (item.qty || 1);
          });
        });

        setProfile({
          name: addr.full_name,
          phone: addr.phone,
          email: addr.email,
          city: addr.city,
          state: addr.state,
          address: addr.address_line1,
          totalOrders: customerOrders.length,
          totalSpent,
          avgOrder,
          firstPurchase: firstOrder.created_at,
          lastPurchase: customerOrders[0]?.created_at,
          isReturning: customerOrders.length > 1,
          favoriteProducts: Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5),
        });
      }
      setLoading(false);
    };
    fetchCustomerOrders();
  }, [phone]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer profile...</div>;
  if (!profile) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Customer not found.</div>;

  const getStatusBadge = (status) => {
    const map = { pending: { bg: '#FEF3C7', color: '#D97706' }, confirmed: { bg: '#DBEAFE', color: '#2563EB' }, delivered: { bg: '#D1FAE5', color: '#059669' }, cancelled: { bg: '#FEE2E2', color: '#DC2626' }, processing: { bg: '#EDE9FE', color: '#7C3AED' } };
    const s = map[status] || map.pending;
    return <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, flex: 1 }}>{profile.name}</h1>
        <span style={{ padding: '0.35rem 0.875rem', borderRadius: 999, background: profile.isReturning ? '#D1FAE5' : '#DBEAFE', color: profile.isReturning ? '#059669' : '#2563EB', fontSize: '0.8125rem', fontWeight: 600 }}>
          {profile.isReturning ? '⭐ Returning Customer' : '🆕 New Customer'}
        </span>
        <button
          onClick={() => window.open(`https://wa.me/91${profile.phone?.replace(/\D/g, '')}`, '_blank')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
        >
          <MessageSquare size={15} /> WhatsApp
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>Profile Information</h3>
          {[
            { icon: Phone, label: profile.phone },
            { icon: Mail, label: profile.email || 'Not provided' },
            { icon: MapPin, label: `${profile.city}, ${profile.state}` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '0.875rem', marginTop: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>First Purchase</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{new Date(profile.firstPurchase).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Last Purchase</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{new Date(profile.lastPurchase).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StatBadge label="Total Orders" value={profile.totalOrders} color="var(--primary)" />
            <StatBadge label="Total Spent" value={fmtCur(profile.totalSpent)} color="var(--success)" />
            <StatBadge label="Avg Order Value" value={fmtCur(profile.avgOrder)} color="var(--info, #3B82F6)" />
            <StatBadge label="Repeat Purchases" value={profile.isReturning ? `${profile.totalOrders}x` : '1x'} color="var(--warning)" />
          </div>
        </div>

        {/* Favourite Products */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Favourite Products</h3>
          {profile.favoriteProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No purchase data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profile.favoriteProducts.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-alpha-10)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', flexShrink: 0 }}>{p.qty}x</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0 }}>{fmtCur(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Order History ({orders.length})</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
                {['Order ID', 'Products', 'Quantity', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
                const qty = items.reduce((s, i) => s + (i.qty || 1), 0);
                const productNames = items.map(i => i.name).join(', ');
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--surface-border)', cursor: 'pointer' }} onClick={() => navigate(`/analytics/orders/${order.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{order.id}</td>
                    <td style={{ padding: '0.875rem 1rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{productNames || '—'}</td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600 }}>{qty}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--success)' }}>{fmtCur(order.grand_total)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
