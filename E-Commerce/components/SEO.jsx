import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useEcom } from '../app/EcomContext';

export default function SEO({ title, description, image, url, type = 'website', schema }) {
  const { settings } = useEcom();
  const brandName = settings?.businessName || 'Gift Yours';
  const fullTitle = title ? `${title} | ${brandName}` : brandName;
  const defaultDesc = settings?.tagline || 'Premium personalized gifts, frames, and more.';
  const metaDesc = description || defaultDesc;
  const metaImage = image || '/logo.png'; // Fallback to logo
  const siteUrl = 'https://giftyours.com'; // Replace with actual domain later
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={brandName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
