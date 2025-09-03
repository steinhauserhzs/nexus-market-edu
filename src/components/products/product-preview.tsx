import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart, Share2 } from "lucide-react";

interface ProductPreviewProps {
  title: string;
  description: string;
  price_cents: number;
  compare_price_cents?: number;
  images: string[];
  type: string;
  difficulty_level?: string;
  featured: boolean;
}

const ProductPreview = ({
  title,
  description,
  price_cents,
  compare_price_cents,
  images,
  type,
  difficulty_level,
  featured
}: ProductPreviewProps) => {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getTypeLabel = (type: string) => {
    const types = {
      digital: 'Digital',
      curso: 'Curso',
      fisico: 'Físico',
      servico: 'Serviço',
      bundle: 'Bundle',
      assinatura: 'Assinatura'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDifficultyColor = (level?: string) => {
    const colors = {
      iniciante: 'bg-green-100 text-green-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-muted-foreground">Preview do Produto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={title || "Preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>

        {/* Title and Badges */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">
              {title || "Título do produto"}
            </h3>
            {featured && (
              <Badge variant="secondary" className="text-xs">
                Destaque
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(type)}
            </Badge>
            {difficulty_level && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${getDifficultyColor(difficulty_level)}`}
              >
                {difficulty_level.charAt(0).toUpperCase() + difficulty_level.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "Descrição do produto..."}
        </p>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(price_cents)}
            </span>
            {compare_price_cents && compare_price_cents > price_cents && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compare_price_cents)}
              </span>
            )}
          </div>
          {compare_price_cents && compare_price_cents > price_cents && (
            <div className="text-xs text-green-600">
              {Math.round((1 - price_cents / compare_price_cents) * 100)}% de desconto
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            5.0 (123 avaliações)
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPreview;