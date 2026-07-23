import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  AlertTriangle, Plus, FileText, RefreshCw, ArrowRight,
  IndianRupee, Layers, Users, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { format, subDays, startOfMonth, eachDayOfInterval } from 'date-fns';

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const QUICK_ACTIONS = [
  { label: 'New Sale', icon: ShoppingCart, to: '/sales', color: 'var(--accent)', bg: 'var(--accent-light)' },
  { label: 'New Invoice', icon: FileText, to: '/invoices/new', color: 'var(--primary)', bg: 'rgba(30,27,75,0.08)' },
  { label: 'Add Product', icon: Package, to: '/products', color: 'var(--success)', bg: 'var(--success-light)' },
  { label: 'Add Expense', icon: TrendingDown, to: '/expenses', color: 'var(--warning)', bg: 'var(--warning-light)' },
];

export default function Dashboard() {
  const { sales, expenses, products, customers, getMetrics } = useApp();
  const metrics = getMetrics();
  const navigate = useNavigate();

  // Build last 14 days chart data
  const chartData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
    return days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayIncome = sales.filter(s => s.date === dateStr).reduce((a, s) => a + (s.total || 0), 0);
      const dayExpense = expenses.filter(e => e.date === dateStr).reduce((a, e) => a + (e.amount || 0), 0);
      return { date: format(d, 'dd MMM'), income: dayIncome, expense: dayExpense, profit: dayIncome - dayExpense };
    });
  }, [sales, expenses]);

  // Top products by sales
  const topProducts = useMemo(() => {
    const map = {};
    sales.forEach(s => {
      (s.items || []).forEach(item => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        map[item.productId].qty += item.qty || 0;
        map[item.productId].revenue += (item.qty || 0) * (item.price || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [sales]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const all = [
      ...sales.slice(-5).map(s => ({ ...s, _type: 'sale', _label: `Sale #${s.id?.slice(-4)}`, _amount: s.total, _color: 'var(--success)' })),
      ...expenses.slice(-5).map(e => ({ ...e, _type: 'expense', _label: e.title || 'Expense', _amount: e.amount, _color: 'var(--error)' })),
    ];
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  }, [sales, expenses]);

  const STATS = [
    { label: "Today's Sales", value: fmt(metrics.todayIncome), icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-light)', sub: `${metrics.todaySalesCount} orders` },
    { label: "Today's Expenses", value: fmt(metrics.todayExpenseTotal), icon: TrendingDown, color: 'var(--error)', bg: 'var(--error-light)', sub: 'Spent today' },
    { label: "Today's Profit", value: fmt(metrics.todayProfit), icon: IndianRupee, color: metrics.todayProfit >= 0 ? 'var(--primary)' : 'var(--error)', bg: 'rgba(30,27,75,0.08)', sub: 'Net today' },
    { label: 'Monthly Revenue', value: fmt(metrics.monthIncome), icon: Receipt, color: 'var(--accent)', bg: 'var(--accent-light)', sub: `${metrics.monthSalesCount} orders` },
    { label: 'Monthly Profit', value: fmt(metrics.monthProfit), icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-light)', sub: 'This month' },
    { label: 'Inventory Value', value: fmt(metrics.totalInventoryValue), icon: Layers, color: 'var(--info)', bg: 'var(--info-light)', sub: `${products.length} products` },
    { label: 'Low Stock', value: metrics.lowStockProducts.length, icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-light)', sub: 'Need restock' },
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'var(--primary)', bg: 'rgba(30,27,75,0.08)', sub: 'Registered' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Good {getGreeting()}, {'\u{1F44B}'}</h2>
          <p className="page-subtitle">{format(new Date(), 'EEEE, d MMMM yyyy')} — Here's your business overview</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {QUICK_ACTIONS.map(({ label, icon: Icon, to, color, bg }) => (
          <Link
            key={to}
            to={to}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.625rem 1.125rem',
              background: 'var(--surface)', border: '1.5px solid var(--surface-border)',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)',
              textDecoration: 'none', transition: 'var(--transition)',
              boxShadow: 'var(--shadow-xs)',
            }}
            className="card-hover"
          >
            <div style={{ width: 28, height: 28, borderRadius: '7px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} color={color} />
            </div>
            {label}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        {STATS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: bg, color }}>
              <Icon size={20} />
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="content-grid grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-title">Revenue vs Expenses</div>
          <div className="chart-subtitle">Last 14 days</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E1B4B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E1B4B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 10, fontSize: 13 }}
                formatter={(v, name) => [fmt(v), name === 'income' ? 'Revenue' : name === 'expense' ? 'Expenses' : 'Profit']}
              />
              <Area type="monotone" dataKey="income" stroke="#1E1B4B" strokeWidth={2.5} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">Stock Alerts</div>
          <div className="chart-subtitle">Products needing attention</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem', overflowY: 'auto' }}>
            {metrics.outOfStockProducts.length === 0 && metrics.lowStockProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '0.875rem' }}>All products in stock!</div>
              </div>
            ) : (
              <>
                {metrics.outOfStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--error-light)', borderRadius: '8px' }}>
                    <AlertTriangle size={14} color="var(--error)" />
                    <div style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <span className="badge badge-error">Out</span>
                  </div>
                ))}
                {metrics.lowStockProducts.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--warning-light)', borderRadius: '8px' }}>
                    <AlertTriangle size={14} color="var(--warning)" />
                    <div style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <span className="badge badge-warning">{p.stock} left</span>
                  </div>
                ))}
              </>
            )}
          </div>
          <Link to="/inventory" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', marginTop: '1rem', textDecoration: 'none' }}>
            View Inventory <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bottom Row: Top Products + Recent Activity */}
      <div className="content-grid grid-2">
        {/* Top Products */}
        <div className="chart-card">
          <div className="chart-title">Top Selling Products</div>
          <div className="chart-subtitle">By revenue, all time</div>
          {topProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📦</div>
              <p>No sales recorded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', background: i === 0 ? 'var(--accent-light)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.qty} sold</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(p.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="chart-card">
          <div className="chart-title">Recent Activity</div>
          <div className="chart-subtitle">Latest transactions</div>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📋</div>
              <p>No activity yet. Start by adding a sale or expense.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: a._type === 'sale' ? 'var(--success-light)' : 'var(--error-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {a._type === 'sale' ? <TrendingUp size={14} color="var(--success)" /> : <TrendingDown size={14} color="var(--error)" />}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a._label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.date}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: a._color }}>
                    {a._type === 'sale' ? '+' : '-'}{fmt(a._amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
