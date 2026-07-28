import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { getProductImagePath, FALLBACK_IMAGE } from '@shared/utils/imageUtils';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, discount, shippingFee, grandTotal, coupon, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toLowerCase() === 'welcome10') {
      applyCoupon({ code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, max_discount: 500 });
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container section flex-center" style={{ minHeight: '60vh', flexDirection: 'column' }}>
        <ShoppingBag size={64} color="var(--color-text-muted)" style={{ marginBottom: '1.5rem' }} />
        <h2 className="h2" style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <h1 className="h2" style={{ marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Left: Cart Items */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.variant}`} style={{ 
              display: 'flex', gap: '1.5rem', padding: '1.5rem', 
              background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' 
            }}>
              {/* Image */}
              <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--color-bg-alt)' }}>
                <img 
                  src={getProductImagePath(item.category, item.name, 'cover.webp')} 
                  alt={item.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link>
                    </h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.category}</span>
                    {item.variant && <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Variant: {item.variant}</div>}
                  </div>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatPrice(item.price * item.qty)}</span>
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
                    <button className="btn-icon" onClick={() => updateQuantity(item.id, item.qty - 1, item.variant)} style={{ width: '32px', height: '32px' }}><Minus size={14} /></button>
                    <span style={{ width: '32px', textAlign: 'center', fontWeight: 600, fontSize: '0.9375rem' }}>{item.qty}</span>
                    <button className="btn-icon" onClick={() => updateQuantity(item.id, item.qty + 1, item.variant)} style={{ width: '32px', height: '32px' }}><Plus size={14} /></button>
                  </div>
                  <button 
                    className="btn-icon" 
                    onClick={() => removeFromCart(item.id, item.variant)}
                    style={{ color: 'var(--color-danger)' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div style={{ flex: '1 1 350px', background: 'var(--color-bg-alt)', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          <h3 className="h3" style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>{formatPrice(subtotal)}</span>
            </div>
            
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                <span>Discount ({coupon.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
              <span style={{ fontWeight: 500 }}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '1.5rem' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatPrice(grandTotal)}</span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem' }} onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          {/* Coupon Form */}
          <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Tag size={16} />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Apply Coupon Code</span>
            </div>
            
            {coupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-success-bg, #ecfdf5)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--color-success)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{coupon.code} Applied!</span>
                <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8125rem' }}>Remove</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter code (e.g. WELCOME10)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-outline">Apply</button>
              </form>
            )}
            {couponError && <div style={{ color: 'var(--color-danger)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{couponError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
