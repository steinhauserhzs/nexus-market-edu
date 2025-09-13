// Nexus Netflix-Style Member Area - Main Component

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NetflixHeader from './NetflixHeader';
import NetflixBottomTabs from './NetflixBottomTabs';
import NetflixHeroBanner from './NetflixHeroBanner';
import NetflixCarousel from './NetflixCarousel';
import NetflixCard from './NetflixCard';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { MemberProduct, MemberBanner, MemberAreaConfig } from './types';
import { useToast } from '@/hooks/use-toast';
import { getSalesBadge } from './badge-rotation';

const NetflixMemberArea = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [products, setProducts] = useState<MemberProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<MemberAreaConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (storeSlug) {
      loadMemberAreaData();
    }
  }, [storeSlug]);

  const loadMemberAreaData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls to get store's products
      const mockProducts: MemberProduct[] = [
        {
          id: '1',
          title: 'Curso de Marketing Digital',
          cover: '/placeholder-course.jpg',
          price: 199.90,
          owned: true,
          storeId: storeSlug!,
          type: 'curso',
          popularityScore: 95,
          badge: 'owned'
        },
        {
          id: '2',
          title: 'E-book Estratégias de Vendas',
          cover: '/placeholder-ebook.jpg',
          price: 39.90,
          owned: false,
          storeId: storeSlug!,
          type: 'digital',
          popularityScore: 88,
          badge: 'new'
        },
        {
          id: '3',
          title: 'Curso Avançado de SEO',
          cover: '/placeholder-course2.jpg',
          price: 299.90,
          owned: true,
          storeId: storeSlug!,
          type: 'curso',
          popularityScore: 92,
          badge: 'owned'
        },
        {
          id: '4',
          title: 'Template de Landing Page',
          cover: '/placeholder-template.jpg',
          price: 67.90,
          owned: false,
          storeId: storeSlug!,
          type: 'digital',
          popularityScore: 85
        }
      ];

      const mockBanners: MemberBanner[] = [
        {
          id: '1',
          image: '/placeholder-banner.jpg',
          storeId: storeSlug!,
          link: `/loja/${storeSlug}/produtos`
        }
      ];

      const mockConfig: MemberAreaConfig = {
        storeId: storeSlug!,
        storeName: 'Loja Exemplo',
        storeSlug: storeSlug!,
        logo: '/placeholder-logo.jpg',
        primaryColor: '#3B82F6',
        backgroundColor: '#0F172A',
        banners: mockBanners
      };

      setProducts(mockProducts);
      setConfig(mockConfig);
    } catch (error) {
      console.error('Error loading member area data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da área de membros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader storeName="Carregando..." storeSlug={storeSlug || ''} />
        <main className="pt-16 pb-20">
          <div className="animate-pulse p-4 space-y-6">
            <div className="h-48 bg-secondary rounded-lg"></div>
            <div className="h-4 bg-secondary rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <NetflixBottomTabs storeSlug={storeSlug || ''} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground">A área de membros desta loja não está disponível.</p>
        </div>
      </div>
    );
  }

  // Sort products: owned first, then by popularity
  const sortedProducts = [...products].sort((a, b) => {
    if (a.owned && !b.owned) return -1;
    if (!a.owned && b.owned) return 1;
    return b.popularityScore - a.popularityScore;
  });

  const ownedProducts = products.filter(p => p.owned);
  const courseProducts = products.filter(p => p.type === 'curso');
  const digitalProducts = products.filter(p => p.type === 'digital');

  // Create "Mais Populares" section with sales badges
  const popularProducts = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((product, index) => ({
      ...product,
      badge: getSalesBadge(index) as any
    }));

  return (
    <div className="min-h-screen bg-background pwa-app no-overscroll">
      <NetflixHeader 
        storeName={config.storeName}
        storeSlug={config.storeSlug}
        logo={config.logo}
        showBackButton={true}
      />
      
      <main className="pt-12 sm:pt-16 pb-20 safe-area-inset-left safe-area-inset-right">
        <div className="space-y-4 sm:space-y-6">
          {/* Hero Banners */}
          {config.banners.length > 0 && (
            <div className="px-3 sm:px-4">
              <NetflixHeroBanner banners={config.banners} />
            </div>
          )}

          {/* Meus Produtos (Owned) */}
          {ownedProducts.length > 0 && (
            <NetflixCarousel title="Meus Produtos" itemCount={ownedProducts.length}>
              {ownedProducts.map((product, index) => (
                <NetflixCard 
                  key={product.id} 
                  product={product} 
                  itemIndex={index}
                  carouselType="owned"
                  storeSlug={config.storeSlug}
                />
              ))}
            </NetflixCarousel>
          )}

          {/* Todos os Produtos */}
          <NetflixCarousel title="Todos os Produtos" itemCount={sortedProducts.length}>
            {sortedProducts.map((product, index) => (
              <NetflixCard 
                key={product.id} 
                product={product} 
                itemIndex={index}
                carouselType="home"
                storeSlug={config.storeSlug}
              />
            ))}
          </NetflixCarousel>

          {/* Cursos */}
          {courseProducts.length > 0 && (
            <NetflixCarousel title="Cursos Disponíveis" itemCount={courseProducts.length}>
              {courseProducts.map((product, index) => (
                <NetflixCard 
                  key={product.id} 
                  product={product} 
                  itemIndex={index}
                  carouselType="home"
                  storeSlug={config.storeSlug}
                />
              ))}
            </NetflixCarousel>
          )}

          {/* Produtos Digitais */}
          {digitalProducts.length > 0 && (
            <NetflixCarousel title="Produtos Digitais" itemCount={digitalProducts.length}>
              {digitalProducts.map((product, index) => (
                <NetflixCard 
                  key={product.id} 
                  product={product} 
                  itemIndex={index}
                  carouselType="home"
                  storeSlug={config.storeSlug}
                />
              ))}
            </NetflixCarousel>
          )}

          {/* Mais Populares - Mixed content with sales badges */}
          <NetflixCarousel title="Mais Populares" itemCount={popularProducts.length}>
            {popularProducts.map((product, index) => (
              <NetflixCard 
                key={`popular-${product.id}-${index}`} 
                product={product} 
                itemIndex={index}
                carouselType="bestsellers"
                storeSlug={config.storeSlug}
              />
            ))}
          </NetflixCarousel>

          {/* Suporte */}
          <section className="px-4 pb-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Precisa de ajuda?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato para suporte
                  </p>
                </div>
                <Button
                  onClick={handleWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Suporte
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <NetflixBottomTabs storeSlug={config.storeSlug} />
    </div>
  );
};

export default NetflixMemberArea;