import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = `${title} | Nexus Market EDU`;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      let selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, 'og:title');
    updateMetaTag('og:description', description, 'og:description');
    updateMetaTag('og:type', type, 'og:type');
    
    if (url) updateMetaTag('og:url', url, 'og:url');
    if (image) updateMetaTag('og:image', image, 'og:image');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'twitter:card');
    updateMetaTag('twitter:title', title, 'twitter:title');
    updateMetaTag('twitter:description', description, 'twitter:description');
    if (image) updateMetaTag('twitter:image', image, 'twitter:image');

  }, [title, description, keywords, image, url, type]);

  return null;
}