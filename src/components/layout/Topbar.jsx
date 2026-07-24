import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Plus, FileText, Package, TrendingDown, LogOut, Settings, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocation, Link } from 'react-router-dom';

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

  const [profileOpen, setProfileOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  
  const profileRef = useRef(null);
  const actionsRef = useRef(null);

  const toggleTheme = () => saveSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--surface-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', gap: '1rem',
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {/* Mobile menu toggle */}
        <button
          className="mobile-only btn btn-ghost btn-icon"
          onClick={onMenuToggle}
          style={{ marginLeft: '-0.5rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 14, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: 'var(--text-primary)', borderRadius: 2 }} />
          </div>
        </button>

        <h1 className="desktop-only" style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap' }}>
          {title}
        </h1>

        {/* Global Search */}
        <div className="search-bar desktop-only" style={{ maxWidth: '400px', marginLeft: '1rem', flex: 1 }}>
          <Search size={16} color="var(--text-muted)" />
          <input type="text" placeholder="Search invoices, products, or customers..." />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        
        {/* Quick Actions Dropdown (Mobile) or Inline (Desktop) */}
        <div className="desktop-only" style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
          <Link to="/invoices/new" className="btn btn-secondary btn-sm" title="New Invoice">
            <FileText size={14} /> <span style={{ fontSize: '0.75rem' }}>Invoice</span>
          </Link>
          <Link to="/products" className="btn btn-secondary btn-sm" title="Add Product">
            <Package size={14} /> <span style={{ fontSize: '0.75rem' }}>Product</span>
          </Link>
          <Link to="/expenses" className="btn btn-secondary btn-sm" title="Add Expense">
            <TrendingDown size={14} /> <span style={{ fontSize: '0.75rem' }}>Expense</span>
          </Link>
        </div>

        <div className="mobile-only dropdown" ref={actionsRef}>
          <button className="btn btn-primary btn-icon-sm" onClick={() => setActionsOpen(!actionsOpen)}>
            <Plus size={18} />
          </button>
          {actionsOpen && (
            <div className="dropdown-menu">
              <Link to="/invoices/new" className="dropdown-item" onClick={() => setActionsOpen(false)}>
                <FileText size={14} /> New Invoice
              </Link>
              <Link to="/products" className="dropdown-item" onClick={() => setActionsOpen(false)}>
                <Package size={14} /> Add Product
              </Link>
              <Link to="/expenses" className="dropdown-item" onClick={() => setActionsOpen(false)}>
                <TrendingDown size={14} /> Add Expense
              </Link>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--surface-border)', margin: '0 0.5rem' }} className="desktop-only" />

        {/* Theme toggle */}
        <button className="btn btn-ghost btn-icon-sm" onClick={toggleTheme} title="Toggle theme">
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon-sm" title="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--surface)',
            }} />
          )}
        </button>

        <div className="dropdown" ref={profileRef} style={{ marginLeft: '0.25rem' }}>
          <div 
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-full)',
              background: 'var(--primary-alpha-10)', border: '1px solid var(--primary-alpha-30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'var(--transition)', overflow: 'hidden'
            }}
            onClick={() => setProfileOpen(!profileOpen)}
            className="hover-scale"
          >
            <img src="/favicon.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
          </div>

          {profileOpen && (
            <div className="dropdown-menu" style={{ width: '220px', padding: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '0.25rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{settings.businessName || 'Gift Yours'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{settings.businessEmail || 'admin@giftyours.com'}</div>
              </div>
              
              <Link to="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                <Settings size={16} /> Preferences
              </Link>
              
              <div style={{ height: '1px', background: 'var(--surface-border)', margin: '0.25rem 0' }} />
              
              <div className="dropdown-item danger" onClick={() => setProfileOpen(false)}>
                <LogOut size={16} /> Log out
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
