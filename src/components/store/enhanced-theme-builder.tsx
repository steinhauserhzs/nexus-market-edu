import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, 
  Type, 
  Layout, 
  Save,
  Eye,
  Undo,
  Redo,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Zap,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ThemeConfig {
  // Base Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    headingFont: string;
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  // Layout
  layout: {
    containerWidth: string;
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  
  // Components
  components: {
    header: {
      height: string;
      background: string;
      logoSize: string;
      sticky: boolean;
      transparent: boolean;
    };
    hero: {
      height: string;
      background: string;
      overlay: number;
      textAlign: 'left' | 'center' | 'right';
      parallax: boolean;
    };
    products: {
      gridCols: number;
      cardStyle: 'modern' | 'classic' | 'minimal' | 'glass';
      imageAspect: 'square' | 'portrait' | 'landscape';
      hoverEffect: 'lift' | 'scale' | 'glow' | 'none';
    };
    buttons: {
      borderRadius: string;
      fontSize: string;
      padding: string;
      animationDuration: string;
    };
    footer: {
      background: string;
      textColor: string;
      columns: number;
    };
  };
  
  // Advanced
  advanced: {
    customCSS: string;
    animations: {
      enabled: boolean;
      duration: string;
      easing: string;
    };
    performance: {
      lazyLoading: boolean;
      optimizeImages: boolean;
      minifyCSS: boolean;
    };
  };
}

const defaultTheme: ThemeConfig = {
  colors: {
    primary: "#3b82f6",
    secondary: "#6366f1", 
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1f2937",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#0ea5e9"
  },
  
  typography: {
    fontFamily: "Inter",
    headingFont: "Inter",
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem", 
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      '2xl': "1.5rem",
      '3xl': "1.875rem",
      '4xl': "2.25rem"
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  layout: {
    containerWidth: "1200px",
    borderRadius: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem"
    },
    spacing: {
      xs: "0.5rem",
      sm: "1rem",
      md: "1.5rem", 
      lg: "2rem",
      xl: "3rem"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
    }
  },
  
  components: {
    header: {
      height: "4rem",
      background: "transparent",
      logoSize: "2.5rem",
      sticky: true,
      transparent: false
    },
    hero: {
      height: "500px",
      background: "gradient",
      overlay: 0.2,
      textAlign: "center",
      parallax: false
    },
    products: {
      gridCols: 4,
      cardStyle: "modern",
      imageAspect: "square",
      hoverEffect: "lift"
    },
    buttons: {
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      padding: "0.75rem 1.5rem",
      animationDuration: "200ms"
    },
    footer: {
      background: "#1f2937",
      textColor: "#ffffff",
      columns: 4
    }
  },
  
  advanced: {
    customCSS: "",
    animations: {
      enabled: true,
      duration: "300ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    performance: {
      lazyLoading: true,
      optimizeImages: true,
      minifyCSS: true
    }
  }
};

const googleFonts = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat",
  "Playfair Display", "Merriweather", "Oswald", "Raleway", "Nunito",
  "Ubuntu", "Source Sans Pro", "PT Sans", "Fira Sans", "DM Sans",
  "Work Sans", "Space Grotesk", "Manrope", "Lexend"
];

const presetThemes = [
  {
    name: "Moderno Azul",
    colors: { primary: "#3b82f6", secondary: "#1e40af", accent: "#f59e0b" }
  },
  {
    name: "Elegante Roxo", 
    colors: { primary: "#7c3aed", secondary: "#5b21b6", accent: "#f97316" }
  },
  {
    name: "Natureza Verde",
    colors: { primary: "#059669", secondary: "#047857", accent: "#eab308" }
  },
  {
    name: "Energia Rosa",
    colors: { primary: "#e11d48", secondary: "#be185d", accent: "#06b6d4" }
  }
];

interface EnhancedThemeBuilderProps {
  theme: ThemeConfig;
  onChange: (theme: ThemeConfig) => void;
  onSave: () => void;
  onPreview: () => void;
  saving?: boolean;
}

