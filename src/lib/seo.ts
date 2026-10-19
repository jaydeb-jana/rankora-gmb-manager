/**
 * SEO & Meta Tags Manager for Single Page Application
 * Updates document title, meta tags, OpenGraph, Twitter cards, canonical link,
 * and JSON-LD structured data dynamically for search engine bots (Googlebot, Bingbot, etc.).
 */

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'RANKORA — Google Business Profile Review Automation & Growth';
const DEFAULT_DESCRIPTION =
  'Supercharge your Google Maps 5-star reviews with RANKORA. Custom QR counter stands, instant AI review drafts powered by Gemini, automated owner replies, and multi-location local SEO.';
const DEFAULT_KEYWORDS =
  'Google Business Profile, Google Maps Ranking, Google Reviews Automation, GMB Review Generator, QR Stand Google Review, Gemini AI Review Reply, Local SEO Software, Reputation Management, 5 Star Reviews, Arventa Ventures';
const DEFAULT_IMAGE = '/google-qr-logo.png';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://rankora.arventaventures.online';

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function removeMetaTag(attrName: 'name' | 'property', attrValue: string) {
  const element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (element) {
    element.remove();
  }
}

export function updatePageSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
}: SeoProps) {
  // 1. Update Title
  const finalTitle = title ? `${title} | RANKORA` : DEFAULT_TITLE;
  document.title = finalTitle;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'author', 'Arventa Ventures');
  setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');

  // 3. OpenGraph Tags
  setMetaTag('property', 'og:title', finalTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:site_name', 'RANKORA');
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  setMetaTag('property', 'og:image', fullImageUrl);

  const fullUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  setMetaTag('property', 'og:url', fullUrl);

  // 4. Twitter Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', finalTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', fullImageUrl);

  // 5. Canonical Link Tag
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // 6. JSON-LD Dynamic Structured Data
  const existingJsonLd = document.getElementById('dynamic-json-ld');
  if (existingJsonLd) {
    existingJsonLd.remove();
  }

  if (structuredData) {
    const script = document.createElement('script');
    script.id = 'dynamic-json-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}
