import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../app/CartContext';

const BOTTOM_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/products', icon: Grid, label: 'Shop' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/cart', icon: ShoppingBag, label: 'Cart' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { cartItems } = useCart();
  const location = useLocation();

  return (
    <nav
      className="mobile-only"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
      }}
    >
      {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => {
        // Active check logic
        let isActive = location.pathname === to;
        if (to === '/products' && location.pathname.startsWith('/category')) {
          isActive = true;
        }

        return (
          <NavLink
            key={to}
            to={to}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              gap: '0.25rem', textDecoration: 'none', position: 'relative'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Cart Badge */}
              {to === '/cart' && cartItems?.length > 0 && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--primary)', color: '#fff',
                  width: 16, height: 16, borderRadius: '50%',
                  fontSize: '0.6rem', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: 'translate(25%, -25%)'
                }}>
                  {cartItems.length}
                </div>
              )}
            </div>
            <span style={{ 
              fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, 
              color: isActive ? 'var(--primary)' : 'var(--text-muted)' 
            }}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
