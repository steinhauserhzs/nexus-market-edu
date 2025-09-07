import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  status: 'Ativo' | 'Inativo';
  firstOrderDate: string;
}

interface CustomerAnalytics {
  customers: Customer[];
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  averageTicket: number;
}

export function useCustomerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<CustomerAnalytics>({
    customers: [],
    totalCustomers: 0,
    newThisMonth: 0,
    activeCustomers: 0,
    averageTicket: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCustomerAnalytics();
    }
  }, [user]);

  const fetchCustomerAnalytics = async () => {
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

      // Buscar produtos das lojas
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .in('store_id', storeIds);

      const productIds = products?.map(p => p.id) || [];

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      // Buscar pedidos pagos com informações do cliente
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          customer_name,
          customer_email,
          customer_phone,
          total_cents,
          created_at,
          payment_status,
          order_items!inner(
            product_id,
            quantity,
            unit_price_cents
          )
        `)
        .eq('payment_status', 'paid')
        .in('order_items.product_id', productIds);

      if (!orders) {
        setLoading(false);
        return;
      }

      // Processar dados dos clientes
      const customerMap = new Map<string, Customer>();
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      orders.forEach(order => {
        const customerId = order.customer_email || order.user_id;
        if (!customerId) return;

        const orderDate = new Date(order.created_at);
        const orderTotal = order.total_cents / 100;

        if (customerMap.has(customerId)) {
          const customer = customerMap.get(customerId)!;
          customer.totalSpent += orderTotal;
          customer.orderCount += 1;
          
          if (orderDate > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.created_at;
          }
          
          if (orderDate < new Date(customer.firstOrderDate)) {
            customer.firstOrderDate = order.created_at;
          }
        } else {
          customerMap.set(customerId, {
            id: customerId,
            name: order.customer_name || 'Cliente',
            email: order.customer_email || '',
            phone: order.customer_phone,
            totalSpent: orderTotal,
            orderCount: 1,
            lastOrderDate: order.created_at,
            firstOrderDate: order.created_at,
            status: 'Ativo' as const
          });
        }
      });

      const customers = Array.from(customerMap.values());

      // Calcular métricas
      const totalCustomers = customers.length;
      const newThisMonth = customers.filter(c => 
        new Date(c.firstOrderDate) >= thisMonthStart
      ).length;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeCustomers = customers.filter(c => 
        new Date(c.lastOrderDate) >= thirtyDaysAgo
      ).length;

      // Marcar clientes inativos
      customers.forEach(customer => {
        if (new Date(customer.lastOrderDate) < thirtyDaysAgo) {
          customer.status = 'Inativo';
        }
      });

      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const averageTicket = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

      // Ordenar por total gasto
      customers.sort((a, b) => b.totalSpent - a.totalSpent);

      setAnalytics({
        customers,
        totalCustomers,
        newThisMonth,
        activeCustomers,
        averageTicket
      });

    } catch (error) {
      console.error('Error fetching customer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, refetch: fetchCustomerAnalytics };
}