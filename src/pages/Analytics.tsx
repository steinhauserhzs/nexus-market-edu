import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/admin-layout";
import { TrendingUp, Users, ShoppingCart, DollarSign, Eye, MousePointer } from "lucide-react";

const Analytics = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const metrics = [
    {
      icon: Eye,
      title: "Visualizações",
      value: "1,234",
      change: "+12%",
      positive: true
    },
    {
      icon: Users,
      title: "Visitantes",
      value: "892",
      change: "+8%",
      positive: true
    },
    {
      icon: MousePointer,
      title: "Cliques",
      value: "456",
      change: "-3%",
      positive: false
    },
    {
      icon: ShoppingCart,
      title: "Vendas",
      value: "23",
      change: "+15%",
      positive: true
    },
    {
      icon: DollarSign,
      title: "Receita",
      value: "R$ 2.450",
      change: "+18%",
      positive: true
    },
    {
      icon: TrendingUp,
      title: "Taxa Conversão",
      value: "2.8%",
      change: "+0.5%",
      positive: true
    }
  ];

  return (
    <>
      <SEOHead 
        title="Analytics - Nexus Market"
        description="Acompanhe o desempenho da sua loja com métricas detalhadas."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Analytics da Loja</h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe o desempenho da sua loja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change} vs mês anterior
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <metric.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vistos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Produto {item}</p>
                        <p className="text-sm text-muted-foreground">{150 - item * 20} visualizações</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Hoje</span>
                    <span className="font-medium">R$ 245</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Esta semana</span>
                    <span className="font-medium">R$ 1.230</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Este mês</span>
                    <span className="font-medium">R$ 4.560</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total</span>
                    <span className="font-bold text-lg">R$ 12.450</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default Analytics;