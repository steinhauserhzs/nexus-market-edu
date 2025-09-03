import { useState, useEffect } from 'react';

export function usePageLoading(delay: number = 300) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return loading;
}