import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: string;
}

/**
 * Enhanced input validation with comprehensive security checks
 * Note: This is the legacy function - use validateAndSanitizeInput from enhanced-validation.ts for new code
 */
export function validateInput(input: string, type: 'text' | 'email' | 'search' | 'html' = 'text'): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    sanitized: input,
    warnings: []
  };

  if (!input || typeof input !== 'string') {
    result.isValid = false;
    result.warnings.push('Invalid input');
    return result;
  }

  let sanitized = input.trim();

  // Enhanced XSS protection
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi
  ];

  let hasXss = false;
  xssPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      hasXss = true;
      sanitized = sanitized.replace(pattern, '');
    }
  });

  if (hasXss) {
    result.warnings.push('Potentially dangerous XSS content removed');
  }

  // Enhanced SQL injection protection
  if (type === 'search' || type === 'text') {
    const sqlPatterns = [
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi,
      /--\s/g,
      /\/\*[\s\S]*?\*\//g,
      /;\s*(drop|delete|truncate|update|insert)/gi
    ];

    let hasSql = false;
    sqlPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        hasSql = true;
        sanitized = sanitized.replace(pattern, '');
      }
    });

    if (hasSql) {
      result.warnings.push('SQL injection patterns detected and removed');
    }
  }

  // Email validation
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      result.isValid = false;
      result.warnings.push('Invalid email format');
    }
  }

  // Length validation with stricter limits
  const maxLengths = {
    text: 1000,
    email: 254,
    search: 200,
    html: 5000 // Reduced from 10000 for security
  };

  if (sanitized.length > maxLengths[type]) {
    result.isValid = false;
    result.warnings.push(`Text too long (max ${maxLengths[type]} characters)`);
    sanitized = sanitized.substring(0, maxLengths[type]);
  }

  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  result.sanitized = sanitized;
  return result;
}

/**
 * Validates input using the server-side security utils
 */
export async function validateInputServer(input: string, type: string = 'text'): Promise<ValidationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('security-utils', {
      body: {
        action: 'validate_input',
        input,
        type
      }
    });

    if (error) {
      console.error('Server validation error:', error);
      // Fallback to client-side validation
      return validateInput(input, type as any);
    }

    return data;
  } catch (error) {
    console.error('Server validation failed:', error);
    // Fallback to client-side validation
    return validateInput(input, type as any);
  }
}

/**
 * Check rate limiting for a specific action
 */
export async function checkRateLimit(
  action: string, 
  identifier?: string,
  limit?: number,
  window?: number
): Promise<RateLimitResult> {
  try {
    // Use user ID if available, otherwise use a client identifier
    const rateLimitId = identifier || getCurrentIdentifier();

    const { data, error } = await supabase.functions.invoke('security-utils', {
      body: {
        action: 'rate_limit_check',
        rateLimitAction: action,
        identifier: rateLimitId,
        limit,
        window
      }
    });

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow the action if we can't check rate limits
      return { allowed: true, remaining: limit || 5 };
    }

    return data;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open
    return { allowed: true, remaining: limit || 5 };
  }
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  action: string,
  details?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('security-utils', {
      body: {
        action: 'security_log',
        logAction: action,
        details,
        severity,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      }
    });

    if (error) {
      console.error('Security logging error:', error);
    }
  } catch (error) {
    console.error('Security logging failed:', error);
  }
}

/**
 * Get a client identifier for rate limiting
 */
function getCurrentIdentifier(): string {
  // Try to get user ID from Supabase auth
  const user = supabase.auth.getUser();
  if (user) {
    return `user_${user}`;
  }

  // Fallback to a session-based identifier
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('session_id', sessionId);
  }
  
  return `session_${sessionId}`;
}

/**
 * Generate a session identifier
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get client IP address (best effort)
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    // This is a best effort attempt - in production you'd want to handle this server-side
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not determine client IP:', error);
    return undefined;
  }
}

/**
 * Sanitize HTML content for safe display
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate CPF format
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

/**
 * Validate Brazilian phone number
 */
export function validateBrazilianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  if (cleanPhone.length === 11) {
    // Mobile number should start with 9
    if (cleanPhone[2] !== '9') return false;
  }
  
  return true;
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://ipify.org",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
}