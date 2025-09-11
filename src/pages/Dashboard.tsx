import { useState } from "react";
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
import { useProducts } from "@/hooks/use-products";
import DeleteProductDialog from "@/components/products/delete-product-dialog";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Plus,
  BarChart3,
  Store,
  Eye,
  Edit,
  Search,
  Star,
  Trash2
} from "lucide-react";

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { products: userProducts, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId?: string; productTitle?: string }>({ 
    open: false 
  });

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
      <div className="px-4 sm:px-6">
        <BackNavigation title="Dashboard" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 md:space-y-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in px-2">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Dashboard
              </h1>
              <p className="text-lg sm:text-xl text-primary/80 font-medium truncate">
                {profile?.full_name || "Usuário"}
              </p>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie suas lojas, produtos e vendas
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/produto/novo')}
            variant="accent"
            size="lg"
            className="w-full sm:w-auto h-12 rounded-xl font-medium flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
          <div className="w-full overflow-x-auto animate-slide-up px-2">
            <TabsList className="inline-flex w-max min-w-full justify-start gap-1 sm:gap-2 bg-muted/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl">
              <TabsTrigger value="overview" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Visão Geral</TabsTrigger>
              <TabsTrigger value="stores" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Lojas</TabsTrigger>
              <TabsTrigger value="products" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Produtos</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Analytics</TabsTrigger>
              <TabsTrigger value="content" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Conteúdo</TabsTrigger>
              <TabsTrigger value="messages" className="flex-shrink-0 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm px-3 sm:px-4 py-2">Mensagens</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Quick Stats */}
            <AnalyticsSection />

            {/* Quick Actions */}
            <Card className="rounded-xl sm:rounded-2xl border-border/50 shadow-lg mx-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg min-h-[80px] sm:min-h-[100px]"
                    onClick={() => navigate('/criar-loja')}
                  >
                    <Store className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                    <span className="text-xs sm:text-sm font-semibold text-center">Nova Loja</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-6 flex-col gap-3 rounded-2xl border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => setActiveTab("analytics")}
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
            {/* Lista de Produtos */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : userProducts.length === 0 ? (
              <Card className="rounded-xl sm:rounded-2xl border-border/50 shadow-lg mx-2">
                <CardContent className="pt-6 text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Produto Encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro produto para começar a vender.
                  </p>
                  <Button onClick={() => navigate('/produto/novo')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mx-2">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Meus Produtos</h2>
                    <p className="text-sm text-muted-foreground">
                      {userProducts.length} produto{userProducts.length !== 1 ? 's' : ''} encontrado{userProducts.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/produto/novo')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>

                <div className="grid gap-4 md:gap-6">
                  {userProducts.map((product) => (
                    <Card key={product.id} className="rounded-xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Imagem do produto */}
                          <div className="w-full sm:w-24 h-32 sm:h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.thumbnail_url ? (
                              <img 
                                src={product.thumbnail_url} 
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>

                          {/* Informações do produto */}
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                                  {product.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {product.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                                  {product.status === 'published' ? 'Publicado' : 'Rascunho'}
                                </Badge>
                                <Badge variant="outline">
                                  {product.type === 'digital' ? 'Digital' : 
                                   product.type === 'curso' ? 'Curso' : 'Físico'}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium text-foreground">
                                    R$ {(product.price_cents / 100).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>0 visualizações</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  <span>0 avaliações</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/produto/${product.slug}`)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/produto/${product.slug}/editar`)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => setDeleteDialog({ 
                                    open: true, 
                                    productId: product.id, 
                                    productTitle: product.title 
                                  })}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
                  <Button onClick={() => setActiveTab("products")}>
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

      {/* Delete Product Dialog */}
      <DeleteProductDialog
        productId={deleteDialog.productId || ''}
        productTitle={deleteDialog.productTitle || ''}
        isOpen={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        onDeleted={() => {
          refetchProducts();
          setDeleteDialog({ open: false });
        }}
      />
    </div>
  );
};

export default Dashboard;