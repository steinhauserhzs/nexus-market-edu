import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ui/product-card";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  comparePrice?: number;
  type: 'digital' | 'curso' | 'fisico' | 'servico' | 'bundle' | 'assinatura';
  rating?: number;
  totalLessons?: number;
  totalDuration?: number;
  studentCount?: number;
  instructor: string;
  featured?: boolean;
}

interface FeaturedSectionProps {
  title: string;
  description?: string;
  products: Product[];
  showMore?: boolean;
  onShowMore?: () => void;
  onProductClick?: (productId: string) => void;
}

export default function FeaturedSection({
  title,
  description,
  products,
  showMore = false,
  onShowMore,
  onProductClick
}: FeaturedSectionProps) {
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
              {...product}
              onClick={() => onProductClick?.(product.id)}
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