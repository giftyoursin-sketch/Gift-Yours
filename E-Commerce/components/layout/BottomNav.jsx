import React, { useState, useEffect } from 'react';
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
        borderTop: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform'
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
