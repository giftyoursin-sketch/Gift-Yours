import React, { useState, useEffect } from 'react';
import { supabase } from '@supabaseClient';
import { Heart, TrendingUp, ShoppingCart } from 'lucide-react';
import KpiCard from '@business/components/analytics/KpiCard';

const fmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n || 0));
const fmtCur = (n) => `₹${fmt(n)}`;

export default function WishlistAnalytics() {
  const [loading, setLoading] = useState(true);
  const [wishlistData, setWishlistData] = useState([]);
  const [kpis, setKpis] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Try to fetch from wishlist table
      const { data: wishlist } = await supabase.from('wishlist').select('*, products(name, category, selling_price)');
      const safeWishlist = wishlist || [];

      // Group by product
      const prodMap = {};
      safeWishlist.forEach(w => {
        const key = w.product_id || w.productId || 'unknown';
        const name = w.products?.name || w.product_name || 'Unknown Product';
        const category = w.products?.category || w.category || '—';
        const price = w.products?.selling_price || w.price || 0;
        if (!prodMap[key]) prodMap[key] = { name, category, price, count: 0 };
        prodMap[key].count++;
      });

      const sortedData = Object.values(prodMap).sort((a, b) => b.count - a.count);
      setWishlistData(sortedData);
      setKpis({
        total: safeWishlist.length,
        uniqueProducts: sortedData.length,
        topProduct: sortedData[0]?.name || '—',
        potentialRevenue: sortedData.reduce((s, p) => s + p.count * p.price, 0),
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Wishlist Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Products customers are saving for later</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Total Wishlists" value={kpis.total ?? '—'} icon={Heart} color="primary" loading={loading} />
        <KpiCard title="Unique Products" value={kpis.uniqueProducts ?? '—'} icon={ShoppingCart} color="info" loading={loading} />
        <KpiCard title="Most Wishlisted" value={kpis.topProduct ?? '—'} icon={TrendingUp} color="warning" loading={loading} />
        <KpiCard title="Potential Revenue" value={fmtCur(kpis.potentialRevenue)} icon={TrendingUp} color="success" loading={loading} />
      </div>

      {/* Most Wishlisted Products */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Most Wishlisted Products</h3>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ height: 44, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : wishlistData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Heart size={36} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <div>No wishlist data yet. Make sure your wishlist table is set up in Supabase.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
                  {['Rank', 'Product', 'Category', 'Price', 'Wishlist Count', 'Potential Revenue'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wishlistData.map((p, i) => (
                  <tr key={p.name + i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'var(--primary-alpha-10)' : 'var(--surface-3)', color: i < 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{p.category}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{fmtCur(p.price)}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Heart size={14} style={{ color: 'var(--primary)' }} fill="currentColor" />
                        <span style={{ fontWeight: 700 }}>{p.count}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--success)' }}>{fmtCur(p.count * p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
