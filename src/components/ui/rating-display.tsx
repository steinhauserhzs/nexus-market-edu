import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export default function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  showNumber = true,
  className
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const starRating = i + 1;
          const isFilled = rating >= starRating;
          const isPartial = rating > i && rating < starRating;
          
          return (
            <div key={i} className="relative">
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-muted-foreground"
                )}
                fill="currentColor"
              />
              {(isFilled || isPartial) && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute inset-0 text-yellow-400"
                  )}
                  fill="currentColor"
                  style={{
                    clipPath: isPartial 
                      ? `inset(0 ${100 - ((rating - i) * 100)}% 0 0)`
                      : undefined
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={cn(
          "font-medium text-muted-foreground",
          textSizeClasses[size]
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}