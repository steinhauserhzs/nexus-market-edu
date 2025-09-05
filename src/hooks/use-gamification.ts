import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPoints {
  id: string;
  user_id: string;
  store_id: string;
  total_points: number;
  level: number;
  experience: number;
}

export interface Achievement {
  id: string;
  user_id: string;
  store_id: string;
  achievement_type: 'video_completion' | 'course_completion' | 'login_streak' | 'community_participation' | 'content_creation';
  title: string;
  description: string;
  points_awarded: number;
  badge_icon: string;
  earned_at: string;
}

export interface LeaderboardEntry {
  id: string;
  store_id: string;
  user_id: string;
  points: number;
  rank: number;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useGamification = (storeId?: string) => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserPoints = useCallback(async () => {
    if (!user || !storeId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user points:', error);
        return;
      }

      if (data) {
        setUserPoints(data);
      } else {
        // Create initial points entry
        const { data: newPoints, error: createError } = await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            store_id: storeId,
            total_points: 0,
            level: 1,
            experience: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user points:', createError);
          return;
        }

        setUserPoints(newPoints);
      }
    } catch (error) {
      console.error('Error in loadUserPoints:', error);
    } finally {
      setLoading(false);
    }
  }, [user, storeId]);

  const loadAchievements = useCallback(async () => {
    if (!user || !storeId) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error loading achievements:', error);
        return;
      }

      setAchievements(data || []);
    } catch (error) {
      console.error('Error in loadAchievements:', error);
    }
  }, [user, storeId]);

  const loadLeaderboard = useCallback(async (period: 'weekly' | 'monthly' | 'yearly' | 'all_time' = 'monthly') => {
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('store_id', storeId)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error in loadLeaderboard:', error);
    }
  }, [storeId]);

  const awardPoints = useCallback(async (points: number, reason: string) => {
    if (!user || !storeId || !userPoints) return;

    try {
      const newTotalPoints = userPoints.total_points + points;
      const newExperience = userPoints.experience + points;
      const newLevel = Math.floor(newExperience / 1000) + 1; // Level up every 1000 XP

      const { data, error } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          experience: newExperience,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', userPoints.id)
        .select()
        .single();

      if (error) {
        console.error('Error awarding points:', error);
        return;
      }

      setUserPoints(data);

      // Check for level up achievement
      if (newLevel > userPoints.level) {
        await earnAchievement(
          'login_streak',
          `Nível ${newLevel} Alcançado!`,
          `Parabéns! Você atingiu o nível ${newLevel}.`,
          50,
          '🏆'
        );
      }

      // Update leaderboard
      await updateLeaderboard();

    } catch (error) {
      console.error('Error in awardPoints:', error);
    }
  }, [user, storeId, userPoints]);

  const earnAchievement = useCallback(async (
    type: Achievement['achievement_type'],
    title: string,
    description: string,
    points: number,
    icon: string
  ) => {
    if (!user || !storeId) return;

    try {
      // Check if achievement already exists
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .eq('achievement_type', type)
        .eq('title', title)
        .maybeSingle();

      if (existing) return; // Achievement already earned

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          store_id: storeId,
          achievement_type: type,
          title,
          description,
          points_awarded: points,
          badge_icon: icon
        })
        .select()
        .single();

      if (error) {
        console.error('Error earning achievement:', error);
        return;
      }

      setAchievements(prev => [data, ...prev]);
      
      // Award points for achievement
      if (points > 0) {
        await awardPoints(points, `Conquista: ${title}`);
      }

      return data;
    } catch (error) {
      console.error('Error in earnAchievement:', error);
    }
  }, [user, storeId, awardPoints]);

  const updateLeaderboard = useCallback(async () => {
    if (!user || !storeId || !userPoints) return;

    try {
      // Update monthly leaderboard entry
      const { error } = await supabase
        .from('leaderboards')
        .upsert({
          store_id: storeId,
          period: 'monthly',
          user_id: user.id,
          points: userPoints.total_points,
          rank: 1 // Will be recalculated by a background job
        });

      if (error) {
        console.error('Error updating leaderboard:', error);
      }
    } catch (error) {
      console.error('Error in updateLeaderboard:', error);
    }
  }, [user, storeId, userPoints]);

  // Predefined achievement triggers
  const triggerVideoCompletion = useCallback(async (videoTitle: string) => {
    await awardPoints(10, `Vídeo assistido: ${videoTitle}`);
    await earnAchievement(
      'video_completion',
      'Vídeo Completado',
      `Você completou o vídeo: ${videoTitle}`,
      10,
      '📹'
    );
  }, [awardPoints, earnAchievement]);

  const triggerCourseCompletion = useCallback(async (courseTitle: string) => {
    await awardPoints(100, `Curso concluído: ${courseTitle}`);
    await earnAchievement(
      'course_completion',
      'Curso Concluído',
      `Parabéns! Você concluiu: ${courseTitle}`,
      100,
      '🎓'
    );
  }, [awardPoints, earnAchievement]);

  const triggerCommunityParticipation = useCallback(async (action: 'post' | 'comment' | 'like') => {
    const points = action === 'post' ? 15 : action === 'comment' ? 5 : 1;
    await awardPoints(points, `Participação na comunidade: ${action}`);
    
    if (action === 'post') {
      await earnAchievement(
        'community_participation',
        'Primeira Publicação',
        'Você fez sua primeira publicação na comunidade!',
        15,
        '💬'
      );
    }
  }, [awardPoints, earnAchievement]);

  return {
    userPoints,
    achievements,
    leaderboard,
    loading,
    loadUserPoints,
    loadAchievements,
    loadLeaderboard,
    awardPoints,
    earnAchievement,
    triggerVideoCompletion,
    triggerCourseCompletion,
    triggerCommunityParticipation
  };
};