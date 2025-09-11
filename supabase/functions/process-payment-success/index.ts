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
    console.log("=== Process Payment Success Started ===");

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { session_id, user_id } = await req.json();

    if (!session_id) {
      throw new Error("session_id is required");
    }

    console.log("Processing payment success for session:", session_id);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'payment_intent']
    });

    console.log("Stripe session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      customer: session.customer
    });

    if (session.payment_status !== 'paid') {
      throw new Error(`Payment not completed. Status: ${session.payment_status}`);
    }

    // Find our checkout session record
    const { data: checkoutSession, error: checkoutError } = await supabaseClient
      .from('checkout_sessions')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single();

    if (checkoutError || !checkoutSession) {
      console.error("Checkout session not found:", checkoutError);
      throw new Error("Checkout session not found in database");
    }

    console.log("Database checkout session found:", checkoutSession.id);

    // Check if already processed
    if (checkoutSession.status === 'completed') {
      console.log("Payment already processed");
      return new Response(JSON.stringify({
        message: "Payment already processed",
        order_id: checkoutSession.id,
        total_cents: checkoutSession.total_amount_cents
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: checkoutSession.user_id,
        total_cents: checkoutSession.total_amount_cents,
        status: 'completed',
        payment_status: 'paid',
        payment_provider: 'stripe',
        gateway_session_id: session_id,
        stripe_payment_intent_id: session.payment_intent?.id,
        external_order_id: session_id,
        customer_name: session.customer_details?.name,
        customer_email: session.customer_details?.email,
        metadata: {
          stripe_session: session.id,
          checkout_session: checkoutSession.id,
          products: checkoutSession.products
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order record");
    }

    console.log("Order created:", order.id);

    // Create order items and licenses
    const products = checkoutSession.products as any[];
    
    for (const product of products) {
      // Create order item
      await supabaseClient
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          quantity: product.quantity || 1,
          unit_price_cents: product.price_cents
        });

      // Create license for digital products
      const { data: productDetails } = await supabaseClient
        .from('products')
        .select('type')
        .eq('id', product.id)
        .single();

      if (productDetails?.type === 'digital' || productDetails?.type === 'curso') {
        await supabaseClient
          .from('licenses')
          .insert({
            user_id: checkoutSession.user_id,
            product_id: product.id,
            order_id: order.id,
            is_active: true
          });

        console.log("License created for product:", product.id);
      }
    }

    // Update checkout session status
    await supabaseClient
      .from('checkout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', checkoutSession.id);

    // Create notification for user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: checkoutSession.user_id,
        title: 'Compra realizada com sucesso!',
        message: `Sua compra no valor de ${(checkoutSession.total_amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi processada.`,
        type: 'purchase_success',
        data: {
          order_id: order.id,
          total_cents: checkoutSession.total_amount_cents,
          products: products.map(p => ({ id: p.id, title: p.title }))
        }
      });

    console.log("=== Process Payment Success Completed ===");

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      total_cents: checkoutSession.total_amount_cents,
      products: products.length,
      message: "Payment processed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("=== Process Payment Success Error ===");
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