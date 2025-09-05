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

  // Use badge rotation hook
  const visibleBadges = useBadgeRotation({
    itemId: id,
    badges,
    position,
    maxBadges: 3
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-600 border-blue-400';
      case 'pack': return 'bg-purple-600 border-purple-400';
      case 'template': return 'bg-green-600 border-green-400';
      default: return 'bg-gray-600 border-gray-400';
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
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Dynamic Badges Stack */}
          {visibleBadges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {visibleBadges.map((badge, index) => (
                <Badge
                  key={`${badge}-${index}`}
                  variant="secondary"
                  className={cn(
                    "text-xs px-1.5 py-0.5 border-none animate-fade-in font-medium",
                    badges.functional.includes(badge)
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/80 text-white"
                  )}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            <div className={cn(
              "w-3 h-3 rounded-full border-2 shadow-sm",
              getTypeColor(type)
            )} />
          </div>
          
          {/* Hover/Touch Controls */}
          {(isHovered || isTouched) && (
            <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
              {/* Title */}
              <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2">
                {title}
              </h3>
              
              {/* Action Buttons */}
              <div className="flex gap-1">
                {owned ? (
                  <Button
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-white hover:bg-gray-200 text-black"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayClick?.();
                    }}
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddClick?.();
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfoClick?.();
                  }}
                >
                  <Info className="w-3 h-3" />
                </Button>
              </div>
              
              {/* Price */}
              {!owned && price && (
                <div className="text-white text-xs font-bold mt-1">
                  {formatPrice(price)}
                </div>
              )}
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
};