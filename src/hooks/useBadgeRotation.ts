import { useState, useEffect, useCallback } from 'react';

export interface BadgeConfig {
  functional: string[]; // "Adquirido", "X aulas grátis"
  promotional: string[]; // "Novo", "Popular", "Mais vendido", "Trending"
}

export interface BadgeRotationProps {
  itemId: string;
  badges: BadgeConfig;
  position: number; // Position in the list (0-based)
  maxBadges?: number;
}

export const useBadgeRotation = ({
  itemId,
  badges,
  position,
  maxBadges = 3
}: BadgeRotationProps) => {
  const [visibleBadges, setVisibleBadges] = useState<string[]>([]);

  const generateBadges = useCallback(() => {
    const allBadges: string[] = [];
    
    // Always show functional badges first (highest priority)
    allBadges.push(...badges.functional);
    
    // Add promotional badges based on rotation algorithm
    if (badges.promotional.length > 0 && allBadges.length < maxBadges) {
      const now = Date.now();
      const timeWindow = 30000; // 30 seconds rotation window
      const positionSeed = position * 1000; // Position-based seed
      const rotationIndex = Math.floor((now + positionSeed) / timeWindow) % badges.promotional.length;
      
      // Eligibility check - only first 6 items get promotional badges
      if (position < 6) {
        const remainingSlots = maxBadges - allBadges.length;
        const promotionalToAdd = badges.promotional.slice(rotationIndex, rotationIndex + remainingSlots);
        
        // Handle wrap-around if needed
        if (promotionalToAdd.length < remainingSlots && badges.promotional.length > 1) {
          const wrapped = badges.promotional.slice(0, remainingSlots - promotionalToAdd.length);
          promotionalToAdd.push(...wrapped);
        }
        
        allBadges.push(...promotionalToAdd);
      }
    }
    
    return allBadges.slice(0, maxBadges);
  }, [badges, position, maxBadges]);

  useEffect(() => {
    const updateBadges = () => {
      setVisibleBadges(generateBadges());
    };

    updateBadges();
    
    // Set up rotation interval only if there are promotional badges
    if (badges.promotional.length > 0 && position < 6) {
      const interval = setInterval(updateBadges, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [generateBadges, badges.promotional.length, position]);

  return visibleBadges;
};

// Badge generation service for products
export const generateProductBadges = (product: {
  owned?: boolean;
  lessonsCount?: number;
  isNew?: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}): BadgeConfig => {
  const functional: string[] = [];
  const promotional: string[] = [];

  // Functional badges
  if (product.owned) {
    functional.push("Adquirido");
  } else if (product.lessonsCount) {
    const freeClasses = Math.min(3, Math.floor(product.lessonsCount * 0.1));
    if (freeClasses > 0) {
      functional.push(`${freeClasses} aulas grátis`);
    }
  }

  // Promotional badges
  if (product.isNew) promotional.push("Novo");
  if (product.isPopular) promotional.push("Popular");
  if (product.isBestSeller) promotional.push("Mais vendido");
  if (product.isTrending) promotional.push("Trending");

  return { functional, promotional };
};