import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStores } from "@/contexts/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Settings,
  ArrowLeft
} from "lucide-react";

const StoreSpecific = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { stores, switchStore } = useStores();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [store, setStore] = useState<any>(null);
  const [storeStats, setStoreStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (storeId && user) {
      loadStoreData();
    }
  }, [storeId, user]);

  const loadStoreData = async () => {
    if (!storeId || !user) return;

    setLoading(true);
    try {
      // Buscar dados da loja
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('owner_id', user.id)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Definir como loja ativa
      if (storeData) {
        switchStore(storeData.id);
      }

      // Buscar produtos da loja
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Buscar estatísticas
      await loadStoreStats();

    } catch (error: any) {
      console.error('Error loading store data:', error);
      toast({
        title: "Erro ao carregar loja",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreStats = async () => {
    if (!storeId) return;

    try {
      // Buscar vendas da loja
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_cents,
          status,
          created_at,
          order_items!inner(
            product_id,
            products!inner(store_id)
          )
        `)
        .eq('status', 'completed')
        .eq('order_items.products.store_id', storeId);

      // Buscar membros da loja
      const { data: licenses } = await supabase
        .from('licenses')
        .select(`
          id,
          user_id,
          is_active,
          products!inner(store_id)
        `)
        .eq('is_active', true)
        .eq('products.store_id', storeId);

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const totalSales = orders?.length || 0;
      const totalMembers = licenses?.length || 0;
      const publishedProducts = products.filter(p => p.status === 'published').length;

      setStoreStats({
        totalRevenue,
        totalSales,
        totalMembers,
        totalProducts: products.length,
        publishedProducts,
        draftProducts: products.length - publishedProducts,
      });

    } catch (error) {
      console.error('Error loading store stats:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Carregando loja...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!store) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A loja que você está procurando não existe ou você não tem acesso a ela.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-6 h-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">
                {store.name}
              </h1>
              <Badge variant={store.is_active ? 'default' : 'secondary'}>
                {store.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {store.description || 'Dashboard específico desta loja'}
            </p>
          </div>

          <Button onClick={() => navigate(`/loja/${store.slug}/configuracoes`)}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar Loja
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            {storeStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Receita Total</p>
                        <p className="text-2xl font-bold">
                          R$ {(storeStats.totalRevenue / 100).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Vendas</p>
                        <p className="text-2xl font-bold">{storeStats.totalSales}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Produtos</p>
                        <p className="text-2xl font-bold">{storeStats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">
                          {storeStats.publishedProducts} publicados
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Membros</p>
                        <p className="text-2xl font-bold">{storeStats.totalMembers}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => navigate('/produto/novo')}
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">Novo Produto</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Ver Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => navigate(`/loja/${store.slug}`)}
                  >
                    <Eye className="w-6 h-6" />
                    <span className="text-sm">Ver Loja</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => navigate(`/loja/${store.slug}/configuracoes`)}
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Configurações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Produtos da {store.name}
              </h2>
              <Button onClick={() => navigate('/produto/novo')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum produto nesta loja</h3>
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
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{product.title}</h3>
                            <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                              {product.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-lg font-bold mt-2">
                            R$ {(product.price_cents / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Vendas da {store.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de vendas em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Membros da {store.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidade de membros em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics da {store.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Analytics específicos da loja em desenvolvimento...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default StoreSpecific;