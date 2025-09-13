// Nexus Netflix-Style Member Area - Hero Banner Component

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberBanner } from './types';

interface NetflixHeroBannerProps {
  banners: MemberBanner[];
}

const NetflixHeroBanner = ({ banners }: NetflixHeroBannerProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(new Array(banners.length).fill(false));

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  if (banners.length === 0) return null;

  return (
    <section className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg bg-secondary">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-out ${
              index === currentBanner
                ? 'translate-x-0'
                : index < currentBanner
                ? '-translate-x-full'
                : 'translate-x-full'
            }`}
          >
            {/* Loading skeleton */}
            {!imageLoaded[index] && (
              <div className="absolute inset-0 bg-secondary animate-pulse" />
            )}
            
            {/* Banner Image */}
            <img
              src={banner.image}
              alt={`Banner ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(index)}
            />

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Click handler for banner link */}
            {banner.link && (
              <a
                href={banner.link}
                className="absolute inset-0 z-10"
                aria-label={`Banner ${index + 1}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation - only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          {/* Previous/Next buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white"
            onClick={prevBanner}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white"
            onClick={nextBanner}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBanner
                    ? 'bg-white scale-110'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => setCurrentBanner(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default NetflixHeroBanner;