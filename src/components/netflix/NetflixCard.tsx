import { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBadgeRotation, BadgeConfig } from "@/hooks/useBadgeRotation";

export interface NetflixCardProps {
  id: string;
  title: string;
  thumbnail: string;
  type: "course" | "pack" | "template";
  owned?: boolean;
  price?: number;
  badges?: BadgeConfig;
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
  badges = { functional: [], promotional: [] },
  position = 0,
  onClick,
  onPlayClick,
  onAddClick,
  onInfoClick,
  className
}: NetflixCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Use badge rotation hook - simplified to show only 1 badge
  const visibleBadges = useBadgeRotation({
    itemId: id,
    badges,
    position,
    maxBadges: 1
  });

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

  const handleInteraction = () => {
    setIsHovered(true);
    setIsTouched(true);
  };

  const handleInteractionEnd = () => {
    setIsHovered(false);
    setTimeout(() => setIsTouched(false), 2000); // Keep mobile state for 2 seconds
  };

  return (
    <div 
      className={cn(
        "group relative cursor-pointer transition-all duration-300 ease-in-out netflix-card",
        "w-[110px] sm:w-[140px] md:w-[160px] lg:w-[180px] flex-shrink-0",
        "hover:scale-105 md:hover:scale-110 hover:z-20 active:scale-95",
        "touch-manipulation select-none",
        className
      )}
      onMouseEnter={handleInteraction}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteraction}
      onTouchEnd={handleInteractionEnd}
      onClick={onClick}
    >
      <AspectRatio ratio={2/3} className="overflow-hidden rounded-md">
        {/* Image Container */}
        <div className="relative w-full h-full bg-muted animate-pulse">
          <img
            src={thumbnail}
            alt={title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Clean Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Single Badge - Only Most Important */}
          {visibleBadges.length > 0 && (
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 bg-accent text-accent-foreground font-medium rounded-md"
              >
                {visibleBadges[0]}
              </Badge>
            </div>
          )}
          
          {/* Simple Type Label */}
          {!owned && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                variant="outline"
                className="text-xs px-2 py-1 bg-background/90 backdrop-blur-sm border-border/50 rounded-md"
              >
                {getTypeLabel(type)}
              </Badge>
            </div>
          )}
          
          {/* Clean Hover Content */}
          {(isHovered || isTouched) && (
            <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
              {/* Title */}
              <h3 className="text-white text-sm font-bold mb-2 line-clamp-2 drop-shadow-md">
                {title}
              </h3>
              
              {/* Price */}
              {!owned && price && (
                <div className="text-white text-lg font-bold mb-2 drop-shadow-md">
                  {formatPrice(price)}
                </div>
              )}
              
              {/* Single Action Button */}
              <div className="flex justify-center">
                {owned ? (
                  <Button
                    size="sm"
                    className="h-8 px-4 rounded-full bg-white hover:bg-gray-200 text-black font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayClick?.();
                    }}
                  >
                    <Play className="w-3 h-3 mr-1 fill-current" />
                    Assistir
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 px-4 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddClick?.();
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
};