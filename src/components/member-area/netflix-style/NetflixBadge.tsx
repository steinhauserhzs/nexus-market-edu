// Nexus Netflix-Style Member Area - Custom Badge Component

import { cn } from '@/lib/utils';

interface NetflixBadgeProps {
  variant?: 'new' | 'free' | 'owned' | 'weeklyBest' | 'bestDay' | 'bestWeek' | 'bestMonth' | 'best6Months' | 'bestYear' | 'bestAllTime';
  children: React.ReactNode;
  className?: string;
}

const NetflixBadge = ({ variant = 'new', children, className }: NetflixBadgeProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'new':
        return 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground';
      case 'free':
        return 'bg-gradient-to-r from-green-600 to-green-500 text-white';
      case 'owned':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold';
      case 'weeklyBest':
        return 'bg-destructive text-destructive-foreground';
      case 'bestDay':
        return 'bg-yellow-500 text-black font-semibold';
      case 'bestWeek':
        return 'bg-orange-500 text-white font-semibold';
      case 'bestMonth':
        return 'bg-purple-500 text-white font-semibold';
      case 'best6Months':
        return 'bg-blue-500 text-white font-semibold';
      case 'bestYear':
        return 'bg-green-500 text-white font-semibold';
      case 'bestAllTime':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium shadow-sm',
        getVariantClasses(),
        className
      )}
    >
      {children}
    </span>
  );
};

export default NetflixBadge;