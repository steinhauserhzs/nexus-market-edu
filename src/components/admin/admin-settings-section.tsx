import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAdminLogs } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { 
  Globe, 
  Shield, 
  Zap,
  Database,
  Mail,
  Palette,
  FileText,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  termsOfService: string;
  privacyPolicy: string;
  supportEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export function AdminSettingsSection() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Nexus Market',
    siteDescription: 'Plataforma de cursos e produtos digitais',
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    termsOfService: '',
    privacyPolicy: '',
    supportEmail: 'suporte@nexusmarket.com',
    maxFileSize: 50,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mov']
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { logAction } = useAdminLogs();

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would load these from system_configs
      // For now, we'll use default values
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Here you would save each setting to system_configs table
      await Promise.all([
        updateSystemConfig('site_name', settings.siteName),
        updateSystemConfig('site_description', settings.siteDescription),
        updateSystemConfig('primary_color', settings.primaryColor),
        updateSystemConfig('secondary_color', settings.secondaryColor),
        updateSystemConfig('maintenance_mode', settings.maintenanceMode),
        updateSystemConfig('registration_enabled', settings.registrationEnabled),
        updateSystemConfig('email_verification_required', settings.emailVerificationRequired),
        updateSystemConfig('support_email', settings.supportEmail),
        updateSystemConfig('max_file_size_mb', settings.maxFileSize),
        updateSystemConfig('allowed_file_types', settings.allowedFileTypes)
      ]);

      await logAction(
        'PLATFORM_SETTINGS_UPDATED',
        'settings',
        undefined,
        { settings: settings }
      );

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSystemConfig = async (key: string, value: any) => {
    const { error } = await supabase
      .from('system_configs')
      .upsert({
        config_key: key,
        config_value: value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da plataforma
              </CardDescription>
            </div>
            <Button onClick={loadSettings} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descrição do Site</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança e Acesso
          </CardTitle>
          <CardDescription>
            Configure as políticas de segurança e acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Registros Habilitados</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que novos usuários se registrem na plataforma
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => 
                  setSettings({...settings, registrationEnabled: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Verificação de Email Obrigatória</Label>
                <p className="text-sm text-muted-foreground">
                  Exige que usuários verifiquem o email antes de acessar
                </p>
              </div>
              <Switch
                checked={settings.emailVerificationRequired}
                onCheckedChange={(checked) => 
                  setSettings({...settings, emailVerificationRequired: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label>Modo de Manutenção</Label>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Bloqueia o acesso público à plataforma
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings({...settings, maintenanceMode: checked})
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configurações de Upload
          </CardTitle>
          <CardDescription>
            Configure os limites e tipos de arquivo permitidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              min="1"
              max="1000"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipos de Arquivo Permitidos</Label>
            <div className="flex flex-wrap gap-2">
              {settings.allowedFileTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-1 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        allowedFileTypes: settings.allowedFileTypes.filter(t => t !== type)
                      });
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Tipos comuns: jpg, png, pdf, mp4, doc, xlsx
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
          {saving ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}