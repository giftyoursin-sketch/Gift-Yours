import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useEcom } from '../EcomContext';
import { useAuth } from '../AuthContext';
import ProductCard from '@shared/components/ProductCard';
import SEO from '../../components/SEO';
import { toSlug } from '@shared/utils/imageUtils';
import { ArrowRight, Star, Truck, ShieldCheck, Gift, ChevronLeft, ChevronRight, Sparkles, Heart, Camera, CheckCircle, Quote, Mail } from 'lucide-react';
import { supabase } from '@supabaseClient';

const TypewriterText = ({ words }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typeSpeed = isDeleting ? 60 : 200;
    
    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      } else {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);
    
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="text-gradient" style={{ position: 'relative' }}>
      {text}
      <span style={{ borderRight: '4px solid var(--color-primary)', animation: 'blink 1s step-end infinite', paddingRight: '2px', opacity: 0.8, marginLeft: '2px' }}></span>
    </span>
  );
};

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
          setRecentProducts((products || []).filter(p => ids.includes(p?.id)));
        }
      } else {
        try {
          const ids = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
          setRecentProducts((products || []).filter(p => ids.includes(p?.id)).slice(0, 4));
        } catch(e) {}
      }
    }
    if (products.length > 0) fetchRecent();
  }, [user, products]);

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
      image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=2000&auto=format&fit=crop',
      badge: 'Exclusive Gifts',
      title: <>Make Every Occasion <span style={{ color: 'var(--color-primary-light)' }}>Unforgettable</span></>,
      subtitle: 'Find the perfect customized present for birthdays, anniversaries, and corporate events.',
      primaryBtn: { text: 'Shop Gifts', link: '/products' },
      secondaryBtn: { text: 'View Collection', link: '/products' }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const safeProducts = products || [];
  const safeCategories = categories || [];

  const frame12x8 = useMemo(() => safeProducts.find(p => String(p?.name || '').toLowerCase().includes('12x8')), [safeProducts]);
  const featuredProducts = useMemo(() => {
    if (frame12x8) {
      return [frame12x8, ...safeProducts.filter(p => p?.id !== frame12x8.id).slice(0, 3)];
    }
    return safeProducts.slice(0, 4);
  }, [safeProducts, frame12x8]);
  const newArrivals = useMemo(() => safeProducts.slice(4, 8), [safeProducts]);

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

  return (
    <div>
      <SEO />
      {/* ─── TOP BANNER SLIDER ─── */}
      <section className="top-banner-slider" style={{
        position: 'relative',
        width: '100%',
        height: '35vh',
        minHeight: '250px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}>
        {slides.map((slide, index) => (
          <div key={index} style={{
            position: 'absolute', inset: 0,
            opacity: currentSlide === index ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            background: `url('${slide.image}') center/cover no-repeat`
          }} />
        ))}
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="btn-icon"
          style={{ 
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            background: 'rgba(255,255,255,0.7)', color: '#111', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          aria-label="Previous Slide"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={nextSlide}
          className="btn-icon"
          style={{ 
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            background: 'rgba(255,255,255,0.7)', color: '#111', width: '28px', height: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          aria-label="Next Slide"
        >
          <ChevronRight size={16} />
        </button>

        {/* Indicators */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          {slides.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── MAIN HERO TEXT ─── */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '1.5rem 0 4rem 0', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, var(--color-primary-light) 0%, transparent 40%), radial-gradient(circle at 20% 80%, #E0E7FF 0%, transparent 40%)', opacity: 0.6 }} />
        
        {/* Premium 3D Floating Icons */}
        <div className="anim-white-gift desktop-only" style={{ position: 'absolute', top: '10%', right: '12%', width: '140px', opacity: 0.8, zIndex: 10 }}>
          <img src="/Gift png 2.webp" alt="White Gift Box" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
        <div className="anim-red-gift hero-red-gift desktop-only" style={{ position: 'absolute', bottom: '15%', right: '22%', width: '120px', opacity: 0.85, animationDelay: '1s', zIndex: 10 }}>
          <img src="/GIft Png.png" alt="Red Gift Box" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
        
        {/* Mobile Specific Floating Gift */}
        <div className="anim-white-gift mobile-only-deco" style={{ position: 'absolute', top: '35%', right: '-5%', width: '140px', opacity: 0.9, zIndex: 1 }}>
          <img src="/Gift png 2.webp" alt="White Gift Box" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>

        <div className="anim-real-heart desktop-only" style={{ position: 'absolute', top: '35%', left: '8%', width: '80px', opacity: 0.6, animationDelay: '2s', zIndex: 1 }}>
          <img src="/Heart 1.png" alt="Red Heart" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain', transform: 'rotate(-45deg)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }}>
          
          <div className="hero-text-container" style={{ animation: 'heroFadeInUp 0.8s ease-out forwards', textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <Sparkles className="anim-sparkles-premium" size={16} /> Premium Personalized Gifts
            </div>
            
            <h1 className="h1 font-premium" style={{ color: 'var(--color-dark)', marginBottom: '1rem', lineHeight: 1.2 }}>
              Make Every Occasion <br className="desktop-only"/> <span className="mobile-space"> </span>
              <TypewriterText words={['Unforgettable', 'Special', 'Magical', 'Memorable', 'Beautiful']} />
            </h1>
            
            <p className="subtitle" style={{ marginBottom: '2rem', maxWidth: '480px' }}>
              High-quality personalized gifts, custom frames, and professional visiting cards crafted with perfection and delivered with love.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/products" className="btn btn-primary btn-ripple btn-arrow-slide btn-hover-lift" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9375rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                Explore Collection <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }} className="hero-trust-badges">
              <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
                <Star fill="#F59E0B" color="#F59E0B" size={16} className="hero-badge-icon" /> 10K+ Orders
              </div>
              <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
                <Truck color="var(--color-primary)" size={16} className="hero-badge-icon" /> Same Day Delivery
              </div>
              <div className="hero-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
                <Heart fill="var(--color-primary)" color="var(--color-primary)" size={16} className="hero-badge-icon" /> Premium Quality
              </div>
            </div>
          </div>

          <div className="desktop-only" style={{ position: 'relative', height: '550px' }}>
            <div className="hover-zoom-img glass-card" style={{ position: 'absolute', top: '20px', right: '0', width: '75%', height: '70%', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop" alt="Gift" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div className="hover-zoom-img glass-card" style={{ position: 'absolute', bottom: '60px', left: '0', width: '55%', height: '55%', borderRadius: 'var(--radius-xl)', overflow: 'hidden', zIndex: 2, border: '6px solid #fff' }}>
              <img src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800&auto=format&fit=crop" alt="Frames" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div>
            <h2 className="h2 font-premium">Shop by Category</h2>
            <p className="subtitle">Discover our wide range of personalized items.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/products" className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
              View All <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid-cols-4 mobile-carousel mobile-3-cards">
          {(() => {
            const dynamicCats = safeCategories.slice(0, 3).map((cat, i) => {
              const images = [
                'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', 
                'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=800&auto=format&fit=crop', 
                'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'  
              ];
              return { name: cat.name, slug: cat.slug, img: images[i % images.length], count: '150+ Designs' };
            });
            
            const displayCategories = [
              ...dynamicCats,
              { name: 'Visiting Cards', slug: 'visiting-cards', img: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=800&auto=format&fit=crop', count: '50+ Templates' } 
            ];

            return displayCategories.map((cat, i) => (
              <Link key={cat.name} to={`/category/${cat.slug || toSlug(cat.name)}`} className="hover-zoom-img hover-slide-arrow" style={{ 
                position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                aspectRatio: '4/5', display: 'flex', alignItems: 'flex-end', padding: '1.5rem',
                textDecoration: 'none', boxShadow: 'var(--shadow-md)'
              }}>
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'
                  }}
                  className="cat-img"
                />
                <div className="glass-overlay" style={{ position: 'absolute', inset: 0 }} />
                
                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <div className="count-badge" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '0.65rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {cat.count}
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.1 }}>{cat.name}</h3>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 600
                  }}>
                    <span className="explore-text">Explore</span>
                    <ArrowRight className="arrow-icon" size={16} color="#fff" />
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>
      </section>

      {/* ─── FEATURED COLLECTIONS ─── */}
      <section className="section container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="h2 font-premium">Featured Collections</h2>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Handpicked favorites just for you.</p>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid-cols-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={{...product, isFeatured: true}} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No products available at the moment.</p>
          </div>
        )}
      </section>

      {/* ─── BEST SELLERS ─── */}
      <section className="section container best-sellers-section" style={{ backgroundColor: 'var(--color-lavender)', borderRadius: 'var(--radius-xl)', position: 'relative' }}>
        <div className="anim-heart-balloon mobile-hidden-deco" style={{ position: 'absolute', top: '-40px', right: '5%', width: '110px', opacity: 0.6, zIndex: 1 }}>
          <img src="/Heart Ballon .png" alt="Heart Balloon" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
          <div>
            <h2 className="h2 font-premium">Best Sellers</h2>
            <p className="subtitle">Most loved items by our customers.</p>
          </div>
          <Link to="/products" className="btn btn-primary ripple desktop-only" style={{ borderRadius: 'var(--radius-full)' }}>
            Shop All <ArrowRight size={18} />
          </Link>
        </div>
        
        {newArrivals.length > 0 ? (
          <div className="grid-cols-4">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={{...product, isBestSeller: true}} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>More products coming soon.</p>
          </div>
        )}
      </section>

      {/* ─── WHY GIFT YOURS (3D ICONS) ─── */}
      <section className="features-section" style={{ backgroundColor: 'var(--color-dark)', padding: '5rem 0' }}>
        <div className="container features-header-container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 className="h2 font-premium" style={{ color: '#fff' }}>Why Gift Yours</h2>
          <p className="subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>The premium gifting experience you deserve.</p>
        </div>
        <div className="container grid-cols-4 features-container mobile-carousel">
          <div style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', textAlign: 'center', padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-xl)', transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#374151'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="feature-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}>
              <Truck size={28} strokeWidth={2} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>Same Day Delivery</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>Fast & secure packaging.</p>
          </div>
          
          <div style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', textAlign: 'center', padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-xl)', transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#374151'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="feature-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}>
              <Star size={28} strokeWidth={2} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>Premium Quality</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>Finest materials guaranteed.</p>
          </div>
          
          <div style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', textAlign: 'center', padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-xl)', transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#374151'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="feature-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}>
              <Gift size={28} strokeWidth={2} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>Personalized Gifts</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>Crafted just for you.</p>
          </div>
          
          <div style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', textAlign: 'center', padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-xl)', transition: 'all 0.3s ease', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = '#374151'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.boxShadow = 'none'; }}>
            <div className="feature-icon-wrap" style={{ width: 64, height: 64, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-primary)', borderRadius: '50%' }}>
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>Secure Payment</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', lineHeight: 1.5, margin: 0 }}>100% safe transactions.</p>
          </div>
        </div>
      </section>

      {/* ─── GIFT BY OCCASION (IMAGE CAROUSEL) ─── */}
      <section className="section" style={{ overflowX: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="h2 font-premium">Gift by Occasion</h2>
          <p className="subtitle">Find the perfect present for any special moment.</p>
        </div>
        
        {/* Continuous Looping Marquee */}
        <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
          <div className="marquee-container" style={{ gap: '1.5rem', paddingBottom: '2rem' }}>
            {[
              { name: 'Birthday', img: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=600&auto=format&fit=crop' },
              { name: 'Wedding', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
              { name: 'Anniversary', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop' },
              { name: 'Baby Shower', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop' },
              { name: 'Valentine', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop' },
              { name: 'House Warming', img: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=600&auto=format&fit=crop' },
              // Duplicate the array for seamless infinite looping
              { name: 'Birthday (2)', img: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=600&auto=format&fit=crop' },
              { name: 'Wedding (2)', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop' },
              { name: 'Anniversary (2)', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600&auto=format&fit=crop' },
              { name: 'Baby Shower (2)', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop' },
              { name: 'Valentine (2)', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop' },
              { name: 'House Warming (2)', img: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=600&auto=format&fit=crop' }
            ].map((occasion, i) => (
              <Link key={`${occasion.name}-${i}`} to={`/products`} className="hover-zoom-img marquee-item" style={{ 
                position: 'relative', borderRadius: 'var(--radius-xl)', 
                minWidth: '280px', height: '350px',
                textDecoration: 'none', overflow: 'hidden',
                boxShadow: 'var(--shadow-md)', flexShrink: 0
              }}>
                <img src={occasion.img} alt={occasion.name.replace(' (2)', '')} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)' }} />
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <h3 className="h3" style={{ color: '#fff', marginBottom: '0.5rem' }}>{occasion.name.replace(' (2)', '')}</h3>
                  <div className="explore-text" style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER REVIEWS (Testimonials) ─── */}
      <section className="section container" style={{ backgroundColor: 'var(--color-warm-gray)', borderRadius: 'var(--radius-xl)', padding: '4rem 2rem', position: 'relative' }}>
        <div className="anim-real-heart mobile-hidden-deco" style={{ position: 'absolute', bottom: '-5%', right: '10%', width: '90px', opacity: 0.7, zIndex: 1 }}>
          <img src="/Heart 1.png" alt="Red Heart" loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'contain', transform: 'rotate(15deg)' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 2 }}>
          <h2 className="h2 font-premium">Customer Reviews</h2>
          <p className="subtitle">Loved by thousands of happy customers.</p>
        </div>
        <div className="grid-cols-3 mobile-carousel reviews-carousel">
          {[
            { name: 'Karthik', city: 'Chennai', review: 'The frame quality exceeded my expectations. Beautiful packaging too!' },
            { name: 'Priya', city: 'Bangalore', review: 'Ordered a custom gift for my anniversary and my husband loved it.' },
            { name: 'Rahul', city: 'Mumbai', review: 'Fast delivery and premium finish. Best gifting site out there.' }
          ].map((r, i) => (
            <div key={i} className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', color: '#F59E0B' }}>
                <Star fill="#F59E0B" size={16} /><Star fill="#F59E0B" size={16} /><Star fill="#F59E0B" size={16} /><Star fill="#F59E0B" size={16} /><Star fill="#F59E0B" size={16} />
              </div>
              <Quote size={24} color="var(--color-border)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '1.5rem', fontStyle: 'italic' }}>"{r.review}"</p>
              <div style={{ fontWeight: 600, color: 'var(--color-dark)' }}>- {r.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{r.city}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INSTAGRAM GALLERY ─── */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
            <Camera size={20} /> <span style={{ fontWeight: 600 }}>@giftyours</span>
          </div>
          <h2 className="h2 font-premium">Follow us on Instagram</h2>
        </div>
        <div className="insta-grid-container" style={{ display: 'grid', gap: '1.5rem' }}>
          {[
            {
              id: 'DWiv0_ACdX7',
              link: 'https://www.instagram.com/p/DWiv0_ACdX7/'
            },
            {
              id: 'C-paPXuJWp6',
              link: 'https://www.instagram.com/p/C-paPXuJWp6/'
            },
            {
              id: 'DVYRE8RkrNy',
              link: 'https://www.instagram.com/p/DVYRE8RkrNy/'
            }
          ].map((reel, i) => (
            <div 
              key={i} 
              className="hover-zoom-img insta-card-container" 
              style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'block', background: '#000', position: 'relative' }}
            >
              <iframe 
                src={`${reel.link}embed/`}
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  pointerEvents: 'none'
                }}
                scrolling="no"
                allowtransparency="true"
              ></iframe>
              
              {/* Cover top header */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55px', background: '#000', zIndex: 5 }}></div>
              
              {/* Cover bottom footer */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65px', background: '#000', zIndex: 5 }}></div>
              
              {/* Invisible overlay link to intercept clicks and open Instagram */}
              <a 
                href={reel.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', transition: 'background 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
              >
                 <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                 </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="container section">
        <div style={{ backgroundColor: '#111827', color: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          {/* Decorative Background Glows */}
          <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)' }} />
          
          {/* Main Content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
              <Mail color="#fff" size={28} />
            </div>
            
            <h2 className="h2 font-premium" style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '2.5rem' }}>Get Exclusive Offers</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', fontSize: '1.125rem' }}>Join 5,000+ Customers receiving premium gifts and deals directly to their inbox.</p>
            
            {/* Unified Premium Form */}
            <form className="newsletter-form" style={{ display: 'flex', gap: '0', maxWidth: '450px', margin: '0 auto', backgroundColor: '#fff', borderRadius: 'var(--radius-full)', padding: '0.4rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }} onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email" required className="newsletter-input" style={{ flex: 1, border: 'none', background: 'transparent', padding: '1rem 1.5rem', color: '#111', outline: 'none', fontSize: '1rem', borderRadius: 'var(--radius-full)' }} />
              <button type="submit" className="btn btn-primary btn-hover-lift newsletter-btn" style={{ borderRadius: 'var(--radius-full)', padding: '1rem 2rem', fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .insta-grid-container {
          grid-template-columns: repeat(3, 1fr);
        }
        .insta-card-container {
          height: 480px;
        }

        @media (max-width: 768px) {
          .insta-grid-container {
            grid-template-columns: 1fr;
          }
          .insta-card-container {
            height: 400px;
          }
        }

        .mobile-only-deco {
          display: none;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
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
          
          /* Hero Trust Badges Mobile Fix */
          .hero-trust-badges {
            display: none !important;
          }
          
          /* Hide all decorative floats on mobile to prevent overlapping */
          .mobile-hidden-deco {
            display: none !important;
          }
          
          /* Show mobile only decorators */
          .mobile-only-deco {
            display: block !important;
          }
          
          /* Hero Floating Gift Mobile Adjust */
          .hero-red-gift {
            display: none !important;
          }
          
          /* Newsletter Form Mobile Layout */
          .newsletter-form {
            flex-direction: column !important;
            border-radius: var(--radius-xl) !important;
            padding: 0.5rem !important;
            gap: 0.5rem !important;
            background: rgba(255, 255, 255, 0.05) !important;
            box-shadow: none !important;
          }
          .newsletter-input {
            width: 100% !important;
            background: #fff !important;
            border-radius: var(--radius-xl) !important;
            padding: 0.8rem 1rem !important;
            font-size: 0.9rem !important;
          }
          .newsletter-btn {
            width: 100% !important;
            border-radius: var(--radius-xl) !important;
            padding: 0.8rem 1rem !important;
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
        
        /* Auto-scrolling Marquee */
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }

        .marquee-container:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
