import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Palette, 
  Layout, 
  Settings, 
  Eye, 
  Save, 
  Plus, 
  Trash2,
  Users,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import BackNavigation from '@/components/layout/back-navigation';
import SEOHead from '@/components/ui/seo-head';

interface Store {
  id: string;
  name: string;
  description: string;
  slug: string;
  owner_id: string;
}

interface MemberAreaConfig {
  id?: string;
  store_id: string;
  welcome_message: string;
  welcome_video_url: string;
  primary_color: string;
  secondary_color: string;
  custom_logo_url: string;
  show_progress_tracking: boolean;
  show_other_products: boolean;
  is_active: boolean;
}

interface ExclusiveContent {
  id?: string;
  title: string;
  content_type: 'text' | 'video' | 'download' | 'link';
  content: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const MemberAreaConfig = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [config, setConfig] = useState<MemberAreaConfig>({
    store_id: '',
    welcome_message: 'Bem-vindo à sua área exclusiva de membros!',
    welcome_video_url: '',
    primary_color: '#dc2626',
    secondary_color: '#1f2937',
    custom_logo_url: '',
    show_progress_tracking: true,
    show_other_products: true,
    is_active: true,
  });
  
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      loadStoreAndConfig();
    }
  }, [slug]);

  const loadStoreAndConfig = async () => {
    try {
      setLoading(true);
      
      // Carregar loja e verificar se o usuário é o dono
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', user?.id)
        .single();

      if (storeError || !storeData) {
        toast({
          title: "Erro",
          description: "Loja não encontrada ou você não tem permissão.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setStore(storeData);

      // Carregar configuração existente
      const { data: configData } = await supabase
        .from('member_area_configs')
        .select('*')
        .eq('store_id', storeData.id)
        .single();

      if (configData) {
        setConfig({
          id: configData.id,
          store_id: configData.store_id,
          welcome_message: configData.welcome_message || '',
          welcome_video_url: configData.welcome_video_url || '',
          primary_color: configData.primary_color || '#dc2626',
          secondary_color: configData.secondary_color || '#1f2937',
          custom_logo_url: configData.custom_logo_url || '',
          show_progress_tracking: configData.show_progress_tracking ?? true,
          show_other_products: configData.show_other_products ?? true,
          is_active: configData.is_active ?? true,
        });
      } else {
        setConfig(prev => ({ ...prev, store_id: storeData.id }));
      }

      // Carregar conteúdo exclusivo
      const { data: contentData } = await supabase
        .from('member_exclusive_content')
        .select('*')
        .eq('store_id', storeData.id)
        .order('sort_order');

      setExclusiveContent(contentData?.map(item => ({
        ...item,
        content_type: item.content_type as 'text' | 'video' | 'download' | 'link'
      })) || []);

      // Carregar produtos da loja
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    
    try {
      // Salvar configuração principal usando Supabase diretamente
      if (config.id) {
        const { error } = await supabase
          .from('member_area_configs')
          .update({
            welcome_message: config.welcome_message,
            welcome_video_url: config.welcome_video_url,
            primary_color: config.primary_color,
            secondary_color: config.secondary_color,
            custom_logo_url: config.custom_logo_url,
            show_progress_tracking: config.show_progress_tracking,
            show_other_products: config.show_other_products,
            is_active: config.is_active,
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('member_area_configs')
          .insert({
            ...config,
            store_id: store?.id
          })
          .select()
          .single();

        if (error) throw error;
        setConfig(prev => ({ ...prev, id: data.id }));
      }

      // Salvar conteúdo exclusivo
      for (const content of exclusiveContent) {
        if (content.id) {
          await supabase
            .from('member_exclusive_content')
            .update({
              title: content.title,
              content_type: content.content_type,
              content: content.content,
              description: content.description,
              is_active: content.is_active,
            })
            .eq('id', content.id);
        } else {
          await supabase
            .from('member_exclusive_content')
            .insert({
              store_id: store?.id,
              title: content.title,
              content_type: content.content_type,
              content: content.content,
              description: content.description,
              sort_order: content.sort_order,
              is_active: content.is_active,
            });
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addExclusiveContent = () => {
    setExclusiveContent(prev => [
      ...prev,
      {
        title: 'Novo Conteúdo',
        content_type: 'text',
        content: '',
        description: '',
        sort_order: prev.length,
        is_active: true,
      }
    ]);
  };

  const removeExclusiveContent = async (index: number) => {
    const content = exclusiveContent[index];
    
    if (content.id) {
      await supabase
        .from('member_exclusive_content')
        .delete()
        .eq('id', content.id);
    }
    
    setExclusiveContent(prev => prev.filter((_, i) => i !== index));
  };

  const updateExclusiveContent = (index: number, field: string, value: any) => {
    setExclusiveContent(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Configurar Área de Membros - ${store?.name}`}
        description={`Configure a área de membros da sua loja ${store?.name}`}
      />

      <div className="container mx-auto px-4 py-8">
        <BackNavigation />
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Área de Membros</h1>
              <p className="text-muted-foreground">
                Configure a experiência dos seus membros na loja {store?.name}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/loja/${slug}/membros`)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </Button>
              
              <Button 
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Conteúdo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                    <Textarea
                      id="welcome-message"
                      value={config.welcome_message}
                      onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                      rows={3}
                      placeholder="Digite uma mensagem acolhedora para seus membros..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcome-video">URL do Vídeo de Boas-vindas</Label>
                    <Input
                      id="welcome-video"
                      value={config.welcome_video_url}
                      onChange={(e) => setConfig(prev => ({ ...prev, welcome_video_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rastreamento de Progresso</Label>
                        <p className="text-sm text-muted-foreground">
                          Mostra o progresso dos cursos e lições
                        </p>
                      </div>
                      <Switch
                        checked={config.show_progress_tracking}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, show_progress_tracking: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mostrar Outros Produtos</Label>
                        <p className="text-sm text-muted-foreground">
                          Exibe outros produtos da loja na área de membros
                        </p>
                      </div>
                      <Switch
                        checked={config.show_other_products}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, show_other_products: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Área de Membros Ativa</Label>
                        <p className="text-sm text-muted-foreground">
                          Ativa ou desativa a área de membros
                        </p>
                      </div>
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(checked) => 
                          setConfig(prev => ({ ...prev, is_active: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalização Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={config.primary_color}
                          onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={config.primary_color}
                          onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="#dc2626"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={config.secondary_color}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          value={config.secondary_color}
                          onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                          placeholder="#1f2937"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">URL do Logo Personalizado</Label>
                    <Input
                      id="logo-url"
                      value={config.custom_logo_url}
                      onChange={(e) => setConfig(prev => ({ ...prev, custom_logo_url: e.target.value }))}
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conteúdo Exclusivo</CardTitle>
                    <Button onClick={addExclusiveContent} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exclusiveContent.map((content, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExclusiveContent(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <Input
                            placeholder="Título do conteúdo"
                            value={content.title}
                            onChange={(e) => updateExclusiveContent(index, 'title', e.target.value)}
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={content.content_type}
                              onChange={(e) => updateExclusiveContent(index, 'content_type', e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="text">Texto</option>
                              <option value="video">Vídeo</option>
                              <option value="download">Download</option>
                              <option value="link">Link</option>
                            </select>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={content.is_active}
                                onCheckedChange={(checked) => 
                                  updateExclusiveContent(index, 'is_active', checked)
                                }
                              />
                              <Label className="text-sm">Ativo</Label>
                            </div>
                          </div>
                          
                          <Textarea
                            placeholder="Descrição"
                            value={content.description}
                            onChange={(e) => updateExclusiveContent(index, 'description', e.target.value)}
                            rows={2}
                          />
                          
                          <Textarea
                            placeholder={
                              content.content_type === 'text' ? 'Conteúdo do texto...' :
                              content.content_type === 'video' ? 'URL do vídeo...' :
                              content.content_type === 'download' ? 'URL para download...' :
                              'URL do link...'
                            }
                            value={content.content}
                            onChange={(e) => updateExclusiveContent(index, 'content', e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {exclusiveContent.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum conteúdo exclusivo adicionado ainda</p>
                        <p className="text-sm">Clique em "Adicionar" para criar seu primeiro conteúdo</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MemberAreaConfig;