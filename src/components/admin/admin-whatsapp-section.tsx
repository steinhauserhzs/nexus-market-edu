import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { MessageSquare, Send, Settings, Activity } from "lucide-react";

interface WhatsAppNotification {
  id: string;
  whatsapp_number: string;
  status: string;
  attempts: number;
  max_attempts: number;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
  user_id: string;
  product_id: string;
}

export const AdminWhatsAppSection = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [config, setConfig] = useState({
    n8n_enabled: false,
    n8n_webhook_url: "",
    whatsapp_message_template: "",
    whatsapp_delay_minutes: "5",
  });

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from("system_configs")
        .select("config_key, config_value")
        .in("config_key", [
          "n8n_enabled",
          "n8n_webhook_url", 
          "whatsapp_message_template",
          "whatsapp_delay_minutes"
        ]);

      const configMap = data?.reduce((acc, item) => {
        acc[item.config_key] = typeof item.config_value === 'string' && item.config_value ? JSON.parse(item.config_value) : "";
        return acc;
      }, {} as Record<string, any>) || {};

      setConfig({
        n8n_enabled: configMap.n8n_enabled === "true" || configMap.n8n_enabled === true,
        n8n_webhook_url: configMap.n8n_webhook_url || "",
        whatsapp_message_template: configMap.whatsapp_message_template || `Olá {nome}! 🎉

Sua compra de "{produto}" foi confirmada!

🔐 Seus dados de acesso:
Email: {email}
Senha: Sua senha atual

🔗 Acesse sua área de membros:
{link_area_membros}

Em caso de dúvidas, estamos aqui para ajudar!`,
        whatsapp_delay_minutes: configMap.whatsapp_delay_minutes || "5",
      });
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Erro ao carregar configurações");
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from("whatsapp_notifications")
        .select(`
          id,
          whatsapp_number,
          status,
          attempts,
          max_attempts,
          sent_at,
          created_at,
          error_message,
          user_id,
          product_id
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Erro ao carregar notificações");
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchNotifications();
  }, []);

  const saveConfig = async () => {
    setLoading(true);
    try {
      const updates = [
        {
          config_key: "n8n_enabled",
          config_value: JSON.stringify(config.n8n_enabled),
        },
        {
          config_key: "n8n_webhook_url",
          config_value: JSON.stringify(config.n8n_webhook_url),
        },
        {
          config_key: "whatsapp_message_template",
          config_value: JSON.stringify(config.whatsapp_message_template),
        },
        {
          config_key: "whatsapp_delay_minutes",
          config_value: JSON.stringify(config.whatsapp_delay_minutes),
        },
      ];

      for (const update of updates) {
        await supabase
          .from("system_configs")
          .upsert(update, { onConflict: "config_key" });
      }

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-whatsapp-queue");
      
      if (error) {
        toast.error("Erro ao processar fila: " + error.message);
      } else {
        toast.success(`Fila processada: ${data.processed} enviados, ${data.errors} erros`);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error processing queue:", error);
      toast.error("Erro ao processar fila");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      sent: "default",
      failed: "destructive",
      retry: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (loading && notifications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Configurações n8n */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações WhatsApp + n8n
          </CardTitle>
          <CardDescription>
            Configure a integração com n8n para envio automático de mensagens WhatsApp após compras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar integração n8n</Label>
              <p className="text-sm text-muted-foreground">
                Ativa o envio automático de mensagens WhatsApp via n8n
              </p>
            </div>
            <Switch
              checked={config.n8n_enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, n8n_enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
            <Input
              id="webhook-url"
              placeholder="https://n8n.exemplo.com/webhook/whatsapp"
              value={config.n8n_webhook_url}
              onChange={(e) =>
                setConfig({ ...config, n8n_webhook_url: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Configure o webhook trigger no n8n e cole a URL aqui
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay">Atraso antes do envio (minutos)</Label>
            <Input
              id="delay"
              type="number"
              min="0"
              max="60"
              value={config.whatsapp_delay_minutes}
              onChange={(e) =>
                setConfig({ ...config, whatsapp_delay_minutes: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template da Mensagem</Label>
            <Textarea
              id="template"
              rows={8}
              placeholder="Template da mensagem com placeholders..."
              value={config.whatsapp_message_template}
              onChange={(e) =>
                setConfig({ ...config, whatsapp_message_template: e.target.value })
              }
            />
            <p className="text-sm text-muted-foreground">
              Use os placeholders: {"{nome}"}, {"{produto}"}, {"{email}"}, {"{link_area_membros}"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveConfig} disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={processQueue} disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              Processar Fila Agora
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Log de Notificações WhatsApp
          </CardTitle>
          <CardDescription>
            Histórico das últimas 50 tentativas de envio de mensagens WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente ID</TableHead>  
                <TableHead>Produto ID</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-mono text-sm">
                    {notification.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {notification.product_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {notification.whatsapp_number === "pending-lookup" 
                      ? "Pendente" 
                      : notification.whatsapp_number}
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    {notification.attempts}/{notification.max_attempts}
                  </TableCell>
                  <TableCell>
                    {formatDate(notification.created_at)}
                  </TableCell>
                  <TableCell>
                    {notification.error_message && (
                      <span className="text-sm text-destructive">
                        {notification.error_message.substring(0, 50)}
                        {notification.error_message.length > 50 ? "..." : ""}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};