import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SecurityHeadersProps {
  cspDirectives?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
  };
}

export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({ 
  cspDirectives = {} 
}) => {
  // Default secure CSP directives
  const defaultDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'", 
      "'unsafe-eval'", // Required for Vite
      "https://js.stripe.com",
      "https://maps.googleapis.com",
      "https://www.google.com",
      "https://www.gstatic.com"
    ],
    styleSrc: [
      "'self'", 
      "'unsafe-inline'", // Required for dynamic styles
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'", 
      "data:", 
      "https:", 
      "blob:",
      "https://*.supabase.co"
    ],
    fontSrc: [
      "'self'", 
      "https://fonts.gstatic.com"
    ],
    connectSrc: [
      "'self'", 
      "https://*.supabase.co",
      "https://api.stripe.com",
      "https://ipify.org",
      "wss://*.supabase.co"
    ],
    frameSrc: [
      "'self'", 
      "https://js.stripe.com"
    ],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", "https://*.supabase.co"],
    ...cspDirectives
  };

  // Build CSP string
  const csp = Object.entries(defaultDirectives)
    .map(([directive, sources]) => {
      const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directiveName} ${sources.join(' ')}`;
    })
    .join('; ');

  useEffect(() => {
    // Set additional security headers via JavaScript
    // Note: Some headers can only be set by the server, but we can set meta tags for CSP
    
    // Add referrer policy
    const existingReferrer = document.querySelector('meta[name="referrer"]');
    if (!existingReferrer) {
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerMeta);
    }

    // Add viewport security
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (!existingViewport) {
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
      document.head.appendChild(viewportMeta);
    }

    // Prevent MIME type sniffing
    const existingContentType = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!existingContentType) {
      const contentTypeMeta = document.createElement('meta');
      contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
      contentTypeMeta.content = 'nosniff';
      document.head.appendChild(contentTypeMeta);
    }

    // Add permissions policy
    const existingPermissions = document.querySelector('meta[http-equiv="Permissions-Policy"]');
    if (!existingPermissions) {
      const permissionsMeta = document.createElement('meta');
      permissionsMeta.httpEquiv = 'Permissions-Policy';
      permissionsMeta.content = 'camera=(), microphone=(), geolocation=(), payment=()';
      document.head.appendChild(permissionsMeta);
    }

    // Only add X-Frame-Options if not in iframe (for Lovable compatibility)
    if (window.top === window) {
      const existingFrameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (!existingFrameOptions) {
        const frameOptionsMeta = document.createElement('meta');
        frameOptionsMeta.httpEquiv = 'X-Frame-Options';
        frameOptionsMeta.content = 'SAMEORIGIN';
        document.head.appendChild(frameOptionsMeta);
      }
    }
  }, []);

  return (
    <Helmet>
      {/* Content Security Policy */}
      <meta httpEquiv="Content-Security-Policy" content={csp} />
      
      {/* Additional security headers via meta tags */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()" />
      
      {/* Only add X-Frame-Options if not in iframe */}
      {window.top === window && (
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      )}
      
      {/* DNS prefetch for trusted domains */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
};