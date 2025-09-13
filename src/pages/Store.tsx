import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreFollowers } from "@/hooks/use-store-followers";
import BackNavigation from "@/components/layout/back-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Store as StoreIcon, 
  Users, 
  Star, 
  Settings,
  Plus,
  Package,
  MapPin,
  Globe,
  Palette,
  Heart
} from "lucide-react";
import ProductCard from "@/components/ui/product-card";
import CustomStoreRenderer from "@/components/store/custom-store-renderer";
import StorePreviewMode from "@/components/store/store-preview-mode";
import StoreShareButton from "@/components/ui/store-share-button";

interface Store {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  theme: any;
  owner_id: string;
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  compare_price_cents: number | null;
  thumbnail_url: string | null;
  slug: string;
  status: string;
  currency: string;
  type: string;
  featured: boolean;
}

const Store = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    isFollowing, 
    followersCount, 
    loading: followLoading, 
    toggleFollow 
  } = useStoreFollowers(store?.id);
  
  const isOwner = user && store && user.id === store.owner_id;

  useEffect(() => {
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      
      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (storeError) {
        if (storeError.code === 'PGRST116') {
          toast({
            title: "Loja não encontrada",
            description: "Esta loja não existe ou foi desativada",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        throw storeError;
      }

      setStore(storeData);

      // Fetch store products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('status', 'published')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);
      
    } catch (error: any) {
      console.error('Error fetching store:', error);
      toast({
        title: "Erro ao carregar loja",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    toggleFollow();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.name,
          text: store?.description || `Confira a loja ${store?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "Link da loja copiado para a área de transferência",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Carregando..." />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Loja não encontrada" />
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <StoreIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            Esta loja não existe ou foi desativada
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const theme = store.theme || {};
  const primaryColor = theme.primaryColor || "#3b82f6";
  const secondaryColor = theme.secondaryColor || "#6366f1";
  const accentColor = theme.accentColor || "#f59e0b";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#1f2937";

  return (
      <StorePreviewMode>
        <CustomStoreRenderer theme={store.theme || {}} storeName={store.name}>
          <div className="min-h-screen pb-20">
            <BackNavigation title={store.name} />
      
      {/* Store Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 relative overflow-hidden">
          {store.banner_url ? (
            <img
              src={store.banner_url}
              alt={`${store.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isOwner && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/loja/${store.slug}/customizar`)}
                  className="bg-white/90 hover:bg-white"
                >
                  <Palette className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/loja/${store.slug}/configuracoes`)}
                  className="bg-white/90 hover:bg-white"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            )}
              <StoreShareButton 
                storeSlug={store.slug} 
                storeName={store.name}
                className="bg-white/90 hover:bg-white"
              />
          </div>
        </div>

        {/* Store Info */}
        <div className="store-container -mt-16 relative z-10">
          <Card className="store-card mb-6">
            <CardContent className="store-spacing-md">
              <div className="flex items-start store-gap-md">
                {/* Logo */}
                <div className="store-logo rounded-xl border-4 border-background shadow-lg flex items-center justify-center bg-white flex-shrink-0">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={`${store.name} logo`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <StoreIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Store Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="store-text-3xl font-bold">
                        {store.name}
                      </h1>
                  <div className="flex items-center store-gap-xs mt-1">
                    <Badge variant="secondary" className="store-text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      {store.slug}
                    </Badge>
                    <Badge variant="outline" className="store-text-xs">
                      <Package className="w-3 h-3 mr-1" />
                      {products.length} produto{products.length !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="store-text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {followersCount} seguidor{followersCount !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                    </div>
                  </div>

                  {store.description && (
                    <p className="store-text-sm mb-4 opacity-75">
                      {store.description}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex store-gap-xs flex-wrap">
                    {!isOwner && (
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className="store-button-primary"
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? "Seguindo" : "Seguir"}
                      </Button>
                    )}
                    
                    {isOwner && (
                      <Button
                        onClick={() => navigate('/produto/novo')}
                        className="store-button-primary"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                      </Button>
                    )}

                    {/* Botão Área de Membros Netflix-Style */}
                    <Button
                      onClick={() => navigate(`/loja/${store.slug}/area-membros`)}
                      variant="secondary"
                      className="store-button-secondary"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Área de Membros
                    </Button>

                    <Button
                      variant="outline"
                      className="store-button-accent"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Avaliar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Section */}
      <div className="store-container">
        {products.length > 0 ? (
          <div>
            <div className="flex items-center justify-between store-spacing-lg">
              <h2 className="store-text-2xl font-semibold">
                Produtos da Loja
              </h2>
              {products.filter(p => p.featured).length > 0 && (
                <Badge 
                  variant="secondary"
                  className="store-button-accent"
                >
                  {products.filter(p => p.featured).length} em destaque
                </Badge>
              )}
            </div>

            <div className="store-products-grid store-gap-lg">
              {products.map((product) => (
                <div key={product.id} className="store-card modern">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    description={product.description || ""}
                    thumbnail={product.thumbnail_url || ""}
                    price={product.price_cents}
                    comparePrice={product.compare_price_cents || undefined}
                    type={product.type === 'physical' ? 'fisico' : product.type as "digital" | "curso" | "fisico" | "servico" | "bundle" | "assinatura"}
                    instructor="Loja"
                    featured={product.featured}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="store-card">
            <CardContent className="store-spacing-xl text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="store-text-xl font-semibold mb-2">Nenhum produto ainda</h3>
              <p className="store-text-base text-muted-foreground mb-4">
                {isOwner 
                  ? "Adicione produtos para começar a vender" 
                  : "Esta loja ainda não possui produtos publicados"
                }
              </p>
              {isOwner && (
                <Button
                  onClick={() => navigate('/produto/novo')}
                  className="store-button-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </CustomStoreRenderer>
    </StorePreviewMode>
  );
};

export default Store;