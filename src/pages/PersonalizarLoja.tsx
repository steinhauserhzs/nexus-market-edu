import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackNavigation from "@/components/layout/back-navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Palette, Layout, Image, Settings, Upload, Eye, Save, RefreshCw } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type StoreRow = Database['public']['Tables']['stores']['Row'];

interface StoreTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

const PersonalizarLoja = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Theme states
  const [theme, setTheme] = useState<StoreTheme>({
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  });

  // Image states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStore && selectedStore.theme) {
      const storeTheme = selectedStore.theme as StoreTheme;
      setTheme({
        primaryColor: storeTheme.primaryColor || "#3b82f6",
        secondaryColor: storeTheme.secondaryColor || "#6366f1",
        accentColor: storeTheme.accentColor || "#f59e0b",
        backgroundColor: storeTheme.backgroundColor || "#ffffff",
        textColor: storeTheme.textColor || "#1f2937",
      });
    }
    if (selectedStore?.logo_url) {
      setLogoPreview(selectedStore.logo_url);
    }
    if (selectedStore?.banner_url) {
      setBannerPreview(selectedStore.banner_url);
    }
  }, [selectedStore]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchStores = async () => {
    try {
      setStoreLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setStores(data || []);
      if (data && data.length > 0) {
        setSelectedStore(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Erro ao carregar lojas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setStoreLoading(false);
    }
  };

  const handleFileUpload = (file: File, type: 'logo' | 'banner') => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(result);
      } else {
        setBannerFile(file);
        setBannerPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const saveChanges = async () => {
    if (!selectedStore) {
      toast({
        title: "Erro",
        description: "Selecione uma loja para personalizar",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let logoUrl = selectedStore.logo_url;
      let bannerUrl = selectedStore.banner_url;

      // Upload new logo if provided
      if (logoFile) {
        const logoPath = `${user.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
        logoUrl = await uploadImage(logoFile, 'store-logos', logoPath);
      }

      // Upload new banner if provided
      if (bannerFile) {
        const bannerPath = `${user.id}/banner-${Date.now()}.${bannerFile.name.split('.').pop()}`;
        bannerUrl = await uploadImage(bannerFile, 'store-banners', bannerPath);
      }

      const { error } = await supabase
        .from('stores')
        .update({
          logo_url: logoUrl,
          banner_url: bannerUrl,
          theme: theme,
        })
        .eq('id', selectedStore.id);

      if (error) throw error;

      toast({
        title: "Loja personalizada!",
        description: "Suas alterações foram salvas com sucesso.",
      });

      // Refresh store data
      await fetchStores();
      
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Personalizar Loja" />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Personalizar Loja" />
        <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Nenhuma Loja Encontrada</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa criar uma loja antes de personalizá-la.
          </p>
          <Button onClick={() => navigate('/criar-loja')}>
            Criar Minha Primeira Loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Personalizar Loja - Nexus Market"
        description="Personalize o visual e comportamento da sua loja na Nexus Market."
      />
      
      <div className="min-h-screen bg-background">
        <BackNavigation title="Personalizar Loja" />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Personalizar Loja</h1>
            <p className="text-muted-foreground text-lg">
              Customize sua loja para refletir sua marca
            </p>
          </div>

          {/* Store Selection */}
          {stores.length > 1 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Selecionar Loja</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedStore?.id || ""} 
                  onValueChange={(value) => {
                    const store = stores.find(s => s.id === value);
                    setSelectedStore(store || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {selectedStore && (
            <Tabs defaultValue="theme" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="theme">
                  <Palette className="w-4 h-4 mr-2" />
                  Cores
                </TabsTrigger>
                <TabsTrigger value="images">
                  <Image className="w-4 h-4 mr-2" />
                  Imagens
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye className="w-4 h-4 mr-2" />
                  Prévia
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theme" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cores do Tema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Cor Primária</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={theme.primaryColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor Secundária</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.secondaryColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={theme.secondaryColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor de Destaque</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.accentColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={theme.accentColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor de Fundo</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={theme.backgroundColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-12 h-8 rounded border"
                          />
                          <Input
                            value={theme.backgroundColor}
                            onChange={(e) => setTheme(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Logo da Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {logoPreview ? (
                          <div className="space-y-4">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="mx-auto h-20 w-20 object-contain rounded-lg"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Escolher Logo
                            </Button>
                          </div>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'logo');
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Banner da Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {bannerPreview ? (
                          <div className="space-y-4">
                            <img
                              src={bannerPreview}
                              alt="Banner preview"
                              className="mx-auto h-24 w-full object-cover rounded-lg"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBannerFile(null);
                                setBannerPreview("");
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('banner-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Escolher Banner
                            </Button>
                          </div>
                        )}
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'banner');
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações da Loja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nome da Loja</Label>
                      <Input 
                        value={selectedStore.name}
                        onChange={(e) => setSelectedStore(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>
                    
                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        value={selectedStore.description || ""}
                        onChange={(e) => setSelectedStore(prev => prev ? { ...prev, description: e.target.value } : null)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>URL da Loja</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">nexus.app/loja/</span>
                        <Input 
                          value={selectedStore.slug}
                          onChange={(e) => setSelectedStore(prev => prev ? { ...prev, slug: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Loja Ativa</Label>
                        <p className="text-sm text-muted-foreground">
                          Controla se a loja está visível publicamente
                        </p>
                      </div>
                      <Switch
                        checked={selectedStore.is_active}
                        onCheckedChange={(checked) => setSelectedStore(prev => prev ? { ...prev, is_active: checked } : null)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prévia da Loja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="border rounded-lg p-6 min-h-96 bg-white"
                      style={{
                        backgroundColor: theme.backgroundColor,
                        color: theme.textColor,
                      }}
                    >
                      {/* Header Preview */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                          {logoPreview && (
                            <img 
                              src={logoPreview} 
                              alt="Logo" 
                              className="w-10 h-10 object-contain rounded"
                            />
                          )}
                          <h2 className="text-xl font-bold">{selectedStore.name}</h2>
                        </div>
                        <Badge style={{ backgroundColor: theme.primaryColor, color: 'white' }}>
                          Loja Online
                        </Badge>
                      </div>

                      {/* Banner Preview */}
                      {bannerPreview && (
                        <div className="mb-6">
                          <img 
                            src={bannerPreview} 
                            alt="Banner" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Content Preview */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Sobre a Loja</h3>
                        <p className="text-muted-foreground">
                          {selectedStore.description || "Descrição da loja aparecerá aqui..."}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div 
                            className="p-4 rounded-lg border"
                            style={{ borderColor: theme.primaryColor }}
                          >
                            <h4 className="font-medium mb-2">Produto Exemplo</h4>
                            <p className="text-sm text-muted-foreground">R$ 99,90</p>
                            <button 
                              className="mt-2 px-4 py-2 rounded text-white text-sm font-medium"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              Comprar
                            </button>
                          </div>
                          
                          <div 
                            className="p-4 rounded-lg border"
                            style={{ borderColor: theme.secondaryColor }}
                          >
                            <h4 className="font-medium mb-2">Curso Exemplo</h4>
                            <p className="text-sm text-muted-foreground">R$ 197,00</p>
                            <button 
                              className="mt-2 px-4 py-2 rounded text-white text-sm font-medium"
                              style={{ backgroundColor: theme.secondaryColor }}
                            >
                              Ver Mais
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`/loja/${selectedStore.slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Loja Completa
                      </Button>
                      <Button 
                        onClick={() => navigate(`/loja/${selectedStore.slug}`)}
                      >
                        Visitar Loja
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Save Button */}
          {selectedStore && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button 
                onClick={saveChanges}
                disabled={saving}
                size="lg"
                className="shadow-lg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PersonalizarLoja;