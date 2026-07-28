import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '@supabaseClient';
import { Package, ChevronRight, MapPin, CreditCard, Clock } from 'lucide-react';

export default function Orders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
          
        if (data) setOrders(data);
        setFetching(false);
      };
      fetchOrders();
    }
  }, [user]);

  if (loading) return <div className="container section flex-center" style={{ minHeight: '60vh' }}><div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div></div>;
  if (!user) return <Navigate to="/login?returnTo=/orders" replace />;

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (['delivered'].includes(s)) return 'var(--color-success)';
    if (['cancelled', 'returned'].includes(s)) return 'var(--color-danger)';
    if (['shipped', 'packed'].includes(s)) return 'var(--color-info, #3b82f6)';
    return 'var(--color-warning)'; // pending, processing
  };

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <h1 className="h2" style={{ marginBottom: '2rem' }}>My Orders</h1>
      
      {fetching ? (
        <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }}></div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)' }}>
          <Package size={64} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No orders yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>When you place orders, they will appear here.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => (
            <div key={order.id} style={{ 
              background: 'var(--color-bg)', border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-xl)', overflow: 'hidden' 
            }}>
              {/* Header */}
              <div style={{ 
                padding: '1.5rem', background: 'var(--color-bg-alt)', borderBottom: '1px solid var(--color-border)',
                display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order Placed</div>
                    <div style={{ fontWeight: 500 }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total</div>
                    <div style={{ fontWeight: 500 }}>{formatPrice(order.grand_total)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Order #</div>
                    <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{order.id}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="badge" style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status), textTransform: 'capitalize' }}>
                    {order.status}
                  </span>
                  <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem' }}>Items</h4>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={24} color="var(--color-text-muted)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}><Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link></div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Qty: {item.qty} • {formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
