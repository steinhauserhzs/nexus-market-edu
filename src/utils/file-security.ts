import { validateAndSanitizeInput } from './enhanced-validation';
import { logSecurityEvent } from './security';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedName: string;
}

export interface URLValidationResult {
  isValid: boolean;
  isSafe: boolean;
  sanitizedUrl: string;
  warnings: string[];
}

// Allowed MIME types with strict whitelist approach
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  documents: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg'
  ],
  archives: [
    'application/zip',
    'application/x-rar-compressed'
  ]
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  archive: 100 * 1024 * 1024, // 100MB
  default: 50 * 1024 * 1024 // 50MB default
};

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.js', '.jar', '.vbs', '.wsf', '.wsh', '.ps1',
  '.msi', '.dll', '.dmg', '.pkg', '.deb', '.rpm'
];

// Known malicious domains and patterns
const MALICIOUS_PATTERNS = [
  /bit\.ly/i,
  /tinyurl/i,
  /(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/,
  /localhost/i,
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
  /@/g, // Suspicious @ in URLs
];

/**
 * Validates file security before upload
 */
export function validateFileBeforeUpload(file: File): FileValidationResult {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    sanitizedName: file.name
  };

  // Validate file name
  const nameValidation = validateAndSanitizeInput(file.name, 'text');
  if (!nameValidation.isValid) {
    result.errors.push('Invalid file name');
    result.isValid = false;
  }
  if (nameValidation.warnings.length > 0) {
    result.warnings.push(...nameValidation.warnings);
  }
  result.sanitizedName = nameValidation.sanitized;

  // Check for dangerous extensions
  const extension = getFileExtension(file.name).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    result.errors.push(`File type ${extension} is not allowed for security reasons`);
    result.isValid = false;
    logSecurityEvent('dangerous_file_upload_attempt', {
      fileName: file.name,
      extension,
      mimeType: file.type
    }, 'high');
  }

  // Validate MIME type
  if (!isAllowedMimeType(file.type)) {
    result.errors.push(`File type ${file.type} is not allowed`);
    result.isValid = false;
  }

  // Validate file size
  const sizeLimit = getFileSizeLimit(file.type);
  if (file.size > sizeLimit) {
    result.errors.push(`File size exceeds limit (${formatFileSize(sizeLimit)})`);
    result.isValid = false;
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /script/i,
    /malware/i,
    /virus/i,
    /trojan/i,
    /\.exe\./i,
    /\.scr\./i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    result.warnings.push('File name contains suspicious patterns');
    logSecurityEvent('suspicious_filename', {
      fileName: file.name,
      mimeType: file.type
    }, 'medium');
  }

  return result;
}

/**
 * Validates external URLs for safety
 */
export function validateExternalURL(url: string): URLValidationResult {
  const result: URLValidationResult = {
    isValid: true,
    isSafe: true,
    sanitizedUrl: url.trim(),
    warnings: []
  };

  if (!url || typeof url !== 'string') {
    result.isValid = false;
    result.isSafe = false;
    return result;
  }

  // Basic URL format validation
  try {
    const urlObj = new URL(url);
    result.sanitizedUrl = urlObj.href;

    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.isValid = false;
      result.isSafe = false;
      result.warnings.push('Only HTTP and HTTPS protocols are allowed');
      return result;
    }

    // Check for malicious patterns
    const hostname = urlObj.hostname.toLowerCase();
    const fullUrl = urlObj.href.toLowerCase();

    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(fullUrl)) {
        result.isSafe = false;
        result.warnings.push('URL contains suspicious patterns');
        logSecurityEvent('suspicious_url_submitted', {
          url: url,
          pattern: pattern.toString()
        }, 'medium');
        break;
      }
    }

    // Check for known safe domains
    const safeDomains = [
      'youtube.com',
      'youtu.be', 
      'vimeo.com',
      'drive.google.com',
      'docs.google.com',
      'dropbox.com',
      'github.com'
    ];

    const isSafeDomain = safeDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isSafeDomain) {
      result.warnings.push('URL is from an unverified domain');
    }

  } catch (error) {
    result.isValid = false;
    result.isSafe = false;
    result.warnings.push('Invalid URL format');
  }

  return result;
}

/**
 * Sanitizes file name for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  const validation = validateAndSanitizeInput(fileName, 'text');
  let sanitized = validation.sanitized;
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '_');
  
  // Remove multiple dots except for file extension
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    const extension = parts.pop();
    const nameWithoutExt = parts.join('_');
    sanitized = `${nameWithoutExt}.${extension}`;
  }
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, 250 - extension.length);
    sanitized = `${nameWithoutExt}${extension}`;
  }
  
  return sanitized;
}

/**
 * Gets file extension from filename
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

/**
 * Checks if MIME type is allowed
 */
function isAllowedMimeType(mimeType: string): boolean {
  const allAllowed = Object.values(ALLOWED_MIME_TYPES).flat();
  return allAllowed.includes(mimeType) || mimeType === 'application/octet-stream';
}

/**
 * Gets file size limit based on MIME type
 */
function getFileSizeLimit(mimeType: string): number {
  if (ALLOWED_MIME_TYPES.images.includes(mimeType)) {
    return FILE_SIZE_LIMITS.image;
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType)) {
    return FILE_SIZE_LIMITS.document;
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType)) {
    return FILE_SIZE_LIMITS.video;
  }
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType)) {
    return FILE_SIZE_LIMITS.audio;
  }
  if (ALLOWED_MIME_TYPES.archives.includes(mimeType)) {
    return FILE_SIZE_LIMITS.archive;
  }
  return FILE_SIZE_LIMITS.default;
}

/**
 * Formats file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates content of uploaded files (basic checks)
 */
export function validateFileContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as ArrayBuffer;
      if (!content) {
        resolve(false);
        return;
      }
      
      // Check for file signature mismatches
      const bytes = new Uint8Array(content);
      const isValidSignature = validateFileSignature(bytes, file.type);
      
      if (!isValidSignature) {
        logSecurityEvent('file_signature_mismatch', {
          fileName: file.name,
          declaredType: file.type,
          actualSignature: Array.from(bytes.slice(0, 8)).map(b => b.toString(16)).join(' ')
        }, 'high');
      }
      
      resolve(isValidSignature);
    };
    
    reader.onerror = () => resolve(false);
    
    // Only read first 512 bytes for signature check
    reader.readAsArrayBuffer(file.slice(0, 512));
  });
}

/**
 * Validates file signature matches declared MIME type
 */
function validateFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]],
  };
  
  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) {
    // If we don't have signature data, allow it but log
    return true;
  }
  
  return expectedSignatures.some(signature => 
    signature.every((byte, index) => bytes[index] === byte)
  );
}