import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface LessonProgress {
  id: string;
  lesson_id: string;
  user_id: string;
  progress_seconds: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  productId: string;
  totalLessons: number;
  completedLessons: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
  progressPercentage: number;
  lessons: Array<{
    id: string;
    title: string;
    duration: number;
    progress: number;
    completed: boolean;
  }>;
}

export const useCourseProgress = (productId: string) => {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProgress = async () => {
    if (!user || !productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all lessons for the product with progress
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          video_duration_seconds,
          lesson_progress:lesson_progress(
            progress_seconds,
            completed,
            completed_at
          )
        `)
        .eq('modules.product_id', productId)
        .eq('lesson_progress.user_id', user.id);

      if (lessonsError) throw lessonsError;

      const lessons = lessonsData?.map(lesson => {
        const progress = lesson.lesson_progress?.[0];
        return {
          id: lesson.id,
          title: lesson.title,
          duration: lesson.video_duration_seconds || 0,
          progress: progress?.progress_seconds || 0,
          completed: progress?.completed || false,
        };
      }) || [];

      const totalLessons = lessons.length;
      const completedLessons = lessons.filter(l => l.completed).length;
      const totalDurationSeconds = lessons.reduce((sum, l) => sum + l.duration, 0);
      const watchedSeconds = lessons.reduce((sum, l) => sum + l.progress, 0);
      const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      setProgress({
        productId,
        totalLessons,
        completedLessons,
        totalDurationSeconds,
        watchedSeconds,
        progressPercentage,
        lessons
      });

    } catch (error: any) {
      console.error('Error fetching course progress:', error);
      toast({
        title: "Erro ao carregar progresso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLessonProgress = async (
    lessonId: string, 
    progressSeconds: number, 
    completed: boolean = false
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_seconds: progressSeconds,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh progress
      await fetchProgress();

    } catch (error: any) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [productId, user?.id]);

  return {
    progress,
    loading,
    updateLessonProgress,
    refetch: fetchProgress
  };
};