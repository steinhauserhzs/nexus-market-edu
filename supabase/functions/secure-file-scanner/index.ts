import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate file security
    const validationResult = await validateFileSecurity(file);
    
    // Log file upload attempt
    await supabase.from('file_upload_audit').insert({
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      sanitized_name: validationResult.sanitizedName,
      security_warnings: validationResult.warnings,
      upload_status: validationResult.isValid ? 'approved' : 'rejected',
      rejection_reason: validationResult.isValid ? null : validationResult.errors.join(', ')
    });

    if (!validationResult.isValid) {
      // Log security violation
      await supabase.from('security_audit').insert({
        user_id: userId,
        action: 'file_upload_blocked',
        risk_level: 'high',
        details: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        }
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'File rejected for security reasons',
          details: validationResult.errors 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // File is valid, proceed with upload
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${crypto.randomUUID()}-${validationResult.sanitizedName}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);

    // Update audit log with success
    await supabase.from('file_upload_audit').insert({
      user_id: userId,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      sanitized_name: validationResult.sanitizedName,
      security_warnings: validationResult.warnings,
      upload_status: 'completed',
      file_path: fileName
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        fileName: validationResult.sanitizedName,
        warnings: validationResult.warnings
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('File upload error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// File security validation function
async function validateFileSecurity(file: File) {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    sanitizedName: file.name
  };

  // Validate file name
  const sanitizedName = sanitizeFileName(file.name);
  if (sanitizedName !== file.name) {
    result.warnings.push('File name was sanitized for security');
    result.sanitizedName = sanitizedName;
  }

  // Check dangerous extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
    '.js', '.jar', '.vbs', '.wsf', '.wsh', '.ps1',
    '.msi', '.dll', '.dmg', '.pkg', '.deb', '.rpm'
  ];

  const extension = getFileExtension(file.name).toLowerCase();
  if (dangerousExtensions.includes(extension)) {
    result.errors.push(`File type ${extension} is not allowed for security reasons`);
    result.isValid = false;
  }

  // Validate file size (100MB max)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    result.errors.push(`File size exceeds maximum limit (${formatFileSize(maxSize)})`);
    result.isValid = false;
  }

  // Validate MIME type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav', 'application/zip'
  ];

  if (!allowedTypes.includes(file.type) && file.type !== 'application/octet-stream') {
    result.errors.push(`File type ${file.type} is not allowed`);
    result.isValid = false;
  }

  // Content validation
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    if (!validateFileSignature(bytes, file.type)) {
      result.warnings.push('File signature does not match declared type');
    }
  } catch (error) {
    result.warnings.push('Could not validate file content');
  }

  return result;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function validateFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'application/zip': [[0x50, 0x4B, 0x03, 0x04], [0x50, 0x4B, 0x05, 0x06]]
  };

  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) {
    return true; // Allow if we don't have signature data
  }

  return expectedSignatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte)
  );
}