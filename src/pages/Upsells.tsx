import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, Plus, Edit, Trash2, Eye } from "lucide-react";

const Upsells = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando upsells...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const upsells = [
    { 
      id: 1, 
      name: "Curso Avançado de React", 
      price: "R$ 497,00", 
      conversionRate: "25%",
      status: "Ativo",
      revenue: "R$ 8.945,00"
    },
    { 
      id: 2, 
      name: "Mentoria VIP 3 Meses", 
      price: "R$ 1.997,00", 
      conversionRate: "12%",
      status: "Ativo",
      revenue: "R$ 15.976,00"
    },
    { 
      id: 3, 
      name: "Kit Desenvolvedor Pro", 
      price: "R$ 297,00", 
      conversionRate: "18%",
      status: "Pausado",
      revenue: "R$ 5.346,00"
    },
  ];

  return (
    <>
      <SEOHead 
        title="Upsells - Nexus Market"
        description="Gerencie seus upsells para maximizar a receita por cliente."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">Upsells</h1>
              <p className="text-muted-foreground text-lg">
                Maximize a receita por cliente com ofertas de upgrade
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Upsell
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Receita Total</p>
                    <p className="text-2xl font-bold">R$ 30.267,00</p>
                  </div>
                  <ArrowUpCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Conversão Média</p>
                    <p className="text-2xl font-bold">18.3%</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Upsells Ativos</p>
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
                    <p className="text-muted-foreground text-sm">LTV Médio</p>
                    <p className="text-2xl font-bold">R$ 847,00</p>
                  </div>
                  <ArrowUpCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Upsells */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Upsells</CardTitle>
            </CardHeader>
            <CardContent>
              {upsells.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowUpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Upsell Criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro upsell para maximizar a receita por cliente.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Upsell
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upsells.map((upsell) => (
                    <div key={upsell.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold">{upsell.name}</h3>
                            <Badge variant={upsell.status === 'Ativo' ? 'default' : 'secondary'}>
                              {upsell.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Preço</p>
                              <p className="font-medium">{upsell.price}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Taxa de Conversão</p>
                              <p className="font-medium">{upsell.conversionRate}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Receita Gerada</p>
                              <p className="font-medium">{upsell.revenue}</p>
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

          {/* Funil de Upsells */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Funil de Upsells</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-medium">Produto Principal</p>
                      <p className="text-sm text-muted-foreground">Curso Básico de React - R$ 197,00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">100%</p>
                    <p className="text-sm text-muted-foreground">Base</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-medium">Upsell 1</p>
                      <p className="text-sm text-muted-foreground">Curso Avançado de React - R$ 497,00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">25%</p>
                    <p className="text-sm text-muted-foreground">Conversão</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-medium">Upsell 2</p>
                      <p className="text-sm text-muted-foreground">Mentoria VIP 3 Meses - R$ 1.997,00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">12%</p>
                    <p className="text-sm text-muted-foreground">Conversão</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Estratégias de Upsell</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Progressão Natural</h4>
                  <p className="text-sm text-muted-foreground">
                    Ofereça produtos que sejam uma evolução natural do que o cliente acabou de comprar.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Valor Percebido</h4>
                  <p className="text-sm text-muted-foreground">
                    Mostre claramente como o upsell vai acelerar os resultados do cliente.
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

export default Upsells;