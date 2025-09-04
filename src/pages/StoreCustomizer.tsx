import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Code, 
  Eye, 
  Save,
  Plus,
  Trash2,
  Upload,
  Settings
} from "lucide-react";
import BackNavigation from "@/components/layout/back-navigation";

interface Store {
  id: string;
  name: string;
  slug: string;
  theme: any;
  owner_id: string;
}

interface ThemeConfig {
  [key: string]: any;
  // Cores
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  
  // Tipografia
  fontFamily: string;
  headingFont: string;
  fontSize: {
    [key: string]: string;
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  
  // Layout
  containerWidth: string;
  borderRadius: string;
  spacing: {
    [key: string]: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Componentes
  header: {
    [key: string]: any;
    height: string;
    background: string;
    logoSize: string;
    menuStyle: string;
  };
  
  hero: {
    [key: string]: any;
    height: string;
    background: string;
    overlay: string;
    textAlign: string;
  };
  
  products: {
    [key: string]: any;
    gridCols: number;
    cardStyle: string;
    imageAspect: string;
  };
  
  footer: {
    [key: string]: any;
    background: string;
    textColor: string;
  };
  
  // CSS personalizado
  customCSS: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: "#3b82f6",
  secondaryColor: "#6366f1", 
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  mutedColor: "#6b7280",
  borderColor: "#e5e7eb",
  successColor: "#10b981",
  warningColor: "#f59e0b",
  errorColor: "#ef4444",
  
  fontFamily: "Inter",
  headingFont: "Inter",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem", 
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    '2xl': "1.5rem",
    '3xl': "1.875rem",
    '4xl': "2.25rem"
  },
  
  containerWidth: "1200px",
  borderRadius: "0.5rem",
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem", 
    lg: "2rem",
    xl: "3rem"
  },
  
  header: {
    height: "4rem",
    background: "transparent",
    logoSize: "2.5rem",
    menuStyle: "horizontal"
  },
  
  hero: {
    height: "500px",
    background: "gradient",
    overlay: "0.2",
    textAlign: "center"
  },
  
  products: {
    gridCols: 4,
    cardStyle: "modern",
    imageAspect: "square"
  },
  
  footer: {
    background: "#1f2937",
    textColor: "#ffffff"
  },
  
  customCSS: ""
};

const googleFonts = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat",
  "Playfair Display", "Merriweather", "Oswald", "Raleway", "Nunito",
  "Ubuntu", "Source Sans Pro", "PT Sans", "Fira Sans"
];

