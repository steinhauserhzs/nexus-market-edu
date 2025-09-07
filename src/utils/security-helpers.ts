/**
 * Security helper functions for common security operations
 */

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates if a string contains only safe characters for filenames
 */
export function isSafeFilename(filename: string): boolean {
  const unsafeChars = /[<>:"/\\|?*\x00-\x1f]/;
  return !unsafeChars.test(filename);
}

/**
 * Removes or replaces unsafe characters from a string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates email format with additional security checks
 */
export function isValidSecureEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) return false;
  
  // Additional security checks
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /<|>/,
    /\.\./
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(email));
}

/**
 * Checks if a URL is from a known safe domain
 */
export function isSafeDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const safeDomains = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'drive.google.com',
      'docs.google.com',
      'dropbox.com',
      'github.com',
      'gitlab.com'
    ];
    
    return safeDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const keyAttempts = this.attempts.get(key)!;
    
    // Remove old attempts outside the window
    const recentAttempts = keyAttempts.filter(time => time > windowStart);
    this.attempts.set(key, recentAttempts);
    
    // Check if under limit
    if (recentAttempts.length < maxAttempts) {
      recentAttempts.push(now);
      return true;
    }
    
    return false;
  }
  
  getRemainingAttempts(key: string, maxAttempts: number, windowMs: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.attempts.has(key)) {
      return maxAttempts;
    }
    
    const recentAttempts = this.attempts.get(key)!
      .filter(time => time > windowStart);
    
    return Math.max(0, maxAttempts - recentAttempts.length);
  }
}

/**
 * Content Security Policy helper
 */
export function generateSecureCSP(): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      "'unsafe-eval'", // Needed for some frameworks
      "https://js.stripe.com",
      "https://maps.googleapis.com"
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", // Needed for Tailwind and dynamic styles
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'", 
      "data:", 
      "https:", 
      "blob:"
    ],
    'font-src': [
      "'self'", 
      "https://fonts.gstatic.com"
    ],
    'connect-src': [
      "'self'", 
      "https://*.supabase.co", 
      "https://api.stripe.com",
      "wss://*.supabase.co"
    ],
    'frame-src': [
      "'self'", 
      "https://js.stripe.com",
      "https://www.youtube.com",
      "https://player.vimeo.com"
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'block-all-mixed-content': []
  };

  return Object.entries(directives)
    .map(([directive, sources]) => 
      sources.length > 0 ? `${directive} ${sources.join(' ')}` : directive
    )
    .join('; ');
}