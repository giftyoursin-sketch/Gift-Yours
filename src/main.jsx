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
  
  const isEcommerceVercel = hostname.includes('e-commerce');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isEcommerceVercel) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<EcommerceApp />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // During local development, serve E-commerce at root and Business at /business
  if (isLocalhost) {
    const isBusinessApp = window.location.pathname.startsWith('/business');
    if (isBusinessApp) {
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

  // Otherwise (for gift-yours.vercel.app), serve the Business Management app at the root
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<BusinessApp />} />
      </Routes>
    </BrowserRouter>
  )
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
