import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { getProductImagePath, FALLBACK_IMAGE } from '../utils/imageUtils';
import { useWishlist } from '../../E-Commerce/app/WishlistContext';

export default function ProductCard({ product }) {
  const [imgSrc, setImgSrc] = useState(getProductImagePath(product.category, product.name, 'cover.jpg'));
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product.id);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'var(--transition-normal)',
        boxShadow: isHovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        position: 'relative',
        height: '100%'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {hasDiscount && (
          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>-{discountPercent}%</span>
        )}
        {product.isNew && (
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>New</span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
          border: 'none', cursor: 'pointer',
          color: isSaved ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'var(--transition-fast)'
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
        title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart size={16} fill={isSaved ? "var(--color-primary)" : "none"} />
      </button>

      {/* Image Link */}
      <Link 
        to={`/product/${product.id}`} 
        style={{ 
          position: 'relative', 
          paddingTop: '100%', /* 1:1 Aspect Ratio */
          backgroundColor: 'var(--color-bg-alt)',
          overflow: 'hidden'
        }}
      >
        <img 
          src={imgSrc} 
          alt={product.name}
          onError={handleImageError}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'contain', padding: '1rem',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        {isOutOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5
          }}>
            <span className="badge" style={{ backgroundColor: 'var(--color-text-main)', color: '#fff', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={12} fill="var(--color-warning)" color="var(--color-warning)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{product.rating}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>({product.reviews})</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ 
            fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)', 
            marginBottom: '0.5rem', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {product.name}
          </h3>
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <button 
            className="btn btn-primary btn-icon" 
            disabled={isOutOfStock}
            style={{ width: '36px', height: '36px', padding: 0 }}
            title="Add to Cart"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
