import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingProducts: number;
  activeAffiliates: number;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: any;
  created_at: string;
  admin_name?: string;
}

interface SystemConfig {
  id: string;
  config_key: string;
  config_value: any;
  description?: string;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        usersResult,
        storesResult,
        productsResult,
        ordersResult,
        pendingProductsResult,
        affiliatesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('stores').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_cents, created_at').eq('status', 'completed'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('affiliates').select('id', { count: 'exact', head: true }).eq('status', 'approved')
      ]);

      // Calculate revenue
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = ordersResult.data?.filter(order => {
        const orderMonth = new Date(order.created_at).getMonth();
        return orderMonth === currentMonth;
      }).reduce((sum, order) => sum + order.total_cents, 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalStores: storesResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalRevenue: totalRevenue / 100, // Convert to reais
        monthlyRevenue: monthlyRevenue / 100,
        pendingProducts: pendingProductsResult.count || 0,
        activeAffiliates: affiliatesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('admin_logs')
        .select(`
          *,
          profiles:admin_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const formattedLogs = data?.map(log => ({
        ...log,
        admin_name: log.profiles?.full_name || 'Admin'
      })) || [];

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const logAction = async (action: string, targetType?: string, targetId?: string, details?: any) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_details: details || {}
      });
      
      fetchLogs(); // Refresh logs
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  return { logs, loading, logAction, refetch: fetchLogs };
}

export function useSystemConfigs() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('system_configs')
        .select('*')
        .order('config_key');

      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching system configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configKey: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_configs')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', configKey);

      if (error) throw error;
      
      fetchConfigs(); // Refresh configs
      return { success: true };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return { configs, loading, updateConfig, refetch: fetchConfigs };
}