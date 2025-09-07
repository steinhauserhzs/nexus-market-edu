import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import MainHeader from "@/components/layout/main-header";
import { 
  Store, 
  Plus, 
  Settings, 
  BarChart3, 
  ShoppingBag, 
  Users, 
  Palette, 
  FileText, 
  MessageCircle,
  BookOpen,
  Star,
  TrendingUp,
  Eye,
  ArrowRight
} from "lucide-react";

interface StoreStats {
  totalStores: number;
  totalProducts: number;
  totalViews: number;
  totalSales: number;
}

const DashboardHome = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StoreStats>({
    totalStores: 0,
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch stores count
      const { count: storesCount } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('is_active', true);

      // First get the store IDs
      const { data: userStores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      const storeIds = userStores?.map(s => s.id) || [];

      // Fetch products count
      let productsCount = 0;
      if (storeIds.length > 0) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .in('store_id', storeIds);
        productsCount = count || 0;
      }

      setStats({
        totalStores: storesCount || 0,
        totalProducts: productsCount,
        totalViews: 0, // TODO: Implement view analytics
        totalSales: 0  // TODO: Implement sales analytics
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const quickActions = [
    {
      icon: Plus,
      title: "Criar Nova Loja",
      description: "Configure uma nova loja do zero",
      action: () => navigate("/criar-loja"),
      color: "bg-blue-500",
      highlight: true
    },
    {
      icon: ShoppingBag,
      title: "Adicionar Produto",
      description: "Publique um novo produto ou curso",
      action: () => navigate("/produto/novo"),
      color: "bg-green-500"
    },
    {
      icon: Palette,
      title: "Personalizar Loja",
      description: "Cores, logos e layout da loja",
      action: () => navigate("/personalizar-loja"),
      color: "bg-purple-500"
    },
    {
      icon: BarChart3,
      title: "Ver Analytics",
      description: "Vendas, visitas e performance",
      action: () => navigate("/analytics"),
      color: "bg-orange-500"
    }
  ];

  const managementOptions = [
    {
      icon: Store,
      title: "Minhas Lojas",
      description: "Gerenciar todas as suas lojas",
      action: () => navigate("/dashboard"),
      count: stats.totalStores
    },
          {
            icon: FileText,
            title: "Meus Produtos", 
            description: "Ver e editar produtos",
            action: () => navigate("/produtos"),
            count: stats.totalProducts
          },
    {
      icon: Users,
      title: "Clientes",
      description: "Base de clientes e vendas",
      action: () => navigate("/dashboard"),
      count: stats.totalSales
    },
    {
      icon: BookOpen,
      title: "Minha Biblioteca",
      description: "Cursos e conteúdos adquiridos",
      action: () => navigate("/biblioteca"),
      count: 0
    }
  ];

  const helpResources = [
    {
      title: "Como criar minha primeira loja",
      description: "Guia passo a passo",
      action: () => navigate("/criar-loja")
    },
    {
      title: "Personalizar aparência",
      description: "Cores, logos e temas",
      action: () => navigate("/personalizar-loja")
    },
    {
      title: "Entender Analytics",
      description: "Métricas e vendas",
      action: () => navigate("/analytics")
    }
  ];

  return (
    <>
      <SEOHead 
        title="Centro de Controle - Nexus Market"
        description="Gerencie suas lojas, produtos e vendas em um só lugar."
      />
      
      <MainHeader />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Olá, {profile?.full_name || "Vendedor"}! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                  Bem-vindo ao seu centro de controle
                </p>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {profile?.role === 'admin' ? '👑 Admin' : 'Vendedor'}
              </Badge>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Lojas</p>
                    <p className="text-2xl font-bold">{loadingStats ? "..." : stats.totalStores}</p>
                  </div>
                  <Store className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos</p>
                    <p className="text-2xl font-bold">{loadingStats ? "..." : stats.totalProducts}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas</p>
                    <p className="text-2xl font-bold">{stats.totalViews}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas</p>
                    <p className="text-2xl font-bold">{stats.totalSales}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-lg transition-all cursor-pointer group ${
                    action.highlight ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <ArrowRight className="w-4 h-4 mx-auto text-muted-foreground group-hover:text-primary" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Management Options */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Gerenciamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {managementOptions.map((option, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={option.action}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <option.icon className="w-6 h-6 text-primary" />
                      <Badge variant="secondary">{option.count}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help & Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Primeiros Passos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {helpResources.map((resource, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={resource.action}
                    >
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Suas atividades recentes aparecerão aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;