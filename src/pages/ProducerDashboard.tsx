import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  CreditCard,
  Clock,
  TrendingUp,
  Users,
  Package
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProducerLayout } from '@/components/producer/producer-layout';

// Mock data - replace with real data from Supabase
const mockSalesData = [
  { date: '01 Set', value: 4200 },
  { date: '02 Set', value: 3800 },
  { date: '03 Set', value: 4600 },
  { date: '04 Set', value: 5200 },
  { date: '05 Set', value: 4800 },
  { date: '06 Set', value: 5600 },
  { date: '07 Set', value: 6200 },
];

const mockPaymentMethods = [
  { name: 'Cartão de crédito', percentage: 78, value: 15719 },
  { name: 'PIX', percentage: 88, value: 5463 },
  { name: 'Boleto', percentage: 12, value: 1200 },
  { name: 'PicPay', percentage: 5, value: 300 },
];

interface DashboardStats {
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  totalSales: number;
  conversionRate: number;
  averageTicket: number;
}

const ProducerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalSales: 0,
    conversionRate: 0,
    averageTicket: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API call - replace with real Supabase data
      setTimeout(() => {
        setStats({
          totalRevenue: 45230.50,
          availableBalance: 23150.75,
          pendingBalance: 8940.25,
          totalSales: 342,
          conversionRate: 18.2,
          averageTicket: 483.99
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProducerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-background to-[hsl(var(--background)_/_0.8)]">
        {/* Header with Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {user?.email?.split('@')[0] || 'Produtor'}! 👋
            </h1>
            <p className="text-muted-foreground">Aqui está um resumo da sua performance hoje</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-border hover:bg-muted/50 transition-all duration-300">
              Exportar dados
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-hover hover:to-primary text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:scale-105">
              Novo produto
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {stats.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +20.1% vs mês anterior
              </div>
            </CardContent>
          </Card>

          {/* Available Balance */}
          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Disponível</CardTitle>
              <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
                <CreditCard className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {stats.availableBalance.toLocaleString()}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                Disponível para saque
              </div>
            </CardContent>
          </Card>

          {/* Pending Balance */}
          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
              <div className="p-2 bg-gradient-to-br from-warning/20 to-warning/10 rounded-lg">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {stats.pendingBalance.toLocaleString()}</div>
              <div className="flex items-center text-xs text-warning mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Em processamento
              </div>
            </CardContent>
          </Card>

          {/* Total Sales */}
          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalSales}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +15% vs semana anterior
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--metric-bg))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Vendas nos últimos 7 dias</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Evolução das vendas recentes</p>
              </div>
              <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      formatter={(value) => [`R$ ${value}`, 'Vendas']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary-glow))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--metric-bg))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Métodos de Pagamento</CardTitle>
              <p className="text-sm text-muted-foreground">Distribuição dos pagamentos este mês</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockPaymentMethods.map((method, index) => (
                <div key={method.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{method.name}</span>
                    <span className="text-sm text-muted-foreground">R$ {method.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
              <div className="p-2 bg-gradient-to-br from-success/20 to-success/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.conversionRate}%</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +2.1% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">R$ {stats.averageTicket.toFixed(2)}</div>
              <div className="flex items-center text-xs text-success mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                +5.4% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[hsl(var(--metric-bg))] to-[hsl(var(--card))] border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Produtos Ativos</CardTitle>
              <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Package className="h-3 w-3 mr-1" />
                6 produtos em destaque
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProducerLayout>
  );
};

export default ProducerDashboard;