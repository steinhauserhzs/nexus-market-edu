import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export default function MobileResponsiveGrid({
  children,
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  gap = 'md'
}: MobileResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const responsiveClasses = [
    cols.default && gridCols[cols.default as keyof typeof gridCols],
    cols.xs && `xs:grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid w-full',
      gapClasses[gap],
      responsiveClasses,
      'auto-rows-max',
      // Mobile optimizations
      'overflow-hidden',
      // Prevent horizontal scroll on mobile
      'max-w-full',
      className
    )}>
      {children}
    </div>
  );
}