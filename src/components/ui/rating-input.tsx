import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export default function RatingInput({
  value,
  onChange,
  maxRating = 5,
  size = "md",
  disabled = false,
  className
}: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starRating = i + 1;
        const isFilled = displayRating >= starRating;
        
        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starRating)}
            onMouseEnter={() => handleMouseEnter(starRating)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              "transition-colors duration-200",
              !disabled && "hover:scale-110 cursor-pointer",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label={`Dar ${starRating} estrela${starRating > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled 
                  ? "text-yellow-400 fill-yellow-400" 
                  : "text-muted-foreground hover:text-yellow-300"
              )}
            />
          </button>
        );
      })}
      
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value} de {maxRating}
        </span>
      )}
    </div>
  );
}