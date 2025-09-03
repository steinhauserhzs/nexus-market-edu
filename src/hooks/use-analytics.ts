import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  totalViews: number;
  totalCartAdds: number;
  totalSales: number;
  totalRevenue: number;
  recentViews: number;
  recentCartAdds: number;
  recentSales: number;
  topProducts: Array<{
    id: string;
    title: string;
    views: number;
    cartAdds: number;
    sales: number;
  }>;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalCartAdds: 0,
    totalSales: 0,
    totalRevenue: 0,
    recentViews: 0,
    recentCartAdds: 0,
    recentSales: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar produtos do usuário
      const { data: userProducts } = await supabase
        .from('products')
        .select('id, title')
        .eq('store_id', user.id);

      if (!userProducts?.length) {
        setLoading(false);
        return;
      }

      const productIds = userProducts.map(p => p.id);
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      // Buscar visualizações totais
      const { count: totalViews } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true })
        .in('product_id', productIds);

      // Buscar visualizações recentes (últimos 7 dias)
      const { count: recentViews } = await supabase
        .from('product_views')
        .select('*', { count: 'exact', head: true })
        .in('product_id', productIds)
        .gte('created_at', last7Days.toISOString());

      // Buscar adições ao carrinho totais
      const { count: totalCartAdds } = await supabase
        .from('cart_analytics')
        .select('*', { count: 'exact', head: true })
        .in('product_id', productIds);

      // Buscar adições ao carrinho recentes
      const { count: recentCartAdds } = await supabase
        .from('cart_analytics')
        .select('*', { count: 'exact', head: true })
        .in('product_id', productIds)
        .gte('created_at', last7Days.toISOString());

      // Buscar transações e receita
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount_cents, seller_amount_cents, created_at')
        .eq('seller_id', user.id)
        .eq('status', 'completed');

      const totalSales = transactions?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.seller_amount_cents || 0), 0) || 0;
      
      const recentTransactions = transactions?.filter(t => 
        new Date(t.created_at) >= last7Days
      ) || [];
      const recentSales = recentTransactions.length;

      // Buscar produtos mais populares
      const { data: topProductsData } = await supabase
        .from('product_views')
        .select(`
          product_id,
          products!inner(title)
        `)
        .in('product_id', productIds);

      // Processar produtos mais populares
      const productViewCounts = topProductsData?.reduce((acc, view) => {
        const productId = view.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            title: view.products.title,
            views: 0,
            cartAdds: 0,
            sales: 0,
          };
        }
        acc[productId].views++;
        return acc;
      }, {} as Record<string, any>) || {};

      const topProducts = Object.values(productViewCounts)
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 5);

      setAnalytics({
        totalViews: totalViews || 0,
        totalCartAdds: totalCartAdds || 0,
        totalSales,
        totalRevenue,
        recentViews: recentViews || 0,
        recentCartAdds: recentCartAdds || 0,
        recentSales,
        topProducts,
      });
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchAnalytics };
}

// Hook para rastrear visualização de produto
export function useTrackProductView() {
  const trackView = async (productId: string) => {
    try {
      await supabase
        .from('product_views')
        .insert({
          product_id: productId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        });
    } catch (error) {
      console.error('Erro ao rastrear visualização:', error);
    }
  };

  return { trackView };
}

// Hook para rastrear adição ao carrinho
export function useTrackCartAdd() {
  const trackCartAdd = async (productId: string, quantity: number = 1) => {
    try {
      await supabase
        .from('cart_analytics')
        .insert({
          product_id: productId,
          quantity,
        });
    } catch (error) {
      console.error('Erro ao rastrear carrinho:', error);
    }
  };

  return { trackCartAdd };
}