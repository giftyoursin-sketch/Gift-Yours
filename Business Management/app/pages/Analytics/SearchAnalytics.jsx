import React from 'react';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';

const TRENDING = [
  { keyword: 'photo frame', searches: 248, conversion: '12%', trend: '+18%' },
  { keyword: 'custom mug', searches: 192, conversion: '9%', trend: '+24%' },
  { keyword: 'visiting card', searches: 164, conversion: '14%', trend: '+8%' },
  { keyword: 'birthday gift', searches: 156, conversion: '11%', trend: '+31%' },
  { keyword: 'photo album', searches: 132, conversion: '7%', trend: '+15%' },
  { keyword: 'wall art', searches: 98, conversion: '6%', trend: '+42%' },
  { keyword: 'personalized gift', searches: 88, conversion: '13%', trend: '+19%' },
  { keyword: 'couple frame', searches: 76, conversion: '10%', trend: '+28%' },
];

const NO_RESULTS = [
  { keyword: 'digital frame', searches: 42 },
  { keyword: 'keychain engraving', searches: 38 },
  { keyword: 'canvas print', searches: 29 },
  { keyword: 'gift hamper', searches: 22 },
  { keyword: 'photo pillow', searches: 18 },
];

export default function SearchAnalytics() {
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Search Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>What your customers are searching for</p>
      </div>

      <div style={{ padding: '1rem 1.25rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>Sample Data — Architecture Ready</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>Real search data will be captured automatically when customers use the search bar in your store. The data below is representative. Connect Google Analytics for complete search tracking.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Trending Searches */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Trending Searches</h3>
          </div>
          <div style={{ padding: '1rem 0' }}>
            {TRENDING.map((item, i) => (
              <div key={item.keyword} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', borderBottom: i < TRENDING.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                <span style={{ width: 24, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>#{i + 1}</span>
                <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{item.keyword}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', flexShrink: 0 }}>{item.searches} searches</span>
                <span style={{ padding: '0.15rem 0.5rem', background: '#D1FAE5', color: '#059669', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>{item.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* No Result Searches */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No-Result Searches</h3>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {NO_RESULTS.map(item => (
                <div key={item.keyword} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.5rem' }}>
                  <AlertCircle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{item.keyword}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{item.searches}x</span>
                  <span style={{ padding: '0.15rem 0.5rem', background: '#FEF3C7', color: '#D97706', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>Add Product</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Stats */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Total Searches', value: '1,234', color: 'var(--text-primary)' },
              { label: 'Unique Keywords', value: '342', color: 'var(--primary)' },
              { label: 'Search to Buy', value: '11.2%', color: 'var(--success)' },
              { label: 'No Results Rate', value: '8.4%', color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
