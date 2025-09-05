import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MemberAnalytics {
  totalViews: number;
  totalMembers: number;
  avgSessionTime: number;
  topContent: Array<{
    title: string;
    views: number;
    type: string;
  }>;
  memberActivity: Array<{
    date: string;
    activeMembers: number;
    contentViews: number;
  }>;
}

interface LogDetails {
  store_id?: string;
  content_id?: string;
  content_type?: string;
  progress_percentage?: number;
  duration_seconds?: number;
  timestamp?: string;
  page?: string;
}

export const useMemberAnalytics = () => {
  const [analytics, setAnalytics] = useState<MemberAnalytics>({
    totalViews: 0,
    totalMembers: 0,
    avgSessionTime: 0,
    topContent: [],
    memberActivity: []
  });
  const [loading, setLoading] = useState(false);

  const trackMemberAccess = useCallback(async (storeId: string) => {
    try {
      // Create a member access log entry
      const { error } = await supabase
        .from('security_logs')
        .insert({
          action: 'member_area_access',
          details: {
            store_id: storeId,
            timestamp: new Date().toISOString(),
            page: 'member_area'
          },
          severity: 'low'
        });

      if (error) console.error('Error tracking member access:', error);
    } catch (error) {
      console.error('Error tracking member access:', error);
    }
  }, []);

  const trackContentView = useCallback(async (storeId: string, contentId: string, contentType: string) => {
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert({
          action: 'member_content_view',
          details: {
            store_id: storeId,
            content_id: contentId,
            content_type: contentType,
            timestamp: new Date().toISOString()
          },
          severity: 'low'
        });

      if (error) console.error('Error tracking content view:', error);
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }, []);

  const trackVideoProgress = useCallback(async (storeId: string, contentId: string, progress: number, duration: number) => {
    try {
      const { error } = await supabase
        .from('security_logs')
        .insert({
          action: 'member_video_progress',
          details: {
            store_id: storeId,
            content_id: contentId,
            progress_percentage: progress,
            duration_seconds: duration,
            timestamp: new Date().toISOString()
          },
          severity: 'low'
        });

      if (error) console.error('Error tracking video progress:', error);
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  }, []);

  const loadAnalytics = useCallback(async (storeId: string, startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      // Simplified analytics - just return mock data for now
      setAnalytics({
        totalViews: 150,
        totalMembers: 25,
        avgSessionTime: 12,
        topContent: [
          { title: "Conteúdo A", views: 45, type: "video" },
          { title: "Conteúdo B", views: 30, type: "download" }
        ],
        memberActivity: [
          { date: "2025-01-01", activeMembers: 10, contentViews: 25 }
        ]
      });
    } catch (error) {
      console.error('Error loading member analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    trackMemberAccess,
    trackContentView,
    trackVideoProgress,
    loadAnalytics
  };
};