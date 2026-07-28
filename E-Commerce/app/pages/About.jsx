import React from 'react';
import SEO from '../../components/SEO';

export default function About() {
  return (
    <div className="page" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO 
        title="About Us" 
        description="Learn about the story behind Gift Yours and our mission to provide premium personalized gifts." 
        url="/about"
      />
      
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--color-bg-alt)', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="h1" style={{ marginBottom: '1rem' }}>Our Story</h1>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            We started with a simple mission: to preserve memories through high-quality, beautifully crafted personalized gifts.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Why Choose Gift Yours?</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            Gift Yours is more than just a store; it’s a commitment to quality. Every frame, every mug, and every gift we produce is crafted with care and precision. We believe that gifts are an extension of the emotions you want to convey, which is why we never compromise on the materials or the final finish.
          </p>

          <div className="grid-cols-2" style={{ marginTop: '3rem', gap: '2rem' }}>
            <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="h3" style={{ marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>To deliver premium personalized products that exceed expectations and bring joy to every occasion.</p>
            </div>
            <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 className="h3" style={{ marginBottom: '1rem' }}>Our Vision</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>To be India's leading platform for thoughtful gifting, blending technology with craftsmanship.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
