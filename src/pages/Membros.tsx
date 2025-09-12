import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Calendar, Crown } from "lucide-react";

const Membros = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando membros...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const members = [
    { 
      id: 1, 
      name: "João Silva", 
      email: "joao@email.com", 
      plan: "Premium", 
      joinDate: "15/08/2025",
      status: "Ativo"
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      email: "maria@email.com", 
      plan: "Básico", 
      joinDate: "20/08/2025",
      status: "Ativo"
    },
    { 
      id: 3, 
      name: "Pedro Costa", 
      email: "pedro@email.com", 
      plan: "Premium", 
      joinDate: "05/09/2025",
      status: "Pendente"
    },
  ];

  return (
    <>
      <SEOHead 
        title="Membros - Nexus Market"
        description="Gerencie todos os membros da sua área de membros."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Membros</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie todos os membros da sua área de membros
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Membros</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Membros Ativos</p>
                    <p className="text-2xl font-bold">98</p>
                  </div>
                  <Crown className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Novos Este Mês</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Taxa de Retenção</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Busca e Filtros */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar membros..." 
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Todos</Button>
                  <Button variant="outline">Ativos</Button>
                  <Button variant="outline">Pendentes</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Membros */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Membros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Nome</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Plano</th>
                      <th className="text-left p-4">Data de Entrada</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{member.name}</td>
                        <td className="p-4">{member.email}</td>
                        <td className="p-4">
                          <Badge variant={member.plan === 'Premium' ? 'default' : 'secondary'}>
                            {member.plan}
                          </Badge>
                        </td>
                        <td className="p-4">{member.joinDate}</td>
                        <td className="p-4">
                          <Badge variant={member.status === 'Ativo' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Ver</Button>
                            <Button variant="outline" size="sm">Editar</Button>
                          </div>
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

export default Membros;