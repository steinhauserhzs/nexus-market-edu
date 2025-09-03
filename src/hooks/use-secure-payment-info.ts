import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentInfo {
  id: string;
  pix_key?: string;
  stripe_account_id?: string;
  bank_account?: any;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

interface PaymentAuditLog {
  id: string;
  action: string;
  success: boolean;
  error_message?: string;
  audit_timestamp: string;
}

export function useSecurePaymentInfo() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar informações de pagamento de forma segura
  const fetchPaymentInfo = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('secure_get_payment_info');

      if (rpcError) {
        console.error('Erro ao buscar informações de pagamento:', rpcError);
        if (rpcError.message.includes('ACESSO_NEGADO')) {
          setError('Acesso negado. Faça login para continuar.');
        } else {
          setError('Erro ao carregar informações de pagamento.');
        }
        return;
      }

      // Se há dados, pegar o primeiro resultado
      if (data && data.length > 0) {
        setPaymentInfo(data[0]);
      } else {
        setPaymentInfo(null);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro inesperado ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  // Inserir informações de pagamento de forma segura
  const insertPaymentInfo = async (data: {
    pix_key?: string;
    stripe_account_id?: string;
    bank_account?: any;
  }) => {
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('secure_insert_payment_info', {
          p_pix_key: data.pix_key || null,
          p_stripe_account_id: data.stripe_account_id || null,
          p_bank_account: data.bank_account || null,
        });

      if (rpcError) {
        console.error('Erro ao inserir informações:', rpcError);
        
        if (rpcError.message.includes('DUPLICADO')) {
          toast({
            title: "Informação já existe",
            description: "Você já possui informações de pagamento cadastradas.",
            variant: "destructive",
          });
          return false;
        } else if (rpcError.message.includes('DADOS_INVALIDOS')) {
          toast({
            title: "Dados inválidos",
            description: "Verifique se todos os dados estão corretos.",
            variant: "destructive",
          });
          return false;
        } else if (rpcError.message.includes('ACESSO_NEGADO')) {
          toast({
            title: "Acesso negado",
            description: "Você precisa estar logado para salvar informações.",
            variant: "destructive",
          });
          return false;
        }

        throw rpcError;
      }

      toast({
        title: "Sucesso!",
        description: "Informações de pagamento salvas com segurança.",
      });

      // Recarregar dados
      await fetchPaymentInfo();
      return true;
    } catch (error) {
      console.error('Erro ao inserir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as informações.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Atualizar informações de pagamento de forma segura
  const updatePaymentInfo = async (data: {
    pix_key?: string;
    stripe_account_id?: string;
    bank_account?: any;
  }) => {
    try {
      const { data: result, error: rpcError } = await supabase
        .rpc('secure_update_payment_info', {
          p_pix_key: data.pix_key || null,
          p_stripe_account_id: data.stripe_account_id || null,
          p_bank_account: data.bank_account || null,
        });

      if (rpcError) {
        console.error('Erro ao atualizar informações:', rpcError);
        
        if (rpcError.message.includes('ACESSO_NEGADO')) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para atualizar estes dados.",
            variant: "destructive",
          });
          return false;
        }

        throw rpcError;
      }

      if (result) {
        toast({
          title: "Atualizado!",
          description: "Informações de pagamento atualizadas com segurança.",
        });

        // Recarregar dados
        await fetchPaymentInfo();
        return true;
      } else {
        toast({
          title: "Nenhuma alteração",
          description: "Não foram encontradas informações para atualizar.",
          variant: "default",
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    fetchPaymentInfo();
  }, [user]);

  return {
    paymentInfo,
    loading,
    error,
    insertPaymentInfo,
    updatePaymentInfo,
    refetch: fetchPaymentInfo,
  };
}

// Hook para logs de auditoria
export function usePaymentAuditLogs() {
  const [logs, setLogs] = useState<PaymentAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLogs = async (startDate?: Date, endDate?: Date) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc('get_my_payment_audit_logs', {
          start_date: startDate?.toISOString() || null,
          end_date: endDate?.toISOString() || null,
        });

      if (error) {
        console.error('Erro ao buscar logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  return {
    logs,
    loading,
    fetchLogs,
  };
}