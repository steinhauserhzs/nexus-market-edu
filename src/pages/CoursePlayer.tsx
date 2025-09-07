import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLicenses } from "@/hooks/use-user-licenses";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/ui/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Settings,
  BookOpen,
  Clock,
  CheckCircle,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  content?: string;
  video_duration_seconds?: number;
  sort_order: number;
  is_preview: boolean;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Product {
  id: string;
  title: string;
  description?: string;
  slug: string;
  thumbnail_url?: string;
  modules: Module[];
}

const CoursePlayer = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasLicense } = useUserLicenses();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product && lessonId) {
      findAndSetCurrentLesson();
    }
  }, [product, lessonId]);

  const fetchProduct = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Buscar produto com módulos e aulas
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          slug,
          thumbnail_url,
          modules!inner(
            id,
            title,
            description,
            sort_order,
            lessons(
              id,
              title,
              description,
              video_url,
              content,
              video_duration_seconds,
              sort_order,
              is_preview,
              module_id
            )
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (productError) throw productError;

      // Verificar se usuário tem licença
      if (!hasLicense(productData.id)) {
        toast.error("Você não tem acesso a este curso");
        navigate(`/produto/${slug}`);
        return;
      }

      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error("Erro ao carregar o curso");
      navigate('/netflix');
    } finally {
      setLoading(false);
    }
  };

  const findAndSetCurrentLesson = () => {
    if (!product || !lessonId) return;

    for (const module of product.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
        return;
      }
    }

    // Se não encontrou a aula, navegar para a primeira aula
    if (product.modules.length > 0 && product.modules[0].lessons.length > 0) {
      const firstLesson = product.modules[0].lessons[0];
      navigate(`/curso/${slug}/aula/${firstLesson.id}`, { replace: true });
    }
  };

  const getAllLessons = (): Lesson[] => {
    if (!product) return [];
    
    return product.modules
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap(module => 
        module.lessons.sort((a, b) => a.sort_order - b.sort_order)
      );
  };

  const navigateToLesson = (lessonId: string) => {
    navigate(`/curso/${slug}/aula/${lessonId}`);
  };

  const getNextLesson = (): Lesson | null => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = (): Lesson | null => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Curso não encontrado</h2>
          <Button onClick={() => navigate('/netflix')}>
            Voltar aos Cursos
          </Button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <>
      <SEOHead 
        title={`${currentLesson.title} - ${product.title}`}
        description={currentLesson.description || product.description}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/netflix')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar aos Cursos
                </Button>
                
                <div>
                  <h1 className="text-lg font-semibold">{product.title}</h1>
                  <p className="text-sm text-muted-foreground">{currentLesson.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentLesson.video_duration_seconds ? 
                    `${Math.ceil(currentLesson.video_duration_seconds / 60)}min` : 
                    'N/A'
                  }
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Player Principal */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  {/* Video Player Placeholder */}
                  <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center">
                    {currentLesson.video_url ? (
                      <video
                        src={currentLesson.video_url}
                        controls
                        className="w-full h-full rounded-t-lg"
                        poster={product.thumbnail_url}
                      />
                    ) : (
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Vídeo não disponível</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold mb-2">{currentLesson.title}</h2>
                        <p className="text-muted-foreground">{currentLesson.description}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progresso da Aula</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => previousLesson && navigateToLesson(previousLesson.id)}
                        disabled={!previousLesson}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Aula Anterior
                      </Button>

                      <Button
                        onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                        disabled={!nextLesson}
                      >
                        Próxima Aula
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>

                    {/* Lesson Content */}
                    {currentLesson.content && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Material da Aula
                        </h3>
                        <div className="prose prose-sm max-w-none">
                          <p>{currentLesson.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar com Lista de Aulas */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conteúdo do Curso</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {product.modules
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((module) => (
                        <div key={module.id} className="border-b border-border last:border-b-0">
                          <div className="p-4 bg-muted/50">
                            <h4 className="font-medium text-sm">{module.title}</h4>
                          </div>
                          
                          {module.lessons
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => navigateToLesson(lesson.id)}
                                className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                                  lesson.id === currentLesson.id ? 'bg-primary/10 border-r-2 border-primary' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {lesson.is_preview ? (
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {lesson.title}
                                    </p>
                                    {lesson.video_duration_seconds && (
                                      <p className="text-xs text-muted-foreground">
                                        {Math.ceil(lesson.video_duration_seconds / 60)} min
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePlayer;