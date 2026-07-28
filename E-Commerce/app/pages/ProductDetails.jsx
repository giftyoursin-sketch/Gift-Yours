import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEcom } from '../EcomContext';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import { useAuth } from '../AuthContext';
import SEO from '../../components/SEO';
import { getProductImagePath, FALLBACK_IMAGE, toSlug } from '@shared/utils/imageUtils';
import ProductCard from '@shared/components/ProductCard';
import { ShoppingBag, Heart, Star, Truck, Shield, ArrowLeft, Plus, Minus, CheckCircle2, Share2 } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading, settings, trackProductView, getProductReviews, submitReview } = useEcom();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [images, setImages] = useState([]);
  
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', review: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (products.length > 0) {
      const found = products.find(p => p.id === id);
      setProduct(found);
      
      if (found) {
        // Generate placeholder gallery images
        setImages([
          getProductImagePath(found.category, found.name, 'cover.jpg'),
          getProductImagePath(found.category, found.name, 'gallery-1.jpg'),
          getProductImagePath(found.category, found.name, 'gallery-2.jpg'),
          getProductImagePath(found.category, found.name, 'gallery-3.jpg'),
        ]);
        setActiveImage(0);
        
        // Phase 4: Track View and Fetch Reviews
        trackProductView(found.id, user);
        getProductReviews(found.id).then(setReviews);
      }
    }
  }, [id, products, user]);

  if (loading || !product) {
    return (
      <div className="container section flex-center" style={{ minHeight: '60vh' }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const hasDiscount = product.originalPrice > product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Find related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to submit a review.");
    // In a real app, verify they actually bought it. We'll pass true for now or check orders.
    const success = await submitReview(user, product.id, reviewForm.rating, reviewForm.title, reviewForm.review, true);
    if (success) {
      alert("Review submitted successfully!");
      setShowReviewForm(false);
      getProductReviews(product.id).then(setReviews);
    }
  };

  const isSaved = isInWishlist(product?.id);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareMessage = `Check out this ${product.name} on Gift Yours!`;

  const textDesc = product.description || '';
  let introDesc = textDesc;
  let tableRows = [];
  
  if (textDesc.includes('Specification | Value')) {
    const parts = textDesc.split('Specification | Value');
    introDesc = parts[0].trim();
    tableRows = parts[1].split('\n').filter(line => line.trim() && !line.includes('--- | ---'));
  }

  return (
    <div className="container section" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO 
        title={product.name} 
        description={product.description} 
        image={images[0]} 
        url={`/product/${product.id}`}
        type="product"
      />

      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', marginBottom: '4rem' }}>
        {/* Left: Image Gallery */}
        <div style={{ flex: '1 1 500px', display: 'flex', gap: '1rem', flexDirection: 'row-reverse' }}>
          {/* Main Image */}
          <div style={{ flex: 1, backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', aspectRatio: '4/5' }}>
            <img 
              src={images[activeImage]} 
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
            />
            {hasDiscount && (
              <span className="badge badge-accent" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>Sale</span>
            )}
          </div>
          
          {/* Thumbnails */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '80px' }}>
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  border: activeImage === idx ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '2px', transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: 'calc(var(--radius-md) - 4px)', overflow: 'hidden', backgroundColor: 'var(--color-bg-alt)' }}>
                  <img 
                    src={img} 
                    alt={`Thumbnail ${idx}`} 
                    onError={(e) => { e.target.closest('button').style.display = 'none'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.25rem' }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
              <span style={{ fontWeight: 600 }}>{product.rating}</span>
              <span style={{ color: 'var(--color-text-light)' }}>({reviews.length || product.reviews} reviews)</span>
            </div>
          </div>

          <h1 className="h2" style={{ marginBottom: '1rem' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1 }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginBottom: '0.25rem' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
            {introDesc || 'No description available for this product. Premium quality guaranteed.'}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '2rem' }} />

          {/* Variants */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>Available Options</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Standard', 'Premium'].map((opt) => (
                <button 
                  key={opt} 
                  className={`btn ${selectedVariant === opt ? 'btn-primary' : 'btn-outline'}`} 
                  style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
                  onClick={() => setSelectedVariant(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {/* Actions */}
          <div className="product-actions-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', alignItems: 'stretch' }}>
            <div className="qty-control" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}>
              <button className="btn-icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
              <button className="btn-icon" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
            </div>
            
            <button 
              className={`btn ${addedToCart ? 'btn-success' : 'btn-outline'} action-btn-add`} 
              style={{ padding: '0 2rem', background: addedToCart ? 'var(--color-success)' : undefined, color: addedToCart ? '#fff' : undefined }} 
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {addedToCart ? <CheckCircle2 size={20} /> : <ShoppingBag size={20} />}
              <span className="desktop-only">{addedToCart ? 'Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>

            <button 
              className="btn btn-primary action-btn-buy" 
              style={{ padding: '0 3rem', fontSize: '1.0625rem', flex: 1 }}
              disabled={isOutOfStock}
              onClick={() => {
                if (isOutOfStock) return;
                addToCart(product, quantity, selectedVariant);
                navigate('/checkout');
              }}
            >
              Buy Now
            </button>
            
            <button 
              className="btn btn-outline btn-icon action-btn-wishlist desktop-only" 
              style={{ width: '56px', height: '56px', padding: 0, borderColor: isSaved ? 'var(--color-primary)' : 'var(--color-border)', color: isSaved ? 'var(--color-primary)' : 'inherit' }} 
              onClick={() => toggleWishlist(product.id)}
              title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={20} fill={isSaved ? "var(--color-primary)" : "none"} />
            </button>
          </div>

          {/* Social Share & WhatsApp */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', justifyContent: 'flex-start' }}>
            <button 
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: '#fff', border: 'none', padding: '0 2rem', fontSize: '1.0625rem', height: '56px' }} 
              onClick={() => window.open(`https://wa.me/${(settings?.contactWhatsapp || '').replace(/[^0-9]/g, '')}?text=I'm interested in ${product.name}: ${shareUrl}`, '_blank')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Enquire on WhatsApp
            </button>
            <button className="btn btn-outline btn-icon" style={{ width: '56px', height: '56px', padding: 0, borderColor: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(shareUrl); alert("Link copied to clipboard!"); }} title="Share Product">
              <Share2 size={20} />
            </button>
          </div>

          {/* Trust Badges */}
          <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Truck size={20} color="var(--color-text-muted)" />
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Free Shipping</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>On orders over ₹999</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={20} color="var(--color-text-muted)" />
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Secure Payment</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>100% secure checkout</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Product Specifications - Moved below */}
      {tableRows.length > 0 && (
        <section style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9375rem', lineHeight: 1.5 }}>
              <thead>
                <tr>
                  <th style={{ paddingBottom: '1rem', color: 'var(--color-text-main)', fontWeight: 700, fontSize: '1rem' }}>Specification</th>
                  <th style={{ paddingBottom: '1rem', color: 'var(--color-text-main)', fontWeight: 700, fontSize: '1rem' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => {
                  const cols = row.split('|');
                  if (cols.length < 2) return null;
                  const key = cols[0].trim();
                  const val = cols[1].trim();
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '0.75rem 0', color: 'var(--color-text-main)', width: '35%', verticalAlign: 'top' }}>{key}</td>
                      <td style={{ padding: '0.75rem 0', color: 'var(--color-text-main)', verticalAlign: 'top' }}>{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 className="h3">You Might Also Like</h3>
            <Link to={`/category/${toSlug(product.category)}`} className="btn btn-ghost">View All</Link>
          </div>
          <div className="grid-cols-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h3 className="h3">Customer Reviews</h3>
          <button className="btn btn-outline" onClick={() => setShowReviewForm(!showReviewForm)}>
            Write a Review
          </button>
        </div>

        {showReviewForm && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Write a Review</h4>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Rating</label>
                <select className="input" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}>
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
              <div>
                <label className="label">Review Title</label>
                <input className="input" type="text" placeholder="Summary of your review" required value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
              </div>
              <div>
                <label className="label">Your Review</label>
                <textarea className="input" rows={4} placeholder="What did you like or dislike?" required value={reviewForm.review} onChange={e => setReviewForm({...reviewForm, review: e.target.value})} />
              </div>
              <button className="btn btn-primary" type="submit">Submit Review</button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reviews.length > 0 ? reviews.map(r => (
            <div key={r.id} style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.125rem' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < r.rating ? "var(--color-warning)" : "var(--color-border)"} color={i < r.rating ? "var(--color-warning)" : "var(--color-border)"} />)}
                    </div>
                    {r.verified_purchase && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Verified Buyer</span>}
                  </div>
                  <h4 style={{ fontWeight: 600 }}>{r.title}</h4>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{r.review}</p>
            </div>
          )) : (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
              <Star size={40} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No reviews yet</h4>
              <p style={{ color: 'var(--color-text-muted)' }}>Be the first to review this product!</p>
            </div>
          )}
        </div>
      </section>
      
      <style>{`
        @media (max-width: 768px) {
          .product-actions-wrapper {
            position: fixed;
            bottom: calc(56px + env(safe-area-inset-bottom));
            left: 0;
            right: 0;
            background: var(--surface);
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--surface-border);
            box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
            z-index: 90;
            margin: 0 !important;
            display: flex;
            gap: 0.5rem !important;
            align-items: center !important;
          }
          .product-actions-wrapper .qty-control {
            display: none !important; /* Hide qty selector in mobile sticky bar for space */
          }
          .action-btn-add {
            flex: 1;
            padding: 0.75rem 0.5rem !important;
          }
          .action-btn-buy {
            flex: 1;
            padding: 0.75rem 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
