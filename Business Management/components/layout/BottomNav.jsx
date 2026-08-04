import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, Layers, MoreHorizontal } from 'lucide-react';

const getBasePath = () => {
  return window.location.hostname.includes('e-commerce') ? '/business' : '';
};

const basePath = getBasePath();

const BOTTOM_ITEMS = [
  { to: `${basePath}/`, icon: LayoutDashboard, label: 'Home' },
  { to: `${basePath}/products`, icon: Package, label: 'Products' },
  { to: `${basePath}/invoices`, icon: FileText, label: 'Invoices' },
  { to: `${basePath}/inventory`, icon: Layers, label: 'Inventory' },
  { to: `${basePath}/settings`, icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    
    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }
      setIsVisible(scrollY < lastScrollY || scrollY < 50);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center',
        padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(30,27,75,0.08)',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform'
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
