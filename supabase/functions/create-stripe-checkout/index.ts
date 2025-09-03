import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductItem {
  id: string;
  title: string;
  price_cents: number;
  quantity: number;
}

interface CheckoutRequest {
  products: ProductItem[];
  success_url?: string;
  cancel_url?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase clients
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseServiceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Verify Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    logStep("Stripe key verified");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { products, success_url, cancel_url } = body;

    if (!products || products.length === 0) {
      throw new Error("No products provided");
    }

    logStep("Products received", { productCount: products.length });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Calculate total amount
    const totalAmount = products.reduce((sum, product) => 
      sum + (product.price_cents * product.quantity), 0
    );

    logStep("Calculated total", { totalAmount });

    // Create checkout session data in database first
    const { data: sessionData, error: sessionError } = await supabaseServiceClient
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        products: JSON.stringify(products),
        total_amount_cents: totalAmount,
        success_url: success_url || `${req.headers.get("origin")}/checkout/success`,
        cancel_url: cancel_url || `${req.headers.get("origin")}/checkout/cancel`,
        status: 'pending'
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Failed to create checkout session: ${sessionError.message}`);
    }

    logStep("Checkout session created in database", { sessionId: sessionData.id });

    // Create line items for Stripe
    const lineItems = products.map(product => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: product.title,
        },
        unit_amount: product.price_cents,
      },
      quantity: product.quantity,
    }));

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: success_url || `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get("origin")}/checkout/cancel`,
      metadata: {
        user_id: user.id,
        checkout_session_id: sessionData.id,
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          checkout_session_id: sessionData.id,
        },
      },
    });

    logStep("Stripe checkout session created", { 
      stripeSessionId: stripeSession.id,
      url: stripeSession.url 
    });

    // Update checkout session with Stripe session ID
    await supabaseServiceClient
      .from('checkout_sessions')
      .update({ 
        stripe_session_id: stripeSession.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionData.id);

    logStep("Updated checkout session with Stripe ID");

    return new Response(JSON.stringify({ 
      url: stripeSession.url,
      session_id: stripeSession.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    logStep("ERROR", { message: errorMessage, stack: error.stack });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});