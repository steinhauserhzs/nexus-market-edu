import { useState, useEffect, useMemo, useCallback } from 'react';
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

// Cache global para admin status (evita verificações repetidas)
const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();

export function useOptimizedAdmin() {
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

  const checkAdminStatus = useCallback(async () => {
    if (!user) return;

    // Check cache first (5 minutes)
    const cached = adminStatusCache.get(user.id);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setIsAdmin(cached.isAdmin);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const adminStatus = data?.role === 'admin';
      
      // Cache the result
      adminStatusCache.set(user.id, { 
        isAdmin: adminStatus, 
        timestamp: Date.now() 
      });
      
      setIsAdmin(adminStatus);
    } catch (error) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { isAdmin, loading };
}

// Cache para stats com timestamp
let statsCache: { data: AdminStats | null; timestamp: number } = { data: null, timestamp: 0 };

export function useOptimizedAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    // Check cache first (2 minutes para stats)
    if (statsCache.data && Date.now() - statsCache.timestamp < 2 * 60 * 1000) {
      setStats(statsCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all stats in parallel (otimizado)
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

      // Calculate revenue (memoized)
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = ordersResult.data?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }).reduce((sum, order) => sum + order.total_cents, 0) || 0;

      const newStats = {
        totalUsers: usersResult.count || 0,
        totalStores: storesResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalRevenue: totalRevenue / 100,
        monthlyRevenue: monthlyRevenue / 100,
        pendingProducts: pendingProductsResult.count || 0,
        activeAffiliates: affiliatesResult.count || 0,
      };

      // Cache the result
      statsCache = { data: newStats, timestamp: Date.now() };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// Cache para logs
let logsCache: { data: AdminLog[]; timestamp: number } = { data: [], timestamp: 0 };

export function useOptimizedAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    // Check cache first (1 minute para logs)
    if (logsCache.data.length > 0 && Date.now() - logsCache.timestamp < 60 * 1000) {
      setLogs(logsCache.data);
      setLoading(false);
      return;
    }

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

      // Cache the result
      logsCache = { data: formattedLogs, timestamp: Date.now() };
      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logAction = useCallback(async (action: string, targetType?: string, targetId?: string, details?: any) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_details: details || {}
      });
      
      // Clear cache to force refresh
      logsCache = { data: [], timestamp: 0 };
      fetchLogs();
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }, [fetchLogs]);

  return { logs, loading, logAction, refetch: fetchLogs };
}

// Cache para system configs
let configsCache: { data: SystemConfig[]; timestamp: number } = { data: [], timestamp: 0 };

export function useOptimizedSystemConfigs() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    // Check cache first (5 minutes para configs)
    if (configsCache.data.length > 0 && Date.now() - configsCache.timestamp < 5 * 60 * 1000) {
      setConfigs(configsCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await supabase
        .from('system_configs')
        .select('*')
        .order('config_key');

      const configData = data || [];
      
      // Cache the result
      configsCache = { data: configData, timestamp: Date.now() };
      setConfigs(configData);
    } catch (error) {
      console.error('Error fetching system configs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (configKey: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_configs')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', configKey);

      if (error) throw error;
      
      // Clear cache to force refresh
      configsCache = { data: [], timestamp: 0 };
      fetchConfigs();
      return { success: true };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error };
    }
  }, [fetchConfigs]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { configs, loading, updateConfig, refetch: fetchConfigs };
}