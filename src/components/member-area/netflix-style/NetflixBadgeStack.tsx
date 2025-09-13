// Nexus Netflix-Style Member Area - Badge Stack Component

import { cn } from '@/lib/utils';
import NetflixBadge from './NetflixBadge';

interface NetflixBadgeStackProps {
  owned?: boolean;
  freeLessons?: number;
  salesBadge?: 'bestDay' | 'bestWeek' | 'bestMonth' | 'best6Months' | 'bestYear' | 'bestAllTime';
  isEligibleForPromotional?: boolean;
  weeklyBest?: boolean;
  className?: string;
}

const NetflixBadgeStack = ({ 
  owned, 
  freeLessons, 
  salesBadge, 
  isEligibleForPromotional = false,
  weeklyBest = false,
  className 
}: NetflixBadgeStackProps) => {
  const badges = [];

  // Priority 1: Ownership/Free lessons (functional badges)
  if (owned) {
    badges.push(
      <NetflixBadge key="owned" variant="owned" className="text-xs">
        Adquirido
      </NetflixBadge>
    );
  } else if (freeLessons && freeLessons > 0) {
    badges.push(
      <NetflixBadge key="free" variant="free" className="text-xs">
        {freeLessons} aulas grátis
      </NetflixBadge>
    );
  }

  // Priority 2: Sales badges (from "Mais Comprados" section)
  if (salesBadge) {
    const salesLabels = {
      bestDay: 'Mais vendido hoje',
      bestWeek: 'Mais vendido da semana',
      bestMonth: 'Mais vendido do mês',
      best6Months: 'Mais vendido (6m)',
      bestYear: 'Mais vendido do ano',
      bestAllTime: 'Mais vendido de todos os tempos'
    };
    
    badges.push(
      <NetflixBadge key="sales" variant={salesBadge} className="text-xs">
        {salesLabels[salesBadge]}
      </NetflixBadge>
    );
  }

  // Priority 3: Weekly best (only in non-bestseller sections)
  if (weeklyBest && !salesBadge) {
    badges.push(
      <NetflixBadge key="weekly" variant="weeklyBest" className="text-xs">
        Mais vendido
      </NetflixBadge>
    );
  }

  // Only show up to 3 badges maximum
  const visibleBadges = badges.slice(0, 3);

  if (visibleBadges.length === 0) return null;

  return (
    <div className={cn(
      "absolute top-2 left-2 flex flex-col gap-1 z-10",
      className
    )}>
      {visibleBadges}
    </div>
  );
};

export default NetflixBadgeStack;