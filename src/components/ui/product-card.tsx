import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import OptimizedImage from "@/components/ui/optimized-image";
import { Star, Play, Clock, Users, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
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
  className?: string;
  onClick?: () => void;
}

export default function ProductCard({
  id,
  title,
  description,
  thumbnail,
  price,
  comparePrice,
  type,
  rating = 4.8,
  totalLessons = 0,
  totalDuration = 0,
  studentCount = 0,
  instructor,
  featured = false,
  className,
  onClick
}: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}min`;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'digital': 'Digital',
      'curso': 'Curso',
      'fisico': 'Físico',
      'servico': 'Serviço',
      'bundle': 'Bundle',
      'assinatura': 'Assinatura'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: `cart-${id}`,
      product_id: id,
      title,
      price_cents: price,
      thumbnail_url: thumbnail || null,
      type,
    });
  };

  const inCart = isInCart(id);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in",
        "bg-gradient-card border-border/50 hover:border-accent/50 rounded-2xl overflow-hidden",
        featured && "ring-2 ring-accent/30 shadow-accent/20 shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 space-y-0">
        {/* Thumbnail */}
        <div className="relative overflow-hidden">
          <OptimizedImage
            src={thumbnail || ''}
            alt={title}
            aspectRatio="video"
            className="rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            fallbackClassName="rounded-t-2xl"
          />
          
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm rounded-lg">
              {getTypeLabel(type)}
            </Badge>
          </div>
          
          {/* Featured badge */}
          {featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-accent text-accent-foreground rounded-lg animate-bounce-in">
                ⭐ Destaque
              </Badge>
            </div>
          )}
          
          {/* Price overlay */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-background/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                {comparePrice && comparePrice > price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(comparePrice)}
                  </span>
                )}
                <span className="font-bold text-accent">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          
          {/* Instructor */}
          <p className="text-sm text-muted-foreground font-medium">{instructor}</p>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating}</span>
              </div>
            )}
            
            {totalLessons > 0 && (
              <div className="flex items-center gap-1">
                <Play className="w-3.5 h-3.5" />
                <span>{totalLessons} aulas</span>
              </div>
            )}
            
            {totalDuration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}
            
            {studentCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{studentCount}</span>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full mt-4 rounded-xl font-semibold" 
            variant={inCart ? "outline" : "accent"}
            onClick={handleAddToCart}
            disabled={inCart}
            size="lg"
          >
            <div className="flex items-center justify-center">
              {inCart ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  No Carrinho
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </>
              )}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}