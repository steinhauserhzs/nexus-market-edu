import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the session from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth context
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    } as any);

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { cpf } = await req.json();

    if (!cpf) {
      throw new Error('CPF is required');
    }

    // Validate CPF using database function
    const { data: validationResult, error: validationError } = await supabaseClient
      .rpc('validate_cpf', { cpf_input: cpf });

    if (validationError) {
      console.error('CPF validation error:', validationError);
      throw new Error('Failed to validate CPF');
    }

    if (!validationResult) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'CPF inválido. Verifique os números digitados.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Generate verification code for CPF
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const { error: dbError } = await supabaseClient
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code,
        type: 'cpf',
        contact_value: cpf.replace(/\D/g, ''), // Store only numbers
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save verification code');
    }

    // For CPF verification, we simulate a validation process
    // In a real scenario, you would integrate with Brazilian government APIs
    console.log('CPF verification code generated:', code, 'for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CPF válido! Código de verificação gerado.',
        // In production, you wouldn't return the code - it would be sent via email/SMS
        // For demo purposes, we return it
        verificationCode: code
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in verify-cpf function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});