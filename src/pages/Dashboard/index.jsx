import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  AlertTriangle, Plus, FileText, RefreshCw, ArrowRight,
  IndianRupee, Layers, Users, Receipt, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import MonthSelector from '../../components/MonthSelector';
import { useApp } from '../../context/AppContext';
import { format, subDays, startOfMonth, eachDayOfInterval, parse } from 'date-fns';

const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const QUICK_ACTIONS = [
  { label: 'New Invoice', icon: FileText, to: '/invoices/new', color: 'var(--primary)', bg: 'var(--primary-alpha-10)' },
  { label: 'Add Product', icon: Package, to: '/products', color: 'var(--success)', bg: 'var(--success-light)' },
  { label: 'Add Expense', icon: TrendingDown, to: '/expenses', color: 'var(--warning)', bg: 'var(--warning-light)' },
];

export default function Dashboard() {
  const { sales, expenses, products, invoices, getMetrics, globalMonth } = useApp();
  const metrics = getMetrics();
  const navigate = useNavigate();

  const monthSalesList = sales.filter(s => s.date?.startsWith(globalMonth));
  const monthExpenseList = expenses.filter(e => e.date?.startsWith(globalMonth));

  // Build chart data for the selected month
  const chartData = useMemo(() => {
    const year = parseInt(globalMonth.split('-')[0]);
    const month = parseInt(globalMonth.split('-')[1]);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const days = eachDayOfInterval({ start, end });
    return days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayIncome = sales.filter(s => s.date === dateStr).reduce((a, s) => a + (s.total || 0), 0);
      const dayExpense = expenses.filter(e => e.date === dateStr).reduce((a, e) => a + (e.amount || 0), 0);
      return { date: format(d, 'dd MMM'), income: dayIncome, expense: dayExpense, profit: dayIncome - dayExpense };
    });
  }, [sales, expenses, globalMonth]);

  // Top products by sales for the selected month
  const topProducts = useMemo(() => {
    const map = {};
    monthSalesList.forEach(s => {
      (s.items || []).forEach(item => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        map[item.productId].qty += item.qty || 0;
        map[item.productId].revenue += (item.qty || 0) * (item.price || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [monthSalesList]);

  // Recent activity for the selected month
  const recentActivity = useMemo(() => {
    const all = [
      ...monthSalesList.map(s => ({ ...s, _type: 'sale', _label: `Sale #${s.id?.slice(-4)}`, _amount: s.total, _color: 'var(--success)' })),
      ...monthExpenseList.map(e => ({ ...e, _type: 'expense', _label: e.title || 'Expense', _amount: e.amount, _color: 'var(--error)' })),
    ];
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  }, [monthSalesList, monthExpenseList]);

  const STATS = [
    { label: "Today's Sales", value: fmt(metrics.todayIncome), icon: IndianRupee, color: 'var(--primary)', bg: 'var(--primary-alpha-10)', sub: `${metrics.todaySalesCount} orders today` },
    { label: "Today's Expenses", value: fmt(metrics.todayExpenseTotal), icon: TrendingDown, color: 'var(--error)', bg: 'var(--error-light)', sub: 'Amount spent today' },
    { label: "Today's Profit", value: fmt(metrics.todayProfit), icon: TrendingUp, color: metrics.todayProfit >= 0 ? 'var(--success)' : 'var(--error)', bg: 'var(--success-light)', sub: 'Net profit today' },
    { label: 'Monthly Revenue', value: fmt(metrics.monthIncome), icon: IndianRupee, color: 'var(--primary)', bg: 'var(--primary-alpha-10)', sub: `${metrics.monthSalesCount} orders this month` },
    { label: 'Monthly Profit', value: fmt(metrics.monthProfit), icon: TrendingUp, color: metrics.monthProfit >= 0 ? 'var(--success)' : 'var(--error)', bg: 'var(--success-light)', sub: 'Net profit this month' },
    { label: 'Inventory Value', value: fmt(metrics.totalInventoryValue), icon: Layers, color: 'var(--info)', bg: 'var(--info-light)', sub: `${products.length} products`, to: '/inventory' },
    { label: 'Low Stock', value: metrics.lowStockProducts.length, icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-light)', sub: 'Need restock', to: '/inventory' },
    { label: 'Total Invoices', value: metrics.monthInvoicesCount, icon: FileText, color: 'var(--accent)', bg: 'var(--accent-light)', sub: 'Invoices created', to: '/invoices' },
  ];

  const monthObj = parse(globalMonth, 'yyyy-MM', new Date());

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{getGreeting()}, {'\u{1F44B}'}</h2>
          <p className="page-subtitle">{format(monthObj, 'MMMM yyyy')} — Business overview</p>
        </div>
        <MonthSelector />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {STATS.map(({ label, value, icon: Icon, color, bg, sub, to, onClick }) => {
          const content = (
            <>
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={20} />
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>
            </>
          );
          return to ? (
            <Link key={label} to={to} className="stat-card card-hover" style={{ textDecoration: 'none', display: 'block' }}>
              {content}
            </Link>
          ) : (
            <div key={label} className="stat-card">
              {content}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="content-grid grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-title">Revenue vs Expenses</div>
          <div className="chart-subtitle">Daily breakdown</div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 12, fontSize: 13, boxShadow: 'var(--shadow-lg)' }}
                formatter={(v, name) => [fmt(v), name === 'income' ? 'Revenue' : name === 'expense' ? 'Expenses' : 'Profit']}
              />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fill="url(#expenseGrad)" />
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
