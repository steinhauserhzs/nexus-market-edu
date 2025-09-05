import { useState, useCallback, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Save,
  GripVertical,
  Settings,
  Layout,
  Type,
  Image,
  Grid3x3,
  Video,
  Code,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Undo,
  Redo
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  styles?: Record<string, any>;
  responsive?: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  };
}

interface PageConfig {
  id: string;
  name: string;
  slug: string;
  components: ComponentConfig[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  settings: {
    layout: 'full' | 'contained' | 'narrow';
    background: string;
    customCSS: string;
  };
}

const componentLibrary = [
  {
    type: 'header',
    name: 'Cabeçalho',
    icon: Layout,
    category: 'Layout',
    description: 'Cabeçalho com logo e navegação'
  },
  {
    type: 'hero',
    name: 'Seção Hero',
    icon: Image,
    category: 'Conteúdo',
    description: 'Banner principal com call-to-action'
  },
  {
    type: 'text',
    name: 'Texto',
    icon: Type,
    category: 'Conteúdo',
    description: 'Bloco de texto editável'
  },
  {
    type: 'rich_text',
    name: 'Texto Rico',
    icon: Type,
    category: 'Conteúdo',
    description: 'Editor de texto com formatação'
  },
  {
    type: 'image',
    name: 'Imagem',
    icon: Image,
    category: 'Mídia',
    description: 'Imagem com opções de layout'
  },
  {
    type: 'gallery',
    name: 'Galeria',
    icon: Grid3x3,
    category: 'Mídia',
    description: 'Galeria de imagens'
  },
  {
    type: 'video',
    name: 'Vídeo',
    icon: Video,
    category: 'Mídia',
    description: 'Player de vídeo responsivo'
  },
  {
    type: 'product_grid',
    name: 'Grade de Produtos',
    icon: Grid3x3,
    category: 'E-commerce',
    description: 'Exibição de produtos em grid'
  },
  {
    type: 'product_carousel',
    name: 'Carrossel de Produtos',
    icon: Layers,
    category: 'E-commerce',
    description: 'Produtos em carrossel deslizante'
  },
  {
    type: 'testimonials',
    name: 'Depoimentos',
    icon: Type,
    category: 'Social',
    description: 'Seção de depoimentos de clientes'
  },
  {
    type: 'cta_section',
    name: 'Call to Action',
    icon: Layout,
    category: 'Conversão',
    description: 'Seção de chamada para ação'
  },
  {
    type: 'spacer',
    name: 'Espaçador',
    icon: Layout,
    category: 'Layout',
    description: 'Espaço vertical ajustável'
  },
  {
    type: 'divider',
    name: 'Divisor',
    icon: Layout,
    category: 'Layout',
    description: 'Linha divisória estilizada'
  },
  {
    type: 'contact_form',
    name: 'Formulário de Contato',
    icon: Layout,
    category: 'Formulários',
    description: 'Formulário de contato customizável'
  },
  {
    type: 'custom_html',
    name: 'HTML Personalizado',
    icon: Code,
    category: 'Avançado',
    description: 'Código HTML/CSS personalizado'
  }
];

const devicePresets = [
  { name: 'Mobile', icon: Smartphone, width: 375 },
  { name: 'Tablet', icon: Tablet, width: 768 },
  { name: 'Desktop', icon: Monitor, width: 1200 }
];

interface AdvancedPageBuilderProps {
  storeId: string;
  initialPage?: PageConfig;
  onSave: (page: PageConfig) => void;
}

const AdvancedPageBuilder = ({ storeId, initialPage, onSave }: AdvancedPageBuilderProps) => {
  const [page, setPage] = useState<PageConfig>(initialPage || {
    id: crypto.randomUUID(),
    name: 'Nova Página',
    slug: 'nova-pagina',
    components: [],
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    settings: {
      layout: 'contained',
      background: '#ffffff',
      customCSS: ''
    }
  });
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [activeTab, setActiveTab] = useState('design');
  const [history, setHistory] = useState<PageConfig[]>([page]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);

  // History management
  const saveToHistory = useCallback((newPage: PageConfig) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPage(history[newIndex]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPage(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Component operations
  const addComponent = useCallback((componentType: string) => {
    const component: ComponentConfig = {
      id: crypto.randomUUID(),
      type: componentType,
      name: componentLibrary.find(c => c.type === componentType)?.name || 'Component',
      config: getDefaultConfig(componentType),
      styles: {},
      responsive: {
        mobile: {},
        tablet: {},
        desktop: {}
      }
    };

    const newPage = {
      ...page,
      components: [...page.components, component]
    };
    
    setPage(newPage);
    saveToHistory(newPage);
    setSelectedComponent(component.id);
    
    toast({
      title: "Componente Adicionado",
      description: `${component.name} foi adicionado à página`,
    });
  }, [page, saveToHistory, toast]);

  const updateComponent = useCallback((componentId: string, updates: Partial<ComponentConfig>) => {
    const newPage = {
      ...page,
      components: page.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    };
    
    setPage(newPage);
    saveToHistory(newPage);
  }, [page, saveToHistory]);

  const removeComponent = useCallback((componentId: string) => {
    const newPage = {
      ...page,
      components: page.components.filter(comp => comp.id !== componentId)
    };
    
    setPage(newPage);
    saveToHistory(newPage);
    setSelectedComponent(null);
    
    toast({
      title: "Componente Removido",
      description: "O componente foi removido da página",
    });
  }, [page, saveToHistory, toast]);

  const duplicateComponent = useCallback((componentId: string) => {
    const component = page.components.find(c => c.id === componentId);
    if (!component) return;

    const duplicated: ComponentConfig = {
      ...component,
      id: crypto.randomUUID(),
      name: `${component.name} (Cópia)`
    };

    const index = page.components.findIndex(c => c.id === componentId);
    const newComponents = [...page.components];
    newComponents.splice(index + 1, 0, duplicated);

    const newPage = {
      ...page,
      components: newComponents
    };
    
    setPage(newPage);
    saveToHistory(newPage);
    setSelectedComponent(duplicated.id);
  }, [page, saveToHistory]);

  // Drag and drop
  const onDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const newComponents = Array.from(page.components);
    const [reorderedItem] = newComponents.splice(result.source.index, 1);
    newComponents.splice(result.destination.index, 0, reorderedItem);

    const newPage = {
      ...page,
      components: newComponents
    };
    
    setPage(newPage);
    saveToHistory(newPage);
  }, [page, saveToHistory]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(page);
      toast({
        title: "Página Salva!",
        description: "As alterações foram salvas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getDefaultConfig = (componentType: string): Record<string, any> => {
    const configs: Record<string, any> = {
      header: {
        logo: '',
        navigation: ['Início', 'Produtos', 'Sobre', 'Contato'],
        showSearch: true,
        showCart: true,
        sticky: true
      },
      hero: {
        title: 'Título Principal',
        subtitle: 'Descrição do seu negócio',
        backgroundImage: '',
        ctaText: 'Saiba Mais',
        ctaLink: '#',
        alignment: 'center',
        overlay: 0.3
      },
      text: {
        content: 'Digite seu texto aqui...',
        alignment: 'left',
        fontSize: 'base',
        color: '#000000'
      },
      rich_text: {
        content: '<p>Texto rico com <strong>formatação</strong></p>',
        maxWidth: '100%'
      },
      image: {
        src: '',
        alt: 'Descrição da imagem',
        width: '100%',
        alignment: 'center',
        rounded: false,
        shadow: false
      },
      gallery: {
        images: [],
        columns: 3,
        spacing: 'md',
        lightbox: true
      },
      video: {
        url: '',
        autoplay: false,
        controls: true,
        loop: false,
        aspectRatio: '16:9'
      },
      product_grid: {
        title: 'Nossos Produtos',
        showFeatured: true,
        columns: 3,
        limit: 6,
        showFilters: false,
        layout: 'grid'
      },
      product_carousel: {
        title: 'Produtos em Destaque',
        autoplay: true,
        dots: true,
        arrows: true,
        itemsToShow: 4
      },
      testimonials: {
        title: 'O que nossos clientes dizem',
        testimonials: [
          {
            name: 'Cliente Satisfeito',
            content: 'Excelente produto e atendimento!',
            rating: 5,
            avatar: ''
          }
        ],
        layout: 'carousel'
      },
      cta_section: {
        title: 'Pronto para começar?',
        description: 'Junte-se a milhares de clientes satisfeitos',
        buttonText: 'Começar Agora',
        buttonLink: '#',
        backgroundColor: '#f8f9fa',
        textColor: '#000000'
      },
      spacer: {
        height: '50px'
      },
      divider: {
        style: 'solid',
        color: '#e5e7eb',
        thickness: 1,
        width: '100%'
      },
      contact_form: {
        title: 'Entre em Contato',
        fields: ['name', 'email', 'message'],
        submitText: 'Enviar',
        successMessage: 'Mensagem enviada com sucesso!'
      },
      custom_html: {
        html: '<div class="custom-content">\n  <!-- Seu HTML personalizado aqui -->\n</div>',
        css: '.custom-content {\n  padding: 1rem;\n}'
      }
    };

    return configs[componentType] || {};
  };

  const selectedComponentData = useMemo(() => {
    return page.components.find(c => c.id === selectedComponent);
  }, [page.components, selectedComponent]);

  const previewWidth = useMemo(() => {
    const device = devicePresets.find(d => d.name.toLowerCase() === previewDevice);
    return device?.width || 1200;
  }, [previewDevice]);

  const componentsByCategory = useMemo(() => {
    return componentLibrary.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<string, typeof componentLibrary>);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-semibold">{page.name}</h1>
              <p className="text-sm text-muted-foreground">/{page.slug}</p>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex === history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {devicePresets.map((device) => (
                <Button
                  key={device.name}
                  variant={previewDevice === device.name.toLowerCase() ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice(device.name.toLowerCase())}
                  className="h-8 w-8 p-0"
                >
                  <device.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
            
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-background/50 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4">
              <TabsTrigger value="components">Componentes</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Config</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Components Tab */}
                <TabsContent value="components" className="mt-0">
                  <div className="space-y-6">
                    {Object.entries(componentsByCategory).map(([category, components]) => (
                      <div key={category}>
                        <h3 className="font-medium text-sm mb-3 text-muted-foreground">{category}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {components.map((component) => (
                            <Button
                              key={component.type}
                              variant="outline"
                              className="h-auto p-3 flex flex-col items-center gap-2"
                              onClick={() => addComponent(component.type)}
                            >
                              <component.icon className="w-5 h-5" />
                              <span className="text-xs font-medium">{component.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Design Tab - Component Settings */}
                <TabsContent value="design" className="mt-0">
                  {selectedComponentData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{selectedComponentData.name}</h3>
                        <Badge variant="secondary">{selectedComponentData.type}</Badge>
                      </div>
                      
                      {/* Component-specific settings would go here */}
                      <div className="space-y-3">
                        {selectedComponentData.type === 'text' && (
                          <>
                            <div>
                              <Label>Conteúdo</Label>
                              <Textarea
                                value={selectedComponentData.config.content || ''}
                                onChange={(e) => updateComponent(selectedComponentData.id, {
                                  config: { ...selectedComponentData.config, content: e.target.value }
                                })}
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <Label>Alinhamento</Label>
                              <Select
                                value={selectedComponentData.config.alignment || 'left'}
                                onValueChange={(value) => updateComponent(selectedComponentData.id, {
                                  config: { ...selectedComponentData.config, alignment: value }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Esquerda</SelectItem>
                                  <SelectItem value="center">Centro</SelectItem>
                                  <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        
                        {selectedComponentData.type === 'hero' && (
                          <>
                            <div>
                              <Label>Título</Label>
                              <Input
                                value={selectedComponentData.config.title || ''}
                                onChange={(e) => updateComponent(selectedComponentData.id, {
                                  config: { ...selectedComponentData.config, title: e.target.value }
                                })}
                              />
                            </div>
                            
                            <div>
                              <Label>Subtítulo</Label>
                              <Textarea
                                value={selectedComponentData.config.subtitle || ''}
                                onChange={(e) => updateComponent(selectedComponentData.id, {
                                  config: { ...selectedComponentData.config, subtitle: e.target.value }
                                })}
                                rows={2}
                              />
                            </div>
                            
                            <div>
                              <Label>Texto do Botão</Label>
                              <Input
                                value={selectedComponentData.config.ctaText || ''}
                                onChange={(e) => updateComponent(selectedComponentData.id, {
                                  config: { ...selectedComponentData.config, ctaText: e.target.value }
                                })}
                              />
                            </div>
                          </>
                        )}
                        
                        {/* Add more component-specific settings */}
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateComponent(selectedComponentData.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeComponent(selectedComponentData.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um componente para editar suas propriedades</p>
                    </div>
                  )}
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0">
                  <div className="space-y-4">
                    <div>
                      <Label>Nome da Página</Label>
                      <Input
                        value={page.name}
                        onChange={(e) => setPage(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Slug (URL)</Label>
                      <Input
                        value={page.slug}
                        onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Layout da Página</Label>
                      <Select
                        value={page.settings.layout}
                        onValueChange={(value: any) => setPage(prev => ({
                          ...prev,
                          settings: { ...prev.settings, layout: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Largura Total</SelectItem>
                          <SelectItem value="contained">Container</SelectItem>
                          <SelectItem value="narrow">Estreito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Meta Título (SEO)</Label>
                      <Input
                        value={page.seo.title}
                        onChange={(e) => setPage(prev => ({
                          ...prev,
                          seo: { ...prev.seo, title: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Meta Descrição (SEO)</Label>
                      <Textarea
                        value={page.seo.description}
                        onChange={(e) => setPage(prev => ({
                          ...prev,
                          seo: { ...prev.seo, description: e.target.value }
                        }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-muted/30 overflow-auto">
          <div className="p-6">
            <div 
              ref={previewRef}
              className="mx-auto bg-white rounded-lg shadow-sm min-h-[600px] transition-all duration-300"
              style={{ width: `${previewWidth}px` }}
            >
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="page-components">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 p-4"
                    >
                      {page.components.map((component, index) => (
                        <Draggable key={component.id} draggableId={component.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group relative border-2 border-transparent rounded-lg transition-all",
                                selectedComponent === component.id && "border-primary bg-primary/5",
                                snapshot.isDragging && "shadow-lg"
                              )}
                              onClick={() => setSelectedComponent(component.id)}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                              >
                                <GripVertical className="w-5 h-5 text-muted-foreground" />
                              </div>
                              
                              {/* Component Preview */}
                              <div className="p-4">
                                <ComponentPreview component={component} />
                              </div>
                              
                              {/* Component Label */}
                              {selectedComponent === component.id && (
                                <div className="absolute -top-6 left-0">
                                  <Badge variant="default" className="text-xs">
                                    {component.name}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {page.components.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Página em Branco</h3>
                          <p>Adicione componentes da barra lateral para começar a criar sua página</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component Preview Component
const ComponentPreview = ({ component }: { component: ComponentConfig }) => {
  switch (component.type) {
    case 'text':
      return (
        <div style={{ textAlign: component.config.alignment || 'left' }}>
          <p className="text-sm">{component.config.content || 'Texto vazio'}</p>
        </div>
      );
      
    case 'hero':
      return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-2">{component.config.title || 'Título Hero'}</h1>
          <p className="mb-4">{component.config.subtitle || 'Subtítulo'}</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium">
            {component.config.ctaText || 'Call to Action'}
          </button>
        </div>
      );
      
    case 'image':
      return (
        <div className="text-center">
          {component.config.src ? (
            <img 
              src={component.config.src} 
              alt={component.config.alt}
              className="max-w-full h-auto rounded"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
      );
      
    case 'spacer':
      return (
        <div 
          className="w-full bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center"
          style={{ height: component.config.height || '50px' }}
        >
          <span className="text-xs text-muted-foreground">Espaçador</span>
        </div>
      );
      
    default:
      return (
        <div className="p-4 bg-muted rounded text-center">
          <span className="text-sm text-muted-foreground">
            {component.name} - Preview não disponível
          </span>
        </div>
      );
  }
};

export default AdvancedPageBuilder;