import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStores } from '@/contexts/StoreContext';

export const useProducts = () => {
  const { user } = useAuth();
  const { currentStore } = useStores();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          stores!inner(owner_id)
        `)
        .eq('stores.owner_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Se há uma loja atual selecionada, filtrar apenas os produtos dessa loja
      if (currentStore) {
        query = query.eq('store_id', currentStore.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [user, currentStore]);

  return {
    products,
    loading,
    refetch,
  };
};