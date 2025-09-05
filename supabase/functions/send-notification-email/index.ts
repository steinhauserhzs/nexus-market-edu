import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  title: string;
  message: string;
  type: 'new_content' | 'achievement' | 'course_update' | 'community_message' | 'system_announcement';
  actionUrl?: string;
  actionText?: string;
  storeName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      subject,
      title,
      message,
      type,
      actionUrl,
      actionText,
      storeName = "Nexus Market"
    }: EmailRequest = await req.json();

    if (!to || !subject || !title || !message) {
      throw new Error("Missing required fields: to, subject, title, message");
    }

    // Generate email content based on notification type
    const getEmailIcon = (type: string) => {
      switch (type) {
        case 'new_content': return '🆕';
        case 'achievement': return '🏆';
        case 'course_update': return '📚';
        case 'community_message': return '💬';
        case 'system_announcement': return '📢';
        default: return '🔔';
      }
    };

    const getEmailColor = (type: string) => {
      switch (type) {
        case 'new_content': return '#10b981';
        case 'achievement': return '#f59e0b';
        case 'course_update': return '#3b82f6';
        case 'community_message': return '#8b5cf6';
        case 'system_announcement': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 20px;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: ${getEmailColor(type)};
              padding: 30px 20px;
              text-align: center;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 10px;
              display: block;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px 20px;
            }
            .message {
              color: #374151;
              font-size: 16px;
              margin-bottom: 25px;
            }
            .action-button {
              display: inline-block;
              background: ${getEmailColor(type)};
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin-bottom: 25px;
            }
            .footer {
              background: #f3f4f6;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .footer a {
              color: ${getEmailColor(type)};
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="icon">${getEmailIcon(type)}</span>
              <h1>${title}</h1>
            </div>
            <div class="content">
              <div class="message">${message.replace(/\n/g, '<br>')}</div>
              ${actionUrl && actionText ? `
                <a href="${actionUrl}" class="action-button">${actionText}</a>
              ` : ''}
            </div>
            <div class="footer">
              <p>
                Esta notificação foi enviada por <strong>${storeName}</strong><br>
                <a href="#">Gerenciar preferências de email</a> | 
                <a href="#">Cancelar inscrição</a>
              </p>
              <p>
                Powered by <a href="https://nexusmarket.com">Nexus Market</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${storeName} <onboarding@resend.dev>`,
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);