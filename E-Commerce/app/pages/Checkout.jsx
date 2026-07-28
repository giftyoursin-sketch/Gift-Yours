import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { supabase } from '@supabaseClient';
import { MapPin, CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, subtotal, discount, shippingFee, grandTotal, coupon, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, cod, bank
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch addresses on mount if logged in
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        const { data, error } = await supabase.from('addresses').select('*').eq('customer_id', user.id);
        if (data && data.length > 0) {
          setAddresses(data);
          const def = data.find(a => a.is_default) || data[0];
          setSelectedAddress(def.id);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  if (authLoading) return <div className="container section flex-center" style={{ minHeight: '60vh' }}><div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div></div>;
  if (!user) return <Navigate to="/login?returnTo=/checkout" replace />;
  if (cartItems.length === 0 && !orderSuccess) return <Navigate to="/cart" replace />;

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const placeOrder = async () => {
    if (!selectedAddress) {
      setError('Please select or add a shipping address');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const address = addresses.find(a => a.id === selectedAddress);
      const orderId = `ORD-${Date.now()}`;
      
      // 1. Create E-Commerce Order
      const orderData = {
        id: orderId,
        customer_id: user.id,
        status: 'pending',
        payment_method: paymentMethod,
        shipping_address: address,
        items: cartItems,
        subtotal,
        discount,
        shipping_fee: shippingFee,
        grand_total: grandTotal,
        delivery_instructions: deliveryNotes,
        coupon_code: coupon?.code || null,
      };

      const { error: orderError } = await supabase.from('orders').insert([orderData]);
      if (orderError) throw orderError;

      // 2. Automatically generate an Invoice in Business Management System
      const invoiceData = {
        id: `INV-${Date.now()}`,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        customer_name: address.full_name,
        customer_phone: address.phone,
        customer_address: `${address.address_line1}, ${address.city}`,
        date: new Date().toISOString().split('T')[0],
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          total: item.price * item.qty
        })),
        subtotal,
        discount_amt: discount,
        grand_total: grandTotal,
        status: paymentMethod === 'upi' ? 'pending' : 'pending',
        payment_method: paymentMethod === 'cod' ? 'Cash' : (paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'),
        invoice_type: 'regular',
        notes: `E-Commerce Order: ${orderId}. ${deliveryNotes}`
      };

      const { error: invoiceError } = await supabase.from('invoices').insert([invoiceData]);
      if (invoiceError) console.error("Failed to sync invoice:", invoiceError); // Non-blocking

      // Success
      clearCart();
      setOrderSuccess(true);
      
    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please try again or contact support.');
    }
    setIsSubmitting(false);
  };

  if (orderSuccess) {
    return (
      <div className="container section flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
        <CheckCircle2 size={80} color="var(--color-success)" style={{ marginBottom: '1.5rem' }} />
        <h1 className="h1" style={{ marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', textAlign: 'center', maxWidth: '400px' }}>
          Thank you for shopping with us. Your order has been placed successfully. You will receive an update shortly.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
          <button className="btn btn-outline" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <h1 className="h2" style={{ marginBottom: '2rem' }}>Checkout</h1>
      
      {error && (
        <div style={{ background: 'var(--color-danger-bg, #fef2f2)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Left: Checkout Form */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Shipping Address */}
          <section style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Shipping Address</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {addresses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {addresses.map(addr => (
                    <label key={addr.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: selectedAddress === addr.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedAddress === addr.id ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                      <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} style={{ marginTop: '0.25rem' }} />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{addr.full_name} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>{addr.phone}</span></div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                          {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                        </div>
                      </div>
                    </label>
                  ))}
                  <button className="btn btn-outline" style={{ marginTop: '0.5rem' }} onClick={() => navigate('/profile?action=add-address&returnTo=/checkout')}>+ Add New Address</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>You don't have any saved addresses.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/profile?action=add-address&returnTo=/checkout')}>Add Delivery Address</button>
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Payment Method</h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: paymentMethod === 'upi' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                <div>
                  <div style={{ fontWeight: 600 }}>UPI (Google Pay, PhonePe, Paytm)</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Scan QR code or use UPI ID after placing order</div>
                </div>
              </label>
              <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: paymentMethod === 'cod' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <div>
                  <div style={{ fontWeight: 600 }}>Cash on Delivery (COD)</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Pay when your order arrives</div>
                </div>
              </label>
              <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: paymentMethod === 'bank' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                <div>
                  <div style={{ fontWeight: 600 }}>Bank Transfer (NEFT/IMPS)</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Direct bank transfer details will be provided</div>
                </div>
              </label>
            </div>
          </section>

          {/* Delivery Instructions */}
          <section style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Truck color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Delivery Notes</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <textarea 
                className="input" 
                placeholder="Any special instructions for delivery or personalization? (Optional)" 
                rows={3} 
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
              />
            </div>
          </section>

        </div>

        {/* Right: Order Summary Sticky */}
        <div style={{ flex: '1 1 350px', background: 'var(--color-bg-alt)', padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'sticky', top: '5rem' }}>
          <h3 className="h3" style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
          
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {cartItems.map(item => (
              <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{item.qty}x</span> {item.name}
                </div>
                <span style={{ fontWeight: 500 }}>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '1.5rem' }} />
          
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
            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Grand Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatPrice(grandTotal)}</span>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }} 
            onClick={placeOrder}
            disabled={isSubmitting || !selectedAddress}
          >
            {isSubmitting ? 'Processing...' : `Pay ${formatPrice(grandTotal)}`}
          </button>
          
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginTop: '1rem' }}>
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

      </div>
    </div>
  );
}
