import React, { Suspense, lazy } from 'react';
import '../styles/index.css';
import './ecom.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import EcomLayout from '../components/layout/EcomLayout';
import { EcomProvider } from './EcomContext';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';

// ─── Code Splitting (Lazy Loading) ─────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));

// Loading Fallback
const PageLoader = () => (
  <div className="container section flex-center" style={{ minHeight: '60vh' }}>
    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
  </div>
);

export default function EcommerceApp() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <EcomProvider>
          <WishlistProvider>
            <CartProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<EcomLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="category/:slug" element={<ProductList />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="search" element={<ProductList />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="login" element={<Login />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:id" element={<OrderDetails />} />
                    
                    {/* Phase 4 New Routes */}
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="about" element={<About />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="faq" element={<FAQ />} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </Suspense>
            </CartProvider>
          </WishlistProvider>
        </EcomProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
