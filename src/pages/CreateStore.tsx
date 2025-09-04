import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import BackNavigation from "@/components/layout/back-navigation";
import { Upload, Palette, Eye, Store, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StoreTheme {
  [key: string]: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

const CreateStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  
  const [theme, setTheme] = useState<StoreTheme>({
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1", 
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const generateSlug = useCallback(async (name: string) => {
    if (!name.trim()) return "";
    
    try {
      const { data, error } = await supabase.rpc('generate_store_slug', {
        store_name: name
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating slug:', error);
      return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    }
  }, []);

  const handleNameChange = async (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    if (name.trim()) {
      const slug = await generateSlug(name);
      setFormData(prev => ({ ...prev, slug }));
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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
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

  const uploadFile = async (file: File, bucket: string, path: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando criação de loja', { user: user?.id, formData });
    
    if (!user) {
      console.error('❌ Usuário não autenticado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma loja",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      console.error('❌ Nome da loja vazio');
      toast({
        title: "Campo obrigatório",
        description: "O nome da loja é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('📁 Iniciando uploads de imagens...');
      
      let logoUrl = "";
      let bannerUrl = "";

      // Upload logo if provided
      if (logoFile) {
        console.log('📤 Fazendo upload do logo...');
        const logoPath = `${user.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
        logoUrl = await uploadFile(logoFile, 'store-logos', logoPath);
        console.log('✅ Logo uploadado:', logoUrl);
      }

      // Upload banner if provided
      if (bannerFile) {
        console.log('📤 Fazendo upload do banner...');
        const bannerPath = `${user.id}/banner-${Date.now()}.${bannerFile.name.split('.').pop()}`;
        bannerUrl = await uploadFile(bannerFile, 'store-banners', bannerPath);
        console.log('✅ Banner uploadado:', bannerUrl);
      }

      const storeData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        slug: formData.slug,
        owner_id: user.id,
        logo_url: logoUrl || null,
        banner_url: bannerUrl || null,
        theme: theme,
        is_active: true,
      };

      console.log('🏪 Criando loja no banco:', storeData);

      // Create store
      const { data: store, error } = await supabase
        .from('stores')
        .insert(storeData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro RLS/DB:', error);
        throw error;
      }

      console.log('✅ Loja criada com sucesso:', store);

      toast({
        title: "Loja criada com sucesso!",
        description: `Sua loja "${formData.name}" foi criada e está ativa`,
      });

      // Navigate to store management or dashboard
      navigate(`/dashboard`);
      
    } catch (error: any) {
      console.error('💥 Erro ao criar loja:', error);
      
      let errorMessage = "Erro ao criar loja. Tente novamente.";
      
      if (error.message?.includes('duplicate key')) {
        errorMessage = "Já existe uma loja com esse nome. Tente outro nome.";
      } else if (error.message?.includes('policy')) {
        errorMessage = "Erro de permissão. Verifique se você está logado corretamente.";
      } else if (error.message?.includes('RLS')) {
        errorMessage = "Erro de segurança. Contate o suporte.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao criar loja",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-bottom animate-fade-in">
      <BackNavigation title="Criar Loja" />
      
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-8 text-center animate-slide-up">
          <div className="mx-auto w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-bounce-in">
            <Store className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Crie sua Loja Personalizada</h1>
          <p className="text-muted-foreground text-lg">
            Configure sua loja com cores, logo e banner únicos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-2 rounded-2xl">
              <TabsTrigger value="basic" className="rounded-xl font-medium">Informações</TabsTrigger>
              <TabsTrigger value="design" className="rounded-xl font-medium">Design</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-xl font-medium">Visualizar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Informações da Loja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Loja *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Minha Loja Incrível"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL da Loja</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">nexus.app/loja/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="minha-loja"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      URL única para sua loja (gerada automaticamente)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Conte sobre sua loja, produtos e missão..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Imagens da Loja
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo da Loja</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {logoPreview ? (
                          <div className="space-y-2">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="mx-auto h-20 w-20 object-contain rounded-lg"
                            />
                            <Button
                              type="button"
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
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                              >
                                Escolher Logo
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG até 5MB
                              </p>
                            </div>
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
                    </div>

                    <div>
                      <Label>Banner da Loja</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        {bannerPreview ? (
                          <div className="space-y-2">
                            <img
                              src={bannerPreview}
                              alt="Banner preview"
                              className="mx-auto h-24 w-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
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
                          <div className="space-y-2">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('banner-upload')?.click()}
                              >
                                Escolher Banner
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG até 5MB (formato landscape)
                              </p>
                            </div>
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
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Cores do Tema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    <div>
                      <Label>Cor do Texto</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.textColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-12 h-8 rounded border"
                        />
                        <Input
                          value={theme.textColor}
                          onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                          placeholder="#1f2937"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Visualização da Loja
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border rounded-lg overflow-hidden"
                    style={{ backgroundColor: theme.backgroundColor }}
                  >
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 relative">
                      {bannerPreview && (
                        <img
                          src={bannerPreview}
                          alt="Banner"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.secondaryColor}40)`
                        }}
                      />
                    </div>

                    {/* Store Info */}
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg border-2 border-white shadow-lg flex items-center justify-center bg-white">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logo"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Store className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 
                            className="text-xl font-bold"
                            style={{ color: theme.textColor }}
                          >
                            {formData.name || "Nome da Loja"}
                          </h2>
                          <p 
                            className="text-sm opacity-75 mt-1"
                            style={{ color: theme.textColor }}
                          >
                            {formData.description || "Descrição da loja aparecerá aqui"}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              Seguir Loja
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg text-sm font-medium border"
                              style={{ 
                                color: theme.accentColor,
                                borderColor: theme.accentColor
                              }}
                            >
                              Ver Produtos
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Loja"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStore;