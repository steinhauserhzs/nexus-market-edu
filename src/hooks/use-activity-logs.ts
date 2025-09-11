import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  details: any;
  created_at: string;
}

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      setError(error.message);
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs
  };
};

export const useDeleteProduct = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.rpc('soft_delete_product', {
        p_product_id: productId
      });

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso e não será mais visível.",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProduct,
    loading
  };
};