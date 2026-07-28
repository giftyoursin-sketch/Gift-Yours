import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// ─── E-commerce Layout Shell ──────────────────────────────────────────────────
// Main layout for the customer-facing website.
// Includes the Header, Footer, and scroll-to-top behavior.
// ──────────────────────────────────────────────────────────────────────────────

export default function EcomLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="ecom-root">
      <Header />
      
      <main className="ecom-main" style={{ paddingTop: '4rem' }}>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
