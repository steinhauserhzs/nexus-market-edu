import { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Link, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockAffiliates = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    status: 'approved',
    commission: 30,
    sales: 15,
    revenue: 4500,
    avatar: null,
    joined: '2024-01-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    status: 'pending',
    commission: 25,
    sales: 8,
    revenue: 2800,
    avatar: null,
    joined: '2024-01-20'
  }
];

const mockStats = {
  totalAffiliates: 156,
  activeAffiliates: 89,
  totalCommissions: 45600,
  salesThisMonth: 234
};

export function ProducerAffiliates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [affiliates] = useState(mockAffiliates);
  const [stats] = useState(mockStats);

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/20 text-success border-success/30">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Programa de Afiliados</h1>
          <p className="text-muted-foreground">Gerencie sua rede de afiliados</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Convidar Afiliado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAffiliates}</div>
            <p className="text-xs text-muted-foreground">57% do total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas por Afiliados</CardTitle>
            <Link className="h-4 w-4 text-primary-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salesThisMonth}</div>
            <p className="text-xs text-muted-foreground">+25% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affiliates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          <TabsTrigger value="commissions">Configurações</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="affiliates" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar afiliados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Afiliados</CardTitle>
              <CardDescription>
                Gerencie todos os seus afiliados e suas comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Vendas</TableHead>
                    <TableHead>Receita</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={affiliate.avatar || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-glow/20">
                              {affiliate.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{affiliate.name}</p>
                            <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                      <TableCell>{affiliate.commission}%</TableCell>
                      <TableCell>{affiliate.sales}</TableCell>
                      <TableCell>R$ {affiliate.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Comissão</CardTitle>
              <CardDescription>
                Configure as regras de comissão para seus produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Performance</CardTitle>
              <CardDescription>
                Acompanhe o desempenho dos seus afiliados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Relatórios em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProducerAffiliates;