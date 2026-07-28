import React from 'react';
import { Link } from 'react-router-dom';

// ─── Coming Soon Placeholder ──────────────────────────────────────────────────
// This page occupies the / route until the E-commerce Phase 2 is built.
// It shows a minimal branded placeholder and a link to the Business Dashboard.
// ──────────────────────────────────────────────────────────────────────────────

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '24px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2.5rem',
        }}>
          🎁
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          Gift Yours
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 2.5rem',
          maxWidth: 480,
        }}>
          The customer shopping experience is coming soon.
          We're crafting something beautiful for you. 🚀
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem 2rem',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '16px',
        marginBottom: '3rem',
      }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            E-Commerce Website
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff' }}>
            Phase 2 — In Development
          </div>
        </div>
        <div style={{
          padding: '0.375rem 0.875rem',
          background: 'rgba(99,102,241,0.3)',
          border: '1px solid rgba(99,102,241,0.5)',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#c7d2fe',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Coming Soon
        </div>
      </div>

      <Link
        to="/business"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 2rem',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '12px',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
      >
        🏪 Go to Business Dashboard
      </Link>

      <p style={{
        marginTop: '3rem',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.35)',
        fontWeight: 500,
      }}>
        giftyours.com · Phase 1 Architecture Complete
      </p>
    </div>
  );
}
