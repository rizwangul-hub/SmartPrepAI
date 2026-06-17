// src/utils/seo.js

/**
 * Dynamically updates head metadata for programmatic SEO.
 */
export function updateMetaTags({ title, description, keywords, canonicalUrl }) {
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
  if (canonicalUrl) {
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }
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
