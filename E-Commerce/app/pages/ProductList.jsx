import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEcom } from '../EcomContext';
import ProductCard from '@shared/components/ProductCard';
import SEO from '../../components/SEO';
import { toSlug } from '@shared/utils/imageUtils';
import { Filter, ChevronDown, Star } from 'lucide-react';

export default function ProductList() {
  const { slug } = useParams(); // For category routes
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const { products, categories, loading } = useEcom();

  const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high, rating
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Filter products based on category slug OR search query
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (slug) {
      result = result.filter(p => toSlug(p.category) === slug);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Typo tolerance could be added here using string distance, but for now we do simple includes
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Advanced Filters
    if (minPrice !== '') result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice !== '') result = result.filter(p => p.price <= Number(maxPrice));
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);
    if (inStockOnly) result = result.filter(p => p.stock > 0);

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    // newest is default (assuming array order is newest first for now)

    return result;
  }, [products, slug, searchQuery, sortBy, minPrice, maxPrice, minRating, inStockOnly]);

  // Find the readable category name from the slug
  const currentCategory = categories.find(c => toSlug(c) === slug) || (slug ? 'Category' : 'All Products');
  const pageTitle = searchQuery ? `Search Results for "${searchQuery}"` : currentCategory;

  if (loading) {
    return (
      <div className="container section flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO 
        title={pageTitle} 
        description={`Browse our collection of ${pageTitle}.`} 
        url={slug ? `/category/${slug}` : '/products'} 
      />
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 className="h2">{pageTitle}</h1>
          <p className="subtitle" style={{ marginTop: '0.5rem' }}>Showing {filteredProducts.length} products</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Filter size={18} /> Filters
          </button>
          <div style={{ position: 'relative' }}>
            <select 
              className="input" 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{ appearance: 'none', paddingRight: '2.5rem', cursor: 'pointer', background: 'var(--color-bg-alt)' }}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar Filters (Desktop) */}
        {showFilters && (
          <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '5rem' }}>
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Categories</h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <a href="/products" style={{ color: !slug ? 'var(--color-primary)' : 'var(--color-text-main)', fontWeight: !slug ? 600 : 400 }}>
                    All Products
                  </a>
                </li>
                {categories.map(cat => (
                  <li key={cat}>
                    <a href={`/category/${toSlug(cat)}`} style={{ color: slug === toSlug(cat) ? 'var(--color-primary)' : 'var(--color-text-main)', fontWeight: slug === toSlug(cat) ? 600 : 400 }}>
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />
              
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Price Range</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" placeholder="Min" className="input" style={{ padding: '0.5rem' }} value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span>-</span>
                <input type="number" placeholder="Max" className="input" style={{ padding: '0.5rem' }} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Rating</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[4, 3, 2, 1].map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r ? "var(--color-warning)" : "var(--color-border)"} color={i < r ? "var(--color-warning)" : "var(--color-border)"} />)}
                      <span style={{ fontSize: '0.875rem' }}>& Up</span>
                    </div>
                  </label>
                ))}
                <button className="btn btn-ghost" style={{ padding: 0, justifyContent: 'flex-start', fontSize: '0.875rem' }} onClick={() => setMinRating(0)}>Clear Rating</button>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1.5rem 0' }} />

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Availability</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                <span style={{ fontSize: '0.875rem' }}>In Stock Only</span>
              </label>

            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          {filteredProducts.length > 0 ? (
            <div className={showFilters ? "grid-cols-4" : "grid-cols-5"}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)' }}>
              <Filter size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>No products found</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>We couldn't find any products matching your current selection.</p>
              <a href="/products" className="btn btn-primary">Clear Filters</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
