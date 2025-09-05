import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useSystemConfigs, useAdminLogs } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { 
  Settings, 
  Save, 
  RefreshCw,
  DollarSign,
  Shield,
  Zap,
  AlertTriangle
} from 'lucide-react';

export function AdminConfigsSection() {
  const { configs, loading, updateConfig, refetch } = useSystemConfigs();
  const { logAction } = useAdminLogs();
  const [saving, setSaving] = useState<string | null>(null);

  const handleUpdateConfig = async (configKey: string, value: any, description?: string) => {
    setSaving(configKey);
    try {
      const result = await updateConfig(configKey, value);
      
      if (result.success) {
        await logAction(
          'SYSTEM_CONFIG_UPDATED',
          'config',
          undefined,
          { config_key: configKey, new_value: value, description }
        );
        toast.success(`Configuração ${configKey} atualizada com sucesso`);
      } else {
        toast.error('Erro ao atualizar configuração');
      }
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
    } finally {
      setSaving(null);
    }
  };

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.config_key === key);
    return config?.config_value || null;
  };

  const getBooleanValue = (key: string): boolean => {
    const value = getConfigValue(key);
    return value === true || value === 'true';
  };

  const getNumberValue = (key: string): number => {
    const value = getConfigValue(key);
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  };

  const getStringValue = (key: string): string => {
    const value = getConfigValue(key);
    return typeof value === 'string' ? value : String(value || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Gerencie as configurações globais da plataforma
              </CardDescription>
            </div>
            <Button onClick={refetch} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Financial Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-600">Configurações Financeiras</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform_fee">Taxa da Plataforma (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="platform_fee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={getNumberValue('platform_fee_percentage')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleUpdateConfig('platform_fee_percentage', value, 'Taxa percentual da plataforma');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    disabled={saving === 'platform_fee_percentage'}
                    onClick={() => handleUpdateConfig('platform_fee_percentage', getNumberValue('platform_fee_percentage'))}
                  >
                    {saving === 'platform_fee_percentage' ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentual cobrado sobre cada transação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixed_fee">Taxa Fixa (R$)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fixed_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={(getNumberValue('platform_fixed_fee_cents') / 100).toFixed(2)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) * 100;
                      if (!isNaN(value)) {
                        handleUpdateConfig('platform_fixed_fee_cents', Math.round(value), 'Taxa fixa da plataforma em centavos');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    disabled={saving === 'platform_fixed_fee_cents'}
                    onClick={() => handleUpdateConfig('platform_fixed_fee_cents', getNumberValue('platform_fixed_fee_cents'))}
                  >
                    {saving === 'platform_fixed_fee_cents' ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor fixo cobrado por transação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_commission">Comissão Máxima (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="max_commission"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={getNumberValue('max_commission_percentage')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        handleUpdateConfig('max_commission_percentage', value, 'Porcentagem máxima de comissão para afiliados');
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    disabled={saving === 'max_commission_percentage'}
                    onClick={() => handleUpdateConfig('max_commission_percentage', getNumberValue('max_commission_percentage'))}
                  >
                    {saving === 'max_commission_percentage' ? <LoadingSpinner /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Máximo que afiliados podem ganhar por venda
                </p>
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Zap className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-600">Configurações da Plataforma</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Aprovação Automática de Produtos</Label>
                  <p className="text-sm text-muted-foreground">
                    Produtos são publicados automaticamente sem revisão manual
                  </p>
                </div>
                <Switch
                  checked={getBooleanValue('auto_approve_products')}
                  onCheckedChange={(checked) => 
                    handleUpdateConfig('auto_approve_products', checked, 'Aprovar produtos automaticamente')
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Verificação KYC Obrigatória</Label>
                  <p className="text-sm text-muted-foreground">
                    Exigir verificação de identidade para vendedores
                  </p>
                </div>
                <Switch
                  checked={getBooleanValue('require_kyc_verification')}
                  onCheckedChange={(checked) => 
                    handleUpdateConfig('require_kyc_verification', checked, 'Requer verificação KYC')
                  }
                />
              </div>
            </div>
          </div>

          {/* Security & Maintenance */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">Segurança & Manutenção</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>Modo de Manutenção</Label>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Desabilita temporariamente o acesso público à plataforma
                  </p>
                </div>
                <Switch
                  checked={getBooleanValue('maintenance_mode')}
                  onCheckedChange={(checked) => 
                    handleUpdateConfig('maintenance_mode', checked, 'Modo de manutenção')
                  }
                />
              </div>

              {getBooleanValue('maintenance_mode') && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Modo de Manutenção Ativo</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    A plataforma está atualmente em modo de manutenção. Apenas administradores podem acessar o sistema.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-4">Resumo das Configurações</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded">
                <span className="font-medium">Taxa Total por Transação:</span>
                <br />
                <span className="text-green-600">
                  {getNumberValue('platform_fee_percentage')}% + R$ {(getNumberValue('platform_fixed_fee_cents') / 100).toFixed(2)}
                </span>
              </div>
              <div className="bg-muted/50 p-3 rounded">
                <span className="font-medium">Comissão Máxima:</span>
                <br />
                <span className="text-blue-600">{getNumberValue('max_commission_percentage')}%</span>
              </div>
              <div className="bg-muted/50 p-3 rounded">
                <span className="font-medium">Status da Plataforma:</span>
                <br />
                <span className={getBooleanValue('maintenance_mode') ? 'text-red-600' : 'text-green-600'}>
                  {getBooleanValue('maintenance_mode') ? 'Manutenção' : 'Operacional'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}