const EnhancedThemeBuilder = ({ 
  theme, 
  onChange, 
  onSave, 
  onPreview, 
  saving = false 
}: EnhancedThemeBuilderProps) => {
  const [activeTab, setActiveTab] = useState("colors");
  const [history, setHistory] = useState<ThemeConfig[]>([theme]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const { toast } = useToast();

  // History management
  const saveToHistory = useCallback((newTheme: ThemeConfig) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTheme);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const updateTheme = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    const newTheme = { ...theme };
    let current: any = newTheme;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newTheme);
    saveToHistory(newTheme);
  }, [theme, onChange, saveToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);

  const applyPreset = useCallback((preset: typeof presetThemes[0]) => {
    updateTheme('colors.primary', preset.colors.primary);
    updateTheme('colors.secondary', preset.colors.secondary);
    updateTheme('colors.accent', preset.colors.accent);
    toast({
      title: "Tema Aplicado!",
      description: `Preset "${preset.name}" foi aplicado com sucesso.`,
    });
  }, [updateTheme, toast]);

  const exportTheme = useCallback(() => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'theme-config.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [theme]);

  const importTheme = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        onChange({ ...defaultTheme, ...importedTheme });
        toast({
          title: "Tema Importado!",
          description: "Configuração de tema carregada com sucesso.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo de tema inválido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [onChange, toast]);

  const resetTheme = useCallback(() => {
    onChange(defaultTheme);
    toast({
      title: "Tema Resetado",
      description: "Todas as configurações foram restauradas aos padrões.",
    });
  }, [onChange, toast]);

  // Generate preview styles
  const previewStyles = useMemo(() => ({
    '--preview-primary': theme.colors.primary,
    '--preview-secondary': theme.colors.secondary,
    '--preview-accent': theme.colors.accent,
    '--preview-bg': theme.colors.background,
    '--preview-text': theme.colors.text,
    '--preview-border': theme.colors.border,
  }), [theme]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Editor de Tema Avançado</CardTitle>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex === 0}
                  title="Desfazer"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  title="Refazer"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetTheme}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
              
              <Button variant="outline" size="sm" onClick={exportTheme}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
                id="import-theme"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('import-theme')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button onClick={onSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Theme Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuração do Tema</CardTitle>
                <Badge variant="secondary">{history.length} alterações</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="colors">
                    <Palette className="w-4 h-4 mr-1" />
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <Type className="w-4 h-4 mr-1" />
                    Tipografia
                  </TabsTrigger>
                  <TabsTrigger value="layout">
                    <Layout className="w-4 h-4 mr-1" />
                    Layout
                  </TabsTrigger>
                  <TabsTrigger value="components">
                    <Settings className="w-4 h-4 mr-1" />
                    Componentes
                  </TabsTrigger>
                  <TabsTrigger value="presets">
                    <Copy className="w-4 h-4 mr-1" />
                    Presets
                  </TabsTrigger>
                  <TabsTrigger value="advanced">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Colors Tab */}
                <TabsContent value="colors" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key}>
                        <Label className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) => updateTheme(`colors.${key}`, e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={value}
                            onChange={(e) => updateTheme(`colors.${key}`, e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Typography Tab */}
                <TabsContent value="typography" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fonte Principal</Label>
                      <Select
                        value={theme.typography.fontFamily}
                        onValueChange={(value) => updateTheme('typography.fontFamily', value)}
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
                        value={theme.typography.headingFont}
                        onValueChange={(value) => updateTheme('typography.headingFont', value)}
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
                </TabsContent>

                {/* Layout Tab */}
                <TabsContent value="layout" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Largura do Container</Label>
                      <Input
                        value={theme.layout.containerWidth}
                        onChange={(e) => updateTheme('layout.containerWidth', e.target.value)}
                        placeholder="1200px"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Components Tab */}
                <TabsContent value="components" className="space-y-6">
                  <div className="space-y-6">
                    {/* Header Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Cabeçalho</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Altura</Label>
                          <Input
                            value={theme.components.header.height}
                            onChange={(e) => updateTheme('components.header.height', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={theme.components.header.sticky}
                            onCheckedChange={(checked) => updateTheme('components.header.sticky', checked)}
                          />
                          <Label>Header Fixo</Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Products Settings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Produtos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Colunas do Grid</Label>
                          <Slider
                            value={[theme.components.products.gridCols]}
                            onValueChange={([value]) => updateTheme('components.products.gridCols', value)}
                            min={1}
                            max={6}
                            step={1}
                            className="mt-2"
                          />
                          <div className="text-sm text-muted-foreground mt-1">
                            {theme.components.products.gridCols} colunas
                          </div>
                        </div>
                        
                        <div>
                          <Label>Estilo do Card</Label>
                          <Select
                            value={theme.components.products.cardStyle}
                            onValueChange={(value) => updateTheme('components.products.cardStyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">Moderno</SelectItem>
                              <SelectItem value="classic">Clássico</SelectItem>
                              <SelectItem value="minimal">Minimalista</SelectItem>
                              <SelectItem value="glass">Glassmorphism</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Presets Tab */}
                <TabsContent value="presets" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {presetThemes.map((preset) => (
                      <Card 
                        key={preset.name}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => applyPreset(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: preset.colors.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: preset.colors.secondary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: preset.colors.accent }}
                              />
                            </div>
                            <span className="font-medium">{preset.name}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <Label>CSS Personalizado</Label>
                      <Textarea
                        value={theme.advanced.customCSS}
                        onChange={(e) => updateTheme('advanced.customCSS', e.target.value)}
                        placeholder="/* Seu CSS personalizado aqui */"
                        className="font-mono text-sm"
                        rows={10}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Performance</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={theme.advanced.performance.lazyLoading}
                            onCheckedChange={(checked) => updateTheme('advanced.performance.lazyLoading', checked)}
                          />
                          <Label>Lazy Loading de Imagens</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={theme.advanced.performance.optimizeImages}
                            onCheckedChange={(checked) => updateTheme('advanced.performance.optimizeImages', checked)}
                          />
                          <Label>Otimização de Imagens</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={theme.advanced.performance.minifyCSS}
                            onCheckedChange={(checked) => updateTheme('advanced.performance.minifyCSS', checked)}
                          />
                          <Label>Minificação CSS</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">Preview em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="space-y-4 p-4 border rounded-lg bg-background"
                style={previewStyles as React.CSSProperties}
              >
                {/* Header Preview */}
                <div 
                  className="p-3 rounded border flex items-center justify-between"
                  style={{ 
                    backgroundColor: 'var(--preview-primary)',
                    color: 'white',
                    height: '40px'
                  }}
                >
                  <div className="font-semibold text-sm">Logo</div>
                  <div className="text-xs">Menu</div>
                </div>
                
                {/* Hero Preview */}
                <div 
                  className="p-6 rounded border text-center"
                  style={{ 
                    background: `linear-gradient(135deg, var(--preview-primary), var(--preview-secondary))`,
                    color: 'white',
                    minHeight: '100px'
                  }}
                >
                  <div className="font-bold text-sm mb-2">Título Principal</div>
                  <div className="text-xs opacity-90">Subtítulo descritivo</div>
                  <button 
                    className="mt-3 px-4 py-2 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: 'var(--preview-accent)',
                      color: 'white'
                    }}
                  >
                    Call to Action
                  </button>
                </div>
                
                {/* Products Grid Preview */}
                <div className={cn("grid gap-2", {
                  'grid-cols-1': theme.components.products.gridCols <= 2,
                  'grid-cols-2': theme.components.products.gridCols > 2
                })}>
                  {[1, 2, 3, 4].slice(0, theme.components.products.gridCols).map((i) => (
                    <div 
                      key={i} 
                      className={cn("border rounded p-2", {
                        'shadow-sm': theme.components.products.cardStyle === 'modern',
                        'shadow-none border-0 bg-transparent': theme.components.products.cardStyle === 'minimal',
                        'backdrop-blur bg-white/10': theme.components.products.cardStyle === 'glass'
                      })}
                      style={{ borderColor: 'var(--preview-border)' }}
                    >
                      <div 
                        className="w-full h-12 rounded mb-2"
                        style={{ backgroundColor: 'var(--preview-bg)' }}
                      />
                      <div className="text-xs font-medium mb-1">Produto {i}</div>
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--preview-accent)' }}
                      >
                        R$ 99,00
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThemeBuilder;