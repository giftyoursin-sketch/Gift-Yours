import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BusinessApp from '@business/app/App'
import EcommerceApp from '@ecommerce/app/App'
import '@business/styles/index.css'

// ─── Root Router ─────────────────────────────────────────────────────────────
// During development, a single Vite dev server serves both apps:
//   /business/*  →  Business Management System
//   /*           →  Customer E-commerce Website (coming soon)
//
// In production, each app will be deployed independently on Vercel:
//   business.giftyours.com  →  Business App
//   giftyours.com           →  E-commerce App
// ──────────────────────────────────────────────────────────────────────────────

function RootApp() {
  const hostname = window.location.hostname;
  const isEcommerceDomain = hostname.includes('e-commerce') || hostname === 'giftyours.com';
  const isBusinessDomain = hostname.includes('gift-yoursvercelapp') || hostname === 'business.giftyours.com';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // 1. If we are on the explicit Business domain, serve Business Manager at root
  if (isBusinessDomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<BusinessApp />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 2. If we are on the explicit E-commerce domain, serve E-Commerce at root
  if (isEcommerceDomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<EcommerceApp />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 3. For localhost (or fallback), path-based routing
  const isBusinessPath = window.location.pathname.startsWith('/business');
  
  if (isBusinessPath) {
    return (
      <BrowserRouter basename="/business">
        <Routes>
          <Route path="/*" element={<BusinessApp />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<EcommerceApp />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)

// Prevent mouse wheel from changing values in number inputs
document.addEventListener('wheel', (e) => {
  if (document.activeElement.type === 'number') {
    document.activeElement.blur();
  }
}, { passive: false });
