import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  action: string;
  identifier: string; // user_id or ip
  limit?: number;
  window?: number; // seconds
}

interface SecurityLogRequest {
  action: string;
  details?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'rate_limit_check':
        return handleRateLimit(supabase, payload as RateLimitRequest);
      
      case 'security_log':
        return handleSecurityLog(supabase, payload as SecurityLogRequest);
      
      case 'validate_input':
        return handleInputValidation(payload);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('Security utils error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleRateLimit(supabase: any, request: RateLimitRequest) {
  const { action, identifier, limit = 5, window = 300 } = request; // 5 attempts per 5 minutes default
  
  try {
    // Create rate limiting table if it doesn't exist
    const windowStart = new Date(Date.now() - window * 1000);
    
    // Check current attempts
    const { data: attempts, error } = await supabase
      .from('rate_limits')
      .select('count(*)')
      .eq('action', action)
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow the request if we can't check rate limits
      return new Response(
        JSON.stringify({ allowed: true, remaining: limit }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentAttempts = attempts?.length || 0;
    
    if (currentAttempts >= limit) {
      // Log security event for rate limit exceeded
      await supabase.from('security_logs').insert({
        action: 'rate_limit_exceeded',
        details: { 
          rate_limit_action: action,
          identifier,
          attempts: currentAttempts,
          limit,
          window 
        },
        severity: 'medium'
      });

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          remaining: 0,
          resetAt: new Date(Date.now() + window * 1000).toISOString()
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Record this attempt
    await supabase.from('rate_limits').insert({
      action,
      identifier,
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        remaining: limit - currentAttempts - 1 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open
    return new Response(
      JSON.stringify({ allowed: true, remaining: limit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSecurityLog(supabase: any, request: SecurityLogRequest) {
  const { action, details = {}, severity = 'low', ip_address, user_agent } = request;
  
  try {
    const { error } = await supabase.from('security_logs').insert({
      action,
      details,
      severity,
      ip_address,
      user_agent,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Security logging error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Security logging error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

function handleInputValidation(payload: any) {
  const { input, type } = payload;
  
  const validationResults = {
    isValid: true,
    sanitized: input,
    warnings: [] as string[]
  };

  if (!input || typeof input !== 'string') {
    validationResults.isValid = false;
    validationResults.warnings.push('Invalid input type');
    return new Response(
      JSON.stringify(validationResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // XSS Protection - sanitize HTML
  let sanitized = input;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s(src|href)\s*=\s*["']javascript:[^"']*["']/gi, '');

  // SQL Injection Protection for search terms
  if (type === 'search') {
    // Remove SQL keywords and special characters
    const sqlKeywords = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
    if (sqlKeywords.test(sanitized)) {
      validationResults.warnings.push('Potential SQL injection attempt detected');
      sanitized = sanitized.replace(sqlKeywords, '');
    }
    
    // Remove SQL comment patterns
    sanitized = sanitized.replace(/(--|\*\/|\/\*)/g, '');
  }

  // Length validation
  if (sanitized.length > 10000) {
    validationResults.isValid = false;
    validationResults.warnings.push('Input too long');
    sanitized = sanitized.substring(0, 10000);
  }

  // Check if input was modified
  if (sanitized !== input) {
    validationResults.warnings.push('Input was sanitized');
  }

  validationResults.sanitized = sanitized;

  return new Response(
    JSON.stringify(validationResults),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}