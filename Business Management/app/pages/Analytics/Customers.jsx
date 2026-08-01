import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@supabaseClient';
import { Users, IndianRupee, UserCheck, BarChart2, RefreshCw } from 'lucide-react';
import KpiCard from '@business/components/analytics/KpiCard';
import DataTable from '@business/components/analytics/DataTable';
import DateRangeFilter, { getDateRange } from '@business/components/analytics/DateRangeFilter';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

export default function Customers() {
  const navigate = useNavigate();
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => { fetchData(); }, [range]);

  const fetchData = async () => {
    setLoading(true);
    const { from } = getDateRange(range);

    // Fetch all orders to build customer profiles
    const { data: orders } = await supabase.from('orders').select('*').gte('created_at', from.toISOString());
    const safeOrders = orders || [];

    // Build customer map from order addresses
    const customerMap = {};
    safeOrders.forEach(order => {
      const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address || '{}') : (order.shipping_address || {});
      const phone = addr.phone || 'unknown';
      if (!customerMap[phone]) {
        customerMap[phone] = {
          id: phone,
          name: addr.full_name || 'Unknown',
          phone: addr.phone || '—',
          email: addr.email || '—',
          city: addr.city || '—',
          state: addr.state || '—',
          orders: 0,
          totalSpent: 0,
          lastPurchase: null,
          firstPurchase: null,
        };
      }
      customerMap[phone].orders += 1;
      customerMap[phone].totalSpent += (order.grand_total || 0);
      const orderDate = new Date(order.created_at);
      if (!customerMap[phone].lastPurchase || orderDate > customerMap[phone].lastPurchase) {
        customerMap[phone].lastPurchase = orderDate;
      }
      if (!customerMap[phone].firstPurchase || orderDate < customerMap[phone].firstPurchase) {
        customerMap[phone].firstPurchase = orderDate;
      }
    });

    const customerList = Object.values(customerMap).map(c => ({
      ...c,
      avgSpend: c.orders > 0 ? c.totalSpent / c.orders : 0,
      isReturning: c.orders > 1,
      lastPurchaseStr: c.lastPurchase ? c.lastPurchase.toLocaleDateString('en-IN') : '—',
      totalSpentStr: fmtCur(c.totalSpent),
      avgSpendStr: fmtCur(c.orders > 0 ? c.totalSpent / c.orders : 0),
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    setCustomers(customerList);

    const returning = customerList.filter(c => c.isReturning).length;
    const totalSpent = customerList.reduce((s, c) => s + c.totalSpent, 0);
    setKpis({
      total: customerList.length,
      returning,
      totalRevenue: totalSpent,
      avgLifetimeValue: customerList.length > 0 ? totalSpent / customerList.length : 0,
    });
    setLoading(false);
  };

  const columns = [
    { header: 'Customer', accessor: 'name', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
      </div>
    )},
    { header: 'Phone', accessor: 'phone', render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span> },
    { header: 'City', accessor: 'city' },
    { header: 'State', accessor: 'state' },
    { header: 'Orders', accessor: 'orders', render: (v) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v}</span> },
    { header: 'Total Spent', accessor: 'totalSpent', render: (_, row) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{row.totalSpentStr}</span> },
    { header: 'Avg Order', accessor: 'avgSpend', render: (_, row) => <span style={{ color: 'var(--text-secondary)' }}>{row.avgSpendStr}</span> },
    { header: 'Last Purchase', accessor: 'lastPurchaseStr', render: (v) => <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{v}</span> },
    { header: 'Type', accessor: 'isReturning', render: (v) => (
      <span style={{ padding: '0.2rem 0.625rem', borderRadius: 999, background: v ? '#D1FAE5' : '#DBEAFE', color: v ? '#059669' : '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}>
        {v ? 'Returning' : 'New'}
      </span>
    )},
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Customers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Customer analytics and purchase behavior</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <DateRangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Customers" value={kpis.total ?? '—'} icon={Users} color="info" loading={loading} />
        <KpiCard title="Returning Customers" value={kpis.returning ?? '—'} icon={UserCheck} color="success" loading={loading} />
        <KpiCard title="Total Revenue" value={fmtCur(kpis.totalRevenue)} icon={IndianRupee} color="primary" loading={loading} />
        <KpiCard title="Avg Lifetime Value" value={fmtCur(kpis.avgLifetimeValue)} icon={BarChart2} color="purple" loading={loading} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          searchPlaceholder="Search by name, phone, email, city..."
          onRowClick={(row) => navigate(`/analytics/customers/${encodeURIComponent(row.phone)}`)}
          emptyMessage="No customers found in the selected period."
        />
      </div>
    </div>
  );
}
