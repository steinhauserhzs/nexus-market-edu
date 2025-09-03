import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductCard from "@/components/ui/product-card";
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
  total_lessons?: number;
  total_duration_minutes?: number;
  featured: boolean;
  slug: string;
  stores?: {
    name: string;
  };
}

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

export default function RelatedProducts({ 
  currentProductId, 
  categoryId 
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const fetchRelatedProducts = async () => {
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
          slug,
          stores (
            name
          )
        `)
        .eq('status', 'published')
        .neq('id', currentProductId)
        .limit(6);

      // If we have a category, prioritize products from same category
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // If we don't have enough products from same category, get more from other categories
      if (data && data.length < 4 && categoryId) {
        const { data: moreProducts } = await supabase
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
            slug,
            stores (
              name
            )
          `)
          .eq('status', 'published')
          .neq('id', currentProductId)
          .neq('category_id', categoryId)
          .limit(6 - data.length)
          .order('featured', { ascending: false });

        if (moreProducts) {
          data.push(...moreProducts);
        }
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Você também pode gostar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </CardContent>
    </Card>
  );
}