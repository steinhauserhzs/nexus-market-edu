// Nexus Netflix-Style Member Area - Product Detail View

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import NetflixHeader from './NetflixHeader';
import NetflixBottomTabs from './NetflixBottomTabs';
import NetflixBadgeStack from './NetflixBadgeStack';
import { MemberProduct } from './types';
import { useToast } from '@/hooks/use-toast';

const NetflixProductView = () => {
  const { storeSlug, productId } = useParams<{ storeSlug: string; productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MemberProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (storeSlug && productId) {
      loadProduct();
    }
  }, [storeSlug, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Mock product data - replace with actual API call
      const mockProduct: MemberProduct = {
        id: productId!,
        title: 'E-book Estratégias de Marketing Digital',
        cover: '/placeholder-ebook.jpg',
        price: 39.90,
        owned: true,
        storeId: storeSlug!,
        type: 'digital',
        popularityScore: 88,
        badge: 'owned',
        description: 'Um guia completo sobre estratégias modernas de marketing digital, incluindo SEO, redes sociais, email marketing e muito mais. Perfeito para iniciantes e profissionais que querem aprimorar suas habilidades.'
      };

      setProduct(mockProduct);
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o produto',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/loja/${storeSlug}/area-membros`);
  };

  const handleDownload = () => {
    if (!product?.owned) {
      toast({
        title: 'Acesso negado',
        description: 'Você precisa adquirir este produto para fazer o download.',
        variant: 'destructive'
      });
      return;
    }

    // Simulate download
    toast({
      title: 'Download iniciado',
      description: 'O download do produto foi iniciado.',
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || 'Produto',
          text: 'Confira este produto incrível!',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copiado',
        description: 'O link do produto foi copiado para a área de transferência.',
      });
    }
  };

  const handleWhatsApp = () => {
    const message = `Olá! Tenho uma dúvida sobre o produto: ${product?.title}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader storeName="Carregando..." storeSlug={storeSlug || ''} showBackButton />
        <main className="pt-16 pb-20">
          <div className="animate-pulse p-4 space-y-6">
            <div className="aspect-[2/3] bg-secondary rounded-lg max-w-sm mx-auto"></div>
            <div className="h-4 bg-secondary rounded w-2/3 mx-auto"></div>
            <div className="h-20 bg-secondary rounded"></div>
          </div>
        </main>
        <NetflixBottomTabs storeSlug={storeSlug || ''} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
          <p className="text-muted-foreground mb-4">Este produto não está disponível.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <NetflixHeader 
        storeName="Loja Exemplo" 
        storeSlug={storeSlug || ''} 
        showBackButton 
      />
      
      <main className="pt-12 sm:pt-16 pb-20 safe-area-inset-left safe-area-inset-right">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Product Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Product Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] w-64 bg-secondary rounded-lg overflow-hidden">
                <img
                  src={product.cover}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <NetflixBadgeStack owned={product.owned} />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                <p className="text-lg text-primary font-semibold">
                  {formatPrice(product.price)}
                </p>
              </div>

              <p className="text-muted-foreground">
                {product.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {product.owned ? (
                  <Button onClick={handleDownload} className="flex-1 sm:flex-none">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button className="flex-1 sm:flex-none">
                    Comprar Produto
                  </Button>
                )}

                <Button variant="outline" onClick={handleShare}>
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>

                <Button variant="outline" onClick={handleWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Suporte
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Product Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium capitalize">
                    {product.type === 'digital' ? 'Produto Digital' : 
                     product.type === 'curso' ? 'Curso' : 'Produto Físico'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${product.owned ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.owned ? 'Adquirido' : 'Não adquirido'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço:</span>
                  <span className="font-medium text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sobre o Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Este produto faz parte da coleção premium da loja e oferece 
                  conteúdo exclusivo e de alta qualidade. Ideal para quem busca 
                  conhecimento especializado e materiais práticos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <NetflixBottomTabs storeSlug={storeSlug || ''} />
    </div>
  );
};

export default NetflixProductView;