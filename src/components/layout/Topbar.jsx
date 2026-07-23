import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/sales': 'Sales',
  '/invoices': 'Invoices',
  '/customers': 'Customers',
  '/expenses': 'Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuToggle }) {
  const { settings, saveSetting, notifications } = useApp();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Gift Yours';
  const unread = notifications.length;

  const toggleTheme = () => saveSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--surface-border)',
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem', gap: '1rem',
      boxShadow: 'var(--shadow-xs)',
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Mobile menu toggle */}
      <button
        className="mobile-only btn btn-ghost btn-icon"
        onClick={onMenuToggle}
        style={{ marginLeft: '-0.25rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 14, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
        </div>
      </button>

      <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Theme toggle */}
        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--surface)',
            }} />
          )}
        </button>

        {/* Business name */}
        <div style={{
          width: 32, height: 32, borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.75rem',
        }}>
          {(settings.businessName || 'GY').slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
