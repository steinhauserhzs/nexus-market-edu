import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/ui/seo-head";
import MainHeader from "@/components/layout/main-header";
import BackNavigation from "@/components/layout/back-navigation";
import ProductForm from "@/components/products/product-form";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price_cents: number;
  compare_price_cents?: number;
  type: string;
  category_id?: string;
  store_id?: string;
  slug: string;
  status: string;
  featured: boolean;
  difficulty_level?: string;
  meta_title?: string;
  meta_description?: string;
  product_files?: any[];
  allow_affiliates?: boolean;
  requires_shipping?: boolean;
  total_lessons?: number;
  total_duration_minutes?: number;
  weight_grams?: number;
}

const ProductEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && user) {
      fetchProduct();
    }
  }, [slug, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o produto pelo slug e verificar se o usuário é o dono
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          stores!inner(owner_id)
        `)
        .eq('slug', slug)
        .single();

      if (productError) throw productError;

      // Verificar se o usuário é o dono da loja
      if (productData.stores.owner_id !== user.id) {
        setError('Você não tem permissão para editar este produto');
        return;
      }

      setProduct(productData as Product);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Produto não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Produto atualizado",
      description: "As alterações foram salvas com sucesso",
    });
    navigate(`/produto/${slug}`);
  };

  const handleCancel = () => {
    navigate(`/produto/${slug}`);
  };

  if (!user) {
    return (
      <>
        <SEOHead 
          title="Editar Produto - Nexus Market"
          description="Acesso restrito para usuários logados"
        />
        <MainHeader />
        <div className="min-h-screen bg-background">
          <BackNavigation title="Editar Produto" />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
                <p className="text-muted-foreground mb-4">
                  Faça login para editar produtos
                </p>
                <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SEOHead 
          title="Carregando... - Nexus Market"
          description="Carregando dados do produto"
        />
        <MainHeader />
        <div className="min-h-screen bg-background">
          <BackNavigation title="Carregando..." />
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner />
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <SEOHead 
          title="Erro - Nexus Market"
          description="Erro ao carregar produto"
        />
        <MainHeader />
        <div className="min-h-screen bg-background">
          <BackNavigation title="Erro" />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Erro ao carregar produto</h2>
                <p className="text-muted-foreground mb-4">
                  {error || 'Produto não encontrado ou você não tem permissão para editá-lo'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/produtos')}>
                    Ver Meus Produtos
                  </Button>
                  <Button onClick={() => navigate('/dashboard')}>
                    Ir para Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={`Editar ${product.title} - Nexus Market`}
        description={`Edite o produto ${product.title} na Nexus Market`}
      />
      <MainHeader />
      
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title={`Editar: ${product.title}`} />
        
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <ProductForm 
            initialData={product}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isEditing={true}
          />
        </div>
      </div>
    </>
  );
};

export default ProductEdit;