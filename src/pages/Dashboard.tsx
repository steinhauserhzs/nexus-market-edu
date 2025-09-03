import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackNavigation from "@/components/layout/back-navigation";
import StoresSection from "@/components/dashboard/stores-section";
import AnalyticsSection from "@/components/dashboard/analytics-section";
import MessagesSection from "@/components/dashboard/messages-section";
import SalesDashboard from "@/components/analytics/sales-dashboard";
import ModuleManager from "@/components/modules/module-manager";
import ProductForm from "@/components/products/product-form";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Plus,
  BarChart3,
  Store,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Store className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Faça login para acessar o dashboard
              </p>
              <a href="/auth" className="inline-block">
                <Button>Fazer Login</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <BackNavigation title="Dashboard" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Dashboard - {profile?.full_name || "Usuário"}
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas lojas, produtos e vendas
            </p>
          </div>
          
          <a href="/criar-loja">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </a>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stores">Lojas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <AnalyticsSection />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => navigate('#products')}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">Novo Produto</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => navigate('#analytics')}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => navigate('#content')}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Gerenciar Cursos</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => navigate('/biblioteca')}
                  >
                    <Eye className="w-6 h-6" />
                    <span className="text-sm">Ver Biblioteca</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nova venda realizada</p>
                      <p className="text-xs text-muted-foreground">Curso de React - R$ 197,00</p>
                    </div>
                    <span className="text-xs text-muted-foreground">há 2h</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Produto visualizado</p>
                      <p className="text-xs text-muted-foreground">Curso de Design UI</p>
                    </div>
                    <span className="text-xs text-muted-foreground">há 4h</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Novo afiliado</p>
                      <p className="text-xs text-muted-foreground">João Silva se cadastrou</p>
                    </div>
                    <span className="text-xs text-muted-foreground">há 6h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stores" className="space-y-6">
            <StoresSection />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Produto</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adicione um novo produto à sua loja
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Funcionalidade de criação de produtos em desenvolvimento.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Em breve você poderá criar produtos diretamente pelo dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SalesDashboard />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Conteúdo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gerencie os módulos e aulas dos seus cursos
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Funcionalidade de gestão de conteúdo em desenvolvimento.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Em breve você poderá gerenciar módulos e aulas dos seus cursos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <MessagesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;