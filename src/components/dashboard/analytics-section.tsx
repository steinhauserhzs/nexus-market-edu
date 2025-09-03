import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/use-analytics";
import { 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Package,
  Users,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsSection = () => {
  const { analytics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold">{analytics.totalViews}</p>
                {analytics.recentViews > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    +{analytics.recentViews} esta semana
                  </Badge>
                )}
              </div>
              <Eye className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">No Carrinho</p>
                <p className="text-2xl font-bold">{analytics.totalCartAdds}</p>
                {analytics.recentCartAdds > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    +{analytics.recentCartAdds} esta semana
                  </Badge>
                )}
              </div>
              <ShoppingCart className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas</p>
                <p className="text-2xl font-bold">{analytics.totalSales}</p>
                {analytics.recentSales > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    +{analytics.recentSales} esta semana
                  </Badge>
                )}
              </div>
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de conversão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {analytics.totalViews > 0 
                  ? ((analytics.totalSales / analytics.totalViews) * 100).toFixed(1)
                  : '0'
                }%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Visualizações → Vendas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Interesse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {analytics.totalViews > 0 
                  ? ((analytics.totalCartAdds / analytics.totalViews) * 100).toFixed(1)
                  : '0'
                }%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Visualizações → Carrinho
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Finalização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {analytics.totalCartAdds > 0 
                  ? ((analytics.totalSales / analytics.totalCartAdds) * 100).toFixed(1)
                  : '0'
                }%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Carrinho → Vendas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Produtos mais populares */}
      {analytics.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Produtos Mais Visualizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.views} visualizações
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsSection;