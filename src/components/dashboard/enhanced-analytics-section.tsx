import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStores } from "@/contexts/StoreContext";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Store,
  BarChart3
} from "lucide-react";

const EnhancedAnalyticsSection = () => {
  const { currentStore, getAllStoresStats, getCurrentStoreStats } = useStores();
  const [allStoresStats, setAllStoresStats] = useState<any>(null);
  const [currentStoreStats, setCurrentStoreStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [currentStore]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [allStats, currentStats] = await Promise.all([
        getAllStoresStats(),
        getCurrentStoreStats()
      ]);
      
      setAllStoresStats(allStats);
      setCurrentStoreStats(currentStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas da Loja Atual */}
      {currentStore && currentStoreStats && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Estatísticas: {currentStore.name}
            </h3>
            <Badge variant="outline">Loja Ativa</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Receita da Loja</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {(currentStoreStats.totalRevenue / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentStoreStats.totalSales} venda{currentStoreStats.totalSales !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Produtos</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {currentStoreStats.totalProducts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentStoreStats.publishedProducts} publicado{currentStoreStats.publishedProducts !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Membros Ativos</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {currentStoreStats.totalMembers}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      com acesso ativo
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Performance</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {currentStoreStats.totalProducts > 0 ? 
                        Math.round((currentStoreStats.publishedProducts / currentStoreStats.totalProducts) * 100) 
                        : 0
                      }%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      produtos publicados
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Estatísticas Consolidadas de Todas as Lojas */}
      {allStoresStats && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              Visão Geral - Todas as Lojas
            </h3>
            <Badge variant="secondary">
              {allStoresStats.storesCount} loja{allStoresStats.storesCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Receita Total</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      R$ {(allStoresStats.totalRevenue / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allStoresStats.totalSales} venda{allStoresStats.totalSales !== 1 ? 's' : ''} • Todas as lojas
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-700 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total de Produtos</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {allStoresStats.totalProducts}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      distribuídos em {allStoresStats.storesCount} loja{allStoresStats.storesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-blue-700 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total de Membros</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {allStoresStats.totalMembers}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      acessos ativos
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-700 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Lojas Ativas</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {allStoresStats.activeStores}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      de {allStoresStats.storesCount} total
                    </p>
                  </div>
                  <Store className="w-8 h-8 text-orange-700 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!allStoresStats && !currentStoreStats && !loading && (
        <Card className="rounded-xl border-border/50 shadow-lg">
          <CardContent className="pt-6 text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground">
              Crie sua primeira loja para começar a ver estatísticas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAnalyticsSection;