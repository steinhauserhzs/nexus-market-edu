import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react";

const OrderBumps = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando order bumps...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const orderBumps = [
    { 
      id: 1, 
      name: "E-book Bonus React", 
      price: "R$ 47,00", 
      conversionRate: "15%",
      status: "Ativo",
      revenue: "R$ 1.245,00"
    },
    { 
      id: 2, 
      name: "Template Figma", 
      price: "R$ 97,00", 
      conversionRate: "8%",
      status: "Ativo",
      revenue: "R$ 782,00"
    },
    { 
      id: 3, 
      name: "Consultoria 30min", 
      price: "R$ 197,00", 
      conversionRate: "12%",
      status: "Pausado",
      revenue: "R$ 2.364,00"
    },
  ];

  return (
    <>
      <SEOHead 
        title="Order Bumps - Nexus Market"
        description="Gerencie seus order bumps para aumentar o ticket médio."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Order Bumps</h1>
              <p className="text-muted-foreground text-lg">
                Aumente seu ticket médio com ofertas complementares
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Order Bump
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Receita Total</p>
                    <p className="text-2xl font-bold">R$ 4.391,00</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Conversão Média</p>
                    <p className="text-2xl font-bold">11.7%</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Order Bumps Ativos</p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <Plus className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Ticket Médio Adicional</p>
                    <p className="text-2xl font-bold">R$ 72,00</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Order Bumps */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Order Bumps</CardTitle>
            </CardHeader>
            <CardContent>
              {orderBumps.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Order Bump Criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro order bump para aumentar suas vendas.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Order Bump
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderBumps.map((bump) => (
                    <div key={bump.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold">{bump.name}</h3>
                            <Badge variant={bump.status === 'Ativo' ? 'default' : 'secondary'}>
                              {bump.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Preço</p>
                              <p className="font-medium">{bump.price}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Taxa de Conversão</p>
                              <p className="font-medium">{bump.conversionRate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Receita Gerada</p>
                              <p className="font-medium">{bump.revenue}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dicas para Order Bumps de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Ofertas Complementares</h4>
                  <p className="text-sm text-muted-foreground">
                    Ofereça produtos que complementem a compra principal, como templates, e-books ou consultorias.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Preço Atrativo</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantenha o preço do order bump entre 10-30% do valor do produto principal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default OrderBumps;