import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Image, 
  Zap, 
  FileImage, 
  Gauge, 
  Settings, 
  Download, 
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetOptimizationSettings {
  imageQuality: number;
  maxWidth: number;
  maxHeight: number;
  format: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  enableLazyLoading: boolean;
  enableResponsive: boolean;
  generateThumbnails: boolean;
  compressionLevel: 'low' | 'medium' | 'high' | 'lossless';
}

interface OptimizationJob {
  id: string;
  fileName: string;
  originalSize: number;
  optimizedSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  savings?: number;
}

interface SmartAssetOptimizerProps {
  storeId: string;
}

const SmartAssetOptimizer = ({ storeId }: SmartAssetOptimizerProps) => {
  const [settings, setSettings] = useState<AssetOptimizationSettings>({
    imageQuality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'auto',
    enableLazyLoading: true,
    enableResponsive: true,
    generateThumbnails: true,
    compressionLevel: 'medium'
  });
  
  const [jobs, setJobs] = useState<OptimizationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    optimizedAssets: 0,
    totalSavings: 0,
    averageSavings: 0
  });
  
  const { toast } = useToast();

  // Load existing optimization jobs
  useEffect(() => {
    loadOptimizationHistory();
    loadOptimizationStats();
  }, [storeId]);

  const loadOptimizationHistory = async () => {
    // Simulated data - in real implementation, fetch from backend
    setJobs([
      {
        id: '1',
        fileName: 'hero-image.jpg',
        originalSize: 2048000,
        optimizedSize: 512000,
        status: 'completed',
        progress: 100,
        savings: 75
      },
      {
        id: '2', 
        fileName: 'product-gallery-1.png',
        originalSize: 3072000,
        optimizedSize: 768000,
        status: 'completed',
        progress: 100,
        savings: 75
      },
      {
        id: '3',
        fileName: 'banner-image.jpg',
        originalSize: 1536000,
        status: 'processing',
        progress: 65
      }
    ]);
  };

  const loadOptimizationStats = async () => {
    // Simulated stats
    setStats({
      totalAssets: 24,
      optimizedAssets: 18,
      totalSavings: 15.6, // MB
      averageSavings: 72 // %
    });
  };

  const optimizeAllAssets = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Simulate optimization process
      const newJob: OptimizationJob = {
        id: Date.now().toString(),
        fileName: 'bulk-optimization',
        originalSize: 0,
        status: 'processing',
        progress: 0
      };
      
      setJobs(prev => [newJob, ...prev]);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { ...job, progress: i, status: i === 100 ? 'completed' : 'processing' }
            : job
        ));
      }
      
      toast({
        title: "Otimização Concluída!",
        description: "Todos os assets foram otimizados com sucesso",
      });
      
      // Reload stats
      loadOptimizationStats();
      
    } catch (error: any) {
      toast({
        title: "Erro na Otimização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const optimizeSingleAsset = useCallback(async (assetId: string) => {
    // Implementation for single asset optimization
    toast({
      title: "Otimização Iniciada",
      description: "O asset está sendo otimizado...",
    });
  }, [toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: OptimizationJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OptimizationJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Otimizador Inteligente de Assets</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Otimização automática para melhor performance
                </p>
              </div>
            </div>
            
            <Button 
              onClick={optimizeAllAssets} 
              disabled={isProcessing}
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isProcessing ? 'Otimizando...' : 'Otimizar Todos'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileImage className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalAssets}</p>
                <p className="text-sm text-muted-foreground">Total Assets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.optimizedAssets}</p>
                <p className="text-sm text-muted-foreground">Otimizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSavings}MB</p>
                <p className="text-sm text-muted-foreground">Economia Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gauge className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageSavings}%</p>
                <p className="text-sm text-muted-foreground">Economia Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <Label>Qualidade da Imagem</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Baixa</span>
                  <span>{settings.imageQuality}%</span>
                  <span>Alta</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.imageQuality}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    imageQuality: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Largura Máxima</Label>
                <Select
                  value={settings.maxWidth.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    maxWidth: parseInt(value)
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1280">1280px</SelectItem>
                    <SelectItem value="1920">1920px</SelectItem>
                    <SelectItem value="2560">2560px</SelectItem>
                    <SelectItem value="3840">3840px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Altura Máxima</Label>
                <Select
                  value={settings.maxHeight.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    maxHeight: parseInt(value)
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720">720px</SelectItem>
                    <SelectItem value="1080">1080px</SelectItem>
                    <SelectItem value="1440">1440px</SelectItem>
                    <SelectItem value="2160">2160px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Formato de Saída</Label>
              <Select
                value={settings.format}
                onValueChange={(value: any) => setSettings(prev => ({
                  ...prev,
                  format: value
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automático</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Nível de Compressão</Label>
              <Select
                value={settings.compressionLevel}
                onValueChange={(value: any) => setSettings(prev => ({
                  ...prev,
                  compressionLevel: value
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="lossless">Sem Perda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lazy Loading</Label>
                <Switch
                  checked={settings.enableLazyLoading}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    enableLazyLoading: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Imagens Responsivas</Label>
                <Switch
                  checked={settings.enableResponsive}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    enableResponsive: checked
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Gerar Thumbnails</Label>
                <Switch
                  checked={settings.generateThumbnails}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    generateThumbnails: checked
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Otimizações</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadOptimizationHistory}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma otimização executada ainda</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(job.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{job.fileName}</p>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status === 'completed' ? 'Concluído' :
                             job.status === 'processing' ? 'Processando' :
                             job.status === 'error' ? 'Erro' : 'Pendente'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {formatFileSize(job.originalSize)}
                            {job.optimizedSize && (
                              <> → {formatFileSize(job.optimizedSize)}</>
                            )}
                          </span>
                          
                          {job.savings && (
                            <span className="text-green-600 font-medium">
                              {job.savings}% economia
                            </span>
                          )}
                        </div>
                        
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="mt-2" />
                        )}
                        
                        {job.error && (
                          <p className="text-red-600 text-sm mt-1">{job.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {job.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => optimizeSingleAsset(job.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setJobs(prev => prev.filter(j => j.id !== job.id))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Dicas de Performance
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Formato WebP</h3>
              <p className="text-sm text-muted-foreground">
                Use WebP para reduzir o tamanho dos arquivos em até 30% sem perda de qualidade visível.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Lazy Loading</h3>
              <p className="text-sm text-muted-foreground">
                Carregue imagens apenas quando necessário para melhorar o tempo de carregamento inicial.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Thumbnails</h3>
              <p className="text-sm text-muted-foreground">
                Gere thumbnails para listagens de produtos e use imagens em tamanho real apenas nos detalhes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartAssetOptimizer;