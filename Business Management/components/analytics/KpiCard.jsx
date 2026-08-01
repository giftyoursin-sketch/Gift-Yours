import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ title, value, icon: Icon, trend, trendValue, color = 'primary', subtitle, loading }) {
  const colors = {
    primary: { bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', light: 'rgba(239,68,68,0.12)', icon: '#EF4444' },
    success: { bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', light: 'rgba(16,185,129,0.12)', icon: '#10B981' },
    warning: { bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', light: 'rgba(245,158,11,0.12)', icon: '#F59E0B' },
    info: { bg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', light: 'rgba(59,130,246,0.12)', icon: '#3B82F6' },
    purple: { bg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', light: 'rgba(139,92,246,0.12)', icon: '#8B5CF6' },
    orange: { bg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', light: 'rgba(249,115,22,0.12)', icon: '#F97316' },
  };
  const c = colors[color] || colors.primary;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--error)' : 'var(--text-muted)';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      transition: 'all 0.2s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c.bg, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          {loading ? (
            <div style={{ height: '2rem', width: '60%', background: 'var(--surface-3)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
          ) : (
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {value}
            </span>
          )}
          {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          background: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && <Icon size={20} style={{ color: c.icon }} />}
        </div>
      </div>

      {trendValue !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <TrendIcon size={14} style={{ color: trendColor }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: trendColor }}>{trendValue}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vs last period</span>
        </div>
      )}
    </div>
  );
}
