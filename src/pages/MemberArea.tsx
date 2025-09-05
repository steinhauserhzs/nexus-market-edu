import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NetflixHeader } from "@/components/netflix/NetflixHeader";
import { NetflixCarousel } from "@/components/netflix/NetflixCarousel";
import { NetflixCardProps } from "@/components/netflix/NetflixCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Download, ExternalLink, BookOpen, Users, Star } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface Store {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  slug: string;
  owner_id: string;
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
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [config, setConfig] = useState<MemberAreaConfig | null>(null);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [ownedProducts, setOwnedProducts] = useState<NetflixCardProps[]>([]);
  const [otherProducts, setOtherProducts] = useState<NetflixCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (slug && user) {
      checkMembershipAndLoadContent();
    }
  }, [slug, user]);

  const checkMembershipAndLoadContent = async () => {
    try {
      // Verificar se é membro (tem alguma licença ativa da loja)
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (!store) {
        toast({
          title: "Loja não encontrada",
          description: "Esta loja não existe ou não está ativa.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setStore(store);

      // Verificar licenças do usuário para produtos desta loja
      const { data: licenses } = await supabase
        .from('licenses')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const storeLicenses = licenses?.filter(
        license => license.product?.store_id === store.id
      ) || [];

      if (storeLicenses.length === 0) {
        setIsMember(false);
        setLoading(false);
        return;
      }

      setIsMember(true);

      // Buscar configurações da área de membros
      const { data: memberConfig } = await supabase
        .from('member_area_configs')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .single();

      setConfig(memberConfig);

      // Buscar conteúdo exclusivo
      const { data: content } = await supabase
        .from('member_exclusive_content')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('sort_order');

      setExclusiveContent(content || []);

      // Transformar licenças em cards Netflix
      const ownedCards: NetflixCardProps[] = storeLicenses.map((license, index) => ({
        id: license.product.id,
        title: license.product.title,
        thumbnail: license.product.thumbnail_url || "/placeholder.svg",
        type: (license.product.type === 'curso' ? 'course' : 'pack') as "course" | "pack" | "template",
        owned: true,
        badges: ["Adquirido"],
        onClick: () => navigate(`/produto/${license.product.id}`),
        onPlayClick: () => {
          // Navegar para o player do curso
          navigate(`/curso/${license.product.id}/aula/1`);
        },
        onInfoClick: () => navigate(`/produto/${license.product.id}`)
      }));

      setOwnedProducts(ownedCards);

      // Buscar outros produtos da loja (não adquiridos)
      if (memberConfig?.show_other_products) {
        const ownedProductIds = storeLicenses.map(l => l.product.id);
        
        const { data: otherStoreProducts } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('status', 'published')
          .not('id', 'in', `(${ownedProductIds.join(',')})`)
          .limit(12);

        const otherCards: NetflixCardProps[] = (otherStoreProducts || []).map((product, index) => ({
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail_url || "/placeholder.svg",
          type: (product.type === 'curso' ? 'course' : 'pack') as "course" | "pack" | "template",
          owned: false,
          price: product.price_cents,
          badges: index < 3 ? ["Novo"] : [],
          onClick: () => navigate(`/produto/${product.id}`),
          onAddClick: () => {
            addToCart({
              id: product.id,
              product_id: product.id,
              title: product.title,
              price_cents: product.price_cents,
              thumbnail_url: product.thumbnail_url,
              type: product.type
            });
            toast({
              title: "Adicionado ao carrinho",
              description: `${product.title} foi adicionado ao seu carrinho.`,
            });
          },
          onInfoClick: () => navigate(`/produto/${product.id}`)
        }));

        setOtherProducts(otherCards);
      }

    } catch (error) {
      console.error('Erro ao carregar área de membros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar a área de membros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderExclusiveContent = (content: ExclusiveContent) => {
    switch (content.content_type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              controls
              className="w-full h-full"
              poster="/placeholder.svg"
            >
              <source src={content.content} />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        );
      case 'download':
        return (
          <Button asChild className="w-full">
            <a href={content.content} download target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </Button>
        );
      case 'link':
        return (
          <Button variant="outline" asChild className="w-full">
            <a href={content.content} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Link
            </a>
          </Button>
        );
      default:
        return (
          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader />
        <div className="flex items-center justify-center h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Faça login para acessar a área de membros
              </p>
              <Button onClick={() => navigate('/auth')}>
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader />
        <div className="flex items-center justify-center h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <Star className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Área de Membros</h2>
              <p className="text-muted-foreground">
                Você precisa adquirir um produto de <strong>{store?.name}</strong> para acessar esta área exclusiva.
              </p>
              <Button onClick={() => navigate(`/loja/${slug}`)}>
                Ver Produtos da Loja
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Área de Membros - ${store?.name}`}
        description={`Área exclusiva para membros da ${store?.name}. Acesse seus conteúdos e materiais exclusivos.`}
        keywords={`área de membros, ${store?.name}, conteúdo exclusivo`}
      />
      
      <NetflixHeader />
      
      <main className="pt-16">
        {/* Hero Section com logo personalizado */}
        <section className="relative py-12 md:py-20">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${store?.banner_url || "/placeholder.svg"})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-2xl space-y-6 text-white">
              <div className="flex items-center gap-4">
                {(config?.custom_logo_url || store?.logo_url) && (
                  <img
                    src={config?.custom_logo_url || store?.logo_url || "/placeholder.svg"}
                    alt={store?.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold">
                    Área de Membros
                  </h1>
                  <p className="text-xl text-gray-300 mt-2">
                    {store?.name}
                  </p>
                </div>
              </div>
              
              {config?.welcome_message && (
                <p className="text-lg text-gray-300 max-w-lg">
                  {config.welcome_message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Vídeo de Boas-vindas */}
        {config?.welcome_video_url && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Mensagem de Boas-vindas</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden max-w-4xl">
                <video
                  controls
                  className="w-full h-full"
                  poster="/placeholder.svg"
                >
                  <source src={config.welcome_video_url} />
                  Seu navegador não suporta vídeos.
                </video>
              </div>
            </div>
          </section>
        )}

        {/* Seus Produtos */}
        {ownedProducts.length > 0 && (
          <NetflixCarousel
            title="Seus Produtos"
            description="Continue de onde parou"
            items={ownedProducts}
          />
        )}

        {/* Conteúdo Exclusivo */}
        {exclusiveContent.length > 0 && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Conteúdo Exclusivo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exclusiveContent.map((content) => (
                  <Card key={content.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      {content.description && (
                        <p className="text-sm text-muted-foreground">
                          {content.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="w-fit">
                        {content.content_type === 'video' && 'Vídeo'}
                        {content.content_type === 'download' && 'Download'}
                        {content.content_type === 'link' && 'Link Externo'}
                        {content.content_type === 'text' && 'Texto'}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {renderExclusiveContent(content)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Outros Produtos da Loja */}
        {config?.show_other_products && otherProducts.length > 0 && (
          <NetflixCarousel
            title="Outros Produtos da Loja"
            description="Descubra mais conteúdos exclusivos"
            items={otherProducts}
          />
        )}
      </main>
    </div>
  );
};

export default MemberArea;