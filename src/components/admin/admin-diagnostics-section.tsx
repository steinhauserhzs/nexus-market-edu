import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useSystemDiagnostics, DiagnosticResult } from '@/hooks/use-system-diagnostics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Database,
  HardDrive,
  Zap,
  Shield,
  TrendingUp,
  Settings,
  Download,
  Wrench
} from 'lucide-react';

export function AdminDiagnosticsSection() {
  const { health, isRunning, runFullDiagnostics } = useSystemDiagnostics();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [fixingStorage, setFixingStorage] = useState(false);

  useEffect(() => {
    // Executar diagnóstico inicial
    runFullDiagnostics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runFullDiagnostics, 30000); // 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="outline" className="text-green-600 border-green-200">OK</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  const getOverallHealthColor = () => {
    if (!health) return 'bg-gray-500';
    switch (health.overall) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const exportDiagnostics = () => {
    if (!health) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      overall_health: health.overall,
      score: health.score,
      results: health.results
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fixStorageBuckets = async () => {
    setFixingStorage(true);
    try {
      const { data, error } = await supabase.functions.invoke('ensure-storage-buckets');
      
      if (error) {
        toast.error('Erro ao corrigir storage: ' + error.message);
      } else {
        toast.success(data.message);
        // Re-run diagnostics after fixing
        setTimeout(() => runFullDiagnostics(), 1000);
      }
    } catch (error) {
      console.error('Error fixing storage buckets:', error);
      toast.error('Erro ao corrigir buckets de storage');
    } finally {
      setFixingStorage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnósticos do Sistema</h2>
          <p className="text-muted-foreground">
            Verificação automática da integridade e performance da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={runFullDiagnostics}
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Executar Diagnóstico
          </Button>
          {health && (
            <Button variant="outline" size="sm" onClick={exportDiagnostics}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Status Geral */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${getOverallHealthColor()}`}></div>
              Status Geral do Sistema
            </CardTitle>
            <CardDescription>
              Última verificação: {health.lastCheck.toLocaleString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saúde Geral</span>
                <Badge variant={health.overall === 'healthy' ? 'outline' : 'destructive'}>
                  {health.overall === 'healthy' ? 'Saudável' : 
                   health.overall === 'warning' ? 'Atenção' : 'Crítico'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score de Saúde</span>
                  <span className="font-medium">{health.score}%</span>
                </div>
                <Progress value={health.score} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-semibold">
                    {health.results.filter(r => r.status === 'pass').length}
                  </div>
                  <div className="text-muted-foreground">Passou</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 font-semibold">
                    {health.results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-muted-foreground">Atenção</div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-semibold">
                    {health.results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-muted-foreground">Erro</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados Detalhados */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {health?.results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.executionTime && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {result.executionTime}ms
                      </Badge>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
                
                {result.details && result.status === 'error' && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Detalhes do Erro</AlertTitle>
                    <AlertDescription>
                      <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {health?.results
            .filter(r => r.name.includes('Performance'))
            .map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.details && (
                    <div className="space-y-4">
                      {result.details.memory && (
                        <div className="space-y-2">
                          <h5 className="font-medium">Uso de Memória</h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Usado</div>
                              <div className="font-medium">{result.details.memory.used} MB</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Total</div>
                              <div className="font-medium">{result.details.memory.total} MB</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Limite</div>
                              <div className="font-medium">{result.details.memory.limit} MB</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {result.details.connection && (
                        <div className="space-y-2">
                          <h5 className="font-medium">Conexão</h5>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Tipo</div>
                              <div className="font-medium">{result.details.connection.effectiveType}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Download</div>
                              <div className="font-medium">{result.details.connection.downlink} Mbps</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">RTT</div>
                              <div className="font-medium">{result.details.connection.rtt} ms</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health?.results
              .filter(r => ['Conectividade do Banco', 'Storage Buckets', 'Edge Functions'].includes(r.name))
              .map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {result.name.includes('Banco') && <Database className="h-5 w-5" />}
                      {result.name.includes('Storage') && <HardDrive className="h-5 w-5" />}
                      {result.name.includes('Edge') && <Zap className="h-5 w-5" />}
                      {result.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Status</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    
                    {result.name === 'Storage Buckets' && result.status === 'error' && (
                      <Button 
                        size="sm" 
                        onClick={fixStorageBuckets}
                        disabled={fixingStorage}
                        className="mb-2"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        {fixingStorage ? 'Corrigindo...' : 'Corrigir Storage'}
                      </Button>
                    )}
                    
                    {result.details && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          {health?.results
            .filter(r => ['Integridade de Dados', 'Configurações do Sistema'].includes(r.name))
            .map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.name.includes('Integridade') && <Shield className="h-5 w-5" />}
                    {result.name.includes('Configurações') && <Settings className="h-5 w-5" />}
                    {result.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">Status</span>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  {result.details && (
                    <div className="space-y-2">
                      {Object.entries(result.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Array.isArray(value) ? value.join(', ') || 'Nenhum' : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Executando diagnósticos do sistema...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}