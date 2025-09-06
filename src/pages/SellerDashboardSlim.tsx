import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/ui/seo-head";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Plus,
  Store,
  Settings,
  BarChart3,
  CreditCard,
  Eye,
  Palette
} from "lucide-react";

interface KPIData {
  sales_today: number;
  sales_month: number;
  revenue_today_cents: number;
  revenue_month_cents: number;
  items_sold_month: number;
  new_customers_month: number;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  niche: string;
}

const SellerDashboardSlim = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [kpis, setKpis] = useState<KPIData>({
    sales_today: 0,
    sales_month: 0,
    revenue_today_cents: 0,
    revenue_month_cents: 0,
    items_sold_month: 0,
    new_customers_month: 0
  });
  
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [consolidated, setConsolidated] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  useEffect(() => {
    if (stores.length > 0) {
      fetchKPIs();
    }
  }, [stores, selectedStore, consolidated]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, niche')
        .eq('owner_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);
      if (data && data.length > 0) {
        setSelectedStore(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Erro ao carregar lojas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      
      // Simulate KPI calculation since we don't have the edge function yet
      // In production, this would call the get-seller-kpis edge function
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price_cents
          )
        `)
        .eq('payment_status', 'paid')
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate KPIs from orders data
      const today = new Date().toDateString();
      const thisMonth = new Date();
      thisMonth.setDate(1);

      let todaySales = 0;
      let todayRevenue = 0;
      let monthSales = 0;
      let monthRevenue = 0;
      let monthItems = 0;
      const uniqueCustomers = new Set();

      (orders || []).forEach((order: any) => {
        const orderDate = new Date(order.created_at);
        const isToday = orderDate.toDateString() === today;
        const isThisMonth = orderDate >= thisMonth;

        if (isToday) {
          todaySales++;
          todayRevenue += order.total_cents;
        }

        if (isThisMonth) {
          monthSales++;
          monthRevenue += order.total_cents;
          uniqueCustomers.add(order.user_id);
          
          if (order.order_items) {
            order.order_items.forEach((item: any) => {
              monthItems += item.quantity;
            });
          }
        }
      });

      setKpis({
        sales_today: todaySales,
        sales_month: monthSales,
        revenue_today_cents: todayRevenue,
        revenue_month_cents: monthRevenue,
        items_sold_month: monthItems,
        new_customers_month: uniqueCustomers.size
      });
      
    } catch (error: any) {
      console.error('Error fetching KPIs:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      });
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

  const kpiCards = [
    {
      title: "Vendas Hoje",
      value: kpis.sales_today,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Receita Hoje",
      value: formatCurrency(kpis.revenue_today_cents),
      icon: DollarSign,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    {
      title: "Vendas no Mês",
      value: kpis.sales_month,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Receita no Mês",
      value: formatCurrency(kpis.revenue_month_cents),
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const quickActions = [
    {
      title: "Cadastrar Produto",
      description: "Adicionar novo curso, pack ou PDF",
      icon: Plus,
      action: () => navigate('/products/new'),
      color: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    {
      title: "Ver Minha Loja",
      description: "Visualizar como os clientes veem",
      icon: Eye,
      action: () => {
        const mainStore = stores.find(s => !s.niche || s.niche === 'geral');
        if (mainStore) {
          navigate(`/loja/${mainStore.slug}`);
        }
      },
      color: "bg-secondary text-secondary-foreground hover:bg-secondary/90"
    },
    {
      title: "Configurar Membros",
      description: "Personalizar área de membros",
      icon: Palette,
      action: () => {
        const mainStore = stores.find(s => !s.niche || s.niche === 'geral');
        if (mainStore) {
          navigate(`/loja/${mainStore.slug}/customizar`);
        }
      },
      color: "bg-accent text-accent-foreground hover:bg-accent/90"
    },
    {
      title: "Analytics Detalhado",
      description: "Ver relatórios completos",
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: "bg-muted text-muted-foreground hover:bg-muted/90"
    }
  ];

  // Redirect if not seller
  if (profile && profile.role !== 'seller') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOHead 
        title="Dashboard do Vendedor - Nexus Market"
        description="Gerencie suas vendas, produtos e métricas em uma interface simplificada"
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Dashboard do Vendedor
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {profile?.full_name || user?.email}
            </p>
          </div>
          
          {stores.length > 1 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {stores.length} {stores.length === 1 ? 'loja' : 'lojas'}
              </Badge>
              {/* TODO: Add store selector for multi-niche */}
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${loading ? 'animate-pulse' : ''}`}>
                  {loading ? '...' : kpi.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center text-center space-y-2 ${action.color}`}
                  onClick={action.action}
                >
                  <action.icon className="w-6 h-6" />
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-75">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Suas vendas e atividades aparecerão aqui</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/products/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </div>
          </CardContent>
        </Card>

        {stores.length === 0 && (
          <Card className="mt-8 border-dashed">
            <CardContent className="text-center py-12">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Crie sua primeira loja</h3>
              <p className="text-muted-foreground mb-6">
                Configure sua loja para começar a vender produtos digitais
              </p>
              <Button onClick={() => navigate('/stores/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Loja
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerDashboardSlim;