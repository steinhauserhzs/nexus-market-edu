import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Plus, 
  Store, 
  Settings, 
  BarChart3 
} from "lucide-react";

interface KPIData {
  salesToday: number;
  revenueToday: number;
  salesMonth: number;
  revenueMonth: number;
  itemsMonth: number;
  newCustomersMonth: number;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  niche?: string;
}

const SellerDashboardSlim = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPIData>({
    salesToday: 0,
    revenueToday: 0,
    salesMonth: 0,
    revenueMonth: 0,
    itemsMonth: 0,
    newCustomersMonth: 0
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [consolidatedView, setConsolidatedView] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  useEffect(() => {
    if (stores.length > 0) {
      fetchKPIs();
    }
  }, [stores, selectedStore, consolidatedView]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, niche')
        .eq('owner_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setStores(data || []);
      if (data && data.length > 0 && !consolidatedView) {
        setSelectedStore(data[0]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      
      // Buscar dados dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let storeIds = stores.map(s => s.id);
      if (!consolidatedView && selectedStore) {
        storeIds = [selectedStore.id];
      }

      // Buscar orders com joins
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!inner(
            product_id,
            quantity,
            unit_price_cents,
            products!inner(store_id)
          )
        `)
        .in('order_items.products.store_id', storeIds)
        .eq('payment_status', 'paid')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Calcular KPIs
      const todayOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= today && orderDate < tomorrow;
      }) || [];

      const monthOrders = orders || [];

      const salesToday = todayOrders.length;
      const revenueToday = todayOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0);
      
      const salesMonth = monthOrders.length;
      const revenueMonth = monthOrders.reduce((sum, order) => sum + (order.total_cents || 0), 0);
      
      const itemsMonth = monthOrders.reduce((sum, order) => {
        return sum + (order.order_items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0);
      }, 0);

      // Contar clientes únicos do mês
      const uniqueCustomers = new Set(monthOrders.map(order => order.user_id).filter(Boolean));
      const newCustomersMonth = uniqueCustomers.size;

      setKpis({
        salesToday,
        revenueToday,
        salesMonth,
        revenueMonth,
        itemsMonth,
        newCustomersMonth
      });

    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Allow access to authenticated users (removed seller role restriction)
  // Users can access dashboard and become sellers by creating stores
  useEffect(() => {
    // Remove role restriction - anyone can access dashboard
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Dashboard do Vendedor - Nexus Market"
        description="Acompanhe suas vendas, receitas e performance em tempo real"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard do Vendedor</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho das suas vendas
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {stores.length > 1 && (
              <Button
                variant={consolidatedView ? "default" : "outline"}
                onClick={() => setConsolidatedView(!consolidatedView)}
              >
                {consolidatedView ? "Visão Consolidada" : "Por Loja"}
              </Button>
            )}
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : kpis.salesToday}</div>
              <p className="text-xs text-muted-foreground">pedidos confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(kpis.revenueToday)}
              </div>
              <p className="text-xs text-muted-foreground">faturamento bruto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas (Mês)</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : kpis.salesMonth}</div>
              <p className="text-xs text-muted-foreground">últimos 30 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(kpis.revenueMonth)}
              </div>
              <p className="text-xs text-muted-foreground">últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/produto/novo')}
              >
                <Plus className="h-5 w-5" />
                Cadastrar Produto
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => stores[0] && navigate(`/loja/${stores[0].slug}`)}
                disabled={stores.length === 0}
              >
                <Store className="h-5 w-5" />
                Ver Minha Loja
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/personalizar-loja')}
              >
                <Settings className="h-5 w-5" />
                Personalizar Loja
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/analytics')}
              >
                <BarChart3 className="h-5 w-5" />
                Analytics Completo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis.salesMonth > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Vendas dos últimos 30 dias</p>
                    <p className="text-sm text-muted-foreground">
                      {kpis.itemsMonth} produtos vendidos para {kpis.newCustomersMonth} clientes
                    </p>
                  </div>
                  <Badge variant="secondary">{kpis.salesMonth} pedidos</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Ainda não há vendas registradas</p>
                <Button onClick={() => navigate('/produto/novo')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prompt para criar loja se não tiver nenhuma */}
        {stores.length === 0 && (
          <Card className="mt-8 border-dashed">
            <CardContent className="text-center py-8">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Crie sua primeira loja</h3>
              <p className="text-muted-foreground mb-4">
                Configure sua loja para começar a vender produtos digitais
              </p>
              <Button onClick={() => navigate('/criar-loja')}>
                Criar Loja Agora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardSlim;