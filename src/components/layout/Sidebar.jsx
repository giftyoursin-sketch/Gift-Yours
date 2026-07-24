import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, FileText,
  Users, TrendingDown, TrendingUp, BarChart3, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/reports', icon: BarChart3, label: 'Reports' },
    ]
  },
  {
    label: 'Management',
    items: [
      { to: '/invoices', icon: FileText, label: 'Invoices' },
      { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
    ]
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/inventory', icon: Layers, label: 'Inventory' },
    ]
  },
  {
    label: 'Preferences',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  }
];

export default function Sidebar({ collapsed, onToggle }) {
  const { settings } = useApp();
  const isDark = settings?.theme === 'dark';

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : '240px',
        minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--surface-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
        borderBottom: '1px solid var(--surface-border)',
        minHeight: 'var(--topbar-height)',
      }}>
        <div style={{
          width: collapsed ? 38 : 120, height: collapsed ? 38 : 44, borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden'
        }}>
          <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {!collapsed && (
              <div style={{ padding: '0 0.75rem', marginBottom: '0.25rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {group.label}
              </div>
            )}
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.5rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-alpha-10)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                })}
                className={(navData) => navData.isActive ? '' : 'hover-bg-surface-2'}
                title={collapsed ? label : ''}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                    {!collapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
        <button
          onClick={onToggle}
          className="desktop-only hover-bg-surface-2"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', color: 'var(--text-secondary)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease', gap: '0.75rem', fontWeight: 500, fontSize: '0.875rem'
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
