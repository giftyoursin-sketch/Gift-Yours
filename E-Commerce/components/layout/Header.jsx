import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, User } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

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
      }}>
        {/* Left: Mobile Menu Toggle & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn-icon" 
            style={{ display: 'inline-flex' }} 
            onClick={() => setMobileMenuOpen(true)}
            id="mobile-menu-btn"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <img src="/logo.png" alt={brandName} style={{ height: '36px', objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav style={{ display: 'none' }} id="desktop-nav">
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {navCategories.map(cat => (
              <li key={cat}>
                <Link 
                  to={`/category/${toSlug(cat)}`}
                  style={{ 
                    fontSize: '0.9375rem', 
                    fontWeight: 500, 
                    color: 'var(--color-text-main)',
                    textDecoration: 'none',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-main)'}
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Search & Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'none', position: 'relative' }} id="desktop-search">
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

          <Link to="/search" className="btn-icon" id="mobile-search-btn" title="Search">
            <Search size={20} />
          </Link>
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
              {categories.map(cat => (
                <li key={cat}>
                  <Link 
                    to={`/category/${toSlug(cat)}`}
                    style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--color-text-main)', textDecoration: 'none' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
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
