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

    const { phone } = await req.json();

    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate Brazilian phone format
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('5')) {
      throw new Error('Phone number must be in Brazilian format (11 digits starting with 5)');
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save verification code to database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const { error: dbError } = await supabaseClient
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code,
        type: 'phone',
        contact_value: cleanPhone,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save verification code');
    }

    // Send SMS using Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', `+${cleanPhone}`);
    formData.append('From', '+18777804236'); // Your Twilio phone number
    formData.append('Body', `Seu código de verificação é: ${code}. Válido por 5 minutos.`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!twilioResponse.ok) {
      const errorBody = await twilioResponse.text();
      console.error('Twilio error:', errorBody);
      throw new Error('Failed to send SMS');
    }

    console.log('SMS sent successfully to:', cleanPhone);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Código de verificação enviado via SMS' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-verification-sms function:', error);
    
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