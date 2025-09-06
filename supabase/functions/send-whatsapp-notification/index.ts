import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppNotificationRequest {
  order_id: string;
  user_id: string;
  product_ids: string[];
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WHATSAPP-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { order_id, user_id, product_ids }: WhatsAppNotificationRequest = await req.json();
    logStep("Request data received", { order_id, user_id, product_ids });

    // Check if n8n integration is enabled
    const { data: n8nConfig } = await supabaseService
      .from("system_configs")
      .select("config_value")
      .eq("config_key", "n8n_enabled")
      .single();

    if (!n8nConfig || n8nConfig.config_value === "false") {
      logStep("n8n integration disabled");
      return new Response(JSON.stringify({ message: "n8n integration disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get n8n webhook URL
    const { data: webhookConfig } = await supabaseService
      .from("system_configs")
      .select("config_value")
      .eq("config_key", "n8n_webhook_url")
      .single();

    if (!webhookConfig || !webhookConfig.config_value || webhookConfig.config_value === '""') {
      logStep("n8n webhook URL not configured");
      return new Response(JSON.stringify({ error: "n8n webhook URL not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const webhookUrl = JSON.parse(webhookConfig.config_value);
    logStep("n8n webhook URL retrieved", { webhookUrl });

    // Get message template
    const { data: templateConfig } = await supabaseService
      .from("system_configs")
      .select("config_value")
      .eq("config_key", "whatsapp_message_template")
      .single();

    const messageTemplate = templateConfig ? JSON.parse(templateConfig.config_value) : 
      "Olá {nome}! 🎉\n\nSua compra de \"{produto}\" foi confirmada!\n\n🔐 Seus dados de acesso:\nEmail: {email}\nSenha: Sua senha atual\n\n🔗 Acesse sua área de membros:\n{link_area_membros}\n\nEm caso de dúvidas, estamos aqui para ajudar!";

    // Get user profile data
    const { data: profile } = await supabaseService
      .from("profiles")
      .select("full_name, email, whatsapp_number")
      .eq("id", user_id)
      .single();

    if (!profile) {
      logStep("Profile not found", { user_id });
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (!profile.whatsapp_number) {
      logStep("WhatsApp number not provided", { user_id });
      return new Response(JSON.stringify({ error: "WhatsApp number not provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get product details
    const { data: products } = await supabaseService
      .from("products")
      .select("id, title")
      .in("id", product_ids);

    if (!products || products.length === 0) {
      logStep("Products not found", { product_ids });
      return new Response(JSON.stringify({ error: "Products not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const productTitles = products.map(p => p.title).join(", ");
    const memberAreaLink = `${req.headers.get("origin") || "https://yourapp.com"}/inicio`;

    // Replace placeholders in message template
    const personalizedMessage = messageTemplate
      .replace(/\{nome\}/g, profile.full_name || "Cliente")
      .replace(/\{produto\}/g, productTitles)
      .replace(/\{email\}/g, profile.email)
      .replace(/\{link_area_membros\}/g, memberAreaLink);

    logStep("Message personalized", { message: personalizedMessage });

    // Process each product separately
    for (const product of products) {
      try {
        // Save notification record
        const { data: notification, error: notificationError } = await supabaseService
          .from("whatsapp_notifications")
          .insert({
            user_id,
            order_id,
            product_id: product.id,
            whatsapp_number: profile.whatsapp_number,
            message_template: messageTemplate,
            message_sent: personalizedMessage,
            n8n_webhook_url: webhookUrl,
            status: "pending",
          })
          .select()
          .single();

        if (notificationError) {
          logStep("Error saving notification", { error: notificationError });
          continue;
        }

        // Send to n8n webhook
        const n8nPayload = {
          notification_id: notification.id,
          whatsapp_number: profile.whatsapp_number,
          message: personalizedMessage,
          customer_name: profile.full_name || "Cliente",
          customer_email: profile.email,
          product_title: product.title,
          order_id,
          user_id,
          timestamp: new Date().toISOString(),
          triggered_from: req.headers.get("origin") || "unknown",
        };

        logStep("Sending to n8n", { payload: n8nPayload });

        const n8nResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nPayload),
        });

        if (n8nResponse.ok) {
          // Update notification status to sent
          await supabaseService
            .from("whatsapp_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              attempts: 1,
            })
            .eq("id", notification.id);

          logStep("Notification sent successfully", { notification_id: notification.id });
        } else {
          // Update notification status to failed
          const errorText = await n8nResponse.text();
          await supabaseService
            .from("whatsapp_notifications")
            .update({
              status: "failed",
              error_message: `HTTP ${n8nResponse.status}: ${errorText}`,
              attempts: 1,
            })
            .eq("id", notification.id);

          logStep("n8n webhook failed", { 
            status: n8nResponse.status, 
            error: errorText,
            notification_id: notification.id 
          });
        }
      } catch (error) {
        logStep("Error processing product notification", { 
          product_id: product.id, 
          error: error.message 
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: "WhatsApp notifications processed",
      products_processed: products.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-whatsapp-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});