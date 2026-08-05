import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import AppLayout from '../components/layout/AppLayout';

// Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const FrameConfiguration = lazy(() => import('./pages/FrameConfiguration'));
const Customers = lazy(() => import('./pages/Customers'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceBuilder = lazy(() => import('./pages/Invoices/InvoiceBuilder'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// E-commerce Analytics
const AnalyticsOverview = lazy(() => import('./pages/Analytics/Overview'));
const SalesAnalytics = lazy(() => import('./pages/Analytics/SalesAnalytics'));
const AnalyticsOrders = lazy(() => import('./pages/Analytics/Orders'));
const OrderDetail = lazy(() => import('./pages/Analytics/OrderDetail'));
const AnalyticsCustomers = lazy(() => import('./pages/Analytics/Customers'));
const CustomerProfile = lazy(() => import('./pages/Analytics/CustomerProfile'));
const AnalyticsProducts = lazy(() => import('./pages/Analytics/Products'));
const ProductDetail = lazy(() => import('./pages/Analytics/ProductDetail'));
const AnalyticsCategories = lazy(() => import('./pages/Analytics/Categories'));
const ConversionFunnel = lazy(() => import('./pages/Analytics/ConversionFunnel'));
const Revenue = lazy(() => import('./pages/Analytics/Revenue'));
const SearchAnalytics = lazy(() => import('./pages/Analytics/SearchAnalytics'));
const WishlistAnalytics = lazy(() => import('./pages/Analytics/WishlistAnalytics'));
const AnalyticsReports = lazy(() => import('./pages/Analytics/AnalyticsReports'));
const AnalyticsSettings = lazy(() => import('./pages/Analytics/AnalyticsSettings'));

const getBasePath = () => {
  return window.location.hostname.includes('e-commerce') ? '/business' : '';
};

const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
  </div>
);

export default function BusinessApp() {
  const basePath = getBasePath();
  return (
    <AppProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="frame-configuration" element={<FrameConfiguration />} />
            <Route path="customers" element={<Customers />} />
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
            <Route path="analytics/customers/:id" element={<CustomerProfile />} />
            <Route path="analytics/products" element={<AnalyticsProducts />} />
            <Route path="analytics/products/:id" element={<ProductDetail />} />
            <Route path="analytics/categories" element={<AnalyticsCategories />} />
            <Route path="analytics/funnel" element={<ConversionFunnel />} />
            <Route path="analytics/revenue" element={<Revenue />} />
            <Route path="analytics/search" element={<SearchAnalytics />} />
            <Route path="analytics/wishlist" element={<WishlistAnalytics />} />
            <Route path="analytics/reports" element={<AnalyticsReports />} />
            <Route path="analytics/settings" element={<AnalyticsSettings />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AppProvider>
  );
}
