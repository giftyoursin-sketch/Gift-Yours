import React from 'react';
import { ArrowDown } from 'lucide-react';

const FUNNEL_STEPS = [
  { step: 1, label: 'Visitors', value: '1,000', pct: 100, color: '#3B82F6', description: 'Unique visitors to your store' },
  { step: 2, label: 'Viewed Product', value: '620', pct: 62, color: '#8B5CF6', description: 'Visitors who viewed a product page' },
  { step: 3, label: 'Added to Cart', value: '280', pct: 28, color: '#F59E0B', description: 'Visitors who added a product to cart' },
  { step: 4, label: 'Started Checkout', value: '140', pct: 14, color: '#F97316', description: 'Visitors who started the checkout process' },
  { step: 5, label: 'Placed Order', value: '80', pct: 8, color: '#EF4444', description: 'Visitors who completed an order' },
  { step: 6, label: 'Delivered', value: '72', pct: 7.2, color: '#10B981', description: 'Orders successfully delivered' },
  { step: 7, label: 'Repeat Customer', value: '22', pct: 2.2, color: '#059669', description: 'Customers who placed 2+ orders' },
];

export default function ConversionFunnel() {
  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Conversion Funnel</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track customer journey from visit to repeat purchase</p>
      </div>

      {/* Note */}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius)', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Sample Data</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>Real visitor tracking requires Google Analytics or Meta Pixel integration. The values below are representative examples. The architecture is ready — connect GA4 to see live data.</div>
        </div>
      </div>

      {/* Funnel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {FUNNEL_STEPS.map((step, i) => {
          const dropPct = i > 0 ? (100 - (step.pct / FUNNEL_STEPS[i - 1].pct) * 100).toFixed(1) : null;
          return (
            <React.Fragment key={step.step}>
              {/* Drop indicator */}
              {i > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0' }}>
                  <ArrowDown size={18} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 600 }}>-{dropPct}% drop</span>
                </div>
              )}
              {/* Funnel bar */}
              <div style={{ width: `${Math.max(step.pct, 10)}%`, minWidth: 280, transition: 'width 0.8s ease' }}>
                <div style={{
                  background: step.color, borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', boxShadow: `0 4px 12px ${step.color}33`,
                }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step {step.step}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', marginTop: '0.15rem' }}>{step.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{step.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', lineHeight: 1 }}>{step.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', fontWeight: 600 }}>{step.pct}%</div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Visit → Order Rate', value: '8%', color: '#EF4444' },
          { label: 'Cart Abandonment', value: '71.4%', color: '#F59E0B' },
          { label: 'Checkout Conversion', value: '57.1%', color: '#10B981' },
          { label: 'Repeat Customer Rate', value: '27.5%', color: '#8B5CF6' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Future integrations */}
      <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>🚀 Connect Real Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {['Google Analytics 4', 'Meta Pixel', 'Google Ads', 'Hotjar', 'Mixpanel', 'Amplitude'].map(tool => (
            <div key={tool} style={{ padding: '0.875rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />
              {tool}
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
