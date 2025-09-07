import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityLogger } from '@/hooks/use-security';
import { generateCSPHeader } from '@/utils/security';

interface EnhancedSecurityContextType {
  logSecurityEvent: (action: string, details?: Record<string, any>, severity?: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  reportViolation: (violation: SecurityPolicyViolation) => void;
}

const EnhancedSecurityContext = createContext<EnhancedSecurityContextType | null>(null);

export const useEnhancedSecurity = () => {
  const context = useContext(EnhancedSecurityContext);
  if (!context) {
    throw new Error('useEnhancedSecurity must be used within EnhancedSecurityProvider');
  }
  return context;
};

interface EnhancedSecurityProviderProps {
  children: ReactNode;
}

export const EnhancedSecurityProvider: React.FC<EnhancedSecurityProviderProps> = ({ children }) => {
  const { logEvent } = useSecurityLogger();

  useEffect(() => {
    // Enhanced security headers setup
    const setupEnhancedSecurity = () => {
      // Enhanced Content Security Policy
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!existingCSP) {
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = generateEnhancedCSPHeader();
        document.head.appendChild(cspMeta);
      }

      // Additional security headers
      const securityHeaders = [
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
        { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { httpEquiv: 'Cross-Origin-Embedder-Policy', content: 'require-corp' },
        { httpEquiv: 'Cross-Origin-Opener-Policy', content: 'same-origin' },
        { httpEquiv: 'Cross-Origin-Resource-Policy', content: 'same-origin' }
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

    setupEnhancedSecurity();

    // CSP Violation Reporting
    const handleCSPViolation = (event: SecurityPolicyViolationEvent) => {
      logEvent('csp_violation', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        statusCode: event.statusCode
      }, 'high');
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Enhanced monitoring
    const monitorSecurityEvents = () => {
      // Monitor for suspicious DOM manipulations
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for inline scripts
              if (element.tagName === 'SCRIPT' && element.textContent) {
                logEvent('inline_script_detected', {
                  content: element.textContent.substring(0, 100),
                  location: window.location.pathname
                }, 'critical');
              }
              
              // Check for suspicious iframe sources
              if (element.tagName === 'IFRAME') {
                const src = element.getAttribute('src');
                if (src && !isAllowedIframeSource(src)) {
                  logEvent('suspicious_iframe_detected', {
                    src,
                    location: window.location.pathname
                  }, 'high');
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    const observer = monitorSecurityEvents();

    // Monitor for clickjacking attempts
    const detectClickjacking = () => {
      if (window.top !== window.self) {
        try {
          // Try to access parent location (will throw if cross-origin)
          const parentHost = window.parent.location.hostname;
          
          // If we can access it, check if it's allowed
          const allowedParents = ['localhost', 'lovable.app'];
          const isAllowed = allowedParents.some(allowed => 
            parentHost === allowed || parentHost.endsWith(`.${allowed}`)
          );
          
          if (!isAllowed) {
            logEvent('potential_clickjacking', {
              parentHost,
              currentLocation: window.location.pathname
            }, 'critical');
          }
        } catch (e) {
          // Cross-origin parent - log as suspicious
          logEvent('cross_origin_frame', {
            referrer: document.referrer,
            currentLocation: window.location.pathname
          }, 'medium');
        }
      }
    };

    detectClickjacking();

    // Monitor console access patterns
    let consoleAccessCount = 0;
    const originalLog = console.log;
    console.log = function(...args) {
      consoleAccessCount++;
      if (consoleAccessCount > 10) {
        logEvent('excessive_console_access', {
          count: consoleAccessCount,
          location: window.location.pathname
        }, 'low');
      }
      return originalLog.apply(this, args);
    };

    // Monitor for rapid-fire requests (potential bot behavior)
    let requestCount = 0;
    const requestTimes: number[] = [];
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      requestCount++;
      const now = Date.now();
      requestTimes.push(now);
      
      // Remove requests older than 1 minute
      const oneMinuteAgo = now - 60000;
      while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
        requestTimes.shift();
      }
      
      // Check for suspicious request patterns
      if (requestTimes.length > 30) { // More than 30 requests per minute
        logEvent('suspicious_request_pattern', {
          requestCount: requestTimes.length,
          timeWindow: '1 minute',
          location: window.location.pathname
        }, 'medium');
      }
      
      return originalFetch.apply(this, args);
    };

    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
      observer.disconnect();
      console.log = originalLog;
      window.fetch = originalFetch;
    };
  }, [logEvent]);

  const reportViolation = (violation: SecurityPolicyViolation) => {
    logEvent('security_violation_reported', {
      type: violation.type || 'unknown',
      message: violation.message || 'No message',
      filename: violation.filename || 'unknown',
      lineno: violation.lineno || 0,
      colno: violation.colno || 0
    }, 'high');
  };

  const contextValue: EnhancedSecurityContextType = {
    logSecurityEvent: logEvent,
    reportViolation
  };

  return (
    <EnhancedSecurityContext.Provider value={contextValue}>
      {children}
    </EnhancedSecurityContext.Provider>
  );
};

/**
 * Generate enhanced CSP header with stricter policies
 */
function generateEnhancedCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://www.youtube.com https://player.vimeo.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://ipify.org wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    "report-uri /api/csp-report"
  ].join('; ');
}

/**
 * Check if iframe source is allowed
 */
function isAllowedIframeSource(src: string): boolean {
  const allowedSources = [
    'https://js.stripe.com',
    'https://www.youtube.com',
    'https://player.vimeo.com',
    'https://drive.google.com',
    'https://docs.google.com'
  ];
  
  return allowedSources.some(allowed => src.startsWith(allowed));
}

// Type definition for SecurityPolicyViolation
interface SecurityPolicyViolation {
  type?: string;
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}