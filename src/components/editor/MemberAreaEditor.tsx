import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Palette, Layout, Settings, Eye, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MemberAreaEditorProps {
  storeId: string;
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
  member_resources: any[];
  exclusive_content: any[];
  is_active: boolean;
}

export default function MemberAreaEditor({ storeId }: MemberAreaEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<MemberAreaConfig>({
    store_id: storeId,
    welcome_message: 'Bem-vindo à sua área exclusiva de membros!',
    welcome_video_url: '',
    primary_color: '#dc2626',
    secondary_color: '#1f2937',
    custom_logo_url: '',
    show_progress_tracking: true,
    show_other_products: true,
    member_resources: [],
    exclusive_content: [],
    is_active: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [storeId]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('member_area_configs')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          store_id: data.store_id,
          welcome_message: data.welcome_message || '',
          welcome_video_url: data.welcome_video_url || '',
          primary_color: data.primary_color || '#dc2626',
          secondary_color: data.secondary_color || '#1f2937',
          custom_logo_url: data.custom_logo_url || '',
          show_progress_tracking: data.show_progress_tracking ?? true,
          show_other_products: data.show_other_products ?? true,
          member_resources: Array.isArray(data.member_resources) ? data.member_resources : [],
          exclusive_content: Array.isArray(data.exclusive_content) ? data.exclusive_content : [],
          is_active: data.is_active ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    
    try {
      if (config.id) {
        // Update existing config
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
            member_resources: config.member_resources,
            exclusive_content: config.exclusive_content,
            is_active: config.is_active,
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('member_area_configs')
          .insert([config])
          .select()
          .single();

        if (error) throw error;
        setConfig({
          ...config,
          id: data.id,
        });
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações da área de membros foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addExclusiveContent = () => {
    setConfig(prev => ({
      ...prev,
      exclusive_content: [
        ...prev.exclusive_content,
        {
          title: 'Novo Conteúdo',
          description: 'Descrição do conteúdo',
          content_type: 'text',
          content: '',
          sort_order: prev.exclusive_content.length,
        }
      ]
    }));
  };

  const updateExclusiveContent = (index: number, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      exclusive_content: prev.exclusive_content.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeExclusiveContent = (index: number) => {
    setConfig(prev => ({
      ...prev,
      exclusive_content: prev.exclusive_content.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Editor da Área de Membros</h2>
          <p className="text-muted-foreground">
            Personalize a experiência dos seus membros
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Sair da Visualização' : 'Visualizar'}
          </Button>
          
          <Button 
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Funcionalidades
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cores e Branding</CardTitle>
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
              <CardTitle>Mensagem de Boas-vindas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Mensagem</Label>
                <Textarea
                  id="welcome-message"
                  value={config.welcome_message}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcome-video">URL do Vídeo de Boas-vindas</Label>
                <Input
                  id="welcome-video"
                  value={config.welcome_video_url}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcome_video_url: e.target.value }))}
                  placeholder="https://exemplo.com/video.mp4"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Conteúdo Exclusivo
                <Button onClick={addExclusiveContent} size="sm">
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.exclusive_content.map((content, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeExclusiveContent(index)}
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Título do conteúdo"
                        value={content.title}
                        onChange={(e) => updateExclusiveContent(index, 'title', e.target.value)}
                      />
                      
                      <Textarea
                        placeholder="Descrição"
                        value={content.description}
                        onChange={(e) => updateExclusiveContent(index, 'description', e.target.value)}
                        rows={2}
                      />
                      
                      <Textarea
                        placeholder="Conteúdo (texto, HTML, etc.)"
                        value={content.content}
                        onChange={(e) => updateExclusiveContent(index, 'content', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
                
                {config.exclusive_content.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum conteúdo exclusivo adicionado ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Funcionalidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="progress-tracking">Rastreamento de Progresso</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostra o progresso dos cursos e lições
                  </p>
                </div>
                <Switch
                  id="progress-tracking"
                  checked={config.show_progress_tracking}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, show_progress_tracking: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="other-products">Mostrar Outros Produtos</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibe outros produtos da loja na área de membros
                  </p>
                </div>
                <Switch
                  id="other-products"
                  checked={config.show_other_products}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, show_other_products: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is-active">Área de Membros Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa ou desativa a área de membros
                  </p>
                </div>
                <Switch
                  id="is-active"
                  checked={config.is_active}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Área de Membros</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-6 space-y-4"
                style={{
                  borderColor: config.primary_color,
                  '--primary-color': config.primary_color,
                  '--secondary-color': config.secondary_color,
                } as React.CSSProperties}
              >
                {/* Header Preview */}
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold" style={{ color: config.primary_color }}>
                    Área de Membros
                  </h1>
                  <p className="text-muted-foreground">{config.welcome_message}</p>
                </div>
                
                {/* Video Preview */}
                {config.welcome_video_url && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Vídeo de Boas-vindas</h3>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Vídeo: {config.welcome_video_url}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Content Preview */}
                {config.exclusive_content.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Conteúdo Exclusivo</h3>
                    <div className="space-y-2">
                      {config.exclusive_content.map((content, index) => (
                        <div key={index} className="border rounded p-3">
                          <h4 className="font-medium">{content.title}</h4>
                          <p className="text-sm text-muted-foreground">{content.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}