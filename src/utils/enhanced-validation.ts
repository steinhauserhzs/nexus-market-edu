/**
 * Enhanced Input Validation and Sanitization Utilities
 * Provides comprehensive protection against XSS, injection attacks, and data validation
 */

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
  allowedCharacters?: RegExp;
  blockedPatterns?: RegExp[];
}

// Common dangerous patterns to detect and block
const DANGEROUS_PATTERNS = {
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /<form\b[^>]*>/gi
  ],
  SQL_INJECTION: [
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi,
    /--\s/g,
    /\/\*[\s\S]*?\*\//g,
    /;\s*(drop|delete|truncate|update|insert)/gi,
    /'[^']*'(\s*(union|or|and)\s+|\s*;)/gi
  ],
  COMMAND_INJECTION: [
    /\$\(.*\)/g,
    /`.*`/g,
    /\|\s*(rm|cat|ls|ps|kill|sudo|su|chmod|chown)/gi,
    /&&\s*(rm|cat|ls|ps|kill|sudo|su)/gi
  ],
  PATH_TRAVERSAL: [
    /\.\.[\/\\]/g,
    /[\/\\]\.\.[\/\\]/g,
    /(^|\s)\.\.$/g
  ]
};

// Comprehensive HTML entity encoding
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Enhanced input validation with comprehensive security checks
 */
