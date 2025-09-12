import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Eye } from "lucide-react";

const Vendas = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const salesData = [
    { id: 1, product: "Curso de React", value: "R$ 197,00", date: "12/09/2025", status: "Aprovado" },
    { id: 2, product: "Curso de Node.js", value: "R$ 297,00", date: "11/09/2025", status: "Pendente" },
    { id: 3, product: "Mentoria 1:1", value: "R$ 500,00", date: "10/09/2025", status: "Aprovado" },
  ];

  return (
    <>
      <SEOHead 
        title="Vendas - Nexus Market"
        description="Acompanhe todas as suas vendas e receitas."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Vendas</h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe todas as suas vendas e receitas
            </p>
          </div>

          {/* Métricas de Vendas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total de Vendas</p>
                    <p className="text-2xl font-bold">R$ 2.450</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Vendas Este Mês</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">2.8%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Ticket Médio</p>
                    <p className="text-2xl font-bold">R$ 248</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Produto</th>
                      <th className="text-left p-4">Valor</th>
                      <th className="text-left p-4">Data</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{sale.product}</td>
                        <td className="p-4">{sale.value}</td>
                        <td className="p-4">{sale.date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sale.status === 'Aprovado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default Vendas;