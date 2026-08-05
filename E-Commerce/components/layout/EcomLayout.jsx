import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

// ─── E-commerce Layout Shell ──────────────────────────────────────────────────
// Main layout for the customer-facing website.
// Includes the Header, Footer, and scroll-to-top behavior.
// ──────────────────────────────────────────────────────────────────────────────

import WhatsAppWidget from './WhatsAppWidget';
import { useEcom } from '../../app/EcomContext';

export default function EcomLayout() {
  const { pathname } = useLocation();
  const { loading } = useEcom();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--border-color, #eee)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Storefront...</p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  return (
    <div className="ecom-root" style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}>
      <Header />
      
      <main className="ecom-main" style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
      
      <Footer />
      <BottomNav />
      <WhatsAppWidget />
    </div>
  );
}
