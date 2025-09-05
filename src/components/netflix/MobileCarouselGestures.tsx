import { useRef, useCallback, useEffect, ReactNode } from 'react';

interface MobileCarouselGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const MobileCarouselGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className
}: MobileCarouselGesturesProps) => {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    
    const swipeThreshold = 50;
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swiped left (next)
        onSwipeLeft?.();
      } else {
        // Swiped right (previous)
        onSwipeRight?.();
      }
    }

    isDragging.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const element = document.querySelector(`.${className}`);
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, className]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};