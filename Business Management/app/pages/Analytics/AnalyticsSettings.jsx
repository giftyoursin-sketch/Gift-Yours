import React from 'react';
import { Settings, Globe, BarChart2, ShoppingBag, CreditCard } from 'lucide-react';

const INTEGRATIONS = [
  {
    category: 'Analytics & Tracking',
    color: '#3B82F6',
    items: [
      { name: 'Google Analytics 4', description: 'Track visitors, sessions, events, and conversions', status: 'Not Connected', icon: '📊' },
      { name: 'Google Tag Manager', description: 'Centralized tag management for all tracking pixels', status: 'Not Connected', icon: '🏷️' },
      { name: 'Meta Pixel (Facebook)', description: 'Track Facebook/Instagram ad conversions', status: 'Not Connected', icon: '📘' },
      { name: 'Hotjar', description: 'Heatmaps, session recordings, and user behavior analytics', status: 'Not Connected', icon: '🔥' },
    ]
  },
  {
    category: 'Payment Gateways',
    color: '#10B981',
    items: [
      { name: 'Razorpay', description: 'Accept UPI, cards, net banking, and EMI payments', status: 'Planned', icon: '💳' },
      { name: 'PhonePe Business', description: 'UPI-first payment collection for Indian businesses', status: 'Planned', icon: '📱' },
      { name: 'Stripe', description: 'International card payments and subscriptions', status: 'Planned', icon: '💳' },
    ]
  },
  {
    category: 'Marketing & Ads',
    color: '#F59E0B',
    items: [
      { name: 'Google Ads', description: 'Track Google Ads conversions and ROI', status: 'Not Connected', icon: '🎯' },
      { name: 'Facebook Ads', description: 'Connect ad spend to e-commerce revenue', status: 'Not Connected', icon: '📣' },
      { name: 'Instagram Shopping', description: 'Tag products directly in Instagram posts', status: 'Not Connected', icon: '📸' },
    ]
  },
];

const STATUS_COLORS = {
  'Not Connected': { bg: '#F3F4F6', color: '#6B7280' },
  'Connected': { bg: '#D1FAE5', color: '#059669' },
  'Planned': { bg: '#EDE9FE', color: '#7C3AED' },
};

export default function AnalyticsSettings() {
  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Analytics Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage integrations and data connections</p>
      </div>

      <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0 }}>🚀</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Future-Ready Architecture</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>The analytics module is designed to plug in real tracking and payment integrations without redesigning your dashboard. Simply connect your API keys when you're ready.</div>
        </div>
      </div>

      {INTEGRATIONS.map(group => (
        <div key={group.category} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: group.color }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{group.category}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {group.items.map((item, i) => {
              const sc = STATUS_COLORS[item.status] || STATUS_COLORS['Not Connected'];
              return (
                <div key={item.name} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: i < group.items.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, background: sc.bg, color: sc.color, fontSize: '0.75rem', fontWeight: 600 }}>{item.status}</span>
                    <button disabled style={{ padding: '0.4rem 0.875rem', background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', cursor: 'not-allowed', fontSize: '0.8125rem', fontWeight: 500 }}>
                      Connect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
