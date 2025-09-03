import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Clock } from "lucide-react";

interface PerformanceData {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  connectionType?: string;
}

const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Measure initial load performance
    const measurePerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        // @ts-ignore - checking for memory API
        const memoryUsage = (navigator as any).memory?.usedJSHeapSize;
        // @ts-ignore - checking for connection API  
        const connectionType = (navigator as any).connection?.effectiveType;
        
        setPerformanceData({
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime), 
          memoryUsage,
          connectionType
        });
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Show only in development or when explicitly enabled
  useEffect(() => {
    const showPerf = localStorage.getItem('show-performance') === 'true' || 
                    process.env.NODE_ENV === 'development';
    setVisible(showPerf);
  }, []);

  const getPerformanceStatus = (loadTime: number) => {
    if (loadTime < 1000) return { status: 'excellent', color: 'bg-green-500' };
    if (loadTime < 2000) return { status: 'good', color: 'bg-yellow-500' };
    return { status: 'needs improvement', color: 'bg-red-500' };
  };

  if (!visible || !performanceData) return null;

  const { status, color } = getPerformanceStatus(performanceData.loadTime);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            Performance Monitor
            <Badge className={color} variant="secondary">
              {status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Load Time:
            </span>
            <span className="font-mono">{performanceData.loadTime}ms</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Render Time:
            </span>
            <span className="font-mono">{performanceData.renderTime}ms</span>
          </div>
          
          {performanceData.memoryUsage && (
            <div className="flex items-center justify-between text-sm">
              <span>Memory:</span>
              <span className="font-mono">
                {Math.round(performanceData.memoryUsage / 1024 / 1024)}MB
              </span>
            </div>
          )}
          
          {performanceData.connectionType && (
            <div className="flex items-center justify-between text-sm">
              <span>Connection:</span>
              <span className="font-mono uppercase">{performanceData.connectionType}</span>
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setVisible(false)}
            className="w-full mt-2"
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;