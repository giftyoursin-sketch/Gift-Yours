import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import AppLayout from '../components/layout/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import InvoiceBuilder from './pages/Invoices/InvoiceBuilder';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function BusinessApp() {
  return (
    <AppProvider>
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
          <Route path="*" element={<Navigate to="/business" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
