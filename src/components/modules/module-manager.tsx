import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, GripVertical, Play, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Module {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  lessons?: Lesson[];
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

interface ModuleManagerProps {
  productId: string;
  editable?: boolean;
}

const ModuleManager = ({ productId, editable = false }: ModuleManagerProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

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

      // Sort lessons within each module
      const modulesWithSortedLessons = data?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a: Lesson, b: Lesson) => a.sort_order - b.sort_order) || []
      })) || [];

      setModules(modulesWithSortedLessons);
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Erro ao carregar módulos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createModule = async () => {
    if (!newModule.title.trim()) return;

    try {
      const maxOrder = Math.max(...modules.map(m => m.sort_order), -1);
      const { error } = await supabase
        .from('modules')
        .insert({
          product_id: productId,
          title: newModule.title,
          description: newModule.description || null,
          sort_order: maxOrder + 1
        });

      if (error) throw error;

      setNewModule({ title: '', description: '' });
      setShowAddForm(false);
      fetchModules();

      toast({
        title: "Módulo criado",
        description: "Módulo adicionado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar módulo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão removidas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      fetchModules();
      toast({
        title: "Módulo excluído",
        description: "Módulo removido com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir módulo",
        description: error.message,
        variant: "destructive",
      });
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

  const calculateModuleDuration = (lessons: Lesson[]): number => {
    return lessons.reduce((total, lesson) => total + (lesson.video_duration_seconds || 0), 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conteúdo do Curso</h2>
        {editable && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Módulo
          </Button>
        )}
      </div>

      {/* Add Module Form */}
      {showAddForm && editable && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Título *</Label>
              <Input
                id="module-title"
                value={newModule.title}
                onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Introdução ao React"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Descrição</Label>
              <Textarea
                id="module-description"
                value={newModule.description}
                onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do módulo"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createModule}>Criar Módulo</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum módulo ainda</h3>
              <p className="text-muted-foreground mb-4">
                {editable 
                  ? "Comece criando o primeiro módulo do seu curso"
                  : "Este curso ainda não possui módulos publicados"
                }
              </p>
              {editable && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Módulo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          modules.map((module, index) => (
            <Card key={module.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {editable && <GripVertical className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm font-medium text-muted-foreground">
                        Módulo {index + 1}
                      </span>
                      <span>{module.title}</span>
                    </CardTitle>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {module.lessons?.length || 0} aula{(module.lessons?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(calculateModuleDuration(module.lessons || []))}
                    </Badge>
                    {editable && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModule(module.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Lessons */}
              {module.lessons && module.lessons.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {editable && <GripVertical className="w-4 h-4 text-muted-foreground" />}
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {lessonIndex + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.is_preview && (
                            <Badge variant="secondary" className="text-xs">
                              Preview
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(lesson.video_duration_seconds)}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            {lesson.is_preview || !editable ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editable && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Aula
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}

              {/* Empty module */}
              {(!module.lessons || module.lessons.length === 0) && editable && (
                <CardContent className="pt-0">
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                    <Play className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Este módulo ainda não possui aulas
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Aula
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ModuleManager;