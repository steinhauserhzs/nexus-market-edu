import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  compact?: boolean;
  touchOptimized?: boolean;
}

export default function MobileOptimizedCard({
  children,
  title,
  description,
  footer,
  className,
  contentClassName,
  compact = false,
  touchOptimized = true
}: MobileOptimizedCardProps) {
  return (
    <Card className={cn(
      'w-full',
      // Mobile-first responsive design
      'border border-border/50',
      'bg-card/95 backdrop-blur-sm',
      'transition-all duration-200',
      // Touch optimization
      touchOptimized && [
        'hover:shadow-md hover:border-border',
        'active:scale-[0.98] active:shadow-sm',
        'md:hover:scale-[1.02]',
        'touch-pan-y' // Allow vertical scrolling on mobile
      ],
      // Compact spacing for mobile
      compact && 'space-y-2',
      // Prevent layout shift
      'overflow-hidden',
      className
    )}>
      {(title || description) && (
        <CardHeader className={cn(
          compact ? 'p-3 pb-2' : 'p-4 pb-3',
          'space-y-1'
        )}>
          {title && (
            <CardTitle className={cn(
              'text-base leading-tight',
              'xs:text-sm sm:text-base',
              'line-clamp-2'
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className={cn(
              'text-xs leading-normal',
              'xs:text-xs sm:text-sm',
              'line-clamp-3'
            )}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      {children && (
        <CardContent className={cn(
          compact ? 'p-3 pt-0' : 'p-4 pt-0',
          'space-y-3',
          contentClassName
        )}>
          {children}
        </CardContent>
      )}
      
      {footer && (
        <CardFooter className={cn(
          compact ? 'p-3 pt-2' : 'p-4 pt-3',
          'border-t border-border/30'
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}