import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  ArrowUp,
  ArrowDown,
  Copy,
  Layout,
  Type,
  Image,
  Grid3x3
} from 'lucide-react';

interface StorePage {
  id: string;
  name: string;
  slug: string;
  type: string;
  content: any;
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  sort_order: number;
}

interface ComponentConfig {
  id: string;
  type: string;
  config: any;
}

interface StorePageBuilderProps {
  storeId: string;
}

const componentTypes = [
  { value: 'header', label: 'Cabeçalho', icon: Layout },
  { value: 'hero', label: 'Seção Hero', icon: Image },
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'product_grid', label: 'Grade de Produtos', icon: Grid3x3 },
  { value: 'image', label: 'Imagem', icon: Image },
  { value: 'spacer', label: 'Espaçador', icon: Layout },
];

const StorePageBuilder = ({ storeId }: StorePageBuilderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pages, setPages] = useState<StorePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<StorePage | null>(null);
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, [storeId]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order');

      if (error) throw error;
      setPages(data || []);
      
      if (data && data.length > 0) {
        setSelectedPage(data[0]);
        setComponents(Array.isArray(data[0].content) ? (data[0].content as unknown as ComponentConfig[]) : []);
      }
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar páginas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPage = async () => {
    try {
      const newPage = {
        store_id: storeId,
        name: 'Nova Página',
        slug: `pagina-${Date.now()}`,
        type: 'custom',
        content: [],
        is_published: false,
        sort_order: pages.length,
      };

      const { data, error } = await supabase
        .from('store_pages')
        .insert(newPage)
        .select()
        .single();

      if (error) throw error;

      setPages(prev => [...prev, data]);
      setSelectedPage(data);
      setComponents([]);

      toast({
        title: "Sucesso!",
        description: "Página criada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const savePage = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_pages')
        .update({
          name: selectedPage.name,
          slug: selectedPage.slug,
          content: components as any,
          meta_title: selectedPage.meta_title,
          meta_description: selectedPage.meta_description,
          is_published: selectedPage.is_published,
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Página salva com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addComponent = (type: string) => {
    const newComponent: ComponentConfig = {
      id: `comp_${Date.now()}`,
      type,
      config: getDefaultConfig(type),
    };

    setComponents(prev => [...prev, newComponent]);
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'header':
        return {
          title: 'Título da Página',
          subtitle: 'Subtítulo da página',
          showLogo: true,
        };
      case 'hero':
        return {
          title: 'Título Principal',
          subtitle: 'Descrição do hero',
          backgroundImage: '',
          ctaText: 'Call to Action',
          ctaUrl: '#',
        };
      case 'text':
        return {
          content: 'Digite seu texto aqui...',
          textAlign: 'left',
          fontSize: 'base',
        };
      case 'product_grid':
        return {
          title: 'Nossos Produtos',
          showFeatured: true,
          gridCols: 3,
          limit: 6,
        };
      case 'image':
        return {
          src: '',
          alt: 'Descrição da imagem',
          width: '100%',
          height: 'auto',
        };
      case 'spacer':
        return {
          height: '2rem',
        };
      default:
        return {};
    }
  };

  const updateComponent = (id: string, config: any) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, config } : comp
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(comp => comp.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= components.length) return;

    const newComponents = [...components];
    [newComponents[index], newComponents[newIndex]] = [newComponents[newIndex], newComponents[index]];
    setComponents(newComponents);
  };

  const duplicateComponent = (id: string) => {
    const component = components.find(comp => comp.id === id);
    if (!component) return;

    const newComponent: ComponentConfig = {
      ...component,
      id: `comp_${Date.now()}`,
    };

    const index = components.findIndex(comp => comp.id === id);
    const newComponents = [...components];
    newComponents.splice(index + 1, 0, newComponent);
    setComponents(newComponents);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Pages Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Páginas</CardTitle>
              <Button size="sm" onClick={createPage}>
                <Plus className="w-4 h-4 mr-1" />
                Nova
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedPage?.id === page.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedPage(page);
                    setComponents(Array.isArray(page.content) ? (page.content as unknown as ComponentConfig[]) : []);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{page.name}</span>
                    <Badge variant={page.is_published ? "default" : "secondary"} className="text-xs">
                      {page.is_published ? "Ativa" : "Rascunho"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">/{page.slug}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Editor */}
      <div className="lg:col-span-2">
        {selectedPage ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedPage.name}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={savePage} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
              <div className="space-y-4">
                {/* Page Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Página</Label>
                    <Input
                      value={selectedPage.name}
                      onChange={(e) => setSelectedPage(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                    />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input
                      value={selectedPage.slug}
                      onChange={(e) => setSelectedPage(prev => 
                        prev ? { ...prev, slug: e.target.value } : null
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedPage.is_published}
                    onCheckedChange={(checked) => setSelectedPage(prev => 
                      prev ? { ...prev, is_published: checked } : null
                    )}
                  />
                  <Label>Página Publicada</Label>
                </div>

                {/* Components */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Componentes da Página</Label>
                    <Select onValueChange={addComponent}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Adicionar componente" />
                      </SelectTrigger>
                      <SelectContent>
                        {componentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    {components.map((component, index) => (
                      <Card key={component.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline">
                              {componentTypes.find(t => t.value === component.type)?.label || component.type}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => moveComponent(component.id, 'up')}>
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => moveComponent(component.id, 'down')}>
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => duplicateComponent(component.id)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => removeComponent(component.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Component Config */}
                          <div className="space-y-2">
                            {component.type === 'text' && (
                              <Textarea
                                value={component.config.content || ''}
                                onChange={(e) => updateComponent(component.id, {
                                  ...component.config,
                                  content: e.target.value
                                })}
                                placeholder="Digite o texto..."
                              />
                            )}

                            {component.type === 'hero' && (
                              <>
                                <Input
                                  value={component.config.title || ''}
                                  onChange={(e) => updateComponent(component.id, {
                                    ...component.config,
                                    title: e.target.value
                                  })}
                                  placeholder="Título do hero"
                                />
                                <Input
                                  value={component.config.subtitle || ''}
                                  onChange={(e) => updateComponent(component.id, {
                                    ...component.config,
                                    subtitle: e.target.value
                                  })}
                                  placeholder="Subtítulo do hero"
                                />
                              </>
                            )}

                            {/* Add more component configs as needed */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Selecione uma página para editar</p>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Propriedades</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPage ? (
              <Tabs defaultValue="page">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="page">Página</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="page" className="space-y-4">
                  <div>
                    <Label>Tipo de Página</Label>
                    <Select
                      value={selectedPage.type}
                      onValueChange={(value) => setSelectedPage(prev => 
                        prev ? { ...prev, type: value } : null
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="about">Sobre</SelectItem>
                        <SelectItem value="contact">Contato</SelectItem>
                        <SelectItem value="custom">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label>Meta Título</Label>
                    <Input
                      value={selectedPage.meta_title || ''}
                      onChange={(e) => setSelectedPage(prev => 
                        prev ? { ...prev, meta_title: e.target.value } : null
                      )}
                      placeholder="Título para SEO"
                    />
                  </div>
                  <div>
                    <Label>Meta Descrição</Label>
                    <Textarea
                      value={selectedPage.meta_description || ''}
                      onChange={(e) => setSelectedPage(prev => 
                        prev ? { ...prev, meta_description: e.target.value } : null
                      )}
                      placeholder="Descrição para SEO"
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione uma página para ver suas propriedades
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StorePageBuilder;