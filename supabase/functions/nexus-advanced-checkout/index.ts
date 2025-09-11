import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Nexus Advanced Checkout Started ===");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    console.log("User authenticated:", { userId: user.id, email: user.email });

    // Parse request body
    const { products, customer_info, success_url, cancel_url } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error("Products array is required and cannot be empty");
    }

    console.log("Checkout data:", { 
      productsCount: products.length, 
      customerInfo: customer_info 
    });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists in Stripe
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Existing Stripe customer found:", customerId);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: customer_info?.name || user.user_metadata?.full_name,
        phone: customer_info?.phone,
        metadata: {
          user_id: user.id,
          source: 'nexus-market'
        }
      });
      customerId = customer.id;
      console.log("New Stripe customer created:", customerId);
    }

    // Calculate total amount
    const totalAmountCents = products.reduce((sum: number, product: any) => {
      return sum + (product.price_cents * (product.quantity || 1));
    }, 0);

    console.log("Total amount:", totalAmountCents, "cents");

    // Create line items for Stripe
    const lineItems = products.map((product: any) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: product.title,
          metadata: {
            product_id: product.id,
            user_id: user.id
          }
        },
        unit_amount: product.price_cents,
      },
      quantity: product.quantity || 1,
    }));

    // Create checkout session record in database
    const { data: sessionRecord, error: sessionError } = await supabaseClient
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        products: products,
        total_amount_cents: totalAmountCents,
        status: 'pending',
        success_url: success_url,
        cancel_url: cancel_url
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating checkout session record:", sessionError);
      throw new Error("Failed to create checkout session record");
    }

    console.log("Checkout session record created:", sessionRecord.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          checkout_session_id: sessionRecord.id,
          product_ids: products.map((p: any) => p.id).join(',')
        }
      },
      metadata: {
        user_id: user.id,
        checkout_session_id: sessionRecord.id
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['BR']
      }
    });

    // Update session record with Stripe session ID
    await supabaseClient
      .from('checkout_sessions')
      .update({ stripe_session_id: session.id })
      .eq('id', sessionRecord.id);

    console.log("Stripe checkout session created:", session.id);
    console.log("=== Nexus Advanced Checkout Completed ===");

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      checkout_session_id: sessionRecord.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("=== Nexus Advanced Checkout Error ===");
    console.error("Error details:", error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error",
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});