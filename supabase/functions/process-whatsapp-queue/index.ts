import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WHATSAPP-QUEUE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Queue processor started");

    // Create Supabase client with service role key to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if n8n integration is enabled
    const { data: configs } = await supabaseService
      .from("system_configs")
      .select("config_key, config_value")
      .in("config_key", ["n8n_enabled", "n8n_webhook_url", "whatsapp_message_template"]);

    const configMap = configs?.reduce((acc, config) => {
      acc[config.config_key] = JSON.parse(config.config_value);
      return acc;
    }, {} as Record<string, any>) || {};

    if (!configMap.n8n_enabled || configMap.n8n_enabled === "false") {
      logStep("n8n integration disabled");
      return new Response(JSON.stringify({ message: "n8n integration disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const webhookUrl = configMap.n8n_webhook_url;
    if (!webhookUrl || webhookUrl === "") {
      logStep("n8n webhook URL not configured");
      return new Response(JSON.stringify({ error: "n8n webhook URL not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const messageTemplate = configMap.whatsapp_message_template || 
      "Olá {nome}! 🎉\n\nSua compra de \"{produto}\" foi confirmada!\n\n🔐 Seus dados de acesso:\nEmail: {email}\nSenha: Sua senha atual\n\n🔗 Acesse sua área de membros:\n{link_area_membros}\n\nEm caso de dúvidas, estamos aqui para ajudar!";

    // Get pending notifications
    const { data: pendingNotifications } = await supabaseService
      .from("whatsapp_notifications")
      .select(`
        id,
        user_id,
        order_id,
        product_id,
        status,
        attempts,
        max_attempts,
        profiles!inner(full_name, email, whatsapp_number),
        products!inner(title)
      `)
      .eq("status", "pending")
      .lt("attempts", 3);

    if (!pendingNotifications || pendingNotifications.length === 0) {
      logStep("No pending notifications found");
      return new Response(JSON.stringify({ message: "No pending notifications" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Processing notifications", { count: pendingNotifications.length });
    
    let processed = 0;
    let errors = 0;

    for (const notification of pendingNotifications) {
      try {
        const profile = notification.profiles;
        const product = notification.products;

        if (!profile.whatsapp_number) {
          await supabaseService
            .from("whatsapp_notifications")
            .update({
              status: "failed",
              error_message: "WhatsApp number not provided",
              attempts: notification.attempts + 1,
            })
            .eq("id", notification.id);
          
          logStep("WhatsApp number missing", { notification_id: notification.id });
          errors++;
          continue;
        }

        const memberAreaLink = `${req.headers.get("origin") || "https://yourapp.com"}/inicio`;

        // Replace placeholders in message template
        const personalizedMessage = messageTemplate
          .replace(/\{nome\}/g, profile.full_name || "Cliente")
          .replace(/\{produto\}/g, product.title)
          .replace(/\{email\}/g, profile.email)
          .replace(/\{link_area_membros\}/g, memberAreaLink);

        // Send to n8n webhook
        const n8nPayload = {
          notification_id: notification.id,
          whatsapp_number: profile.whatsapp_number,
          message: personalizedMessage,
          customer_name: profile.full_name || "Cliente",
          customer_email: profile.email,
          product_title: product.title,
          order_id: notification.order_id,
          user_id: notification.user_id,
          timestamp: new Date().toISOString(),
          triggered_from: req.headers.get("origin") || "queue-processor",
        };

        logStep("Sending to n8n", { 
          notification_id: notification.id,
          whatsapp_number: profile.whatsapp_number 
        });

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
              attempts: notification.attempts + 1,
              message_sent: personalizedMessage,
              whatsapp_number: profile.whatsapp_number,
              message_template: messageTemplate,
              n8n_webhook_url: webhookUrl,
            })
            .eq("id", notification.id);

          logStep("Notification sent successfully", { notification_id: notification.id });
          processed++;
        } else {
          // Update notification status to failed or retry
          const errorText = await n8nResponse.text();
          const newStatus = notification.attempts + 1 >= notification.max_attempts ? "failed" : "retry";
          
          await supabaseService
            .from("whatsapp_notifications")
            .update({
              status: newStatus,
              error_message: `HTTP ${n8nResponse.status}: ${errorText}`,
              attempts: notification.attempts + 1,
            })
            .eq("id", notification.id);

          logStep("n8n webhook failed", { 
            status: n8nResponse.status, 
            error: errorText,
            notification_id: notification.id,
            new_status: newStatus
          });
          errors++;
        }
      } catch (error) {
        logStep("Error processing notification", { 
          notification_id: notification.id, 
          error: error.message 
        });
        
        // Update notification with error
        await supabaseService
          .from("whatsapp_notifications")
          .update({
            status: notification.attempts + 1 >= notification.max_attempts ? "failed" : "retry",
            error_message: error.message,
            attempts: notification.attempts + 1,
          })
          .eq("id", notification.id);
        
        errors++;
      }
    }

    return new Response(JSON.stringify({ 
      message: "Queue processing completed",
      processed,
      errors,
      total: pendingNotifications.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in queue processor", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});