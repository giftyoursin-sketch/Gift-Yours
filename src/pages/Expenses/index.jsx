import React, { useState, useMemo } from 'react';
import { Plus, X, Trash2, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';
import { format, subMonths, startOfMonth, endOfMonth, parse } from 'date-fns';
import MonthSelector from '../../components/MonthSelector';

const CATEGORIES = ['Rent', 'Electricity', 'Staff Salary', 'Raw Materials', 'Packaging', 'Transportation', 'Marketing', 'Miscellaneous'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
const CATEGORY_COLORS = ['#1E1B4B', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

function ExpenseForm({ onClose, onSave, expense }) {
  const [form, setForm] = useState({
    title: expense?.title || '',
    amount: expense?.amount || '',
    category: expense?.category || CATEGORIES[0],
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
    description: expense?.description || '',
    paymentMethod: expense?.paymentMethod || 'Cash',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, amount: parseFloat(form.amount) || 0 });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{expense ? 'Edit Expense' : 'Add Expense'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="input-group">
              <label className="input-label">Expense Title *</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Monthly Rent" required />
            </div>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Amount (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Payment Method</label>
                <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional details..." rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : expense ? 'Save Changes' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, globalMonth } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const monthObj = parse(globalMonth, 'yyyy-MM', new Date());
  const monthLabel = format(monthObj, 'MMMM yyyy');

  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(globalMonth))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  , [expenses, globalMonth]);

  const totalMonth = monthExpenses.reduce((a, e) => a + (e.amount || 0), 0);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map = {};
    monthExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + (e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthExpenses]);

  // Last 6 months trend
  const trendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const ms = format(d, 'yyyy-MM');
      const total = expenses.filter(e => e.date?.startsWith(ms)).reduce((a, e) => a + (e.amount || 0), 0);
      return { month: format(d, 'MMM'), total };
    });
  }, [expenses]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Expenses</h2>
          <p className="page-subtitle">Track and manage business expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <MonthSelector />
          <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowForm(true); }}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="content-grid grid-2 mb-6">
        {/* Trend Chart */}
        <div className="chart-card">
          <div className="chart-title">6-Month Expense Trend</div>
          <div className="chart-subtitle">Monthly breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 10, fontSize: 13 }} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Expenses']} />
              <Bar dataKey="total" fill="#1E1B4B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="chart-title">Category Breakdown</div>
              <div className="chart-subtitle">{monthLabel}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
            </div>
          </div>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No expenses this month</p></div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {categoryData.slice(0, 5).map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>₹{d.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Month header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{monthLabel}</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--error)' }}>₹{totalMonth.toLocaleString('en-IN')}</div>
      </div>

      {monthExpenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><TrendingDown size={48} strokeWidth={1} /></div>
          <h3>No expenses in {monthLabel}</h3>
          <p>Track your business expenses to see where money goes</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Expense</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthExpenses.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    {e.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.description}</div>}
                  </td>
                  <td>
                    <span className="badge badge-primary">{e.category}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e.date}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e.paymentMethod}</td>
                  <td style={{ fontWeight: 700, color: 'var(--error)', fontSize: '0.9375rem' }}>₹{(e.amount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditExpense(e); setShowForm(true); }}>✏️</button>
                      <button className="btn btn-ghost btn-icon-sm" style={{ color: 'var(--error)' }} onClick={() => { if (window.confirm('Delete?')) deleteExpense(e.id); }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="fab" onClick={() => { setEditExpense(null); setShowForm(true); }}><Plus size={24} /></button>

      {showForm && (
        <ExpenseForm
          expense={editExpense}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editExpense) await updateExpense(editExpense.id, data);
            else await addExpense(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
