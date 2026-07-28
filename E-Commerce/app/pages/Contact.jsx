import React from 'react';
import SEO from '../../components/SEO';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useEcom } from '../EcomContext';

export default function Contact() {
  const { settings } = useEcom();
  const phone = settings?.contactPhone || '+91 98765 43210';
  const email = settings?.contactEmail || 'support@giftyours.com';
  const whatsapp = settings?.contactWhatsapp || '+91 98765 43210';
  const address = settings?.businessAddress || '123 Gift Street, T Nagar, Chennai, Tamil Nadu 600017';

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO title="Contact Us" description="Get in touch with Gift Yours for any queries, bulk orders, or support." url="/contact" />
      
      <section style={{ backgroundColor: 'var(--color-bg-alt)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="h1" style={{ marginBottom: '1rem' }}>Contact Us</h1>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>We’d love to hear from you. Get in touch with our team.</p>
        </div>
      </section>

      <section className="section container">
        <div className="grid-cols-2" style={{ gap: '3rem' }}>
          <div>
            <h2 className="h2" style={{ marginBottom: '2rem' }}>Get in Touch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <MapPin className="text-primary-color" size={24} />
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Our Office</h4>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{address}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Phone className="text-primary-color" size={24} />
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Phone</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>{phone}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Mail className="text-primary-color" size={24} />
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email</h4>
                  <p style={{ color: 'var(--color-text-muted)' }}>{email}</p>
                </div>
              </div>
            </div>

            <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

            <button className="btn btn-success" style={{ width: '100%', padding: '1rem' }} onClick={handleWhatsApp}>
              <MessageCircle size={20} /> Chat with us on WhatsApp
            </button>
          </div>

          <div style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <h3 className="h3" style={{ marginBottom: '1.5rem' }}>Send a Message</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input" placeholder="Your Name" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" required />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" placeholder="How can we help?" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem' }}>Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
