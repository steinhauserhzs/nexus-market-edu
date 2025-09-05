import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useTrackProductView } from "@/hooks/use-analytics";
import BackNavigation from "@/components/layout/back-navigation";
import OptimizedImage from "@/components/ui/optimized-image";
import ProductReviews from "@/components/product/product-reviews";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import RelatedProducts from "@/components/product/related-products";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  Star, 
  ShoppingCart, 
  Check, 
  Play, 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  Download,
  Share2,
  Heart,
  ArrowLeft
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price_cents: number;
  compare_price_cents?: number;
  type: string;
  total_lessons?: number;
  total_duration_minutes?: number;
  difficulty_level?: string;
  meta_description?: string;
  category_id?: string;
  store_id?: string;
  featured: boolean;
  created_at: string;
  status: string;
}

interface Store {
  id: string;
  name: string;
  logo_url?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const { trackView } = useTrackProductView();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      // Fetch product by slug - usando first() em vez de single() para lidar com duplicatas
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1);

      if (productError) throw productError;
      
      const product = productData?.[0];
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      
      setProduct(product);

      // Rastrear visualização do produto
      if (product) {
        trackView(product.id);
      }

      // Fetch store info ou usar dados fake se não existir
      if (product?.store_id) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('id, name, logo_url')
          .eq('id', product.store_id)
          .single();
        
        if (storeData) setStore(storeData);
      } else {
        // Dados fake da loja para demonstração
        setStore({
          id: 'fake-store-1',
          name: 'Academia Digital Pro',
          logo_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center'
        });
      }

      // Fetch category info ou usar dados fake
      if (product?.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', product.category_id)
          .single();
        
        if (categoryData) setCategory(categoryData);
      } else {
        // Categoria fake baseada no tipo de produto
        const fakeCategories = {
          'curso': { id: 'cat-1', name: 'Desenvolvimento' },
          'digital': { id: 'cat-2', name: 'Cursos Online' },
          'bundle': { id: 'cat-3', name: 'Pacotes' }
        };
        setCategory(fakeCategories[product.type as keyof typeof fakeCategories] || { id: 'cat-1', name: 'Geral' });
      }

    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erro",
        description: "Produto não encontrado",
        variant: "destructive",
      });
      navigate('/biblioteca');
    } finally {
      setLoading(false);
    }
  };
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: `cart-${product.id}`,
        product_id: product.id,
        title: product.title,
        price_cents: product.price_cents,
        thumbnail_url: product.thumbnail_url || null,
        type: product.type,
      });
      
      toast({
        title: "Adicionado ao carrinho!",
        description: `${product.title} foi adicionado ao seu carrinho.`,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: product?.title,
          text: product?.meta_description || product?.description,
          url: window.location.href,
        });
      } else {
        // Fallback para dispositivos que não suportam Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado!",
          description: "O link do produto foi copiado para sua área de transferência.",
        });
      }
    } catch (error: any) {
      // Se o compartilhamento falhar, copia o link
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado!",
          description: "O link do produto foi copiado para sua área de transferência.",
        });
      } catch (clipboardError) {
        toast({
          title: "Erro ao compartilhar",
          description: "Não foi possível compartilhar o produto.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isWishlisted ? 
        "Produto removido da sua lista de desejos" : 
        "Produto adicionado à sua lista de desejos",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Carregando..." />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Produto não encontrado" />
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
          <p className="text-muted-foreground mb-4">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/biblioteca')}>
            Ver todos os produtos
          </Button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const hasDiscount = product.compare_price_cents && product.compare_price_cents > product.price_cents;
  const discountPercent = hasDiscount ? 
    Math.round(((product.compare_price_cents! - product.price_cents) / product.compare_price_cents!) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20">
      <BackNavigation title={product.title} />
      
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 max-w-6xl">
        {/* Product Header */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-8">
          {/* Product Image */}
          <div className="space-y-3 sm:space-y-4">
            <ProductGallery 
              images={product.thumbnail_url ? [product.thumbnail_url] : []}
              productTitle={product.title}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                {product.featured && (
                  <Badge className="bg-gradient-to-r from-accent to-accent/80 text-xs">
                    ⭐ Destaque
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">{product.type}</Badge>
                {category && (
                  <Badge variant="outline" className="text-xs">{category.name}</Badge>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-3 sm:mb-4 break-words">
                {product.title}
              </h1>

              {store && (
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {store.logo_url && (
                    <img 
                      src={store.logo_url} 
                      alt={store.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">Por {store.name}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-xs sm:text-base">4.8</span>
                  <span className="text-muted-foreground text-xs sm:text-sm">(234 avaliações)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs sm:text-sm">1.547 alunos</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                   <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                     {hasDiscount && (
                       <span className="text-sm sm:text-lg text-muted-foreground line-through">
                         {formatPrice(product.compare_price_cents!)}
                       </span>
                     )}
                     <span className="text-xl sm:text-3xl font-bold text-accent">
                       {formatPrice(product.price_cents)}
                     </span>
                     {hasDiscount && (
                       <Badge className="bg-red-500 text-white text-xs">
                         -{discountPercent}%
                       </Badge>
                     )}
                   </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button 
                      size="lg"
                      className="flex-1 h-11 sm:h-12"
                      onClick={handleAddToCart}
                      disabled={inCart}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="text-sm sm:text-base">No Carrinho</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="text-sm sm:text-base">Adicionar</span>
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-11 sm:h-12 px-3"
                      onClick={toggleWishlist}
                    >
                      <Heart 
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
                      />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-11 sm:h-12 px-3"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {(product.total_lessons || product.total_duration_minutes || product.difficulty_level) && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    {product.total_lessons && (
                      <div>
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="font-medium text-sm sm:text-base">{product.total_lessons}</div>
                        <div className="text-xs text-muted-foreground">Aulas</div>
                      </div>
                    )}
                    {product.total_duration_minutes && (
                      <div>
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="font-medium text-sm sm:text-base">{formatDuration(product.total_duration_minutes)}</div>
                        <div className="text-xs text-muted-foreground">Duração</div>
                      </div>
                    )}
                    {product.difficulty_level && (
                      <div>
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-muted-foreground" />
                        <div className="font-medium text-sm sm:text-base capitalize">{product.difficulty_level}</div>
                        <div className="text-xs text-muted-foreground">Nível</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Conteúdo
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Avaliações
            </TabsTrigger>
            <TabsTrigger 
              value="instructor" 
              className="text-xs sm:text-sm py-2 px-1 sm:px-3 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              Instrutor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4">
            <ProductInfo 
              description={product.description}
              metaDescription={product.meta_description}
              productType={product.type}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Conteúdo do Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {/* Mock curriculum - In real app, this would come from modules/lessons */}
                <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Módulo 1: Introdução</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-accent" />
                      <span>Apresentação do curso (5min)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="w-3 h-3 text-accent" />
                      <span>Material complementar</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Módulo 2: Fundamentos</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-accent" />
                      <span>Conceitos básicos (15min)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-accent" />
                      <span>Primeira prática (20min)</span>
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Módulo 3: Avançado</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-accent" />
                      <span>Recursos avançados (25min)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="w-3 h-3 text-accent" />
                      <span>Projeto final</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 sm:space-y-6 mt-4">
            <ProductReviews productId={product.id} />
          </TabsContent>

          <TabsContent value="instructor" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Sobre o Instrutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {store && (
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url} 
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-accent flex items-center justify-center">
                          <span className="text-accent-foreground font-bold text-sm sm:text-lg">
                            {store.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{store.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Especialista com anos de experiência na área. Já ajudou milhares de alunos a alcançarem seus objetivos.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          ⭐ 4.9 (567 avaliações)
                        </span>
                        <span className="flex items-center gap-1">
                          👥 2.340 alunos
                        </span>
                        <span className="flex items-center gap-1">
                          📚 12 cursos
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts 
            currentProductId={product.id}
            categoryId={product.category_id}
          />
        </div>
      </div>
    </div>
  );
}