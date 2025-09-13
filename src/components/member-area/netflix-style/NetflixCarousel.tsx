// Nexus Netflix-Style Member Area - Carousel Row Component

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';

interface NetflixCarouselProps {
  title: string;
  children: React.ReactNode;
  showMoreUrl?: string;
  itemCount?: number;
}

const NetflixCarousel = ({ title, children, showMoreUrl, itemCount = 4 }: NetflixCarouselProps) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Netflix-style smooth scrolling: scroll by approximately 3 cards width
      const cardWidth = 140; // Approximate card width including gap
      const scrollAmount = cardWidth * 3;
      
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 netflix-carousel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {showMoreUrl && (
          <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
            Ver mais
          </Button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Desktop Navigation Arrows */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/95 transition-opacity ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/95 transition-opacity ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Netflix-style Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
          onScroll={checkScroll}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div 
            className="flex gap-3 px-4"
            style={{
              width: 'max-content'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Netflix responsive grid styles for children */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Netflix-style responsive card layout */
          @media (max-width: 767px) {
            .netflix-carousel .flex > * {
              flex: 0 0 calc(33.333% - 8px); /* 3 cards on mobile */
              min-width: 110px;
              max-width: 140px;
            }
          }
          
          @media (min-width: 768px) and (max-width: 1023px) {
            .netflix-carousel .flex > * {
              flex: 0 0 calc(20% - 10px); /* 5 cards on tablet */
              min-width: 140px;
              max-width: 180px;
            }
          }
          
          @media (min-width: 1024px) {
            .netflix-carousel .flex > * {
              flex: 0 0 calc(14.285% - 12px); /* 7 cards on desktop */
              min-width: 160px;
              max-width: 200px;
            }
          }
        `
      }} />
    </section>
  );
};

export default NetflixCarousel;