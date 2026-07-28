import React from 'react';
import SEO from '../../components/SEO';
import { useWishlist } from '../WishlistContext';
import { useEcom } from '../EcomContext';
import ProductCard from '@shared/components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { products } = useEcom();

  // Find the product objects for the IDs in the wishlist
  const savedProducts = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO title="My Wishlist" description="View your saved products." url="/wishlist" />
      
      <section className="section container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <Heart size={32} className="text-primary-color" fill="var(--color-primary)" />
          <h1 className="h1" style={{ margin: 0 }}>My Wishlist</h1>
        </div>

        {wishlistLoading ? (
          <div className="grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : savedProducts.length > 0 ? (
          <div className="grid-cols-4">
            {savedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <Heart size={40} color="var(--color-text-muted)" />
            </div>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>Your wishlist is empty</h2>
            <p className="subtitle" style={{ marginBottom: '2rem' }}>Save items you love and buy them later.</p>
            <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              <ShoppingBag size={20} /> Continue Shopping
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
