import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, User, ChevronDown } from 'lucide-react';
import { useEcom } from '../../app/EcomContext';
import { toSlug } from '@shared/utils/imageUtils';
import { useCart } from '../../app/CartContext';
import { useAuth } from '../../app/AuthContext';
import { useWishlist } from '../../app/WishlistContext';
export default function Header() {
  const { settings, categories } = useEcom();
  const { itemTotal } = useCart();
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const { syncing } = useEcom();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);

  const brandName = settings?.businessName || 'Gift Yours';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // Top 4 categories for desktop nav
  const navCategories = categories.slice(0, 4);

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--surface-border)',
        boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition-normal)',
      }}
    >
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem',
        padding: '0 1rem'
      }}>
        {/* Left: Mobile Menu Toggle & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button 
            className="btn-icon desktop-only" 
            style={{ display: 'inline-flex' }} 
            onClick={() => setMobileMenuOpen(true)}
            id="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt={brandName} className="header-logo" />
          </Link>
        </div>

        {/* Mobile Search Bar (Visible only on mobile) */}
        <div className="mobile-only" style={{ flex: 1, padding: '0 0.5rem 0 1rem', display: 'flex', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
             <div className="input-wrapper" style={{ position: 'relative', width: '100%' }}>
               <Search size={14} className="input-icon" style={{ left: '0.75rem', position: 'absolute', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                  type="text" 
                  className="input mobile-search-input" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-alt)', fontSize: '0.875rem', border: '1px solid var(--surface-border)' }}
               />
             </div>
           </form>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-only" id="desktop-nav">
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {navCategories.map(parent => (
              <li 
                key={parent.id}
                style={{ position: 'relative', height: '4rem', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setActiveMegaMenu(parent.id)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link 
                  to={`/category/${parent.slug}`}
                  style={{ 
                    fontSize: '0.9375rem', 
                    fontWeight: 500, 
                    color: activeMegaMenu === parent.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {parent.name}
                  <ChevronDown size={14} style={{ marginTop: '2px', transition: 'transform 0.2s', transform: activeMegaMenu === parent.id ? 'rotate(180deg)' : 'rotate(0)' }} />
                </Link>

                {/* Mega Menu Dropdown */}
                {activeMegaMenu === parent.id && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    border: '1px solid var(--surface-border)',
                    borderTop: 'none',
                    padding: '1.25rem',
                    minWidth: '220px',
                    zIndex: 100
                  }}>
                    {parent.children && parent.children.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {parent.children.map(child => (
                          <li key={child.id}>
                            <Link 
                              to={`/category/${child.slug}`}
                              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'block' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                              onClick={() => setActiveMegaMenu(null)}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
                        No subcategories yet.<br/>
                        <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Assign "Parent Category" in Business Management.</span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Search & Icons (Desktop) */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: '0.5rem' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative' }} id="desktop-search">
            <div className="input-wrapper" style={{ width: '240px' }}>
              <Search size={16} className="input-icon" />
              <input 
                type="text" 
                className="input has-icon" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(e.target.value.length > 1); }}
                onFocus={() => { if(searchQuery.length > 1) setShowSearchResults(true); }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-alt)' }}
              />
            </div>
            {/* Instant Search Dropdown Mock */}
            {showSearchResults && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', boxShadow: 'var(--shadow-lg)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Press Enter to search for "{searchQuery}"</p>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem' }} onClick={handleSearch}>View all results</button>
              </div>
            )}
          </form>

          {syncing && (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: 'var(--color-primary-alpha-10, rgba(234,88,12,0.1))', color: 'var(--color-primary, #EA580C)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              <div style={{ width: 12, height: 12, border: '2px solid rgba(234,88,12,0.2)', borderTop: '2px solid var(--color-primary, #EA580C)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <span>Syncing...</span>
            </div>
          )}

          <Link to="/wishlist" className="btn-icon" title="Wishlist" style={{ position: 'relative' }}>
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--color-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to={user ? "/profile" : "/login"} className="btn-icon" title="Account">
            <User size={20} />
          </Link>
          <Link to="/cart" className="btn-icon" title="Cart" style={{ position: 'relative' }}>
            <ShoppingBag size={20} />
            {itemTotal > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--color-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemTotal}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '80%', maxWidth: '320px',
            background: 'var(--color-bg)', padding: '1.5rem', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)' }}>Menu</span>
              <button className="btn-icon" onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            
            <Link to="/products" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
            <Link to={user ? "/profile" : "/login"} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setMobileMenuOpen(false)}>
              {user ? "My Account" : "Sign In"}
            </Link>
            <Link to="/orders" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setMobileMenuOpen(false)}>
              My Orders
            </Link>
            
            <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
              <div className="input-wrapper">
                <Search size={16} className="input-icon" />
                <input 
                  type="text" 
                  className="input has-icon" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Categories</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categories.map(parent => (
                <li key={parent.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link 
                    to={`/category/${parent.slug}`}
                    style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-main)', textDecoration: 'none' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {parent.name}
                  </Link>
                  {parent.children && parent.children.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--surface-border)' }}>
                      {parent.children.map(child => (
                        <Link 
                          key={child.id}
                          to={`/category/${child.slug}`}
                          style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <Link 
                  to="/products"
                  style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      <style>{`
        .header-logo {
          height: 36px;
          object-fit: contain;
        }
        
        @media (max-width: 768px) {
          .header-logo {
            height: 28px;
          }
        }
        
        @media (min-width: 768px) {
          #mobile-menu-btn { display: none !important; }
          #mobile-search-btn { display: none !important; }
          #desktop-nav { display: block !important; }
          #desktop-search { display: block !important; }
        }
      `}</style>
    </header>
  );
}
