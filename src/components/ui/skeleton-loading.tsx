import { memo } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
}

const Skeleton = memo<SkeletonProps>(({ className, variant = 'default' }) => {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-48 w-full",
    text: "h-4 w-3/4",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24"
  };

  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label="Carregando..."
    />
  );
});

Skeleton.displayName = "Skeleton";

// Componentes de skeleton pré-definidos para casos comuns
export const AdminStatsSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-4 sm:p-6 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton variant="text" className="h-6 w-16" />
          </div>
          <Skeleton variant="avatar" className="h-8 w-8" />
        </div>
      </div>
    ))}
  </div>
));

AdminStatsSkeleton.displayName = "AdminStatsSkeleton";

export const ProductCardSkeleton = memo(() => (
  <div className="border rounded-lg overflow-hidden">
    <Skeleton variant="card" className="h-48" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" className="h-5 w-full" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-6 w-20" />
        <Skeleton variant="button" />
      </div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = "ProductCardSkeleton";

export const TableSkeleton = memo(({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 p-4 border-b">
      {[...Array(cols)].map((_, i) => (
        <Skeleton key={i} variant="text" className="h-4 flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4">
        {[...Array(cols)].map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
));

TableSkeleton.displayName = "TableSkeleton";

export const DashboardSkeleton = memo(() => (
  <div className="container mx-auto px-4 py-6 space-y-8">
    {/* Header */}
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-40" />
        <Skeleton variant="text" className="h-5 w-60" />
      </div>
      <Skeleton variant="button" className="h-12 w-32" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 border rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-6 w-16" />
            </div>
            <Skeleton variant="avatar" className="h-10 w-10" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Content Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="p-6 border rounded-xl space-y-4">
          <Skeleton variant="text" className="h-6 w-32" />
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center gap-4">
                <Skeleton variant="avatar" className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

DashboardSkeleton.displayName = "DashboardSkeleton";

export default Skeleton;