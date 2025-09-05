import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityLogger } from '@/hooks/use-security';
import { generateCSPHeader } from '@/utils/security';

interface SecurityContextType {
  logSecurityEvent: (action: string, details?: Record<string, any>, severity?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { logEvent } = useSecurityLogger();

  useEffect(() => {
    // Set up security headers
    const setupSecurityHeaders = () => {
      // Add Content Security Policy via meta tag
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!existingCSP) {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = generateCSPHeader();
        document.head.appendChild(cspMeta);
      }

      // Add X-Frame-Options protection (except for Lovable iframe)
      if (window.top === window) {
        const xFrameMeta = document.createElement('meta');
        xFrameMeta.httpEquiv = 'X-Frame-Options';
        xFrameMeta.content = 'SAMEORIGIN';
        document.head.appendChild(xFrameMeta);
      }

      // Add other security headers via meta tags
      const securityHeaders = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
      ];

      securityHeaders.forEach(header => {
        const existing = document.querySelector(`meta[http-equiv="${header.httpEquiv}"]`);
        if (!existing) {
          const meta = document.createElement('meta');
          meta.httpEquiv = header.httpEquiv;
          meta.content = header.content;
          document.head.appendChild(meta);
        }
      });
    };

    setupSecurityHeaders();

    // Log page view
    logEvent('page_view', {
      url: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    }, 'low');

    // Set up security event listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('page_hidden', { url: window.location.pathname }, 'low');
      } else {
        logEvent('page_visible', { url: window.location.pathname }, 'low');
      }
    };

    const handleBeforeUnload = () => {
      logEvent('page_unload', { url: window.location.pathname }, 'low');
    };

    // Detect potential clickjacking
    const detectClickjacking = () => {
      if (window.top !== window.self) {
        // Avoid cross-origin access to parent.location
        let parentHost = 'unknown';
        try {
          parentHost = document.referrer ? new URL(document.referrer).hostname : 'unknown';
        } catch (e) {
          parentHost = 'unknown';
        }
        logEvent('potential_clickjacking', {
          url: window.location.pathname,
          parent: parentHost,
          inIframe: true,
        }, 'high');
      }
    };

    // Monitor for console access (developer tools)
    let devtools = { open: false };
    setInterval(() => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          logEvent('devtools_opened', {
            url: window.location.pathname
          }, 'low');
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check for potential threats on mount
    detectClickjacking();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [logEvent]);

  const contextValue: SecurityContextType = {
    logSecurityEvent: logEvent
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};