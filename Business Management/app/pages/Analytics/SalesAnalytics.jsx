import React, { useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';
import KpiCard from '@business/components/analytics/KpiCard';
import { IndianRupee, TrendingUp, ShoppingCart, BarChart2, RefreshCw } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  );
}

const TAB_VIEWS = ['Daily', 'Weekly', 'Monthly'];

export default function SalesAnalytics() {
  const [range, setRange] = useState('30d');
  const [activeView, setActiveView] = useState('Daily');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => { fetchOrders(); }, [range]);
  useEffect(() => { buildChart(); }, [orders, activeView]);

  const fetchOrders = async () => {
    setLoading(true);
    const { from } = getDateRange(range);
    const { data } = await supabase.from('orders').select('*').gte('created_at', from.toISOString());
    const safeData = data || [];
    setOrders(safeData);

    const totalRev = safeData.reduce((s, o) => s + (o.grand_total || 0), 0);
    const totalOrders = safeData.length;
    const aov = totalOrders > 0 ? totalRev / totalOrders : 0;
    const profit = totalRev * 0.3; // Estimated 30% margin
    setKpis({ totalRev, totalOrders, aov, profit });
    setLoading(false);
  };

  const buildChart = () => {
    if (activeView === 'Daily') {
      const days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const dayOrders = orders.filter(o => { const od = new Date(o.created_at); od.setHours(0,0,0,0); return od.getTime() === d.getTime(); });
        const revenue = dayOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
        const profit = revenue * 0.3;
        days.push({ label, revenue: Math.round(revenue), profit: Math.round(profit), orders: dayOrders.length });
      }
      setChartData(days);
    } else if (activeView === 'Weekly') {
      const weeks = [];
      for (let i = 11; i >= 0; i--) {
        const wStart = new Date(); wStart.setDate(wStart.getDate() - i * 7); wStart.setHours(0,0,0,0);
        const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 7);
        const label = `W${12 - i}`;
        const weekOrders = orders.filter(o => { const od = new Date(o.created_at); return od >= wStart && od < wEnd; });
        const revenue = weekOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
        weeks.push({ label, revenue: Math.round(revenue), profit: Math.round(revenue * 0.3), orders: weekOrders.length });
      }
      setChartData(weeks);
    } else {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
        const mOrders = orders.filter(o => { const od = new Date(o.created_at); return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear(); });
        const revenue = mOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
        months.push({ label, revenue: Math.round(revenue), profit: Math.round(revenue * 0.3), orders: mOrders.length });
      }
      setChartData(months);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Sales Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Track revenue, profit, and order trends</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Revenue" value={fmtCur(kpis.totalRev)} icon={IndianRupee} color="primary" loading={loading} trendValue="+14%" trend="up" />
        <KpiCard title="Total Profit (Est.)" value={fmtCur(kpis.profit)} icon={TrendingUp} color="success" loading={loading} subtitle="~30% margin" />
        <KpiCard title="Total Orders" value={kpis.totalOrders ?? '—'} icon={ShoppingCart} color="info" loading={loading} />
        <KpiCard title="Avg Order Value" value={fmtCur(kpis.aov)} icon={BarChart2} color="purple" loading={loading} />
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {TAB_VIEWS.map(v => (
          <button key={v} onClick={() => setActiveView(v)} style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--surface-border)', background: activeView === v ? 'var(--primary)' : 'var(--surface)', color: activeView === v ? '#fff' : 'var(--text-secondary)', fontWeight: activeView === v ? 600 : 400, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.15s' }}>
            {v}
          </button>
        ))}
      </div>

      {/* Revenue vs Profit Chart */}
      <Card title={`Revenue vs Profit — ${activeView}`}>
        {loading ? (
          <div style={{ height: 300, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v, n) => [`₹${fmt(v)}`, n === 'revenue' ? 'Revenue' : 'Profit']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={2} fill="url(#revG)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fill="url(#profG)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Orders Chart */}
      <Card title={`Orders — ${activeView}`}>
        {loading ? (
          <div style={{ height: 250, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
