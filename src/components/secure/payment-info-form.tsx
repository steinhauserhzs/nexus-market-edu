import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecurePaymentInfo, usePaymentAuditLogs } from "@/hooks/use-secure-payment-info";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  Shield, 
  Eye, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SecurePaymentInfoForm = () => {
  const { 
    paymentInfo, 
    loading, 
    error, 
    insertPaymentInfo, 
    updatePaymentInfo 
  } = useSecurePaymentInfo();
  
  const { logs, loading: logsLoading } = usePaymentAuditLogs();
  
  const [formData, setFormData] = useState({
    pix_key: '',
    stripe_account_id: '',
    bank_account: {
      bank: '',
      agency: '',
      account: '',
      account_type: 'checking'
    }
  });
  
  const [saving, setSaving] = useState(false);

  // Preencher formulário se houver dados existentes
  React.useEffect(() => {
    if (paymentInfo) {
      setFormData({
        pix_key: paymentInfo.pix_key || '',
        stripe_account_id: paymentInfo.stripe_account_id || '',
        bank_account: paymentInfo.bank_account || {
          bank: '',
          agency: '',
          account: '',
          account_type: 'checking'
        }
      });
    }
  }, [paymentInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const success = paymentInfo 
        ? await updatePaymentInfo(formData)
        : await insertPaymentInfo(formData);
      
      if (success) {
        // Limpar formulário se for inserção
        if (!paymentInfo) {
          setFormData({
            pix_key: '',
            stripe_account_id: '',
            bank_account: {
              bank: '',
              agency: '',
              account: '',
              account_type: 'checking'
            }
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">Carregando informações seguras...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Proteção Avançada Ativa</h3>
              <p className="text-sm text-green-700">
                Suas informações financeiras estão protegidas com criptografia e auditoria completa
              </p>
            </div>
            {paymentInfo?.verified && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="form" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Informações de Pagamento
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Log de Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {paymentInfo ? 'Atualizar' : 'Cadastrar'} Informações de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PIX Key */}
                <div className="space-y-2">
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    type="text"
                    value={formData.pix_key}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      pix_key: e.target.value
                    }))}
                    placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
                  />
                </div>

                {/* Stripe Account ID */}
                <div className="space-y-2">
                  <Label htmlFor="stripe_account_id">ID da Conta Stripe</Label>
                  <Input
                    id="stripe_account_id"
                    type="text"
                    value={formData.stripe_account_id}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      stripe_account_id: e.target.value
                    }))}
                    placeholder="acct_xxxxxxxxxx"
                  />
                </div>

                {/* Bank Account Info */}
                <div className="space-y-4">
                  <Label>Informações Bancárias</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank">Banco</Label>
                      <Input
                        id="bank"
                        type="text"
                        value={formData.bank_account.bank}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bank_account: {
                            ...prev.bank_account,
                            bank: e.target.value
                          }
                        }))}
                        placeholder="Nome do banco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agência</Label>
                      <Input
                        id="agency"
                        type="text"
                        value={formData.bank_account.agency}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bank_account: {
                            ...prev.bank_account,
                            agency: e.target.value
                          }
                        }))}
                        placeholder="0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Conta</Label>
                      <Input
                        id="account"
                        type="text"
                        value={formData.bank_account.account}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bank_account: {
                            ...prev.bank_account,
                            account: e.target.value
                          }
                        }))}
                        placeholder="00000-0"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Salvando com segurança...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {paymentInfo ? 'Atualizar' : 'Salvar'} Informações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Log de Acesso Seguro
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Histórico de todos os acessos às suas informações financeiras
              </p>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2">Carregando logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log de acesso registrado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className={`p-3 rounded-lg border ${
                        log.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          <div>
                            <span className="font-medium capitalize">
                              {log.action === 'read' && 'Leitura'}
                              {log.action === 'insert' && 'Inserção'}
                              {log.action === 'update' && 'Atualização'}
                              {log.action === 'delete' && 'Exclusão'}
                            </span>
                            {log.error_message && (
                              <p className="text-sm text-red-600 mt-1">
                                {log.error_message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.audit_timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurePaymentInfoForm;