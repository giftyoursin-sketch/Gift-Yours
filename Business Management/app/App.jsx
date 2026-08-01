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

// E-commerce Analytics
import AnalyticsOverview from './pages/Analytics/Overview';
import SalesAnalytics from './pages/Analytics/SalesAnalytics';
import AnalyticsOrders from './pages/Analytics/Orders';
import OrderDetail from './pages/Analytics/OrderDetail';
import AnalyticsCustomers from './pages/Analytics/Customers';
import CustomerProfile from './pages/Analytics/CustomerProfile';
import AnalyticsProducts from './pages/Analytics/Products';
import ProductDetail from './pages/Analytics/ProductDetail';
import Categories from './pages/Analytics/Categories';
import ConversionFunnel from './pages/Analytics/ConversionFunnel';
import Revenue from './pages/Analytics/Revenue';
import SearchAnalytics from './pages/Analytics/SearchAnalytics';
import WishlistAnalytics from './pages/Analytics/WishlistAnalytics';
import AnalyticsReports from './pages/Analytics/AnalyticsReports';
import AnalyticsSettings from './pages/Analytics/AnalyticsSettings';

const getBasePath = () => {
  return window.location.hostname.includes('e-commerce') ? '/business' : '';
};

export default function BusinessApp() {
  const basePath = getBasePath();
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

          {/* ─── E-commerce Analytics ─── */}
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="analytics/sales" element={<SalesAnalytics />} />
          <Route path="analytics/orders" element={<AnalyticsOrders />} />
          <Route path="analytics/orders/:id" element={<OrderDetail />} />
          <Route path="analytics/customers" element={<AnalyticsCustomers />} />
          <Route path="analytics/customers/:phone" element={<CustomerProfile />} />
          <Route path="analytics/products" element={<AnalyticsProducts />} />
          <Route path="analytics/products/:id" element={<ProductDetail />} />
          <Route path="analytics/categories" element={<Categories />} />
          <Route path="analytics/funnel" element={<ConversionFunnel />} />
          <Route path="analytics/revenue" element={<Revenue />} />
          <Route path="analytics/search" element={<SearchAnalytics />} />
          <Route path="analytics/wishlist" element={<WishlistAnalytics />} />
          <Route path="analytics/reports" element={<AnalyticsReports />} />
          <Route path="analytics/settings" element={<AnalyticsSettings />} />

          <Route path="*" element={<Navigate to={basePath || '/'} replace />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
