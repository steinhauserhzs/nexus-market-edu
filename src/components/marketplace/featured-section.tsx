import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/product-card";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  price_cents: number;
  compare_price_cents?: number;
  type: string;
  rating?: number;
  total_lessons?: number;
  total_duration_minutes?: number;
  student_count?: number;
  instructor?: string;
  featured?: boolean;
  slug: string;
  stores?: {
    name: string;
  };
}

interface FeaturedSectionProps {
  title: string;
  description?: string;
  categoryId?: string;
  featured?: boolean;
  showMore?: boolean;
  onShowMore?: () => void;
  limit?: number;
}

export default function FeaturedSection({
  title,
  description,
  categoryId,
  featured = false,
  showMore = false,
  onShowMore,
  limit = 8
}: FeaturedSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [categoryId, featured, limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          price_cents,
          compare_price_cents,
          type,
          total_lessons,
          total_duration_minutes,
          featured,
          slug
        `)
        .eq('status', 'published')
        .limit(limit);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
        console.log('🏷️ Filtrando por categoria:', categoryId);
      }

      if (featured) {
        query = query.eq('featured', true);
        console.log('⭐ Filtrando produtos em destaque');
      }

      console.log('📡 Executando query...');
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }
      
      console.log('✅ Produtos encontrados:', data?.length || 0);
      console.log('📦 Dados dos produtos:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      // Fallback: tentar buscar sem a relação com stores
      try {
        console.log('🔄 Tentando busca alternativa sem stores...');
        let fallbackQuery = supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            price_cents,
            compare_price_cents,
            type,
            total_lessons,
            total_duration_minutes,
            featured,
            slug
          `)
          .eq('status', 'published')
          .limit(limit);

        if (categoryId) {
          fallbackQuery = fallbackQuery.eq('category_id', categoryId);
        }

        if (featured) {
          fallbackQuery = fallbackQuery.eq('featured', true);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        console.log('✅ Busca alternativa bem-sucedida:', fallbackData?.length || 0);
        setProducts(fallbackData || []);
      } catch (fallbackError) {
        console.error('❌ Erro na busca alternativa:', fallbackError);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Loading finalizado');
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-lg max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-lg max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado nesta categoria.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Tente ajustar os filtros ou explore outras categorias.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-lg max-w-2xl">
                {description}
              </p>
            )}
          </div>
          
          {showMore && (
            <Button 
              variant="outline" 
              onClick={onShowMore}
              className="gap-2"
            >
              Ver Todos
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description}
              thumbnail={product.thumbnail_url}
              price={product.price_cents}
              comparePrice={product.compare_price_cents}
              type={product.type as any}
              totalLessons={product.total_lessons}
              totalDuration={product.total_duration_minutes}
              instructor={product.stores?.name || "Instrutor"}
              featured={product.featured}
              onClick={() => handleProductClick(product.slug)}
            />
          ))}
        </div>

        {/* Show More Button - Mobile */}
        {showMore && (
          <div className="flex justify-center mt-8 md:hidden">
            <Button onClick={onShowMore} className="gap-2">
              Ver Todos os Cursos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}