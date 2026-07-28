import React, { useState } from 'react';
import SEO from '../../components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const [open, setOpen] = useState(0);

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping usually takes 5-7 business days. Express shipping is available for select items taking 2-3 business days."
    },
    {
      q: "Can I return a personalized item?",
      a: "Since personalized items are made specifically for you, they cannot be returned unless they arrive damaged or defective. Please contact our support if there's an issue with your order."
    },
    {
      q: "Do you offer bulk discounts for corporate gifts?",
      a: "Yes! We offer special pricing for bulk and corporate orders. Please reach out to us via the Contact page or WhatsApp us directly."
    },
    {
      q: "How can I track my order?",
      a: "Once your order is shipped, you will receive a tracking link via email and SMS. You can also view the status in the 'Orders' section of your profile."
    }
  ];

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <SEO title="FAQ" description="Frequently asked questions about shipping, returns, and ordering from Gift Yours." url="/faq" />
      
      <section style={{ backgroundColor: 'var(--color-bg-alt)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 className="h1" style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h1>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Find answers to common questions about our products and services.</p>
        </div>
      </section>

      <section className="section container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              <button 
                style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{faq.q}</h3>
                {open === i ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
