import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '@supabaseClient';
import { ArrowLeft, Package, CheckCircle2, Truck, CreditCard, Download } from 'lucide-react';
import { getProductImagePath, FALLBACK_IMAGE } from '@shared/utils/imageUtils';

export default function OrderDetails() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user && id) {
      const fetchOrder = async () => {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).eq('customer_id', user.id).single();
        if (data) setOrder(data);
        setFetching(false);
      };
      fetchOrder();
    }
  }, [user, id]);

  if (loading) return <div className="container section flex-center" style={{ minHeight: '60vh' }}><div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div></div>;
  if (!user) return <Navigate to={`/login?returnTo=/orders/${id}`} replace />;

  if (fetching) return <div className="container section"><div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }}></div></div>;
  if (!order) return <div className="container section flex-center" style={{ minHeight: '60vh' }}>Order not found or you don't have permission to view it.</div>;

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const stages = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
  const currentStageIdx = stages.indexOf(order.status.toLowerCase());
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="h2" style={{ marginBottom: '0.5rem' }}>Order #{order.id}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Download Invoice
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left column */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Tracking Timeline */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '2rem' }}>Order Status</h3>
            {isCancelled ? (
              <div style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 /> Order Cancelled
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', background: 'var(--color-border)', zIndex: 0 }}>
                  <div style={{ height: '100%', background: 'var(--color-success)', width: `${Math.max(0, (currentStageIdx / (stages.length - 1)) * 100)}%`, transition: 'width 0.5s ease' }}></div>
                </div>
                {stages.map((stage, idx) => {
                  const completed = currentStageIdx >= idx;
                  const active = currentStageIdx === idx;
                  return (
                    <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '0.5rem', width: '80px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: completed ? 'var(--color-success)' : 'var(--color-bg)', border: `2px solid ${completed ? 'var(--color-success)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: completed ? '#fff' : 'var(--color-text-muted)' }}>
                        {completed ? <CheckCircle2 size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-text-muted)' }}></div>}
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: completed ? 'var(--color-text-main)' : 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', overflow: 'hidden' }}>
                    <img src={getProductImagePath(item.category, item.name, 'cover.webp')} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}><Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link></h4>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Qty: {item.qty}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary */}
          <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem' }}>Payment Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9375rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
              <span>Total</span>
              <span>{formatPrice(order.grand_total)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Truck size={18} color="var(--color-text-muted)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Shipping Address</h3>
            </div>
            {order.shipping_address ? (
              <div style={{ fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--color-text-main)' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.shipping_address.full_name}</div>
                <div>{order.shipping_address.address_line1}, {order.shipping_address.address_line2}</div>
                <div>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</div>
                <div style={{ marginTop: '0.5rem' }}>Phone: {order.shipping_address.phone}</div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)' }}>No address provided</div>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CreditCard size={18} color="var(--color-text-muted)" />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0 }}>Payment Method</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9375rem', textTransform: 'uppercase' }}>{order.payment_method}</span>
              <span className="badge" style={{ background: order.payment_status === 'paid' ? 'var(--color-success-bg, #ecfdf5)' : 'var(--color-warning-bg, #fffbeb)', color: order.payment_status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {order.payment_status}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
