import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEcom } from '../EcomContext';
import { useAuth } from '../AuthContext';
import ProductCard from '@shared/components/ProductCard';
import SEO from '../../components/SEO';
import { toSlug } from '@shared/utils/imageUtils';
import { ArrowRight, Star, Truck, ShieldCheck, Gift } from 'lucide-react';
import { supabase } from '@supabaseClient';

export default function Home() {
  const { products, categories, loading } = useEcom();
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    async function fetchRecent() {
      if (user) {
        const { data } = await supabase.from('recently_viewed').select('product_id').eq('customer_id', user.id).order('viewed_at', { ascending: false }).limit(4);
        if (data) {
          const ids = data.map(d => d.product_id);
          setRecentProducts(products.filter(p => ids.includes(p.id)));
        }
      } else {
        try {
          const ids = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          setRecentProducts(products.filter(p => ids.includes(p.id)).slice(0, 4));
        } catch(e) {}
      }
    }
    if (products.length > 0) fetchRecent();
  }, [user, products]);

  if (loading) {
    return (
      <div className="container section flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading premium experience...</p>
        </div>
      </div>
    );
  }

  const frame12x8 = products.find(p => p.name.toLowerCase().includes('12x8'));
  let featuredProducts = [];
  if (frame12x8) {
    featuredProducts = [frame12x8, ...products.filter(p => p.id !== frame12x8.id).slice(0, 3)];
  } else {
    featuredProducts = products.slice(0, 4);
  }
  const newArrivals = products.slice(4, 8);

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=2000&auto=format&fit=crop',
      badge: 'New Collection',
      title: <>Preserve Your Memories in <span style={{ color: 'var(--color-primary-light)' }}>Premium Frames</span></>,
      subtitle: 'High-quality personalized gifts, custom frames, and professional visiting cards crafted with perfection.',
      primaryBtn: { text: 'Shop Frames', link: '/category/frames' },
      secondaryBtn: { text: 'Explore All', link: '/products' }
    },
    {
      image: 'https://images.unsplash.com/photo-1512316616428-103328e19c36?q=80&w=2000&auto=format&fit=crop',
      badge: 'Exclusive Gifts',
      title: <>Make Every Occasion <span style={{ color: 'var(--color-primary-light)' }}>Unforgettable</span></>,
      subtitle: 'Find the perfect customized present for birthdays, anniversaries, and corporate events.',
      primaryBtn: { text: 'Shop Gifts', link: '/products' },
      secondaryBtn: { text: 'View Collection', link: '/products' }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div>
      <SEO />
      {/* ─── HERO SECTION ─── */}
      <section className="hero-section" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-alt)'
      }}>
        {slides.map((slide, index) => (
          <div key={index} style={{
            position: 'absolute', inset: 0, zIndex: 0,
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            background: `url('${slide.image}') center/cover no-repeat`
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div key={currentSlide} style={{ animation: 'heroFadeInUp 0.8s ease-out forwards' }}>
            <span className="badge badge-accent hero-badge" style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}>
              {slides[currentSlide].badge}
            </span>
            <h1 className="h1" style={{ color: '#fff', marginBottom: '1rem', maxWidth: '800px', margin: '0 auto 1rem' }}>
              {slides[currentSlide].title}
            </h1>
            <p className="subtitle desktop-only" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              {slides[currentSlide].subtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }} className="hero-actions">
              <Link to={slides[currentSlide].primaryBtn.link} className="btn btn-accent" style={{ padding: '1rem 2rem', fontSize: '1.0625rem' }}>
                {slides[currentSlide].primaryBtn.text}
              </Link>
              <Link to={slides[currentSlide].secondaryBtn.link} className="btn desktop-only" style={{ 
                padding: '1rem 2rem', fontSize: '1.0625rem', 
                background: 'rgba(255,255,255,0.2)', color: '#fff', 
                backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' 
              }}>
                {slides[currentSlide].secondaryBtn.text}
              </Link>
            </div>
          </div>

          {/* Slide Indicators */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {slides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: currentSlide === index ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: currentSlide === index ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="h2">Shop by Category</h2>
            <p className="subtitle">Discover our wide range of personalized items.</p>
          </div>
          <Link to="/products" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid-cols-4 mobile-carousel">
          {(() => {
            const dynamicCats = categories.slice(0, 3).map((cat, i) => {
              const images = [
                'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', // Frames
                'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=800&auto=format&fit=crop', // Cards
                'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'  // Gifts
              ];
              return { name: cat, img: images[i % images.length] };
            });
            
            // Add Visiting Cards to the list
            const displayCategories = [
              ...dynamicCats,
              { name: 'Visiting Cards', img: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=800&auto=format&fit=crop' } // Better image for business cards
            ];

            return displayCategories.map((cat, i) => (
              <Link key={cat.name} to={`/category/${toSlug(cat.name)}`} className="mobile-category-card" style={{ 
                position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                aspectRatio: '4/5', display: 'flex', alignItems: 'flex-end', padding: '2rem',
                textDecoration: 'none', group: 'true'
              }}>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.6s ease'
                  }}
                  className="cat-img"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)' }} />
                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{cat.name}</h3>
                  <div className="cat-explore" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem', fontWeight: 500
                  }}>
                    <span>Explore</span>
                    <div className="cat-arrow-wrap" style={{ 
                      width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                    }}>
                      <ArrowRight size={16} color="#fff" />
                    </div>
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="h2">Featured Products</h2>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Handpicked favorites just for you.</p>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid-cols-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No products available at the moment.</p>
          </div>
        )}
      </section>

      {/* ─── FEATURES / WHY CHOOSE US ─── */}
      <section className="features-section" style={{ backgroundColor: 'var(--color-bg-alt)', padding: 'var(--space-2xl) 0' }}>
        <div className="container grid-cols-3 features-container">
          <div className="feature-item" style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="feature-icon-wrap" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <Truck size={20} color="#111" />
            </div>
            <h4 className="h4" style={{ marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Fast Delivery</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Pan India delivery with secure packaging for delicate items.</p>
          </div>
          <div className="feature-item" style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="feature-icon-wrap" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <ShieldCheck size={20} color="#111" />
            </div>
            <h4 className="h4" style={{ marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Premium Quality</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>We use the best materials to ensure your memories last a lifetime.</p>
          </div>
          <div className="feature-item" style={{ textAlign: 'center', padding: '1rem' }}>
            <div className="feature-icon-wrap" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <Gift size={20} color="#111" />
            </div>
            <h4 className="h4" style={{ marginBottom: '0.25rem', fontSize: '0.9375rem' }}>Personalized</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Customized completely to your requirements with expert design.</p>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      <section className="section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h2 className="h2">New Arrivals</h2>
            <p className="subtitle">Check out the latest additions to our store.</p>
          </div>
        </div>
        
        {newArrivals.length > 0 ? (
          <div className="grid-cols-4">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={{...product, isNew: true}} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>More products coming soon.</p>
          </div>
        )}
      </section>

      <style>{`
        .cat-img:hover {
          transform: scale(1.05) !important;
        }
        
        .hero-section {
          height: min(80vh, 700px);
          min-height: 500px;
        }

        @media (max-width: 768px) {
          .hero-section {
            height: 220px !important;
            min-height: 220px !important;
          }
          .hero-badge {
            margin-bottom: 0.5rem !important;
            font-size: 0.65rem !important;
            padding: 0.25rem 0.5rem !important;
          }
          .hero-actions .btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
          }
          
          /* Categories Carousel Specifics */
          .mobile-category-card {
            width: 140px;
            aspect-ratio: 1/1 !important;
            padding: 1rem !important;
            border-radius: var(--radius-lg) !important;
          }
          .mobile-category-card h3 {
            font-size: 1rem !important;
            margin-bottom: 0.25rem !important;
          }
          .mobile-category-card .cat-explore {
            font-size: 0.75rem !important;
          }
          .mobile-category-card .cat-arrow-wrap {
            width: 24px !important;
            height: 24px !important;
          }
          
          /* Features Scroll (Compact Cards) */
          .features-section {
            padding: 1.5rem 0 !important;
          }
          .features-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 1rem;
            padding: 1rem !important;
            scrollbar-width: none;
            flex-direction: row;
          }
          .features-container::-webkit-scrollbar { display: none; }
          .feature-item {
            min-width: 160px;
            scroll-snap-align: start;
            padding: 1rem !important;
            background: var(--surface) !important;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            text-align: center !important;
          }
          .feature-item .feature-icon-wrap {
            width: 40px !important;
            height: 40px !important;
            margin: 0 auto 0.75rem !important;
            box-shadow: none !important;
            background: #f1f5f9 !important;
            border: none !important;
          }
          .feature-item .feature-icon-wrap svg {
            width: 20px !important;
            height: 20px !important;
          }
          .feature-item h4 {
            font-size: 0.9375rem !important;
            margin-bottom: 0.25rem !important;
          }
          .feature-item p {
            font-size: 0.8125rem !important;
            margin: 0 !important;
          }
        }
        
        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
