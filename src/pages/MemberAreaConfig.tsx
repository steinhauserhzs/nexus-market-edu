import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, Plus, Trash2, Settings, Palette, FileText } from "lucide-react";
import MainHeader from "@/components/layout/main-header";
import BackNavigation from "@/components/layout/back-navigation";

interface Store {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

interface MemberAreaConfig {
  id?: string;
  store_id: string;
  custom_logo_url: string;
  primary_color: string;
  secondary_color: string;
  welcome_message: string;
  welcome_video_url: string;
  is_active: boolean;
  show_other_products: boolean;
  show_progress_tracking: boolean;
}

interface ExclusiveContent {
  id?: string;
  title: string;
  content_type: 'text' | 'video' | 'download' | 'link';
  content: string;
  description: string;
  requires_product_ids: string[];
  is_active: boolean;
  sort_order: number;
}

const MemberAreaConfig = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [config, setConfig] = useState<MemberAreaConfig>({
    store_id: '',
    custom_logo_url: '',
    primary_color: '#dc2626',
    secondary_color: '#1f2937',
    welcome_message: '',
    welcome_video_url: '',
    is_active: true,
    show_other_products: true,
    show_progress_tracking: true,
  });
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug && user) {
      loadStoreAndConfig();
    }
  }, [slug, user]);

  const loadStoreAndConfig = async () => {
    try {
      // Verificar se o usuário é dono da loja
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', user?.id)
        .single();

      if (storeError || !store) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para configurar esta área de membros.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setStore(store);

      // Buscar configuração existente
      const { data: memberConfig } = await supabase
        .from('member_area_configs')
        .select('*')
        .eq('store_id', store.id)
        .single();

      if (memberConfig) {
        setConfig(memberConfig);
      } else {
        setConfig(prev => ({ ...prev, store_id: store.id }));
      }

      // Buscar conteúdo exclusivo
      const { data: content } = await supabase
        .from('member_exclusive_content')
        .select('*')
        .eq('store_id', store.id)
        .order('sort_order');

      const typedContent: ExclusiveContent[] = (content || []).map(item => ({
        ...item,
        content_type: item.content_type as 'text' | 'video' | 'download' | 'link'
      }));

      setExclusiveContent(typedContent);

      // Buscar produtos da loja
      const { data: storeProducts } = await supabase
        .from('products')
        .select('id, title, status')
        .eq('store_id', store.id)
        .eq('status', 'published');

      setProducts(storeProducts || []);

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      if (config.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('member_area_configs')
          .update(config)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('member_area_configs')
          .insert(config)
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      // Salvar conteúdo exclusivo
      for (const content of exclusiveContent) {
        if (content.id) {
          await supabase
            .from('member_exclusive_content')
            .update(content)
            .eq('id', content.id);
        } else {
          await supabase
            .from('member_exclusive_content')
            .insert({ ...content, store_id: store!.id });
        }
      }

      toast({
        title: "Salvo com sucesso",
        description: "As configurações da área de membros foram salvas.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
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
    setExclusiveContent(prev => [...prev, {
      title: '',
      content_type: 'text',
      content: '',
      description: '',
      requires_product_ids: [],
      is_active: true,
      sort_order: prev.length
    }]);
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
      <div className="min-h-screen bg-background">
        <MainHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MainHeader />
      
      <div className="container mx-auto px-4 py-8">
        <BackNavigation 
          title={`Configurar Área de Membros - ${store?.name}`}
        />

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Configurações da Área de Membros</h1>
            <Button onClick={saveConfig} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="w-4 h-4 mr-2" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="w-4 h-4 mr-2" />
                Conteúdo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Área de membros ativa</Label>
                    <Switch
                      id="is_active"
                      checked={config.is_active}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_other_products">Mostrar outros produtos da loja</Label>
                    <Switch
                      id="show_other_products"
                      checked={config.show_other_products}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, show_other_products: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_progress_tracking">Mostrar progresso dos cursos</Label>
                    <Switch
                      id="show_progress_tracking"
                      checked={config.show_progress_tracking}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, show_progress_tracking: checked }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome_message">Mensagem de boas-vindas</Label>
                    <Textarea
                      id="welcome_message"
                      placeholder="Digite uma mensagem personalizada para seus membros..."
                      value={config.welcome_message}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome_video_url">URL do vídeo de boas-vindas</Label>
                    <Input
                      id="welcome_video_url"
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      value={config.welcome_video_url}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, welcome_video_url: e.target.value }))}
                    />
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
                  <div>
                    <Label htmlFor="custom_logo_url">Logo personalizado (URL)</Label>
                    <Input
                      id="custom_logo_url"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={config.custom_logo_url}
                      onChange={(e) => 
                        setConfig(prev => ({ ...prev, custom_logo_url: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary_color">Cor primária</Label>
                      <Input
                        id="primary_color"
                        type="color"
                        value={config.primary_color}
                        onChange={(e) => 
                          setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondary_color">Cor secundária</Label>
                      <Input
                        id="secondary_color"
                        type="color"
                        value={config.secondary_color}
                        onChange={(e) => 
                          setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conteúdo Exclusivo</CardTitle>
                    <Button onClick={addExclusiveContent}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Conteúdo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {exclusiveContent.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum conteúdo exclusivo adicionado ainda.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {exclusiveContent.map((content, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant={content.is_active ? "default" : "secondary"}>
                                {content.is_active ? "Ativo" : "Inativo"}
                              </Badge>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeExclusiveContent(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Título</Label>
                                <Input
                                  value={content.title}
                                  onChange={(e) => 
                                    updateExclusiveContent(index, 'title', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Tipo</Label>
                                <select
                                  className="w-full p-2 border rounded-md"
                                  value={content.content_type}
                                  onChange={(e) => 
                                    updateExclusiveContent(index, 'content_type', e.target.value)}
                                >
                                  <option value="text">Texto</option>
                                  <option value="video">Vídeo</option>
                                  <option value="download">Download</option>
                                  <option value="link">Link Externo</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <Label>Descrição</Label>
                              <Input
                                value={content.description}
                                onChange={(e) => 
                                  updateExclusiveContent(index, 'description', e.target.value)}
                              />
                            </div>

                            <div>
                              <Label>Conteúdo</Label>
                              {content.content_type === 'text' ? (
                                <Textarea
                                  value={content.content}
                                  onChange={(e) => 
                                    updateExclusiveContent(index, 'content', e.target.value)}
                                />
                              ) : (
                                <Input
                                  type="url"
                                  placeholder="URL do conteúdo"
                                  value={content.content}
                                  onChange={(e) => 
                                    updateExclusiveContent(index, 'content', e.target.value)}
                                />
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <Label>Ativo</Label>
                              <Switch
                                checked={content.is_active}
                                onCheckedChange={(checked) => 
                                  updateExclusiveContent(index, 'is_active', checked)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
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