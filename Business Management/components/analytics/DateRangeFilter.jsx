import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'This Year', value: 'this_year' },
];

export function getDateRange(preset) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today': return { from: today, to: now };
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { from: y, to: today };
    }
    case '7d': { const d = new Date(today); d.setDate(d.getDate() - 7); return { from: d, to: now }; }
    case '30d': { const d = new Date(today); d.setDate(d.getDate() - 30); return { from: d, to: now }; }
    case '90d': { const d = new Date(today); d.setDate(d.getDate() - 90); return { from: d, to: now }; }
    case 'this_month': { const d = new Date(now.getFullYear(), now.getMonth(), 1); return { from: d, to: now }; }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: start, to: end };
    }
    case 'this_year': { const d = new Date(now.getFullYear(), 0, 1); return { from: d, to: now }; }
    default: { const d = new Date(today); d.setDate(d.getDate() - 30); return { from: d, to: now }; }
  }
}

export default function DateRangeFilter({ value = '30d', onChange }) {
  const [open, setOpen] = useState(false);
  const selected = PRESETS.find(p => p.value === value) || PRESETS[3];

  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 0.875rem', background: 'var(--surface)',
          border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)',
          color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
          transition: 'all 0.15s ease',
        }}
      >
        <Calendar size={15} style={{ color: 'var(--text-muted)' }} />
        {selected.label}
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 180,
            background: 'var(--surface)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden', padding: '0.5rem',
          }}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { onChange(p.value); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.5rem 0.75rem', background: value === p.value ? 'var(--primary-alpha-10)' : 'transparent',
                  color: value === p.value ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: value === p.value ? 600 : 400,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { if (value !== p.value) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (value !== p.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
