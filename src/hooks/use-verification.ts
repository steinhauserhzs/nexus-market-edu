import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationResult {
  success: boolean;
  message: string;
  verificationCode?: string; // For demo purposes with CPF
}

export const useVerification = () => {
  const [loading, setLoading] = useState(false);

  const sendPhoneVerification = async (phone: string): Promise<VerificationResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-sms', {
        body: { phone }
      });

      if (error) {
        throw error;
      }

      return data as VerificationResult;
    } catch (error: any) {
      console.error('Error sending phone verification:', error);
      return {
        success: false,
        message: error.message || 'Erro ao enviar SMS de verificação'
      };
    } finally {
      setLoading(false);
    }
  };

  const sendCPFVerification = async (cpf: string): Promise<VerificationResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-cpf', {
        body: { cpf }
      });

      if (error) {
        throw error;
      }

      return data as VerificationResult;
    } catch (error: any) {
      console.error('Error verifying CPF:', error);
      return {
        success: false,
        message: error.message || 'Erro ao verificar CPF'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string, type: 'phone' | 'cpf'): Promise<VerificationResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_code_and_update_profile', {
        p_code: code,
        p_type: type
      });

      if (error) {
        throw error;
      }

      return (data as any) as VerificationResult;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: error.message || 'Erro ao verificar código'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendPhoneVerification,
    sendCPFVerification,
    verifyCode
  };
};