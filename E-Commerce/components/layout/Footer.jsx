import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useEcom } from '../../app/EcomContext';
import { toSlug } from '@shared/utils/imageUtils';

export default function Footer() {
  const { settings, categories } = useEcom();
  const brandName = settings?.businessName || 'Gift Yours';
  const phone = settings?.phone || '+91 98765 43210';
  const email = settings?.email || 'hello@giftyours.com';

  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-alt)',
      borderTop: '1px solid var(--color-border)',
      paddingTop: 'var(--space-2xl)',
      paddingBottom: 'var(--space-md)',
      marginTop: 'var(--space-3xl)'
    }}>
      <div className="container">
        <div className="grid-cols-4" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Brand Info */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textDecoration: 'none' }}>
              <img src="/logo.png" alt={brandName} style={{ height: '36px', objectFit: 'contain' }} />
            </Link>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', maxWidth: '280px' }}>
              Premium personalized gifts and frames for your loved ones. Make every moment special with {brandName}.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-primary)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Follow us on Social Media</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="desktop-only" style={{ flexDirection: 'column' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.slice(0, 5).map(cat => (
                <li key={cat}>
                  <Link to={`/category/${toSlug(cat)}`} style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={`/products`} style={{ color: 'var(--color-primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="desktop-only" style={{ flexDirection: 'column' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/about" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>About Us</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Contact Us</Link></li>
              <li><Link to="/faq" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>FAQs</Link></li>
              <li><Link to="/shipping" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Shipping Policy</Link></li>
              <li><Link to="/returns" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Returns & Refunds</Link></li>
              <li><Link to="/track" style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Get in Touch</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                <Phone size={16} /> <span>{phone}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                <Mail size={16} /> <span>{email}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.25rem' }} /> 
                <span>123 Gift Street, Design District, 400001</span>
              </li>
            </ul>
            
            <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="input" 
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
              />
              <button className="btn btn-primary" style={{ padding: '0.625rem 1rem' }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 'var(--space-md)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/privacy" style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
