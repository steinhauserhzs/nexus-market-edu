// Nexus Netflix-Style Member Area - Badge Rotation System (3-day cycle)

export type PromotionalBadgeType = 'popular' | 'new' | 'highlight' | 'weeklyBest';
export type SalesBadgeType = 'bestDay' | 'bestWeek' | 'bestMonth' | 'best6Months' | 'bestYear' | 'bestAllTime';

const PROMOTIONAL_BADGES: PromotionalBadgeType[] = ['popular', 'new', 'highlight', 'weeklyBest'];

// Calculate 3-day window based on UTC timestamp
export const get3DayWindow = (): number => {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 3));
};

// Get stored window or calculate new one
export const getCurrentWindow = (): number => {
  const stored = localStorage.getItem('badge-window-3d');
  const current = get3DayWindow();
  
  if (!stored || parseInt(stored) !== current) {
    localStorage.setItem('badge-window-3d', current.toString());
    return current;
  }
  
  return parseInt(stored);
};

// Deterministic badge assignment for first 6 items
export const getPromotionalBadges = (itemIds: string[], currentWindow: number): Map<string, PromotionalBadgeType> => {
  const result = new Map<string, PromotionalBadgeType>();
  const eligibleItems = itemIds.slice(0, 6); // Only first 6 items
  
  eligibleItems.forEach((id, index) => {
    // Create deterministic seed based on window + item id + index
    const seed = currentWindow + id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
    const badgeIndex = seed % PROMOTIONAL_BADGES.length;
    
    // Not all items get badges - add some randomness
    if ((seed % 3) === 0) { // ~33% chance
      result.set(id, PROMOTIONAL_BADGES[badgeIndex]);
    }
  });
  
  return result;
};

// Check if item should have promotional badge
export const shouldShowPromotionalBadge = (itemId: string, itemIndex: number): boolean => {
  return itemIndex < 6; // Only first 6 items are eligible
};

// Get sales badge for "Mais Comprados" section
export const getSalesBadge = (index: number): SalesBadgeType => {
  const salesBadges: SalesBadgeType[] = ['bestDay', 'bestWeek', 'bestMonth', 'best6Months', 'bestYear', 'bestAllTime'];
  return salesBadges[index % salesBadges.length];
};