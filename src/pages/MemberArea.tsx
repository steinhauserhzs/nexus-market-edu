import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/ui/seo-head";
import { toast } from "sonner";
import { 
  Play, 
  FileText, 
  Star, 
  Clock, 
  Users,
  BookOpen,
  Download,
  MessageCircle,
  Trophy,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  slug: string;
  owner_id: string;
  support_channel_url?: string | null;
}

interface MemberAreaConfig {
  id: string;
  custom_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  welcome_message: string | null;
  welcome_video_url: string | null;
  show_other_products: boolean;
  show_progress_tracking: boolean;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  type: string;
  slug: string;
  featured: boolean;
  total_lessons: number | null;
  total_duration_minutes: number | null;
  store_id: string;
}

interface ExclusiveContent {
  id: string;
  title: string;
  content_type: string;
  content: string;
  description: string | null;
  sort_order: number;
}

const MemberArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [memberConfig, setMemberConfig] = useState<MemberAreaConfig | null>(null);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadMemberArea();
    }
  }, [slug, user]);

  const loadMemberArea = async () => {
    try {
      setLoading(true);

      // Buscar loja
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (storeError || !storeData) {
        toast.error("Loja não encontrada");
        navigate('/');
        return;
      }

      setStore(storeData);

      // Buscar configuração da área de membros
      const { data: configData } = await supabase
        .from('member_area_configs')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .single();

      setMemberConfig(configData);

      // Buscar todos os produtos da loja
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('status', 'published')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setAllProducts(productsData || []);

      // Se usuário logado, buscar produtos que ele possui
      if (user) {
        const { data: licensesData } = await supabase
          .from('licenses')
          .select(`
            *,
            products(*)
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        const userProductsData = licensesData?.map(l => l.products).filter(p => 
          p && p.store_id === storeData.id
        ) || [];

        setUserProducts(userProductsData as Product[]);
      }

      // Buscar conteúdo exclusivo
      const { data: contentData } = await supabase
        .from('member_exclusive_content')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('sort_order');

      setExclusiveContent(contentData || []);

    } catch (error) {
      console.error('Error loading member area:', error);
      toast.error("Erro ao carregar área de membros");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Loja não encontrada</p>
            <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Área de Membros - ${store.name}`}
        description={`Área exclusiva para membros da ${store.name}. Acesse seus conteúdos e materiais exclusivos.`}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero/Banner Section */}
        <div 
          className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-secondary rounded-lg mb-8 overflow-hidden"
          style={store?.banner_url ? {
            backgroundImage: `url(${store.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {memberConfig?.welcome_message || "Bem-vindo à área de membros"}
            </h1>
            <p className="text-white/90">
              {store?.name || 'Sua plataforma de aprendizado'}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Mais Vendidos */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Mais Vendidos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(allProducts.filter(p => p.featured).length > 0 ? 
                allProducts.filter(p => p.featured) : 
                allProducts
              ).slice(0, 6).map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Play className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {userProducts.find(up => up.id === product.id) && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Comprado
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description || 'Conteúdo de qualidade disponível'}
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        if (userProducts.find(up => up.id === product.id)) {
                          navigate(`/curso/${product.slug}`);
                        } else {
                          navigate(`/produto/${product.slug}`);
                        }
                      }}
                    >
                      {userProducts.find(up => up.id === product.id) ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Acessar
                        </>
                      ) : (
                        <>Ver Detalhes</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Meus Cursos */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Meus Cursos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProducts.filter(p => p.type === 'curso').length > 0 ? (
                userProducts.filter(p => p.type === 'curso').map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Play className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Matriculado
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {product.total_duration_minutes ? `${Math.round(product.total_duration_minutes / 60)}h` : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {product.total_lessons || 0} aulas
                        </span>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => navigate(`/curso/${product.slug}`)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continuar Curso
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Você ainda não possui cursos. Explore a loja para encontrar conteúdos incríveis!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Meus PDFs */}
          {userProducts && userProducts.some(product => product.type === 'digital') && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Meus PDFs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProducts
                  .filter(product => product.type === 'digital')
                  .map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted rounded-t-lg mb-4 overflow-hidden relative">
                        {product.thumbnail_url ? (
                          <img
                            src={product.thumbnail_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-blue-600">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.title}</h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <Button 
                          className="w-full" 
                          onClick={() => navigate(`/produto/${product.slug}`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </section>
          )}

          {/* Suporte */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Suporte
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Precisa de Ajuda?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Nossa equipe está pronta para auxiliar você
                </p>
                {store?.support_channel_url ? (
                  <Button className="w-full" asChild>
                    <a href={store.support_channel_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contatar Suporte
                    </a>
                  </Button>
                ) : (
                  <Button className="w-full">
                    Contatar Suporte
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MemberArea;