export function validateAndSanitizeInput(
  input: string,
  type: 'text' | 'email' | 'search' | 'html' | 'url' | 'phone' | 'cpf' = 'text',
  rules: ValidationRule = {}
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    sanitized: '',
    warnings: [],
    risk_level: 'low'
  };

  // Handle null/undefined input
  if (!input || typeof input !== 'string') {
    result.isValid = rules.required !== false;
    result.sanitized = '';
    if (rules.required) {
      result.warnings.push('Input is required');
    }
    return result;
  }

  let sanitized = input.trim();
  const originalInput = sanitized;

  // Length validation
  if (rules.minLength && sanitized.length < rules.minLength) {
    result.isValid = false;
    result.warnings.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (rules.maxLength && sanitized.length > rules.maxLength) {
    result.isValid = false;
    result.warnings.push(`Maximum length is ${rules.maxLength} characters`);
    sanitized = sanitized.substring(0, rules.maxLength);
  }

  // Detect and assess security threats
  let threatLevel = 0;
  const threats: string[] = [];

  // Check for XSS patterns
  DANGEROUS_PATTERNS.XSS.forEach(pattern => {
    if (pattern.test(sanitized)) {
      threats.push('XSS');
      threatLevel += 3;
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // Check for SQL injection patterns
  DANGEROUS_PATTERNS.SQL_INJECTION.forEach(pattern => {
    if (pattern.test(sanitized)) {
      threats.push('SQL_INJECTION');
      threatLevel += 2;
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // Check for command injection patterns
  DANGEROUS_PATTERNS.COMMAND_INJECTION.forEach(pattern => {
    if (pattern.test(sanitized)) {
      threats.push('COMMAND_INJECTION');
      threatLevel += 3;
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // Check for path traversal patterns
  DANGEROUS_PATTERNS.PATH_TRAVERSAL.forEach(pattern => {
    if (pattern.test(sanitized)) {
      threats.push('PATH_TRAVERSAL');
      threatLevel += 2;
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // Set risk level based on threat assessment
  if (threatLevel >= 3) {
    result.risk_level = 'critical';
  } else if (threatLevel >= 2) {
    result.risk_level = 'high';
  } else if (threatLevel >= 1) {
    result.risk_level = 'medium';
  }

  if (threats.length > 0) {
    result.warnings.push(`Security threats detected: ${threats.join(', ')}`);
  }

  // Type-specific validation and sanitization
  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(sanitized, result);
      break;
    case 'search':
      sanitized = sanitizeSearch(sanitized, result);
      break;
    case 'html':
      sanitized = sanitizeHTML(sanitized, result);
      break;
    case 'url':
      sanitized = sanitizeURL(sanitized, result);
      break;
    case 'phone':
      sanitized = sanitizePhone(sanitized, result);
      break;
    case 'cpf':
      sanitized = sanitizeCPF(sanitized, result);
      break;
    default:
      sanitized = sanitizeText(sanitized, result);
  }

  // Apply custom validation rules
  if (rules.pattern && !rules.pattern.test(sanitized)) {
    result.isValid = false;
    result.warnings.push('Input does not match required pattern');
  }

  if (rules.allowedCharacters && !rules.allowedCharacters.test(sanitized)) {
    result.isValid = false;
    result.warnings.push('Input contains disallowed characters');
    // Remove disallowed characters
    sanitized = sanitized.replace(new RegExp(`[^${rules.allowedCharacters.source}]`, 'g'), '');
  }

  if (rules.blockedPatterns) {
    rules.blockedPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        result.warnings.push('Input contains blocked pattern');
        sanitized = sanitized.replace(pattern, '');
      }
    });
  }

  if (rules.customValidator && !rules.customValidator(sanitized)) {
    result.isValid = false;
    result.warnings.push('Custom validation failed');
  }

  // Final check: if input was significantly modified, flag as warning
  if (sanitized !== originalInput) {
    result.warnings.push('Input was sanitized for security');
  }

  result.sanitized = sanitized;
  return result;
}

function sanitizeEmail(input: string, result: ValidationResult): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Basic email format validation
  if (!emailRegex.test(input)) {
    result.isValid = false;
    result.warnings.push('Invalid email format');
  }

  // Remove any HTML entities or suspicious characters
  let sanitized = input.toLowerCase();
  sanitized = sanitized.replace(/[<>()[\]\\,;:\s@"]/g, match => {
    if (match === '@') return '@'; // Keep @ symbol
    if (match === '.') return '.'; // Keep dots
    return ''; // Remove other suspicious characters
  });

  return sanitized;
}

function sanitizeSearch(input: string, result: ValidationResult): string {
  let sanitized = input;

  // Remove SQL keywords and operators
  const sqlKeywords = /(union|select|insert|update|delete|drop|create|alter|exec|or|and)\s/gi;
  if (sqlKeywords.test(sanitized)) {
    result.warnings.push('SQL keywords removed from search');
    sanitized = sanitized.replace(sqlKeywords, '');
  }

  // Remove SQL comment patterns
  sanitized = sanitized.replace(/(--|\*\/|\/\*|;)/g, '');

  // Limit special characters in search
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');

  return sanitized.substring(0, 200); // Limit search length
}

function sanitizeHTML(input: string, result: ValidationResult): string {
  // For HTML content, we need to be more careful
  // This is a basic sanitizer - for production, consider using a library like DOMPurify
  
  let sanitized = input;

  // Remove dangerous tags completely
  const dangerousTags = /<(script|iframe|object|embed|form|input|textarea|button)[^>]*>.*?<\/\1>/gi;
  sanitized = sanitized.replace(dangerousTags, '');

  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s(on\w+|javascript:|vbscript:|data:)\s*=\s*["'][^"']*["']/gi, '');

  // Encode remaining HTML entities
  sanitized = sanitized.replace(/[&<>"'`=\/]/g, match => HTML_ENTITIES[match] || match);

  if (sanitized !== input) {
    result.warnings.push('Dangerous HTML content removed');
  }

  return sanitized;
}

function sanitizeURL(input: string, result: ValidationResult): string {
  try {
    const url = new URL(input);
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(url.protocol)) {
      result.isValid = false;
      result.warnings.push('Unsafe URL protocol');
      return '';
    }

    return url.toString();
  } catch {
    result.isValid = false;
    result.warnings.push('Invalid URL format');
    return '';
  }
}

function sanitizePhone(input: string, result: ValidationResult): string {
  // Remove all non-numeric characters except + and spaces
  let sanitized = input.replace(/[^\d+\s()-]/g, '');
  
  // Basic Brazilian phone validation
  const numbersOnly = sanitized.replace(/[^\d]/g, '');
  if (numbersOnly.length < 10 || numbersOnly.length > 11) {
    result.warnings.push('Invalid phone number length');
  }

  return sanitized;
}

function sanitizeCPF(input: string, result: ValidationResult): string {
  // Remove all non-numeric characters
  let sanitized = input.replace(/[^\d]/g, '');
  
  // CPF should have exactly 11 digits
  if (sanitized.length !== 11) {
    result.warnings.push('CPF must have 11 digits');
    result.isValid = false;
  }

  // Basic CPF validation (can be enhanced with full algorithm)
  if (/^(\d)\1{10}$/.test(sanitized)) {
    result.warnings.push('Invalid CPF format');
    result.isValid = false;
  }

  return sanitized;
}

function sanitizeText(input: string, result: ValidationResult): string {
  // Basic text sanitization
  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove invisible characters (except normal whitespace)
  sanitized = sanitized.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * Specialized validator for financial data
 */
export function validateFinancialInput(input: string, currency = 'BRL'): ValidationResult {
  const rules: ValidationRule = {
    pattern: /^\d+(\.\d{1,2})?$/,
    maxLength: 12,
    allowedCharacters: /[\d.]/
  };

  const result = validateAndSanitizeInput(input, 'text', rules);
  
  // Additional financial validation
  const numValue = parseFloat(result.sanitized);
  if (isNaN(numValue) || numValue < 0) {
    result.isValid = false;
    result.warnings.push('Invalid financial amount');
  }

  if (numValue > 999999.99) {
    result.warnings.push('Amount seems unusually large');
    result.risk_level = 'medium';
  }

  return result;
}

/**
 * Rate limiting key generator based on input characteristics
 */
export function generateRateLimitKey(input: string, action: string): string {
  // Create a key that can detect potential abuse patterns
  const inputHash = btoa(input.substring(0, 10)).substring(0, 8);
  return `${action}_${inputHash}`;
}