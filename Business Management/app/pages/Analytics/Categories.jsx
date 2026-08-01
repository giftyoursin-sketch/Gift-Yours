import React, { useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';
import KpiCard from '@business/components/analytics/KpiCard';
import { Tag, TrendingUp, ShoppingCart, Star } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

export default function Categories() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [catData, setCatData] = useState([]);

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { from } = getDateRange(range);
    const { data: orders } = await supabase.from('orders').select('*').gte('created_at', from.toISOString());

    const map = {};
    (orders || []).forEach(o => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
      items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!map[cat]) map[cat] = { name: cat, revenue: 0, orders: 0, units: 0 };
        map[cat].revenue += (item.price || 0) * (item.qty || 1);
        map[cat].orders += 1;
        map[cat].units += (item.qty || 1);
      });
    });
    setCatData(Object.values(map).sort((a, b) => b.revenue - a.revenue));
    setLoading(false);
  };

  const total = catData.reduce((s, c) => s + c.revenue, 0);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Category Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Performance breakdown by product category</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Categories" value={catData.length} icon={Tag} color="info" loading={loading} />
        <KpiCard title="Top Category" value={catData[0]?.name || '—'} icon={Star} color="warning" loading={loading} />
        <KpiCard title="Total Revenue" value={fmtCur(total)} icon={TrendingUp} color="success" loading={loading} />
        <KpiCard title="Total Orders" value={catData.reduce((s, c) => s + c.orders, 0)} icon={ShoppingCart} color="primary" loading={loading} />
      </div>

      {/* Bar chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Revenue by Category</h3>
        {loading ? (
          <div style={{ height: 280, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {catData.map((_, i) => (
                  <rect key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Category Performance</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
                {['Rank', 'Category', 'Revenue', 'Orders', 'Units Sold', 'Revenue Share'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    {[1,2,3,4,5,6].map(j => <td key={j} style={{ padding: '0.875rem 1rem' }}><div style={{ height: 14, background: 'var(--surface-3)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}
                  </tr>
                ))
              ) : catData.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No category data yet</td></tr>
              ) : (
                catData.map((cat, i) => {
                  const share = total > 0 ? ((cat.revenue / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={cat.name} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'var(--primary-alpha-10)' : 'var(--surface-3)', color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--success)' }}>{fmtCur(cat.revenue)}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{cat.orders}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>{cat.units}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--surface-3)', borderRadius: 999 }}>
                            <div style={{ width: `${share}%`, height: '100%', borderRadius: 999, background: COLORS[i % COLORS.length] }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
