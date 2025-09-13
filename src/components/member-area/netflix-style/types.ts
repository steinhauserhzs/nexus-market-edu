// Nexus Netflix-Style Member Area - Type Definitions

export interface MemberProduct {
  id: string;
  title: string;
  cover: string;
  price: number;
  owned: boolean;
  storeId: string;
  productId?: string;
  badge?: 'new' | 'free' | 'owned' | 'weeklyBest' | 'bestDay' | 'bestWeek' | 'bestMonth' | 'best6Months' | 'bestYear' | 'bestAllTime';
  description?: string;
  type: 'digital' | 'curso' | 'physical';
  popularityScore: number;
}

export interface MemberCourse extends MemberProduct {
  lessons: MemberLesson[];
  tutorCourseId?: number;
}

export interface MemberLesson {
  id: string;
  title: string;
  duration: string;
  free: boolean;
  videoUrl?: string;
  completed?: boolean;
}

export interface MemberBanner {
  id: string;
  image: string;
  link?: string;
  storeId: string;
}

export interface MemberAreaConfig {
  storeId: string;
  storeName: string;
  storeSlug: string;
  logo: string;
  primaryColor: string;
  backgroundColor: string;
  banners: MemberBanner[];
}

export interface NavigationState {
  currentTab: 'home' | 'products' | 'courses' | 'settings';
}