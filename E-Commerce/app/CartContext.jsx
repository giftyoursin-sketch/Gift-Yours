import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discountValue, type }
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('giftyours_cart');
      if (savedCart) setCartItems(JSON.parse(savedCart));
      
      const savedCoupon = localStorage.getItem('giftyours_coupon');
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error('Failed to load cart from local storage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('giftyours_cart', JSON.stringify(cartItems));
      if (coupon) {
        localStorage.setItem('giftyours_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('giftyours_coupon');
      }
    }
  }, [cartItems, coupon, isLoaded]);

  // Actions
  const addToCart = (product, quantity = 1, variant = null) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.variant === variant);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += quantity;
        return updated;
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        originalPrice: product.originalPrice,
        category: product.category,
        qty: quantity,
        variant 
      }];
    });
  };

  const removeFromCart = (productId, variant = null) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.variant === variant)));
  };

  const updateQuantity = (productId, qty, variant = null) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.variant === variant) {
        return { ...item, qty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = (couponObj) => {
    setCoupon(couponObj);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const metrics = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const itemTotal = cartItems.reduce((acc, item) => acc + item.qty, 0);
    
    let discount = 0;
    if (coupon) {
      if (coupon.discount_type === 'percentage') {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
      } else {
        discount = coupon.discount_value;
      }
    }

    const shippingFee = subtotal > 0 && subtotal < 999 ? 50 : 0; // Free shipping over ₹999
    const grandTotal = Math.max(0, subtotal - discount) + shippingFee;

    return {
      subtotal,
      discount,
      shippingFee,
      grandTotal,
      itemTotal
    };
  }, [cartItems, coupon]);

  return (
    <CartContext.Provider value={{
      cartItems,
      coupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      ...metrics
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
