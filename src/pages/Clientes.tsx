import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import BackNavigation from "@/components/layout/back-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, Filter, Mail, Phone, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCustomerAnalytics } from "@/hooks/use-customer-analytics";

const Clientes = () => {
  const { user, loading: authLoading } = useAuth();
  const { analytics, loading } = useCustomerAnalytics();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const { customers, totalCustomers, newThisMonth, activeCustomers, averageTicket } = analytics;

  return (
    <>
      <SEOHead 
        title="Clientes - Nexus Market"
        description="Gerencie seus clientes e relacionamentos na Nexus Market."
      />
      
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Clientes" />
        
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
              <p className="text-muted-foreground">
                Acompanhe e gerencie sua base de clientes
              </p>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <p className="text-2xl font-bold">{loading ? "..." : totalCustomers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Novos este Mês</p>
                    <p className="text-2xl font-bold">{loading ? "..." : newThisMonth}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                    <p className="text-2xl font-bold">{loading ? "..." : activeCustomers}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                    <p className="text-2xl font-bold">R$ {loading ? "..." : averageTicket.toFixed(2)}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes por nome ou email..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clientes List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Carregando clientes...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum cliente ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Quando alguém fizer uma compra, aparecerá aqui
                  </p>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convidar Clientes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customers.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {cliente.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{cliente.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {cliente.email}
                            </span>
                            {cliente.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {cliente.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={cliente.status === "Ativo" ? "default" : "secondary"}>
                          {cliente.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Última compra: {new Date(cliente.lastOrderDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm font-medium">
                          {cliente.orderCount} pedido{cliente.orderCount !== 1 ? 's' : ''} • R$ {cliente.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Clientes;