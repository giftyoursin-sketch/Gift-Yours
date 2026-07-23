import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Layers, MoreHorizontal } from 'lucide-react';

const BOTTOM_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/inventory', icon: Layers, label: 'Inventory' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center',
        padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(30,27,75,0.08)',
      }}
    >
      {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'rgba(30,27,75,0.08)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
