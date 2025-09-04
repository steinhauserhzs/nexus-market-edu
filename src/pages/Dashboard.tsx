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
import { useProducts } from "@/hooks/use-products";
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
  const { products: userProducts, loading: productsLoading } = useProducts();

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
              <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-bottom">
      <BackNavigation title="Dashboard" />
      
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              Dashboard - {profile?.full_name || "Usuário"}
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas lojas, produtos e vendas
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/criar-loja')}
            variant="accent"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Loja
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="w-full overflow-x-auto animate-slide-up">
            <TabsList className="inline-flex w-max min-w-full justify-start gap-2 bg-muted/50 p-2 rounded-2xl">
              <TabsTrigger value="overview" className="flex-shrink-0 rounded-xl font-medium">Visão Geral</TabsTrigger>
              <TabsTrigger value="stores" className="flex-shrink-0 rounded-xl font-medium">Lojas</TabsTrigger>
              <TabsTrigger value="products" className="flex-shrink-0 rounded-xl font-medium">Produtos</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-shrink-0 rounded-xl font-medium">Analytics</TabsTrigger>
              <TabsTrigger value="content" className="flex-shrink-0 rounded-xl font-medium">Conteúdo</TabsTrigger>
              <TabsTrigger value="messages" className="flex-shrink-0 rounded-xl font-medium">Mensagens</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Quick Stats */}
            <AnalyticsSection />

            {/* Quick Actions */}
            <Card className="rounded-2xl border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col gap-3 rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate('#products')}
                  >
                    <Plus className="w-8 h-8 text-accent" />
                    <span className="text-sm font-semibold">Novo Produto</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col gap-3 rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate('#analytics')}
                  >
                    <BarChart3 className="w-8 h-8 text-accent" />
                    <span className="text-sm font-semibold">Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col gap-3 rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate('#content')}
                  >
                    <Users className="w-8 h-8 text-accent" />
                    <span className="text-sm font-semibold">Gerenciar Cursos</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col gap-3 rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate('/biblioteca')}
                  >
                    <Eye className="w-8 h-8 text-accent" />
                    <span className="text-sm font-semibold">Ver Biblioteca</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-2xl border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-accent/50 transition-colors">
                    <div className="w-3 h-3 bg-success rounded-full animate-bounce-in" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Nova venda realizada</p>
                      <p className="text-xs text-muted-foreground">Curso de React - R$ 197,00</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full">há 2h</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-accent/50 transition-colors">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce-in" style={{ animationDelay: '0.1s' }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Produto visualizado</p>
                      <p className="text-xs text-muted-foreground">Curso de Design UI</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full">há 4h</span>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-accent/50 transition-colors">
                    <div className="w-3 h-3 bg-warning rounded-full animate-bounce-in" style={{ animationDelay: '0.2s' }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Novo afiliado</p>
                      <p className="text-xs text-muted-foreground">João Silva se cadastrou</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full">há 6h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stores" className="space-y-6">
            <StoresSection />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductForm />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <SalesDashboard />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : userProducts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Produto Encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro produto para começar a gerenciar conteúdo.
                  </p>
                  <Button onClick={() => navigate('#products')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userProducts.filter(p => p.type === 'curso').map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{product.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description}
                          </p>
                        </div>
                        <Badge variant="outline">{product.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ModuleManager productId={product.id} editable={true} />
                    </CardContent>
                  </Card>
                ))}
                {userProducts.filter(p => p.type === 'curso').length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Nenhum Curso Encontrado</h3>
                      <p className="text-muted-foreground">
                        Apenas produtos do tipo "curso" podem ter módulos e aulas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
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