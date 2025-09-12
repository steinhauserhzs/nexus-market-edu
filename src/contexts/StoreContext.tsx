import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  theme: any;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface StoreContextType {
  stores: Store[];
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  loadStores: () => Promise<void>;
  loading: boolean;
  switchStore: (storeId: string) => Promise<void>;
  getAllStoresStats: () => Promise<any>;
  getCurrentStoreStats: () => Promise<any>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStores = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
      
      // Se não há loja atual definida e há lojas disponíveis, define a primeira
      if (!currentStore && data && data.length > 0) {
        const lastActiveStore = localStorage.getItem(`activeStore_${user.id}`);
        const storeToSet = lastActiveStore 
          ? data.find(store => store.id === lastActiveStore) || data[0]
          : data[0];
        setCurrentStore(storeToSet);
      }
    } catch (error: any) {
      console.error('Error loading stores:', error);
      toast({
        title: "Erro ao carregar lojas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchStore = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store && user) {
      setCurrentStore(store);
      localStorage.setItem(`activeStore_${user.id}`, storeId);
      
      toast({
        title: "Loja alterada",
        description: `Agora você está gerenciando: ${store.name}`,
      });
    }
  };

  const getAllStoresStats = async () => {
    if (!user || stores.length === 0) return null;

    try {
      const storeIds = stores.map(store => store.id);
      
      // Buscar produtos de todas as lojas
      const { data: products } = await supabase
        .from('products')
        .select('id, store_id, price_cents, status')
        .in('store_id', storeIds);

      // Buscar vendas de todas as lojas
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_cents,
          status,
          created_at,
          order_items!inner(
            product_id,
            products!inner(store_id)
          )
        `)
        .eq('status', 'completed')
        .in('order_items.products.store_id', storeIds);

      // Buscar membros (licenças ativas) de todas as lojas
      const { data: licenses } = await supabase
        .from('licenses')
        .select(`
          id,
          user_id,
          is_active,
          products!inner(store_id)
        `)
        .eq('is_active', true)
        .in('products.store_id', storeIds);

      return {
        totalProducts: products?.length || 0,
        totalRevenue: orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0,
        totalSales: orders?.length || 0,
        totalMembers: licenses?.length || 0,
        storesCount: stores.length,
        activeStores: stores.filter(store => store.is_active).length
      };
    } catch (error) {
      console.error('Error fetching all stores stats:', error);
      return null;
    }
  };

  const getCurrentStoreStats = async () => {
    if (!currentStore) return null;

    try {
      // Buscar produtos da loja atual
      const { data: products } = await supabase
        .from('products')
        .select('id, price_cents, status')
        .eq('store_id', currentStore.id);

      // Buscar vendas da loja atual
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_cents,
          status,
          created_at,
          order_items!inner(
            product_id,
            products!inner(store_id)
          )
        `)
        .eq('status', 'completed')
        .eq('order_items.products.store_id', currentStore.id);

      // Buscar membros da loja atual
      const { data: licenses } = await supabase
        .from('licenses')
        .select(`
          id,
          user_id,
          is_active,
          products!inner(store_id)
        `)
        .eq('is_active', true)
        .eq('products.store_id', currentStore.id);

      return {
        storeId: currentStore.id,
        storeName: currentStore.name,
        totalProducts: products?.length || 0,
        totalRevenue: orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0,
        totalSales: orders?.length || 0,
        totalMembers: licenses?.length || 0,
        publishedProducts: products?.filter(p => p.status === 'published').length || 0,
        draftProducts: products?.filter(p => p.status === 'draft').length || 0
      };
    } catch (error) {
      console.error('Error fetching current store stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadStores();
    } else {
      setStores([]);
      setCurrentStore(null);
      setLoading(false);
    }
  }, [user]);

  const value = {
    stores,
    currentStore,
    setCurrentStore,
    loadStores,
    loading,
    switchStore,
    getAllStoresStats,
    getCurrentStoreStats,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export type { Store };