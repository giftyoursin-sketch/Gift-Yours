import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, FileText,
  Users, TrendingDown, TrendingUp, BarChart3, Settings, ChevronLeft, ChevronRight,
  LineChart, ShoppingCart, Tag, IndianRupee, Search, Heart, FileBarChart,
  SlidersHorizontal, Briefcase,
} from 'lucide-react';
import { useApp } from '../../app/AppContext';

const getBasePath = () =>
  window.location.hostname.includes('e-commerce') ? '/business' : '';

const basePath = getBasePath();

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    key: 'business',
    label: 'Business Management',
    icon: Briefcase,
    alwaysOpen: true,
    // Matches any route that is NOT /analytics
    matchPaths: [`${basePath}/`, `${basePath}/reports`, `${basePath}/invoices`, `${basePath}/expenses`, `${basePath}/settings`],
    items: [
      { to: `${basePath}/`,        icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { to: `${basePath}/reports`, icon: BarChart3,       label: 'Reports'   },
      { to: `${basePath}/invoices`,icon: FileText,        label: 'Invoices'  },
      { to: `${basePath}/expenses`,icon: TrendingDown,    label: 'Expenses'  },
      { to: `${basePath}/settings`,icon: Settings,        label: 'Settings'  },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    icon: Package,
    matchPaths: [`${basePath}/products`, `${basePath}/inventory`],
    items: [
      { to: `${basePath}/products`,  icon: Package, label: 'Products'  },
      { to: `${basePath}/inventory`, icon: Layers,  label: 'Inventory' },
    ],
  },
  {
    key: 'analytics',
    label: 'E-commerce Analytics',
    icon: LineChart,
    matchPaths: ['analytics'], // substring match
    items: [
      { to: `${basePath}/analytics`,          icon: LineChart,       label: 'Overview',          exact: true },
      { to: `${basePath}/analytics/sales`,    icon: TrendingUp,      label: 'Sales Analytics'    },
      { to: `${basePath}/analytics/orders`,   icon: ShoppingCart,    label: 'Orders'             },
      { to: `${basePath}/analytics/customers`,icon: Users,           label: 'Customers'          },
      { to: `${basePath}/analytics/products`, icon: Package,         label: 'Products'           },
      { to: `${basePath}/analytics/categories`,icon: Tag,            label: 'Categories'         },
      { to: `${basePath}/analytics/funnel`,   icon: BarChart3,       label: 'Conversion Funnel'  },
      { to: `${basePath}/analytics/revenue`,  icon: IndianRupee,     label: 'Revenue'            },
      { to: `${basePath}/analytics/search`,   icon: Search,          label: 'Search Analytics'   },
      { to: `${basePath}/analytics/wishlist`, icon: Heart,           label: 'Wishlist Analytics' },
      { to: `${basePath}/analytics/reports`,  icon: FileBarChart,    label: 'Reports'            },
      { to: `${basePath}/analytics/settings`, icon: SlidersHorizontal, label: 'Settings'         },
    ],
  },
];

// ─── Chevron SVG ──────────────────────────────────────────────────────────────
function Chevron({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13" height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Reusable accordion (expanded sidebar) ────────────────────────────────────
function NavAccordion({ group, sidebarCollapsed }) {
  const location = useLocation();

  const isGroupActive = group.matchPaths.some(p =>
    p === 'analytics'
      ? location.pathname.includes('/analytics')
      : location.pathname === p || location.pathname.startsWith(p + '/')
  );

  const [open, setOpen] = useState(group.alwaysOpen ? true : isGroupActive);
  const contentRef = useRef(null);
  const [contentH, setContentH] = useState(0);

  // Re-measure whenever content or sidebar state changes
  useLayoutEffect(() => {
    if (contentRef.current) setContentH(contentRef.current.scrollHeight);
  });

  // Auto-expand when active route matches this group
  useEffect(() => {
    if (isGroupActive) setOpen(true);
  }, [location.pathname]);

  const GroupIcon = group.icon;

  // ── Collapsed sidebar — icon-only strip ──────────────────────────────────
  if (sidebarCollapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {group.items.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={!!exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--primary-alpha-10)' : 'transparent',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            })}
            className={({ isActive }) => isActive ? '' : 'hover-bg-surface-2'}
            title={label}
          >
            {({ isActive }) => (
              <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
            )}
          </NavLink>
        ))}
      </div>
    );
  }

  // ── Expanded sidebar — accordion ─────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>

      {/* Accordion trigger */}
      <button
        onClick={() => !group.alwaysOpen && setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.4rem 0.75rem',
          borderRadius: 'var(--radius)',
          background: isGroupActive && open ? 'var(--primary-alpha-10)' : 'transparent',
          border: 'none',
          cursor: group.alwaysOpen ? 'default' : 'pointer',
          color: isGroupActive ? 'var(--primary)' : 'var(--text-muted)',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          transition: 'color 0.15s ease, background 0.15s ease',
          lineHeight: 1,
          overflow: 'hidden',
        }}
        className={group.alwaysOpen ? '' : 'hover-bg-surface-2'}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          whiteSpace: 'nowrap', overflow: 'hidden', minWidth: 0,
        }}>
          <GroupIcon size={13} style={{ flexShrink: 0 }} />
          {group.label}
        </span>
        {!group.alwaysOpen && <Chevron open={open} />}
      </button>

      {/* Animated submenu */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? `${contentH}px` : '0px',
          transition: 'max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.1rem',
            paddingLeft: '0.625rem',
            marginLeft: '0.5rem',
            borderLeft: '1.5px solid var(--surface-border)',
          }}
        >
          {group.items.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={!!exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.625rem',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-alpha-10)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                marginLeft: '-1.5px',
              })}
              className={({ isActive }) => isActive ? '' : 'hover-bg-surface-2'}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={14}
                    style={{ flexShrink: 0, color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
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
          width: collapsed ? 38 : 120,
          height: collapsed ? 38 : 44,
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <img
            src={isDark ? '/logo-white.png' : '/logo.png'}
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: '0.875rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {NAV_GROUPS.map(group => (
          <NavAccordion
            key={group.key}
            group={group}
            sidebarCollapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
        <button
          onClick={onToggle}
          className="desktop-only hover-bg-surface-2"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            gap: '0.75rem',
            fontWeight: 500,
            fontSize: '0.875rem',
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
