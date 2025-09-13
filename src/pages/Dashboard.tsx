import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin-layout";
import StoresSection from "@/components/dashboard/stores-section";
import EnhancedAnalyticsSection from "@/components/dashboard/enhanced-analytics-section";
import MessagesSection from "@/components/dashboard/messages-section";
import SalesDashboard from "@/components/analytics/sales-dashboard";
import ModuleManager from "@/components/modules/module-manager";
import { useProducts } from "@/hooks/use-products-filtered";
import { useStores } from "@/contexts/StoreContext";
import { StoreSelector } from "@/components/ui/store-selector";
import DeleteProductDialog from "@/components/products/delete-product-dialog";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Plus,
  PlusCircle,
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
  const { currentStore, stores } = useStores();
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
    <AdminLayout>
      <div className="container mx-auto px-6 py-8 space-y-6 md:space-y-8 max-w-7xl">
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
            <EnhancedAnalyticsSection />
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
            ) : !currentStore ? (
              <Card className="rounded-xl sm:rounded-2xl border-border/50 shadow-lg mx-2">
                <CardContent className="pt-6 text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma Loja</h3>
                  <p className="text-muted-foreground mb-4">
                    Escolha uma loja para ver e gerenciar seus produtos.
                  </p>
                </CardContent>
              </Card>
            ) : userProducts.length === 0 ? (
              <Card className="rounded-xl sm:rounded-2xl border-border/50 shadow-lg mx-2">
                <CardContent className="pt-6 text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Produto na {currentStore.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro produto para esta loja.
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
                    <h2 className="text-xl font-semibold">
                      Produtos da {currentStore?.name || 'Loja'}
                    </h2>
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
    </AdminLayout>
  );
};

export default Dashboard;