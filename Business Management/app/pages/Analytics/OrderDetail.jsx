import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import {
  ArrowLeft, MapPin, CreditCard, Package,
  MessageSquare, Clock, CheckCircle, XCircle, Truck
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

const STATUS_MAP = {
  pending: { color: '#D97706', bg: '#FEF3C7', icon: Clock },
  confirmed: { color: '#2563EB', bg: '#DBEAFE', icon: CheckCircle },
  processing: { color: '#7C3AED', bg: '#EDE9FE', icon: Package },
  delivered: { color: '#059669', bg: '#D1FAE5', icon: CheckCircle },
  cancelled: { color: '#DC2626', bg: '#FEE2E2', icon: XCircle },
  shipped: { color: '#0891B2', bg: '#CFFAFE', icon: Truck },
};

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.625rem 0', borderBottom: '1px solid var(--surface-border)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', width: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Order not found.</div>;

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address || '{}') : (order.shipping_address || {});
  const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;

  const openWhatsApp = () => {
    const msg = `Hi Gift Yours 👋\n\nOrder ID: ${order.id}\nCustomer: ${addr.full_name}\nPhone: ${addr.phone}\nTotal: ${fmtCur(order.grand_total)}\nStatus: ${order.status}\n\nPlease provide an update.`;
    window.open(`https://wa.me/919363911273?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'monospace' }}>{order.id}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <span style={{ padding: '0.4rem 1rem', borderRadius: 999, background: statusInfo.bg, color: statusInfo.color, fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusIcon size={14} /> {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
        </span>
        <button onClick={openWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <MessageSquare size={15} /> WhatsApp Customer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Customer Info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Customer Information</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <InfoRow label="Name" value={addr.full_name} />
            <InfoRow label="Phone" value={addr.phone} />
            <InfoRow label="Email" value={addr.email} />
            <InfoRow label="Address" value={addr.address_line1} />
            <InfoRow label="City" value={addr.city} />
            <InfoRow label="State" value={addr.state} />
            <InfoRow label="Pincode" value={addr.pincode} />
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Payment Information</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <InfoRow label="Method" value={order.payment_method} />
            <InfoRow label="Subtotal" value={fmtCur(order.subtotal)} />
            <InfoRow label="Discount" value={order.discount > 0 ? `-${fmtCur(order.discount)}` : '₹0'} />
            <InfoRow label="Shipping" value={order.shipping_fee === 0 ? 'Free' : fmtCur(order.shipping_fee)} />
            <InfoRow label="Coupon" value={order.coupon_code || 'None'} />
            <div style={{ display: 'flex', gap: '1rem', padding: '0.875rem 0', marginTop: '0.5rem', borderTop: '2px solid var(--surface-border)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', flex: 1 }}>Grand Total</span>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>{fmtCur(order.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* Ordered Products */}
        <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Ordered Products ({items.length})</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {items.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No product details available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={22} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{item.name}</div>
                      {item.variant && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Variant: {item.variant}</div>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmtCur(item.price * (item.qty || 1))}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{fmtCur(item.price)} × {item.qty || 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Notes */}
        {order.delivery_instructions && (
          <div style={{ gridColumn: '1 / -1', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Order Notes</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{order.delivery_instructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
