import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentInfo {
  id: string;
  pix_key?: string;
  stripe_account_id?: string;
  bank_account?: any;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  action: string;
  success: boolean;
  error_message?: string;
  audit_timestamp: string;
}

export function useSecurePaymentInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar informações de pagamento de forma segura
  const fetchPaymentInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('secure_get_payment_info');

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setPaymentInfo(data?.[0] || null);
    } catch (err: any) {
      console.error('Erro ao buscar informações de pagamento:', err);
      setError(err.message);
      
      if (err.message.includes('ACESSO_NEGADO')) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar essas informações.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para inserir informações de pagamento
  const insertPaymentInfo = async (data: {
    pix_key?: string;
    stripe_account_id?: string;
    bank_account?: any;
  }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: rpcError } = await supabase
        .rpc('secure_insert_payment_info', {
          p_pix_key: data.pix_key || null,
          p_stripe_account_id: data.stripe_account_id || null,
          p_bank_account: data.bank_account || null,
        });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      toast({
        title: "Sucesso!",
        description: "Informações de pagamento salvas com segurança.",
      });

      // Recarregar dados
      await fetchPaymentInfo();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao inserir informações de pagamento:', err);
      setError(err.message);
      
      let errorMessage = "Erro ao salvar informações de pagamento.";
      
      if (err.message.includes('ACESSO_NEGADO')) {
        errorMessage = "Acesso negado. Faça login para continuar.";
      } else if (err.message.includes('DUPLICADO')) {
        errorMessage = "Você já possui informações de pagamento cadastradas.";
      } else if (err.message.includes('DADOS_INVALIDOS')) {
        errorMessage = "Dados inválidos. Verifique a chave PIX.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar informações de pagamento
  const updatePaymentInfo = async (data: {
    pix_key?: string;
    stripe_account_id?: string;
    bank_account?: any;
  }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const { data: result, error: rpcError } = await supabase
        .rpc('secure_update_payment_info', {
          p_pix_key: data.pix_key || null,
          p_stripe_account_id: data.stripe_account_id || null,
          p_bank_account: data.bank_account || null,
        });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      toast({
        title: "Sucesso!",
        description: "Informações de pagamento atualizadas com segurança.",
      });

      // Recarregar dados
      await fetchPaymentInfo();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao atualizar informações de pagamento:', err);
      setError(err.message);
      
      let errorMessage = "Erro ao atualizar informações de pagamento.";
      
      if (err.message.includes('ACESSO_NEGADO')) {
        errorMessage = "Acesso negado. Faça login para continuar.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar logs de auditoria
  const fetchAuditLogs = async () => {
    if (!user) return;

    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_my_payment_audit_logs');

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      setAuditLogs(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar logs de auditoria:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPaymentInfo();
      fetchAuditLogs();
    } else {
      setPaymentInfo(null);
      setAuditLogs([]);
    }
  }, [user]);

  return {
    paymentInfo,
    auditLogs,
    loading,
    error,
    insertPaymentInfo,
    updatePaymentInfo,
    fetchPaymentInfo,
    fetchAuditLogs,
  };
}

// Hook separado para logs de auditoria (para compatibilidade)
export function usePaymentAuditLogs() {
  const { auditLogs, fetchAuditLogs, loading, error } = useSecurePaymentInfo();
  
  return {
    logs: auditLogs,
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
  };
}