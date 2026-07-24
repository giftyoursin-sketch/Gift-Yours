import React, { useState, useMemo } from 'react';
import { Download, Printer, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { format, eachDayOfInterval, parse } from 'date-fns';
import MonthSelector from '../../components/MonthSelector';

const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function Reports() {
  const { sales, expenses, products, customers, globalMonth } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  const monthObj = parse(globalMonth, 'yyyy-MM', new Date());
  const monthLabel = format(monthObj, 'MMMM yyyy');

  // Daily data for the selected month
  const dailyData = useMemo(() => {
    const year = parseInt(globalMonth.split('-')[0]);
    const month = parseInt(globalMonth.split('-')[1]);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const daySales = sales.filter(s => s.date === dateStr);
      const dayExp = expenses.filter(e => e.date === dateStr);
      const income = daySales.reduce((a, s) => a + (s.total || 0), 0);
      const expense = dayExp.reduce((a, e) => a + (e.amount || 0), 0);
      return {
        day: format(d, 'dd MMM'),
        income, expense, profit: income - expense,
        orders: daySales.length,
      };
    });
  }, [sales, expenses, globalMonth]);

  const totalIncome = dailyData.reduce((a, m) => a + m.income, 0);
  const totalExpense = dailyData.reduce((a, m) => a + m.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const totalOrders = dailyData.reduce((a, m) => a + m.orders, 0);

  const monthSalesList = useMemo(() => sales.filter(s => s.date?.startsWith(globalMonth)), [sales, globalMonth]);
  const monthExpenseList = useMemo(() => expenses.filter(e => e.date?.startsWith(globalMonth)), [expenses, globalMonth]);

  // Top products for the month
  const topProducts = useMemo(() => {
    const map = {};
    monthSalesList.forEach(s => (s.items || []).forEach(item => {
      if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      map[item.productId].qty += item.qty || 0;
      map[item.productId].revenue += (item.qty || 0) * (item.price || 0);
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [monthSalesList]);

  // Category expense for the month
  const categoryExpenses = useMemo(() => {
    const map = {};
    monthExpenseList.forEach(e => { map[e.category] = (map[e.category] || 0) + (e.amount || 0); });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthExpenseList]);

  const COLORS = ['#1E1B4B', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const exportCSV = () => {
    const rows = [['Date', 'Revenue', 'Expenses', 'Profit', 'Orders']];
    dailyData.forEach(m => rows.push([m.day, m.income, m.expense, m.profit, m.orders]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report-${globalMonth}.csv`; a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports & Analytics</h2>
          <p className="page-subtitle">{monthLabel} — Business performance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <MonthSelector />
          <button className="btn btn-secondary" onClick={exportCSV}><Download size={15} /> CSV</button>
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={15} /> Print</button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Revenue', value: fmt(totalIncome), color: 'var(--primary)', bg: 'rgba(30,27,75,0.08)' },
          { label: 'Total Expenses', value: fmt(totalExpense), color: 'var(--error)', bg: 'var(--error-light)' },
          { label: 'Net Profit', value: fmt(totalProfit), color: totalProfit >= 0 ? 'var(--success)' : 'var(--error)', bg: 'var(--success-light)' },
          { label: 'Total Orders', value: totalOrders, color: 'var(--accent)', bg: 'var(--accent-light)' },
          { label: 'Products', value: products.length, color: 'var(--info)', bg: 'var(--info-light)' },
          { label: 'Customers', value: customers.length, color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        {[['overview', 'Overview'], ['products', 'Top Products'], ['expenses', 'Expense Analysis']].map(([k, l]) => (
          <button key={k} className={`tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Revenue vs Expense */}
          <div className="chart-card">
            <div className="chart-title">Revenue vs Expenses</div>
            <div className="chart-subtitle">Daily comparison ({monthLabel})</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 10, fontSize: 13 }} formatter={(v, n) => [fmt(v), n === 'income' ? 'Revenue' : n === 'expense' ? 'Expenses' : 'Profit']} />
                <Bar dataKey="income" fill="#1E1B4B" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="expense" />
                <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Profit Trend */}
          <div className="chart-card">
            <div className="chart-title">Profit Trend</div>
            <div className="chart-subtitle">Net profit by day ({monthLabel})</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 10, fontSize: 13 }} formatter={v => [fmt(v), 'Profit']} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="chart-card">
          <div className="chart-title">Top Selling Products</div>
          <div className="chart-subtitle">By total revenue ({monthLabel})</div>
          {topProducts.length === 0 ? (
            <div className="empty-state"><p>No sales data available</p></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td><span className={`badge ${i === 0 ? 'badge-accent' : i === 1 ? 'badge-warning' : 'badge-muted'}`}>#{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ fontWeight: 600 }}>{p.qty}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="content-grid grid-2">
          <div className="chart-card">
            <div className="chart-title">Expenses by Category</div>
            <div className="chart-subtitle">For {monthLabel}</div>
            {categoryExpenses.length === 0 ? (
              <div className="empty-state"><p>No expense data</p></div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryExpenses} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {categoryExpenses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => [fmt(v), '']} contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  {categoryExpenses.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.875rem' }}>{d.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-title">Daily Expense Summary</div>
            <div className="chart-subtitle">{monthLabel}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {dailyData.filter(d => d.expense > 0).length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}><p>No expenses recorded</p></div>
              ) : dailyData.filter(d => d.expense > 0).map(m => (
                <div key={m.day} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{ width: 45, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.day}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${totalExpense > 0 ? (m.expense / Math.max(...dailyData.map(d => d.expense))) * 100 : 0}%`, background: 'var(--error)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, width: 80, textAlign: 'right' }}>{fmt(m.expense)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
