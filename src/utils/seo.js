// src/utils/seo.js

/**
 * Dynamically updates head metadata for programmatic SEO.
 */
export function updateMetaTags({ title, description, keywords, canonicalUrl, robots }) {
  if (title) {
    document.title = title;
  }

  // Update Meta Description
  if (description) {
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);
  }

  // Update Meta Keywords
  if (keywords) {
    let keyMeta = document.querySelector('meta[name="keywords"]');
    if (!keyMeta) {
      keyMeta = document.createElement('meta');
      keyMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keyMeta);
    }
    keyMeta.setAttribute('content', keywords);
  }

  // Update Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const resolvedCanonical = canonicalUrl || `${window.location.origin}${window.location.pathname}`;
  const officialCanonical = resolvedCanonical.replace(
    /https?:\/\/(localhost:\d+|www\.|[a-zA-Z0-9-]+\.vercel\.app)/i,
    'https://prepforceai.online'
  );
  canonicalLink.setAttribute('href', officialCanonical);

  // Update Robots Tag
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement('meta');
    robotsMeta.setAttribute('name', 'robots');
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.setAttribute('content', robots || 'index, follow');

  // Helper to set properties/names for social metadata
  const setMetaTag = (attrName, attrValue, contentValue) => {
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', contentValue);
  };

  // Set Open Graph Tags
  setMetaTag('property', 'og:title', title || document.title);
  setMetaTag('property', 'og:description', description || '');
  setMetaTag('property', 'og:url', officialCanonical);
  setMetaTag('property', 'og:type', 'website');
  
  const logoUrl = 'https://prepforceai.online/logo.png';
  setMetaTag('property', 'og:image', logoUrl);

  // Set Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title || document.title);
  setMetaTag('name', 'twitter:description', description || '');
  setMetaTag('name', 'twitter:image', logoUrl);
}

/**
 * Dynamically injects structured JSON-LD schemas.
 */
export function injectJsonLdSchema(schemaObj) {
  if (!schemaObj) return;

  // Remove any existing dynamic schemas
  const existing = document.getElementById('dynamic-seo-schema');
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.id = 'dynamic-seo-schema';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schemaObj);
  document.body.appendChild(script);
}
