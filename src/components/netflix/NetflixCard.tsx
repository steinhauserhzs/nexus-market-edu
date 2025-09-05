import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface NetflixCardProps {
  id: string;
  title: string;
  thumbnail: string;
  type: "course" | "pack" | "template";
  owned?: boolean;
  price?: number;
  badges?: { functional: string[]; promotional: string[] };
  position?: number;
  onClick?: () => void;
  onPlayClick?: () => void;
  onAddClick?: () => void;
  onInfoClick?: () => void;
  className?: string;
}

export const NetflixCard = ({
  id,
  title,
  thumbnail,
  type,
  owned = false,
  price,
  badges,
  position = 0,
  onClick,
  onPlayClick,
  onAddClick,
  className
}: NetflixCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return 'Curso';
      case 'pack': return 'Pack';
      case 'template': return 'Template';
      default: return type;
    }
  };

  // Get the most important badge (functional badges have priority)
  const mostImportantBadge = badges?.functional?.[0] || badges?.promotional?.[0];

  return (
    <article 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 ease-out apple-card",
        "w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0",
        "hover:scale-[1.02] hover:shadow-lg hover:z-20",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
        "active:scale-[0.98] touch-manipulation",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${getTypeLabel(type)}`}
    >
      <div className="space-y-3">
        {/* Image Container - Apple style with subtle rounded corners */}
        <AspectRatio ratio={2/3} className="overflow-hidden rounded-xl bg-muted/50 relative">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
          )}
          
          {/* Main Image */}
          <img
            src={thumbnail}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Subtle Overlay on Hover - Very Apple-like */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/0 transition-all duration-300 ease-out",
              isHovered && "bg-black/10"
            )} 
          />

          {/* Minimal Badge - Only Show Most Important */}
          {mostImportantBadge && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary"
                className="text-xs px-2 py-1 bg-background/95 text-foreground border-0 shadow-sm backdrop-blur-sm"
              >
                {mostImportantBadge}
              </Badge>
            </div>
          )}

          {/* Type Indicator - Minimalist */}
          <div className="absolute top-3 right-3">
            <div className="w-2 h-2 rounded-full bg-foreground/30" />
          </div>
          
          {/* Apple-style Hover Content */}
          <div 
            className={cn(
              "absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ease-out transform",
              isHovered 
                ? "translate-y-0 opacity-100" 
                : "translate-y-2 opacity-0 pointer-events-none"
            )}
          >
            <div className="bg-background/95 backdrop-blur-md rounded-lg p-3 shadow-lg border border-border/50">
              {/* Action Button - Single, Clear */}
              {owned ? (
                <Button
                  size="sm"
                  className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary-hover font-medium rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayClick?.();
                  }}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Continuar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full h-9 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddClick?.();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </div>
          </div>
        </AspectRatio>

        {/* Clean Content Below Image */}
        <div className="space-y-2 px-1">
          {/* Title - Clean Typography */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {title}
          </h3>
          
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {getTypeLabel(type)}
            </span>
            {!owned && price && (
              <span className="font-semibold text-foreground">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};