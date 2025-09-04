import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import VideoPlayer from "@/components/video/video-player";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Play, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  Clock,
  Award,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  content: string | null;
  sort_order: number;
  is_preview: boolean;
}

interface CoursePlayerProps {
  productId: string;
  hasAccess: boolean;
}

const CoursePlayer = ({ productId, hasAccess }: CoursePlayerProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const { progress, updateLessonProgress } = useCourseProgress(productId);

  useEffect(() => {
    fetchModules();
  }, [productId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          lessons:lessons(*)
        `)
        .eq('product_id', productId)
        .order('sort_order');

      if (error) throw error;

      const modulesWithSortedLessons = data?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order) || []
      })) || [];

      setModules(modulesWithSortedLessons);

      // Set first accessible lesson as current
      if (modulesWithSortedLessons.length > 0) {
        const firstLesson = modulesWithSortedLessons[0]?.lessons[0];
        if (firstLesson && (hasAccess || firstLesson.is_preview)) {
          setCurrentLesson(firstLesson);
        }
      }
    } catch (error: any) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (hasAccess || lesson.is_preview) {
      setCurrentLesson(lesson);
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (currentLesson && hasAccess) {
      const completed = currentTime >= duration * 0.9; // 90% watched = completed
      updateLessonProgress(currentLesson.id, Math.floor(currentTime), completed);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "0min";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const getLessonProgress = (lessonId: string) => {
    return progress?.lessons.find(l => l.id === lessonId);
  };

  const isLessonCompleted = (lessonId: string) => {
    const lessonProgress = getLessonProgress(lessonId);
    return lessonProgress?.completed || false;
  };

  const canAccessLesson = (lesson: Lesson) => {
    return hasAccess || lesson.is_preview;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Curso em Preparação</h3>
            <p className="text-muted-foreground">
              Este curso ainda não possui conteúdo disponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Video Player Area */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          showSidebar ? "mr-80" : "mr-0"
        )}>
          <div className="p-6">
            {currentLesson ? (
              <div className="space-y-6">
                {/* Video Player */}
                {currentLesson.video_url && (
                  <VideoPlayer
                    src={currentLesson.video_url}
                    title={currentLesson.title}
                    onProgress={handleVideoProgress}
                    className="w-full"
                  />
                )}

                {/* Lesson Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold mb-2">
                        {currentLesson.title}
                      </h1>
                      {currentLesson.description && (
                        <p className="text-muted-foreground mb-4">
                          {currentLesson.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentLesson.is_preview && (
                        <Badge variant="secondary">Preview Gratuito</Badge>
                      )}
                      {isLessonCompleted(currentLesson.id) && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(currentLesson.video_duration_seconds)}
                      </Badge>
                    </div>
                  </div>

                  {/* Course Progress */}
                  {progress && hasAccess && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progresso do Curso</span>
                          <span className="text-sm text-muted-foreground">
                            {progress.completedLessons} de {progress.totalLessons} aulas
                          </span>
                        </div>
                        <Progress value={progress.progressPercentage} className="mb-2" />
                        <div className="text-xs text-muted-foreground">
                          {Math.round(progress.progressPercentage)}% concluído
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lesson Content */}
                  {currentLesson.content && canAccessLesson(currentLesson) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Material de Apoio
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p>{currentLesson.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <Card className="w-full max-w-md">
                  <CardContent className="pt-6 text-center">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Selecione uma Aula</h3>
                    <p className="text-muted-foreground">
                      Escolha uma aula no menu lateral para começar a assistir.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className={cn(
          "fixed right-0 top-0 h-full w-80 bg-card border-l transform transition-transform duration-300 overflow-y-auto",
          showSidebar ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <List className="w-4 h-4" />
                Conteúdo do Curso
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? '→' : '←'}
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="space-y-2">
                <div className="font-medium text-sm text-muted-foreground">
                  Módulo {moduleIndex + 1}: {module.title}
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const canAccess = canAccessLesson(lesson);
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isCurrent = currentLesson?.id === lesson.id;

                    return (
                      <Button
                        key={lesson.id}
                        variant={isCurrent ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start h-auto p-3 text-left",
                          !canAccess && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => handleLessonSelect(lesson)}
                        disabled={!canAccess}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : canAccess ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {lessonIndex + 1}. {lesson.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(lesson.video_duration_seconds)}
                              </span>
                              {lesson.is_preview && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Access Notice */}
          {!hasAccess && (
            <div className="p-4 border-t">
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <Award className="w-8 h-8 text-primary mx-auto" />
                    <h4 className="font-medium text-sm">Acesso Completo</h4>
                    <p className="text-xs text-muted-foreground">
                      Adquira o curso para ter acesso a todas as aulas e materiais.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Toggle (when hidden) */}
        {!showSidebar && (
          <Button
            variant="outline"
            size="sm"
            className="fixed right-4 top-4 z-10"
            onClick={() => setShowSidebar(true)}
          >
            <List className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;