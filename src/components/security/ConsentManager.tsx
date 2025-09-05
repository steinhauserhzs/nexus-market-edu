import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Download, Eye, Mail, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsentState {
  data_consent_given: boolean;
  marketing_consent: boolean;
  data_processing_consent: boolean;
  data_consent_date: string | null;
}

interface ConsentManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minimal?: boolean; // For initial consent collection
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({ 
  open, 
  onOpenChange, 
  minimal = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [consentState, setConsentState] = useState<ConsentState>({
    data_consent_given: false,
    marketing_consent: false,
    data_processing_consent: false,
    data_consent_date: null
  });

  useEffect(() => {
    if (open && user) {
      loadConsentState();
    }
  }, [open, user]);

  const loadConsentState = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data_consent_given, marketing_consent, data_processing_consent, data_consent_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setConsentState({
          data_consent_given: data.data_consent_given || false,
          marketing_consent: data.marketing_consent || false,
          data_processing_consent: data.data_processing_consent || false,
          data_consent_date: data.data_consent_date
        });
      }
    } catch (error) {
      console.error('Error loading consent state:', error);
    }
  };

  const updateConsent = async (updates: Partial<ConsentState>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_user_consent', {
        p_data_consent: updates.data_consent_given,
        p_marketing_consent: updates.marketing_consent,
        p_processing_consent: updates.data_processing_consent
      });

      if (error) throw error;

      setConsentState(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Consentimentos atualizados",
        description: "Suas preferências de privacidade foram salvas.",
      });

      if (minimal && updates.data_consent_given) {
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Error updating consent:', error);
      toast({
        title: "Erro ao atualizar consentimentos",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('export_user_data');

      if (error) throw error;

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro ao exportar dados",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (minimal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Consentimento de Dados
            </DialogTitle>
            <DialogDescription>
              Para continuar usando nossa plataforma, precisamos do seu consentimento para processar seus dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Switch
                id="data-consent"
                checked={consentState.data_consent_given}
                onCheckedChange={(checked) => 
                  setConsentState(prev => ({ ...prev, data_consent_given: checked }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="data-consent" className="text-sm font-medium">
                  Processamento de Dados Necessários *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Consentimento para processar seus dados pessoais para o funcionamento da plataforma.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Switch
                id="marketing-consent"
                checked={consentState.marketing_consent}
                onCheckedChange={(checked) => 
                  setConsentState(prev => ({ ...prev, marketing_consent: checked }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="marketing-consent" className="text-sm font-medium">
                  Comunicações de Marketing
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber emails sobre novos produtos e ofertas.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">Consentimento obrigatório</p>
                  <p>O processamento de dados necessários é obrigatório para o funcionamento da plataforma.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => updateConsent({ 
                  data_consent_given: consentState.data_consent_given,
                  marketing_consent: consentState.marketing_consent,
                  data_processing_consent: true
                })}
                disabled={!consentState.data_consent_given || loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : "Aceitar e Continuar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Gerenciar Privacidade e Dados
          </DialogTitle>
          <DialogDescription>
            Controle como seus dados são utilizados e exercite seus direitos de privacidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Consent Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Status dos Consentimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Processamento de Dados</Label>
                  <p className="text-xs text-muted-foreground">Dados necessários para funcionamento</p>
                </div>
                <Badge variant={consentState.data_consent_given ? "default" : "destructive"}>
                  {consentState.data_consent_given ? "Ativo" : "Negado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Marketing</Label>
                  <p className="text-xs text-muted-foreground">Comunicações promocionais</p>
                </div>
                <Badge variant={consentState.marketing_consent ? "default" : "secondary"}>
                  {consentState.marketing_consent ? "Ativo" : "Desabilitado"}
                </Badge>
              </div>

              {consentState.data_consent_date && (
                <div className="text-xs text-muted-foreground">
                  Último consentimento: {new Date(consentState.data_consent_date).toLocaleDateString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consent Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Controles de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="data-processing" className="text-sm font-medium">
                    Processamento de Dados Necessários
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Dados essenciais para o funcionamento da conta e compras
                  </p>
                </div>
                <Switch
                  id="data-processing"
                  checked={consentState.data_consent_given}
                  onCheckedChange={(checked) => updateConsent({ data_consent_given: checked })}
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="marketing" className="text-sm font-medium">
                    Comunicações de Marketing
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Emails sobre novos produtos, ofertas e atualizações
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={consentState.marketing_consent}
                  onCheckedChange={(checked) => updateConsent({ marketing_consent: checked })}
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics" className="text-sm font-medium">
                    Análise e Melhorias
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Dados para melhorar a experiência da plataforma
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={consentState.data_processing_consent}
                  onCheckedChange={(checked) => updateConsent({ data_processing_consent: checked })}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Seus Direitos de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={exportUserData}
                  disabled={loading}
                  className="justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Meus Dados
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Solicitação enviada",
                      description: "Entre em contato pelo suporte para exclusão de dados.",
                    });
                  }}
                  className="justify-start"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Solicitar Exclusão
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium text-blue-900 mb-1">Seus direitos incluem:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Exportar uma cópia dos seus dados</li>
                  <li>Solicitar correção de dados incorretos</li>
                  <li>Solicitar exclusão da sua conta</li>
                  <li>Revogar consentimentos a qualquer momento</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};