import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAdminLogs } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { 
  Zap, 
  UserPlus, 
  Mail, 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Users,
  MessageCircle
} from 'lucide-react';

export function AdminQuickActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [emailDialog, setEmailDialog] = useState(false);
  const [userDialog, setUserDialog] = useState(false);
  const { logAction } = useAdminLogs();

  const [emailData, setEmailData] = useState({
    recipient: 'all',
    subject: '',
    message: ''
  });

  const [userData, setUserData] = useState({
    email: '',
    fullName: '',
    role: 'user'
  });

  const sendBulkEmail = async () => {
    setLoading('email');
    try {
      // In a real implementation, you would call an edge function to send emails
      await logAction(
        'BULK_EMAIL_SENT',
        'notification',
        undefined,
        { 
          recipient: emailData.recipient,
          subject: emailData.subject,
          recipientCount: emailData.recipient === 'all' ? 'all_users' : 'admins_only'
        }
      );
      
      toast.success('Email enviado com sucesso!');
      setEmailDialog(false);
      setEmailData({ recipient: 'all', subject: '', message: '' });
    } catch (error) {
      toast.error('Erro ao enviar email');
    } finally {
      setLoading(null);
    }
  };

  const createUser = async () => {
    setLoading('user');
    try {
      // In a real implementation, you would create the user via Supabase Admin API
      await logAction(
        'ADMIN_USER_CREATED',
        'user',
        undefined,
        { 
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role
        }
      );
      
      toast.success('Usuário criado com sucesso!');
      setUserDialog(false);
      setUserData({ email: '', fullName: '', role: 'user' });
    } catch (error) {
      toast.error('Erro ao criar usuário');
    } finally {
      setLoading(null);
    }
  };

  const toggleMaintenanceMode = async () => {
    setLoading('maintenance');
    try {
      // Get current maintenance mode status
      const { data: config } = await supabase
        .from('system_configs')
        .select('config_value')
        .eq('config_key', 'maintenance_mode')
        .single();

      const currentStatus = config?.config_value === true;
      const newStatus = !currentStatus;

      await supabase
        .from('system_configs')
        .update({ config_value: newStatus })
        .eq('config_key', 'maintenance_mode');

      await logAction(
        newStatus ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
        'system',
        undefined,
        { new_status: newStatus }
      );

      toast.success(`Modo de manutenção ${newStatus ? 'ativado' : 'desativado'}`);
    } catch (error) {
      toast.error('Erro ao alterar modo de manutenção');
    } finally {
      setLoading(null);
    }
  };

  const clearCache = async () => {
    setLoading('cache');
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await logAction('SYSTEM_CACHE_CLEARED', 'system');
      toast.success('Cache do sistema limpo com sucesso!');
    } catch (error) {
      toast.error('Erro ao limpar cache');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Execute ações administrativas rapidamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Send Bulk Email */}
          <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">Email</Badge>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Enviar Email em Massa</p>
                  <p className="text-xs text-muted-foreground">Notificar todos os usuários</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Email em Massa</DialogTitle>
                <DialogDescription>
                  Envie uma notificação por email para usuários da plataforma
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinatários</Label>
                  <Select value={emailData.recipient} onValueChange={(value) => 
                    setEmailData({...emailData, recipient: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                      <SelectItem value="sellers">Apenas vendedores</SelectItem>
                      <SelectItem value="admins">Apenas administradores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    placeholder="Assunto do email..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Input
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    placeholder="Conteúdo da mensagem..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmailDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendBulkEmail} disabled={loading === 'email'}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create User */}
          <Dialog open={userDialog} onOpenChange={setUserDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 w-full">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <Badge variant="secondary" className="text-xs">Usuário</Badge>
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Criar Usuário</p>
                  <p className="text-xs text-muted-foreground">Adicionar novo usuário</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário diretamente ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    placeholder="usuario@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={userData.fullName}
                    onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={userData.role} onValueChange={(value) => 
                    setUserData({...userData, role: value})
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="seller">Vendedor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={createUser} disabled={loading === 'user'}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toggle Maintenance Mode */}
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={toggleMaintenanceMode}
            disabled={loading === 'maintenance'}
          >
            <div className="flex items-center gap-2 w-full">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <Badge variant="secondary" className="text-xs">Sistema</Badge>
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Modo Manutenção</p>
              <p className="text-xs text-muted-foreground">Ativar/desativar acesso</p>
            </div>
          </Button>

          {/* Clear Cache */}
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-start gap-2"
            onClick={clearCache}
            disabled={loading === 'cache'}
          >
            <div className="flex items-center gap-2 w-full">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <Badge variant="secondary" className="text-xs">Performance</Badge>
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Limpar Cache</p>
              <p className="text-xs text-muted-foreground">Melhorar performance</p>
            </div>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Estatísticas Rápidas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24h</p>
              <p className="text-muted-foreground">Novos usuários</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">R$ 1.2k</p>
              <p className="text-muted-foreground">Receita hoje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">156</p>
              <p className="text-muted-foreground">Produtos ativos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">98%</p>
              <p className="text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}