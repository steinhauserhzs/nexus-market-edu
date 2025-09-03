import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MobileGesturesProps {
  children: React.ReactNode;
}

const MobileGestures = ({ children }: MobileGesturesProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);
    const minSwipeDistance = 150;

    // Only trigger if horizontal swipe is larger than vertical
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > minSwipeDistance) {
      // Swipe right (go back)
      if (deltaX > 0 && touchStart.x < 50) {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/');
        }
      }
    }

    // Reset touch positions
    setTouchStart({ x: 0, y: 0 });
    setTouchEnd({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive touch listeners for better performance
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, touchStart.x, touchEnd.x]);

  return (
    <div ref={containerRef} className="touch-pan-y">
      {children}
    </div>
  );
};

export default MobileGestures;