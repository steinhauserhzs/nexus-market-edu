import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberArea } from '@/hooks/use-member-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const MemberAreaConfig = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    store,
    config,
    exclusiveContent,
    products,
    loading,
    isOwner,
    saveMemberAreaConfig,
    addExclusiveContent,
    updateExclusiveContent,
    removeExclusiveContent,
    setConfig
  } = useMemberArea(slug);
  
  const [saving, setSaving] = useState(false);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentType, setNewContentType] = useState('text');
  const [newContentContent, setNewContentContent] = useState('');
  const [newContentDescription, setNewContentDescription] = useState('');
  
  const handleSaveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    const success = await saveMemberAreaConfig(config);
    setSaving(false);
    
    if (!success) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    }
  };
  
  const addNewContent = async () => {
    if (!newContentTitle.trim() || !newContentContent.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await addExclusiveContent({
      title: newContentTitle,
      content_type: newContentType as 'text' | 'video' | 'download' | 'link',
      content: newContentContent,
      description: newContentDescription,
      sort_order: exclusiveContent.length,
      is_active: true,
    });
    
    if (success) {
      // Reset form
      setNewContentTitle('');
      setNewContentContent('');
      setNewContentDescription('');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is the store owner
  if (!loading && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para configurar esta área de membros.
            </p>
            <Button onClick={() => navigate('/inicio')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!store || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Loja não encontrada</h2>
            <p className="text-muted-foreground mb-4">
              A loja que você está tentando configurar não foi encontrada.
            </p>
            <Button onClick={() => navigate('/inicio')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Configurar Área de Membros - ${store.name}`}
        description="Configure a área de membros da sua loja para oferecer conteúdo exclusivo aos seus clientes."
      />
      
      <BackNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Área de Membros</h1>
              <p className="text-muted-foreground">
                Configure a área exclusiva para membros de <strong>{store.name}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/loja/${slug}/area-membros`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Netflix-Style
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Membros Ativos</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Layout className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conteúdos</p>
                    <p className="text-2xl font-bold">{exclusiveContent.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className={`h-8 w-8 mr-3 ${config.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold">
                      {config.is_active ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Tabs */}
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="config">
                <Settings className="h-4 w-4 mr-2" />
                Configuração
              </TabsTrigger>
              <TabsTrigger value="design">
                <Palette className="h-4 w-4 mr-2" />
                Design
              </TabsTrigger>
              <TabsTrigger value="content">
                <Layout className="h-4 w-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Prévia
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                    <Textarea
                      id="welcome-message"
                      placeholder="Digite uma mensagem de boas-vindas para seus membros..."
                      value={config.welcome_message || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="welcome-video">URL do Vídeo de Boas-vindas</Label>
                    <Input
                      id="welcome-video"
                      placeholder="https://..."
                      value={config.welcome_video_url || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, welcome_video_url: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-logo">URL do Logo Personalizado</Label>
                    <Input
                      id="custom-logo"
                      placeholder="https://..."
                      value={config.custom_logo_url || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, custom_logo_url: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-progress"
                      checked={config.show_progress_tracking}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, show_progress_tracking: checked }))}
                    />
                    <Label htmlFor="show-progress">Mostrar progresso dos cursos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-products"
                      checked={config.show_other_products}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, show_other_products: checked }))}
                    />
                    <Label htmlFor="show-products">Mostrar outros produtos da loja</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is-active"
                      checked={config.is_active}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is-active">Área de membros ativa</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design">
              <Card>
                <CardHeader>
                  <CardTitle>Personalização Visual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Cor Primária</Label>
                      <Input
                        id="primary-color"
                        type="color"
                        value={config.primary_color}
                        onChange={(e) => setConfig(prev => ({ ...prev, primary_color: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <Input
                        id="secondary-color"
                        type="color"
                        value={config.secondary_color}
                        onChange={(e) => setConfig(prev => ({ ...prev, secondary_color: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content">
              <div className="space-y-6">
                {/* Add New Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Conteúdo Exclusivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          placeholder="Título do conteúdo"
                          value={newContentTitle}
                          onChange={(e) => setNewContentTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={newContentType} onValueChange={setNewContentType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="video">Vídeo</SelectItem>
                            <SelectItem value="download">Download</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Descrição opcional"
                        value={newContentDescription}
                        onChange={(e) => setNewContentDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Conteúdo</Label>
                      <Textarea
                        placeholder="Conteúdo, URL ou texto..."
                        value={newContentContent}
                        onChange={(e) => setNewContentContent(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={addNewContent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Conteúdo
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdos Exclusivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {exclusiveContent.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum conteúdo exclusivo adicionado ainda.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {exclusiveContent.map((content) => (
                          <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{content.title}</h4>
                                <Badge variant="secondary">{content.content_type}</Badge>
                              </div>
                              {content.description && (
                                <p className="text-sm text-muted-foreground mb-2">{content.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground truncate">
                                {content.content}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeExclusiveContent(content.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Prévia da Área de Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Visualize como sua área de membros aparecerá para os clientes.
                    </p>
                    <Button onClick={() => navigate(`/loja/${slug}/membros`)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Área de Membros
                    </Button>
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
