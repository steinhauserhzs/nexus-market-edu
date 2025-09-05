import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  FileCode, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb,
  Code,
  Play,
  RefreshCw
} from "lucide-react";
import { useAIStoreAnalyzer } from "@/hooks/use-ai-store-analyzer";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  fileName: string;
  analysis: string;
  issues: string[];
  improvements: string[];
  newFeatures: string[];
}

const AIStoreImprovementManager = ({ storeId }: { storeId: string }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { analyzeMultipleFiles, loading } = useAIStoreAnalyzer();
  const { toast } = useToast();

  const filesToAnalyze = [
    {
      name: 'StoreCustomizer.tsx',
      path: 'src/pages/StoreCustomizer.tsx',
      description: 'Página principal de personalização'
    },
    {
      name: 'store-page-builder.tsx', 
      path: 'src/components/store/store-page-builder.tsx',
      description: 'Construtor de páginas'
    },
    {
      name: 'enhanced-store-asset-manager.tsx',
      path: 'src/components/store/enhanced-store-asset-manager.tsx', 
      description: 'Gerenciador de assets'
    },
    {
      name: 'custom-store-renderer.tsx',
      path: 'src/components/store/custom-store-renderer.tsx',
      description: 'Renderizador de tema customizado'
    }
  ];

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulated file content - in a real implementation, you'd fetch these
      const files = [
        {
          code: `// StoreCustomizer.tsx - Simulated content for analysis
          // This is the main store customization page with theme configuration
          // Contains color picker, typography settings, layout options
          // Issues: Large file (756 lines), complex state management, poor error handling
          // Missing: Real-time preview, component isolation, validation`,
          fileName: 'StoreCustomizer.tsx',
          analysisType: 'store-customization'
        },
        {
          code: `// store-page-builder.tsx - Simulated content for analysis  
          // Page builder with drag-and-drop components
          // Issues: Limited component types, no validation, poor UX
          // Missing: Component library, templates, responsive preview`,
          fileName: 'store-page-builder.tsx',
          analysisType: 'page-builder'
        },
        {
          code: `// enhanced-store-asset-manager.tsx - Simulated content for analysis
          // Asset management with upload, organization, filtering
          // Issues: Performance with large files, limited file types, no optimization
          // Missing: Image editing, batch operations, CDN integration`,
          fileName: 'enhanced-store-asset-manager.tsx', 
          analysisType: 'asset-management'
        },
        {
          code: `// custom-store-renderer.tsx - Simulated content for analysis
          // CSS injection and theme rendering system
          // Issues: Performance issues, limited customization, no caching
          // Missing: CSS optimization, theme validation, performance monitoring`,
          fileName: 'custom-store-renderer.tsx',
          analysisType: 'theme-renderer'
        }
      ];

      const results = await analyzeMultipleFiles(files);
      
      // Process results into structured format
      const processedResults: AnalysisResult[] = results
        .filter(r => r.success)
        .map(result => ({
          fileName: result.fileName || 'Unknown',
          analysis: result.analysis || '',
          issues: extractIssues(result.analysis || ''),
          improvements: extractImprovements(result.analysis || ''),
          newFeatures: extractNewFeatures(result.analysis || '')
        }));

      setAnalysisResults(processedResults);
      
      toast({
        title: "Análise Completa!",
        description: `${processedResults.length} arquivos analisados com sucesso`,
      });

    } catch (error: any) {
      toast({
        title: "Erro na Análise",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractIssues = (analysis: string): string[] => {
    const issuesSection = analysis.match(/(?:PROBLEMAS IDENTIFICADOS|ISSUES FOUND)[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
    if (!issuesSection) return [];
    
    return issuesSection[1]
      .split(/\n[\-\*\d]+\.?\s*/)
      .filter(item => item.trim().length > 10)
      .map(item => item.trim())
      .slice(0, 5); // Limit to 5 items
  };

  const extractImprovements = (analysis: string): string[] => {
    const improvementsSection = analysis.match(/(?:MELHORIAS DE CÓDIGO|CODE IMPROVEMENTS)[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
    if (!improvementsSection) return [];
    
    return improvementsSection[1]
      .split(/\n[\-\*\d]+\.?\s*/)
      .filter(item => item.trim().length > 10)
      .map(item => item.trim())
      .slice(0, 5);
  };

  const extractNewFeatures = (analysis: string): string[] => {
    const featuresSection = analysis.match(/(?:FUNCIONALIDADES ADICIONAIS|NEW FEATURES)[:\s]*\n(.*?)(?=\n\d+\.|$)/s);
    if (!featuresSection) return [];
    
    return featuresSection[1]
      .split(/\n[\-\*\d]+\.?\s*/)
      .filter(item => item.trim().length > 10)
      .map(item => item.trim())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Análise IA - Sistema de Personalização</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Use IA para identificar problemas e sugerir melhorias no sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={runFullAnalysis} 
              disabled={isAnalyzing || loading}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Análise Completa
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {analysisResults.length > 0 && (
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Arquivos</p>
                      <p className="text-2xl font-bold">{analysisResults.length}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Problemas</p>
                      <p className="text-2xl font-bold">
                        {analysisResults.reduce((acc, r) => acc + r.issues.length, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Melhorias</p>
                      <p className="text-2xl font-bold">
                        {analysisResults.reduce((acc, r) => acc + r.improvements.length, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Recursos</p>
                      <p className="text-2xl font-bold">
                        {analysisResults.reduce((acc, r) => acc + r.newFeatures.length, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analysisResults.map((result, index) => (
            <Card key={index} className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{result.fileName}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="issues">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="issues" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Problemas ({result.issues.length})
                    </TabsTrigger>
                    <TabsTrigger value="improvements" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Melhorias ({result.improvements.length})
                    </TabsTrigger>
                    <TabsTrigger value="features" className="text-xs">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Recursos ({result.newFeatures.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="issues">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {result.issues.length > 0 ? result.issues.map((issue, i) => (
                          <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-700">{issue}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Nenhum problema crítico identificado</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="improvements">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {result.improvements.length > 0 ? result.improvements.map((improvement, i) => (
                          <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-green-700">{improvement}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Nenhuma melhoria sugerida</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="features">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {result.newFeatures.length > 0 ? result.newFeatures.map((feature, i) => (
                          <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-700">{feature}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Nenhum novo recurso sugerido</p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Files to be analyzed */}
      {analysisResults.length === 0 && !isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Arquivos para Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {filesToAnalyze.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{file.description}</p>
                  </div>
                  <Badge variant="outline">Pendente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIStoreImprovementManager;