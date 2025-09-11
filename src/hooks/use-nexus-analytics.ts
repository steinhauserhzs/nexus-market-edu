import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NexusAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalOrders: number;
  topProducts: Array<{
    id: string;
    title: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
    customer_name?: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export const useNexusAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<NexusAnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    topProducts: [],
    recentOrders: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's stores
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      if (storesError) throw storesError;

      if (!stores || stores.length === 0) {
        setAnalytics({
          totalUsers: 0,
          activeUsers: 0,
          totalRevenue: 0,
          totalOrders: 0,
          topProducts: [],
          recentOrders: [],
          monthlyRevenue: []
        });
        return;
      }

      const storeIds = stores.map(store => store.id);

      // Get products for these stores
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, price_cents')
        .in('store_id', storeIds);

      if (productsError) throw productsError;

      const productIds = products?.map(p => p.id) || [];

      // Get orders for these products
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_cents,
          status,
          created_at,
          customer_name,
          order_items!inner(
            product_id,
            quantity,
            unit_price_cents
          )
        `)
        .in('order_items.product_id', productIds)
        .eq('payment_status', 'paid');

      if (ordersError) throw ordersError;

      // Get licenses (active users)
      const { data: licenses, error: licensesError } = await supabase
        .from('licenses')
        .select('user_id, product_id')
        .in('product_id', productIds)
        .eq('is_active', true);

      if (licensesError) throw licensesError;

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const totalOrders = orders?.length || 0;
      const uniqueUsers = new Set(licenses?.map(l => l.user_id)).size;
      const activeUsers = licenses?.length || 0;

      // Top products
      const productSales = new Map<string, { sales: number; revenue: number; title: string }>();
      
      orders?.forEach((order) => {
        order.order_items?.forEach((item: any) => {
          const product = products?.find(p => p.id === item.product_id);
          if (product) {
            const current = productSales.get(product.id) || { sales: 0, revenue: 0, title: product.title };
            current.sales += item.quantity;
            current.revenue += item.unit_price_cents * item.quantity;
            productSales.set(product.id, current);
          }
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent orders
      const recentOrders = orders
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(order => ({
          id: order.id,
          total: order.total_cents / 100,
          status: order.status,
          created_at: order.created_at,
          customer_name: order.customer_name
        })) || [];

      // Monthly revenue (mock data for now)
      const monthlyRevenue = [
        { month: 'Jan', revenue: Math.floor(totalRevenue * 0.1 / 100) },
        { month: 'Fev', revenue: Math.floor(totalRevenue * 0.15 / 100) },
        { month: 'Mar', revenue: Math.floor(totalRevenue * 0.2 / 100) },
      ];

      setAnalytics({
        totalUsers: uniqueUsers,
        activeUsers,
        totalRevenue: totalRevenue / 100,
        totalOrders,
        topProducts: topProducts.map(p => ({
          ...p,
          revenue: p.revenue / 100
        })),
        recentOrders,
        monthlyRevenue
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};