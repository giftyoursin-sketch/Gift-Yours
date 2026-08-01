import React, { useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';
import KpiCard from '@business/components/analytics/KpiCard';
import { IndianRupee, TrendingUp, MapPin, CreditCard } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4'];

export default function Revenue() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { from } = getDateRange(range);
    const { data } = await supabase.from('orders').select('*').gte('created_at', from.toISOString());
    setOrders(data || []);
    setLoading(false);
  };

  // Revenue by Payment Method
  const paymentMap = {};
  orders.forEach(o => {
    const pm = o.payment_method || 'Unknown';
    paymentMap[pm] = (paymentMap[pm] || 0) + (o.grand_total || 0);
  });
  const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ name, value: Math.round(value) }));

  // Revenue by City
  const cityMap = {};
  orders.forEach(o => {
    const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address || '{}') : (o.shipping_address || {});
    const city = addr.city || 'Unknown';
    cityMap[city] = (cityMap[city] || 0) + (o.grand_total || 0);
  });
  const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, revenue: Math.round(value) }));

  // Revenue by Category
  const catMap = {};
  orders.forEach(o => {
    const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
    items.forEach(item => {
      const cat = item.category || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + (item.price || 0) * (item.qty || 1);
    });
  });
  const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, revenue: Math.round(value) }));

  // Revenue by Month (last 6)
  const monthMap = {};
  orders.forEach(o => {
    const d = new Date(o.created_at);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthMap[key] = (monthMap[key] || 0) + (o.grand_total || 0);
  });
  const monthData = Object.entries(monthMap).map(([name, value]) => ({ name, revenue: Math.round(value) }));

  const totalRevenue = orders.reduce((s, o) => s + (o.grand_total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  function ChartCard({ title, children }) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>{title}</h3>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {loading ? <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} /> : children}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Revenue</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Revenue breakdown across all dimensions</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Revenue" value={fmtCur(totalRevenue)} icon={IndianRupee} color="primary" loading={loading} />
        <KpiCard title="Estimated Profit" value={fmtCur(totalRevenue * 0.3)} icon={TrendingUp} color="success" loading={loading} subtitle="~30% margin" />
        <KpiCard title="Avg Order Value" value={fmtCur(avgOrderValue)} icon={CreditCard} color="info" loading={loading} />
        <KpiCard title="Top City" value={cityData[0]?.name || '—'} icon={MapPin} color="purple" loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <ChartCard title="Revenue by Payment Method">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by City">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityData} layout="vertical" margin={{ top: 5, right: 5, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={60} />
              <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
