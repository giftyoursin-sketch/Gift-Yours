import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useEcom } from '../../app/EcomContext';
import { toSlug } from '@shared/utils/imageUtils';

export default function Footer() {
  const { settings, categories } = useEcom();
  const brandName = settings?.businessName || 'Gift Yours';
  const phone = settings?.phone || '+91 98765 43210';
  const email = settings?.email || 'giftyours.in@gmail.com';

  return (
    <footer style={{
      backgroundColor: 'var(--bg-alt)',
      borderTop: '1px solid var(--surface-border)',
      paddingTop: '3rem',
      paddingBottom: '1rem',
      marginTop: '4rem',
      position: 'relative',
      overflow: 'hidden'
    }} className="footer-wrapper">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid-cols-4 footer-grid" style={{ marginBottom: '3rem' }}>
          {/* Brand Info */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textDecoration: 'none' }} className="footer-logo-link">
              <img src="/logo.png" alt={brandName} style={{ height: '36px', objectFit: 'contain' }} className="footer-logo" />
            </Link>
            <p className="footer-brand-text" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem', maxWidth: '280px' }}>
              Premium personalized gifts and frames for your loved ones. Make every moment special with {brandName}.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--primary)' }}>
              <span className="footer-heading" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Follow us on Social Media</span>
              <a 
                href="https://www.instagram.com/gift_yours.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: 'var(--primary)', width: 'max-content', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="desktop-only" style={{ flexDirection: 'column' }}>
            <h4 className="footer-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to={`/products`} style={{ color: 'var(--primary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="desktop-only" style={{ flexDirection: 'column' }}>
            <h4 className="footer-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><Link to="/about" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>About Us</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Contact Us</Link></li>
              <li><Link to="/faq" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>FAQs</Link></li>
              <li><Link to="/shipping" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Shipping Policy</Link></li>
              <li><Link to="/returns" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Returns & Refunds</Link></li>
              <li><Link to="/track" style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Track Order</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="footer-heading" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Get in Touch</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <li className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                <Phone size={16} /> <span>{phone}</span>
              </li>
              <li className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                <Mail size={16} /> <span>{email}</span>
              </li>
              <li className="footer-contact-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.25rem' }} /> 
                <span style={{ lineHeight: '1.5' }}>
                  Salapettai, Near Thirumathi<br />
                  Vijayalakshmi Mahal, Pernambut Taluk,<br />
                  Vellore Dist-635810
                </span>
              </li>
            </ul>
            
            <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="input footer-input" 
                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', flex: 1, minWidth: 0 }}
              />
              <button className="btn btn-primary footer-btn" style={{ padding: '0.625rem 1rem', flexShrink: 0 }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar" style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--surface-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .footer-wrapper {
            padding-top: 2rem !important;
            padding-bottom: calc(4rem + env(safe-area-inset-bottom)) !important; /* padding for bottom nav */
            margin-top: 2rem !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            margin-bottom: 1.5rem !important;
          }
          .footer-logo-link {
            margin-bottom: 1rem !important;
          }
          .footer-logo {
            height: 28px !important;
          }
          .footer-brand-text {
            font-size: 0.8125rem !important;
            margin-bottom: 1rem !important;
            max-width: 100% !important;
          }
          .footer-heading {
            font-size: 0.9375rem !important;
            margin-bottom: 0.75rem !important;
          }
          .footer-contact-item {
            font-size: 0.8125rem !important;
            gap: 0.5rem !important;
          }
          .footer-contact-item svg {
            width: 14px !important;
            height: 14px !important;
          }
          .footer-input {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.8125rem !important;
          }
          .footer-btn {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.8125rem !important;
          }
          .footer-bottom-bar {
            padding-top: 1.5rem !important;
            gap: 1.25rem !important;
          }
          .footer-bottom-bar p {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </footer>
  );
}
