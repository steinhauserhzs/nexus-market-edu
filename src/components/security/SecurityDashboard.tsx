import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Activity, 
  TrendingUp, 
  Users, 
  Lock,
  FileText,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  total_events: number;
  high_risk_events: number;
  failed_logins: number;
  data_exports: number;
  recent_activity: SecurityEvent[];
}

interface SecurityEvent {
  id: string;
  action: string;
  table_name: string;
  risk_level: string; // Changed from union type to string to match database
  created_at: string;
  details: any;
}

export const SecurityDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    total_events: 0,
    high_risk_events: 0,
    failed_logins: 0,
    data_exports: 0,
    recent_activity: []
  });

  // Only show dashboard to admin users
  if (profile?.role !== 'admin') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Acesso negado. Este painel é restrito a administradores.
        </AlertDescription>
      </Alert>
    );
  }

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      loadSecurityMetrics();
    }
  }, [user, profile]);

  const loadSecurityMetrics = async () => {
    setLoading(true);
    try {
      // Load security analytics
      const { data: analytics, error: analyticsError } = await supabase
        .rpc('get_security_analytics', {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        });

      if (analyticsError) throw analyticsError;

      // Load recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      // Process metrics
      const totalEvents = events?.length || 0;
      const highRiskEvents = events?.filter(e => ['high', 'critical'].includes(e.risk_level)).length || 0;
      const failedLogins = events?.filter(e => e.action.includes('auth_failure')).length || 0;
      const dataExports = events?.filter(e => e.action === 'DATA_EXPORT').length || 0;

      setMetrics({
        total_events: totalEvents,
        high_risk_events: highRiskEvents,
        failed_logins: failedLogins,
        data_exports: dataExports,
        recent_activity: events || []
      });

    } catch (error: any) {
      console.error('Error loading security metrics:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Painel de Segurança
          </h1>
          <p className="text-muted-foreground">
            Monitoramento e análise de eventos de segurança
          </p>
        </div>
        <Button onClick={loadSecurityMetrics} disabled={loading}>
          <Activity className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_events}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.high_risk_events}</div>
            <p className="text-xs text-muted-foreground">
              Eventos críticos/altos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas de Login</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.failed_logins}</div>
            <p className="text-xs text-muted-foreground">
              Tentativas falhadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exportações</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.data_exports}</div>
            <p className="text-xs text-muted-foreground">
              Dados exportados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Table */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Eventos Recentes</TabsTrigger>
          <TabsTrigger value="high-risk">Alto Risco</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recent_activity.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(event.risk_level)}>
                          {event.risk_level.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{event.action}</span>
                        {event.table_name && (
                          <span className="text-sm text-muted-foreground">
                            → {event.table_name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatEventTime(event.created_at)}
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
                
                {metrics.recent_activity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum evento de segurança encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Eventos de Alto Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recent_activity
                  .filter(event => ['high', 'critical'].includes(event.risk_level))
                  .slice(0, 15)
                  .map((event) => (
                    <Alert key={event.id} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">{event.action}</div>
                          <div className="text-sm">
                            Tabela: {event.table_name} | {formatEventTime(event.created_at)}
                          </div>
                          {event.details && Object.keys(event.details).length > 0 && (
                            <div className="text-xs mt-2 p-2 bg-red-50 rounded">
                              <pre>{JSON.stringify(event.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                
                {metrics.recent_activity.filter(e => ['high', 'critical'].includes(e.risk_level)).length === 0 && (
                  <div className="text-center py-8 text-green-600">
                    <Shield className="w-8 h-8 mx-auto mb-2" />
                    Nenhum evento de alto risco detectado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Análises de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Level Distribution */}
                <div className="space-y-3">
                  <h4 className="font-medium">Distribuição por Nível de Risco</h4>
                  {['critical', 'high', 'medium', 'low'].map(level => {
                    const count = metrics.recent_activity.filter(e => e.risk_level === level).length;
                    const percentage = metrics.total_events > 0 ? (count / metrics.total_events * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskBadgeVariant(level)} className="w-16 justify-center">
                            {level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top Actions */}
                <div className="space-y-3">
                  <h4 className="font-medium">Ações Mais Frequentes</h4>
                  {Object.entries(
                    metrics.recent_activity.reduce((acc, event) => {
                      acc[event.action] = (acc[event.action] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([action, count]) => (
                      <div key={action} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{action}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};