const StoreCustomizer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");

  useEffect(() => {
    if (slug) {
      fetchStore();
    }
  }, [slug]);

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching store:', error);
        toast({
          title: "Erro",
          description: "Loja não encontrada ou você não tem permissão.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setStore(data);
      
      // Mesclar tema existente com padrão
      const existingTheme = data.theme || {};
      setTheme({ ...defaultTheme, ...(existingTheme as Partial<ThemeConfig>) });
      
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async () => {
    if (!store) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ theme })
        .eq('id', store.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Personalização salva com sucesso.",
      });
      
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateTheme = (path: string, value: any) => {
    const keys = path.split('.');
    setTheme(prev => {
      const newTheme = { ...prev };
      let current: any = newTheme;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newTheme;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Carregando..." />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <BackNavigation title="Loja não encontrada" />
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-xl font-semibold">Loja não encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackNavigation title={`Personalizar ${store.name}`} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header com ações */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Personalizar Loja</h1>
            <p className="text-muted-foreground">
              Configure o visual da sua loja
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/loja/${store.slug}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button
              onClick={saveTheme}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de configuração */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="colors" className="text-xs">
                  <Palette className="w-4 h-4 mr-1" />
                  Cores
                </TabsTrigger>
                <TabsTrigger value="typography" className="text-xs">
                  <Type className="w-4 h-4 mr-1" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">
                  <Layout className="w-4 h-4 mr-1" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="components" className="text-xs">
                  <Settings className="w-4 h-4 mr-1" />
                  Seções
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs">
                  <Code className="w-4 h-4 mr-1" />
                  CSS
                </TabsTrigger>
              </TabsList>

              {/* Cores */}
              <TabsContent value="colors">
                <Card>
                  <CardHeader>
                    <CardTitle>Paleta de Cores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme('primaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme('primaryColor', e.target.value)}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor Secundária</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.secondaryColor}
                            onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.secondaryColor}
                            onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cor de Destaque</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.accentColor}
                            onChange={(e) => updateTheme('accentColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.accentColor}
                            onChange={(e) => updateTheme('accentColor', e.target.value)}
                            placeholder="#f59e0b"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Fundo</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.backgroundColor}
                            onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.backgroundColor}
                            onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Texto</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.textColor}
                            onChange={(e) => updateTheme('textColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.textColor}
                            onChange={(e) => updateTheme('textColor', e.target.value)}
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Bordas</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.borderColor}
                            onChange={(e) => updateTheme('borderColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={theme.borderColor}
                            onChange={(e) => updateTheme('borderColor', e.target.value)}
                            placeholder="#e5e7eb"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tipografia */}
              <TabsContent value="typography">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipografia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fonte Principal</Label>
                        <Select
                          value={theme.fontFamily}
                          onValueChange={(value) => updateTheme('fontFamily', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {googleFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Fonte dos Títulos</Label>
                        <Select
                          value={theme.headingFont}
                          onValueChange={(value) => updateTheme('headingFont', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {googleFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Tamanhos de Fonte</Label>
                      {Object.entries(theme.fontSize).map(([size, value]) => (
                        <div key={size} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-mono">{size}:</div>
                          <Input
                            value={value}
                            onChange={(e) => updateTheme(`fontSize.${size}`, e.target.value)}
                            className="flex-1"
                            placeholder="1rem"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout */}
              <TabsContent value="layout">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout e Espaçamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Largura Máxima</Label>
                        <Input
                          value={theme.containerWidth}
                          onChange={(e) => updateTheme('containerWidth', e.target.value)}
                          placeholder="1200px"
                        />
                      </div>
                      
                      <div>
                        <Label>Raio das Bordas</Label>
                        <Input
                          value={theme.borderRadius}
                          onChange={(e) => updateTheme('borderRadius', e.target.value)}
                          placeholder="0.5rem"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Espaçamentos</Label>
                      {Object.entries(theme.spacing).map(([size, value]) => (
                        <div key={size} className="flex items-center gap-4">
                          <div className="w-16 text-sm font-mono">{size}:</div>
                          <Input
                            value={value}
                            onChange={(e) => updateTheme(`spacing.${size}`, e.target.value)}
                            className="flex-1"
                            placeholder="1rem"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Componentes */}
              <TabsContent value="components">
                <div className="space-y-4">
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cabeçalho</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Altura</Label>
                          <Input
                            value={theme.header.height}
                            onChange={(e) => updateTheme('header.height', e.target.value)}
                            placeholder="4rem"
                          />
                        </div>
                        
                        <div>
                          <Label>Tamanho do Logo</Label>
                          <Input
                            value={theme.header.logoSize}
                            onChange={(e) => updateTheme('header.logoSize', e.target.value)}
                            placeholder="2.5rem"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hero */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Seção Hero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Altura</Label>
                          <Input
                            value={theme.hero.height}
                            onChange={(e) => updateTheme('hero.height', e.target.value)}
                            placeholder="500px"
                          />
                        </div>
                        
                        <div>
                          <Label>Alinhamento</Label>
                          <Select
                            value={theme.hero.textAlign}
                            onValueChange={(value) => updateTheme('hero.textAlign', value)}
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* Produtos */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Grade de Produtos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Colunas na Grade</Label>
                          <Select
                            value={theme.products.gridCols.toString()}
                            onValueChange={(value) => updateTheme('products.gridCols', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Colunas</SelectItem>
                              <SelectItem value="3">3 Colunas</SelectItem>
                              <SelectItem value="4">4 Colunas</SelectItem>
                              <SelectItem value="5">5 Colunas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Estilo do Card</Label>
                          <Select
                            value={theme.products.cardStyle}
                            onValueChange={(value) => updateTheme('products.cardStyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">Moderno</SelectItem>
                              <SelectItem value="classic">Clássico</SelectItem>
                              <SelectItem value="minimal">Minimalista</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* CSS Avançado */}
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>CSS Personalizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>CSS Customizado</Label>
                      <Textarea
                        value={theme.customCSS}
                        onChange={(e) => updateTheme('customCSS', e.target.value)}
                        placeholder="/* Seu CSS personalizado aqui */&#10;.minha-classe {&#10;  color: #000;&#10;}"
                        rows={10}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use CSS personalizado para ajustes avançados. As classes serão aplicadas apenas na sua loja.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pré-visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[9/16] bg-muted rounded border overflow-hidden">
                  <iframe
                    src={`/loja/${store.slug}?preview=1`}
                    className="w-full h-full"
                    title="Preview da loja"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Visualização em tempo real da sua loja
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCustomizer;