import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, ShoppingCart, FileText,
  Users, TrendingDown, BarChart3, Settings, Gift, ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/inventory', icon: Layers, label: 'Inventory' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: 'var(--topbar-height)',
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: '10px',
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
        }}>
          <Gift size={20} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>Gift Yours</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6875rem', fontWeight: 500 }}>Business Manager</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.75rem' : '0.625rem 0.875rem',
              borderRadius: '10px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
              whiteSpace: 'nowrap',
              position: 'relative',
            })}
            title={collapsed ? label : ''}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 20, background: '#EF4444',
                    borderRadius: '0 2px 2px 0',
                  }} />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '0.75rem 0.625rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={onToggle}
          className="desktop-only"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '0.5rem', borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
