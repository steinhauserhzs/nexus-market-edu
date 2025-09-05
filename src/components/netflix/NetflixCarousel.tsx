import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NetflixCard, NetflixCardProps } from "./NetflixCard";
import { MobileCarouselGestures } from "./MobileCarouselGestures";

interface NetflixCarouselProps {
  title?: string;
  description?: string;
  items: NetflixCardProps[];
  className?: string;
  showArrows?: boolean;
}

export const NetflixCarousel = ({
  title,
  description,
  items,
  className,
  showArrows = true
}: NetflixCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const checkScrollability = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollRef.current && !isScrolling && !isDragging) {
      setIsScrolling(true);
      const scrollAmount = scrollRef.current.clientWidth * 0.7;
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(() => {
        setIsScrolling(false);
        checkScrollability();
      }, 300);
    }
  }, [isScrolling, isDragging, checkScrollability]);

  const handleSwipeLeft = useCallback(() => scroll('right'), [scroll]);
  const handleSwipeRight = useCallback(() => scroll('left'), [scroll]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      checkScrollability();
      scrollContainer.addEventListener('scroll', checkScrollability);
      return () => scrollContainer.removeEventListener('scroll', checkScrollability);
    }
  }, [checkScrollability, items]);

  useEffect(() => {
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("relative group", className)}>
      {/* Header */}
      {title && (
        <div className="mb-4 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showArrows && canScrollLeft && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 h-12 w-8 p-0 bg-black/60 hover:bg-black/80 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => scroll('left')}
            disabled={isScrolling}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Right Arrow */}
        {showArrows && canScrollRight && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 h-12 w-8 p-0 bg-black/60 hover:bg-black/80 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
            onClick={() => scroll('right')}
            disabled={isScrolling}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* Scrollable Content with Gesture Support */}
        <MobileCarouselGestures
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          className="netflix-carousel-container"
        >
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide netflix-carousel-container",
              "px-4 md:px-6 py-2",
              "scroll-smooth touch-pan-x"
            )}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setTimeout(() => setIsDragging(false), 100)}
          >
            {items.map((item, index) => (
              <NetflixCard
                key={item.id}
                {...item}
                position={index}
              />
            ))}
          </div>
        </MobileCarouselGestures>
      </div>
    </section>
  );
};