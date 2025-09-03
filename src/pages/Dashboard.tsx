import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Eye,
  Plus,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

interface Product {
  id: string;
  title: string;
  price_cents: number;
  status: string;
  type: string;
  created_at: string;
}

interface Stats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'seller') {
      fetchStoreData();
    }
  }, [user, profile]);

  const fetchStoreData = async () => {
    try {
      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (storeError && storeError.code !== 'PGRST116') {
        throw storeError;
      }

      setStore(storeData);

      if (storeData) {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Calculate stats
        const totalProducts = productsData?.length || 0;
        const publishedProducts = productsData?.filter(p => p.status === 'published').length || 0;
        
        setStats({
          totalProducts,
          totalSales: 0, // TODO: Implement sales counting
          totalRevenue: 0, // TODO: Implement revenue calculation
          totalViews: publishedProducts * 150, // Mock data
        });
      }
    } catch (error: any) {
      console.error('Error fetching store data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStore = async () => {
    if (!profile?.seller_slug) {
      toast({
        title: "Perfil incompleto",
        description: "Complete seu perfil de vendedor primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          owner_id: user?.id,
          name: `Loja de ${profile.full_name || 'Vendedor'}`,
          slug: profile.seller_slug,
          description: 'Minha loja de cursos e produtos digitais',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setStore(data);
      toast({
        title: "Loja criada!",
        description: "Sua loja foi criada com sucesso.",
      });
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast({
        title: "Erro ao criar loja",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      published: 'Publicado',
      draft: 'Rascunho',
      paused: 'Pausado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Store className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Faça login para acessar o dashboard
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Store className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você precisa ser um vendedor para acessar esta área.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Store className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Criar Loja</h2>
              <p className="text-muted-foreground">
                Você ainda não possui uma loja. Crie uma agora para começar a vender.
              </p>
              <Button onClick={createStore}>
                Criar Minha Loja
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard - {store.name}</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos, vendas e desempenho
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Loja
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendas</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Meus Produtos</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">Nenhum produto ainda</h3>
                    <p className="text-muted-foreground">
                      Comece criando seu primeiro produto ou curso.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Produto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {product.title}
                        </CardTitle>
                        <Badge className={getStatusColor(product.status)}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Preço</span>
                          <span className="font-semibold">{formatPrice(product.price_cents)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Tipo</span>
                          <span className="text-sm capitalize">{product.type}</span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">Em breve</h3>
                  <p className="text-muted-foreground">
                    A gestão de pedidos estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">Em breve</h3>
                  <p className="text-muted-foreground">
                    O sistema de afiliados estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">Em breve</h3>
                  <p className="text-muted-foreground">
                    Os relatórios detalhados estarão disponíveis em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;