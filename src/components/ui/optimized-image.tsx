import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  lazy?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
}

export default function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  lazy = true,
  aspectRatio = "square"
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video", 
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]"
  };

  if (imageError || !src) {
    return (
      <div className={cn(
        "bg-muted flex items-center justify-center",
        aspectRatioClasses[aspectRatio],
        fallbackClassName,
        className
      )}>
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspectRatioClasses[aspectRatio], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  );
}