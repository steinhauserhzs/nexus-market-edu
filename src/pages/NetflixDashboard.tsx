import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/use-products";
import { NetflixHeader } from "@/components/netflix/NetflixHeader";
import { NetflixCarousel } from "@/components/netflix/NetflixCarousel";
import { NetflixCardProps } from "@/components/netflix/NetflixCard";
import { generateProductBadges } from "@/hooks/useBadgeRotation";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const NetflixDashboard = () => {
  const { user } = useAuth();
  const { products: allProducts, loading } = useProducts({ limit: 50 });
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Transform products to Netflix cards
  const transformProductsToCards = (products: any[]): NetflixCardProps[] => {
    return products.map((product, index) => {
      const badges = generateProductBadges({
        owned: false, // TODO: Check user licenses for ownership
        lessonsCount: product.total_lessons || 0,
        isNew: index < 3, // First 3 are "new"
        isPopular: index % 4 === 0, // Every 4th is "popular"
        isBestSeller: index % 6 === 0 && index > 0, // Every 6th is "best seller"
        isTrending: index % 8 === 0 && index > 0, // Every 8th is "trending"
      });

      return {
        id: product.id,
        title: product.title,
        thumbnail: product.thumbnail_url || "/placeholder.svg",
        type: product.type || "course",
        owned: false, // TODO: Check user licenses for ownership
        price: product.price_cents,
        badges: [],
        onClick: () => navigate(`/produto/${product.id}`),
        onPlayClick: () => {
          // TODO: Navigate to course player when owned
          navigate(`/curso/${product.id}/aula/1`);
        },
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
      };
    });
  };

  // Separate products by categories for Netflix sections
  const featuredProducts = transformProductsToCards(
    allProducts.filter(p => p.featured).slice(0, 12)
  );
  
  const popularProducts = transformProductsToCards(
    allProducts.filter(p => !p.featured).slice(0, 12)
  );
  
  const recentProducts = transformProductsToCards(
    [...allProducts].reverse().slice(0, 12)
  );
  
  const ownedProducts = transformProductsToCards(
    allProducts.filter(p => false).slice(0, 12) // TODO: Filter by user licenses
  );

  // Hero Content
  const heroProduct = allProducts[0];

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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Nexus Market - Streaming de Educação"
        description="Sua plataforma de streaming para educação digital. Acesse milhares de cursos e conteúdos exclusivos."
        keywords="streaming educação, cursos online, netflix educacional"
      />
      
      <NetflixHeader transparent />
      
      <main className="pt-16">
        {/* Netflix-style Hero Section */}
        {heroProduct && (
          <section className="relative h-[70vh] min-h-[400px] overflow-hidden">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${heroProduct.thumbnail_url || "/placeholder.svg"})`,
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            {/* Hero Content */}
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl space-y-4 text-white">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  {heroProduct.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg">
                  {heroProduct.description || "Descubra o melhor conteúdo educacional em uma experiência única de streaming."}
                </p>
                <div className="flex gap-4 pt-4">
                  <Button 
                    size="lg"
                    className="h-12 px-8 bg-white text-black hover:bg-gray-200 font-semibold"
                    onClick={() => {
                      // TODO: Check if user owns this product
                      navigate(`/produto/${heroProduct.id}`);
                    }}
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Começar Agora
                  </Button>
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="h-12 px-8 bg-gray-500/70 text-white hover:bg-gray-500/50 font-semibold border-none"
                    onClick={() => navigate(`/produto/${heroProduct.id}`)}
                  >
                    <Info className="w-5 h-5 mr-2" />
                    Mais Informações
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Netflix Carousels */}
        <div className="space-y-8 pb-20">
          {/* Continue Watching - Only show if user has owned products */}
          {user && ownedProducts.length > 0 && (
            <NetflixCarousel
              title="Continue Assistindo"
              description="Retome seus estudos de onde parou"
              items={ownedProducts}
            />
          )}

          {/* Featured Content */}
          <NetflixCarousel
            title="Em Destaque"
            description="Conteúdo selecionado especialmente para você"
            items={featuredProducts}
          />

          {/* Popular */}
          <NetflixCarousel
            title="Populares Agora"
            description="Os mais assistidos da plataforma"
            items={popularProducts}
          />

          {/* Recently Added */}
          <NetflixCarousel
            title="Adicionados Recentemente"
            description="Novidades que chegaram à plataforma"
            items={recentProducts}
          />
        </div>
      </main>
    </div>
  );
};

export default NetflixDashboard;