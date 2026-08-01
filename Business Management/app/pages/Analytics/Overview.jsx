import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@supabaseClient';
import {
  ShoppingCart, IndianRupee, Users, Package, TrendingUp,
  AlertCircle, Eye, Clock, XCircle, Star, Heart, BarChart2,
  ArrowRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import KpiCard from '@business/components/analytics/KpiCard';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';
import { NavLink } from 'react-router-dom';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

const CHART_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

function SectionCard({ title, children, action }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>
        {action}
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  );
}

export default function Overview() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [revenueChart, setRevenueChart] = useState([]);
  const [categoryPie, setCategoryPie] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { from } = getDateRange(range);
    const fromISO = from.toISOString();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

    try {
      // Fetch orders
      const { data: orders } = await supabase.from('orders').select('*').gte('created_at', fromISO).order('created_at', { ascending: false });
      const { data: todayOrders } = await supabase.from('orders').select('*').gte('created_at', todayStart.toISOString());
      const { data: allProducts } = await supabase.from('products').select('id, name, stock, min_stock, selling_price, category');
      const { data: allCustomers } = await supabase.from('customers').select('id, created_at');

      const safeOrders = orders || [];
      const safeTodayOrders = todayOrders || [];
      const safeProducts = allProducts || [];

      // KPIs
      const todayRev = safeTodayOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
      const totalRev = safeOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
      const pendingOrders = safeOrders.filter(o => o.status === 'pending').length;
      const cancelledOrders = safeOrders.filter(o => o.status === 'cancelled').length;
      const outOfStock = safeProducts.filter(p => (p.stock || 0) === 0).length;
      const lowStock = safeProducts.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.min_stock || 5)).length;
      const avgOrderValue = safeOrders.length > 0 ? totalRev / safeOrders.length : 0;
      const conversionRate = 4.8; // Placeholder until visitor tracking is added

      const allItems = safeOrders.flatMap(o => {
        const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
        return items;
      });
      const totalProductsSold = allItems.reduce((s, i) => s + (i.qty || 1), 0);

      setKpis({
        todayOrders: safeTodayOrders.length,
        todayRevenue: todayRev,
        totalRevenue: totalRev,
        totalOrders: safeOrders.length,
        pendingOrders,
        cancelledOrders,
        outOfStock,
        lowStock,
        avgOrderValue,
        conversionRate,
        totalProductsSold,
        totalCustomers: (allCustomers || []).length,
      });

      // Revenue chart by day (last 14 days)
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const dayOrders = safeOrders.filter(o => {
          const od = new Date(o.created_at); od.setHours(0, 0, 0, 0);
          return od.getTime() === d.getTime();
        });
        const revenue = dayOrders.reduce((s, o) => s + (o.grand_total || 0), 0);
        days.push({ date: label, revenue, orders: dayOrders.length });
      }
      setRevenueChart(days);

      // Category pie
      const catMap = {};
      safeOrders.forEach(o => {
        const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
        items.forEach(item => {
          const cat = item.category || 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + ((item.price || 0) * (item.qty || 1));
        });
      });
      setCategoryPie(Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value) })).slice(0, 6));

      // Recent orders
      setRecentOrders(safeOrders.slice(0, 8));

      // Top products
      const prodMap = {};
      safeOrders.forEach(o => {
        const items = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
        items.forEach(item => {
          if (!prodMap[item.name]) prodMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
          prodMap[item.name].qty += (item.qty || 1);
          prodMap[item.name].revenue += (item.price || 0) * (item.qty || 1);
        });
      });
      setTopProducts(Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
      confirmed: { bg: '#DBEAFE', color: '#2563EB', label: 'Confirmed' },
      delivered: { bg: '#D1FAE5', color: '#059669', label: 'Delivered' },
      cancelled: { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
      processing: { bg: '#EDE9FE', color: '#7C3AED', label: 'Processing' },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Analytics Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Your e-commerce performance at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Today's Orders" value={kpis.todayOrders ?? '—'} icon={ShoppingCart} color="primary" loading={loading} trendValue="+12%" trend="up" />
        <KpiCard title="Today's Revenue" value={fmtCur(kpis.todayRevenue)} icon={IndianRupee} color="success" loading={loading} trendValue="+8%" trend="up" />
        <KpiCard title="Total Revenue" value={fmtCur(kpis.totalRevenue)} icon={TrendingUp} color="info" loading={loading} subtitle={`In selected period`} />
        <KpiCard title="Total Orders" value={kpis.totalOrders ?? '—'} icon={ShoppingCart} color="purple" loading={loading} />
        <KpiCard title="Avg Order Value" value={fmtCur(kpis.avgOrderValue)} icon={IndianRupee} color="orange" loading={loading} trendValue="+3%" trend="up" />
        <KpiCard title="Conversion Rate" value={`${kpis.conversionRate ?? '—'}%`} icon={BarChart2} color="success" loading={loading} subtitle="Visitors to buyers" />
        <KpiCard title="Total Customers" value={kpis.totalCustomers ?? '—'} icon={Users} color="info" loading={loading} />
        <KpiCard title="Products Sold" value={fmt(kpis.totalProductsSold)} icon={Package} color="purple" loading={loading} />
        <KpiCard title="Pending Orders" value={kpis.pendingOrders ?? '—'} icon={Clock} color="warning" loading={loading} />
        <KpiCard title="Cancelled Orders" value={kpis.cancelledOrders ?? '—'} icon={XCircle} color="primary" loading={loading} />
        <KpiCard title="Out of Stock" value={kpis.outOfStock ?? '—'} icon={AlertCircle} color="primary" loading={loading} />
        <KpiCard title="Low Stock Items" value={kpis.lowStock ?? '—'} icon={AlertCircle} color="warning" loading={loading} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

        <SectionCard title="Revenue (Last 14 Days)">
          {loading ? (
            <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="#EF4444" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Orders (Last 14 Days)">
          {loading ? (
            <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueChart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Orders']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Revenue by Category">
          {loading ? (
            <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
          ) : categoryPie.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`₹${fmt(v)}`, 'Revenue']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Top Products by Revenue">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height: 36, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : topProducts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No order data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.map((p, i) => {
                const maxRev = topProducts[0].revenue;
                const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                return (
                  <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', flexShrink: 0 }}>{fmtCur(p.revenue)}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 999 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: CHART_COLORS[i % CHART_COLORS.length], transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Recent Orders */}
      <SectionCard title="Recent Orders" action={
        <NavLink to="orders" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          View All <ArrowRight size={14} />
        </NavLink>
      }>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    {[1,2,3,4,5].map(j => <td key={j} style={{ padding: '0.75rem' }}><div style={{ height: 14, background: 'var(--surface-3)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</td></tr>
              ) : (
                recentOrders.map(order => {
                  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address || '{}') : (order.shipping_address || {});
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>{order.id}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-primary)' }}>{addr.full_name || '—'}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{fmtCur(order.grand_total)}</td>
                      <td style={{ padding: '0.75rem' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
