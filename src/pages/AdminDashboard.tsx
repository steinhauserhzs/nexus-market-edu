import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin, useAdminStats } from '@/hooks/use-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/loading-spinner';
import BackNavigation from '@/components/layout/back-navigation';
import { AdminUsersSection } from '@/components/admin/admin-users-section';
import { AdminStoresSection } from '@/components/admin/admin-stores-section';
import { AdminFinancialSection } from '@/components/admin/admin-financial-section';
import { AdminLogsSection } from '@/components/admin/admin-logs-section';
import { AdminConfigsSection } from '@/components/admin/admin-configs-section';
import { AdminSettingsSection } from '@/components/admin/admin-settings-section';
import { AdminDiagnosticsSection } from '@/components/admin/admin-diagnostics-section';
import { AISystemReviewer } from '@/components/admin/ai-system-reviewer';
import { AdminWhatsAppSection } from '@/components/admin/admin-whatsapp-section';
import AdminFlowValidationSection from "@/components/admin/admin-flow-validation-section";
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  UserCheck 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { stats, loading: statsLoading } = useAdminStats();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-16 sm:h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-600">Usuários Totais</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-600">Lojas Ativas</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{stats?.totalStores || 0}</p>
                  </div>
                  <Store className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-purple-600">Produtos</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-700">{stats?.totalProducts || 0}</p>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-orange-600">Receita Total</p>
                    <p className="text-lg sm:text-2xl font-bold text-orange-700">
                      R$ {stats?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Este Mês</p>
                  <p className="text-lg sm:text-xl font-bold">
                    R$ {stats?.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </p>
                </div>
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Produtos Pendentes</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-lg sm:text-xl font-bold">{stats?.pendingProducts || 0}</p>
                    {(stats?.pendingProducts || 0) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Requer atenção
                      </Badge>
                    )}
                  </div>
                </div>
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Afiliados Ativos</p>
                  <p className="text-lg sm:text-xl font-bold">{stats?.activeAffiliates || 0}</p>
                </div>
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        {/* Quick Actions removed temporarily */}

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
          <AdminDiagnosticsSection />
        </TabsContent>
        
        <TabsContent value="ai-reviewer">
          <AISystemReviewer />
        </TabsContent>

          <TabsContent value="users">
            <AdminUsersSection />
          </TabsContent>

          <TabsContent value="stores">
            <AdminStoresSection />
          </TabsContent>

          <TabsContent value="financial">
            <AdminFinancialSection />
          </TabsContent>

          <TabsContent value="logs">
            <AdminLogsSection />
          </TabsContent>

          <TabsContent value="configs">
            <AdminConfigsSection />
          </TabsContent>

          <TabsContent value="whatsapp">
            <AdminWhatsAppSection />
          </TabsContent>

          <TabsContent value="flow-validation">
            <AdminFlowValidationSection />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}