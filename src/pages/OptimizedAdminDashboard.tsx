import { useEffect, memo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptimizedAdmin, useOptimizedAdminStats } from '@/hooks/use-optimized-admin';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import BackNavigation from '@/components/layout/back-navigation';
import { AdminStatsSkeleton, DashboardSkeleton } from '@/components/ui/skeleton-loading';
import { 
  OptimizedAdminUsersSection,
  OptimizedAdminStoresSection,
  OptimizedAdminFinancialSection,
  OptimizedAdminLogsSection,
  OptimizedAdminConfigsSection,
  OptimizedAdminWhatsAppSection,
  OptimizedAdminDiagnosticsSection,
  OptimizedAISystemReviewer,
  OptimizedAdminFlowValidationSection
} from '@/components/admin/optimized-admin-sections';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  UserCheck 
} from 'lucide-react';

// Memoized stat card component
const StatCard = memo<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  gradientClasses: string;
  iconColor: string;
}>(({ title, value, icon: Icon, gradientClasses, iconColor }) => (
  <Card className={`${gradientClasses} border-opacity-30`}>
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs sm:text-sm font-medium ${iconColor}`}>{title}</p>
          <p className={`text-xl sm:text-2xl font-bold ${iconColor.replace('600', '700')}`}>
            {typeof value === 'number' && title.includes('Receita') 
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value
            }
          </p>
        </div>
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Memoized quick stats component
const QuickStatCard = memo<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  badge?: { text: string; variant: 'destructive' | 'default' };
}>(({ title, value, icon: Icon, badge }) => (
  <Card>
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className={badge ? "flex-1 min-w-0" : ""}>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg sm:text-xl font-bold">
              {typeof value === 'number' && title.includes('Mês') 
                ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : value
              }
            </p>
            {badge && (
              <Badge variant={badge.variant} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${badge ? 'text-orange-500 flex-shrink-0' : 'text-muted-foreground'}`} />
      </div>
    </CardContent>
  </Card>
));

QuickStatCard.displayName = 'QuickStatCard';

export default memo(function OptimizedAdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useOptimizedAdmin();
  const { stats, loading: statsLoading } = useOptimizedAdminStats();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <BackNavigation />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Controle total da plataforma Nexus Market
          </p>
        </div>

        {/* Stats Overview */}
        {statsLoading ? (
          <AdminStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Usuários Totais"
              value={stats?.totalUsers || 0}
              icon={Users}
              gradientClasses="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Lojas Ativas"
              value={stats?.totalStores || 0}
              icon={Store}
              gradientClasses="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200"
              iconColor="text-green-600"
            />
            <StatCard
              title="Produtos"
              value={stats?.totalProducts || 0}
              icon={ShoppingCart}
              gradientClasses="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200"
              iconColor="text-purple-600"
            />
            <StatCard
              title="Receita Total"
              value={stats?.totalRevenue || 0}
              icon={TrendingUp}
              gradientClasses="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200"
              iconColor="text-orange-600"
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <QuickStatCard
            title="Este Mês"
            value={stats?.monthlyRevenue || 0}
            icon={Calendar}
          />
          <QuickStatCard
            title="Produtos Pendentes"
            value={stats?.pendingProducts || 0}
            icon={AlertCircle}
            badge={(stats?.pendingProducts || 0) > 0 ? { text: "Requer atenção", variant: "destructive" } : undefined}
          />
          <QuickStatCard
            title="Afiliados Ativos"
            value={stats?.activeAffiliates || 0}
            icon={UserCheck}
          />
        </div>

        {/* Admin Sections */}
        <Tabs defaultValue="diagnostics" className="space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="flex w-max min-w-full justify-start gap-1 p-1">
              <TabsTrigger value="diagnostics" className="whitespace-nowrap">Diagnósticos</TabsTrigger>
              <TabsTrigger value="ai-reviewer" className="whitespace-nowrap">IA Revisor</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Usuários</TabsTrigger>
              <TabsTrigger value="stores" className="whitespace-nowrap">Lojas</TabsTrigger>
              <TabsTrigger value="financial" className="whitespace-nowrap">Financeiro</TabsTrigger>
              <TabsTrigger value="logs" className="whitespace-nowrap">Logs</TabsTrigger>
              <TabsTrigger value="configs" className="whitespace-nowrap">Configurações</TabsTrigger>
              <TabsTrigger value="whatsapp" className="whitespace-nowrap">WhatsApp</TabsTrigger>
              <TabsTrigger value="flow-validation" className="whitespace-nowrap">Validação</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="diagnostics">
            <OptimizedAdminDiagnosticsSection />
          </TabsContent>
          
          <TabsContent value="ai-reviewer">
            <OptimizedAISystemReviewer />
          </TabsContent>

          <TabsContent value="users">
            <OptimizedAdminUsersSection />
          </TabsContent>

          <TabsContent value="stores">
            <OptimizedAdminStoresSection />
          </TabsContent>

          <TabsContent value="financial">
            <OptimizedAdminFinancialSection />
          </TabsContent>

          <TabsContent value="logs">
            <OptimizedAdminLogsSection />
          </TabsContent>

          <TabsContent value="configs">
            <OptimizedAdminConfigsSection />
          </TabsContent>

          <TabsContent value="whatsapp">
            <OptimizedAdminWhatsAppSection />
          </TabsContent>

          <TabsContent value="flow-validation">
            <OptimizedAdminFlowValidationSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});