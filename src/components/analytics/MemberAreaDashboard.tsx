import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemberAnalytics, MemberAnalytics } from "@/hooks/use-member-analytics";
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberAreaDashboardProps {
  storeId: string;
  className?: string;
}

export const MemberAreaDashboard = ({ storeId, className }: MemberAreaDashboardProps) => {
  const { analytics, loading, loadAnalytics } = useMemberAnalytics();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (storeId) {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      loadAnalytics(storeId, startDate, endDate);
    }
  }, [storeId, timeRange, loadAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Últimos 7 dias';
      case '30d': return 'Últimos 30 dias';
      case '90d': return 'Últimos 90 dias';
      default: return 'Período selecionado';
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Skeleton loading */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics da Área de Membros</h2>
          <p className="text-muted-foreground">
            Acompanhe o engajamento e atividade dos seus membros
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
            >
              {getTimeRangeLabel(range)}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalMembers)}</div>
            <p className="text-xs text-muted-foreground">
              Membros únicos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Conteúdos visualizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgSessionTime}min</div>
            <p className="text-xs text-muted-foreground">
              Sessão média de vídeo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalMembers > 0 ? Math.round((analytics.totalViews / analytics.totalMembers) * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Views por membro
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade dos Membros</CardTitle>
              <CardDescription>
                Membros ativos e visualizações por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.memberActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(activity.date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.activeMembers} membros ativos
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {activity.contentViews} views
                    </Badge>
                  </div>
                ))}
                {analytics.memberActivity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade encontrada no período selecionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Conteúdos</CardTitle>
              <CardDescription>
                Conteúdos mais acessados pelos membros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topContent.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {content.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {content.views} views
                    </Badge>
                  </div>
                ))}
                {analytics.topContent.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum conteúdo acessado no período selecionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Baixe relatórios detalhados da sua área de membros
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório de Atividade (CSV)
              </Button>
              <Button className="w-full" variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Exportar Analytics Completo (PDF)
              </Button>
              <p className="text-xs text-muted-foreground">
                Os relatórios incluem dados detalhados de atividade, engajamento e conteúdo dos últimos {getTimeRangeLabel(timeRange).toLowerCase()}.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};