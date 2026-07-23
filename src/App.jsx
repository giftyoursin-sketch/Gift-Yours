import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

// Pages (lazy loaded)
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import InvoiceBuilder from './pages/Invoices/InvoiceBuilder';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--surface-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceBuilder />} />
            <Route path="invoices/:id/edit" element={<InvoiceBuilder />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
