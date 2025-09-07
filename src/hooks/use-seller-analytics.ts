import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SellerAnalytics {
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalStores: number;
  recentViews: number;
  recentSales: number;
  recentRevenue: number;
}

export function useSellerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SellerAnalytics>({
    totalViews: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalStores: 0,
    recentViews: 0,
    recentSales: 0,
    recentRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar lojas do usuário
      const { data: stores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .eq('is_active', true);

      if (!stores || stores.length === 0) {
        setLoading(false);
        return;
      }

      const storeIds = stores.map(store => store.id);

      // Buscar produtos do usuário
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .in('store_id', storeIds)
        .eq('status', 'published');

      const productIds = products?.map(product => product.id) || [];

      // Buscar visualizações totais
      const { data: totalViewsData } = await supabase
        .from('product_views')
        .select('id')
        .in('product_id', productIds);

      // Buscar visualizações recentes (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentViewsData } = await supabase
        .from('product_views')
        .select('id')
        .in('product_id', productIds)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Buscar vendas através das order_items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          quantity,
          unit_price_cents,
          order_id,
          orders!inner(
            status,
            payment_status,
            created_at
          )
        `)
        .in('product_id', productIds)
        .eq('orders.payment_status', 'paid');

      // Calcular métricas de vendas
      let totalSales = 0;
      let totalRevenue = 0;
      let recentSales = 0;
      let recentRevenue = 0;

      orderItems?.forEach(item => {
        const quantity = item.quantity;
        const revenue = (item.unit_price_cents * quantity) / 100;
        
        totalSales += quantity;
        totalRevenue += revenue;

        // Verificar se é recente (últimos 7 dias)
        const orderDate = new Date(item.orders.created_at);
        if (orderDate >= sevenDaysAgo) {
          recentSales += quantity;
          recentRevenue += revenue;
        }
      });

      setAnalytics({
        totalViews: totalViewsData?.length || 0,
        totalSales,
        totalRevenue,
        totalProducts: products?.length || 0,
        totalStores: stores.length,
        recentViews: recentViewsData?.length || 0,
        recentSales,
        recentRevenue
      });

    } catch (error) {
      console.error('Error fetching seller analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
}