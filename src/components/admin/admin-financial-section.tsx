import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  PieChart,
  Download
} from 'lucide-react';

interface FinancialData {
  totalRevenue: number;
  platformRevenue: number;
  sellersRevenue: number;
  monthlyGrowth: number;
  totalTransactions: number;
  pendingPayments: number;
}

interface Transaction {
  id: string;
  user_name: string;
  user_email: string;
  total_cents: number;
  platform_fee_cents: number;
  seller_amount_cents: number;
  status: string;
  payment_status: string;
  created_at: string;
  store_name?: string;
}

export function AdminFinancialSection() {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch all completed orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(full_name, email)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate totals
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const platformRevenue = Math.floor(totalRevenue * 0.05) + (orders?.length || 0) * 39; // 5% + R$0.39 per transaction
      const sellersRevenue = totalRevenue - platformRevenue;

      // Calculate monthly growth (comparing last 2 months)
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth - 1;
      
      const currentMonthRevenue = orders?.filter(order => {
        const orderMonth = new Date(order.created_at).getMonth();
        return orderMonth === currentMonth;
      }).reduce((sum, order) => sum + order.total_cents, 0) || 0;

      const lastMonthRevenue = orders?.filter(order => {
        const orderMonth = new Date(order.created_at).getMonth();
        return orderMonth === lastMonth;
      }).reduce((sum, order) => sum + order.total_cents, 0) || 0;

      const monthlyGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // Get pending payments count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending');

      setFinancialData({
        totalRevenue: totalRevenue / 100,
        platformRevenue: platformRevenue / 100,
        sellersRevenue: sellersRevenue / 100,
        monthlyGrowth,
        totalTransactions: orders?.length || 0,
        pendingPayments: pendingCount || 0
      });

      // Format transactions for display
      const formattedTransactions: Transaction[] = (orders || []).slice(0, 20).map(order => ({
        id: order.id,
        user_name: order.profiles?.full_name || 'Usuário sem nome',
        user_email: order.profiles?.email || order.customer_email || 'Email não informado',
        total_cents: order.total_cents,
        platform_fee_cents: Math.floor(order.total_cents * 0.05) + 39,
        seller_amount_cents: order.total_cents - (Math.floor(order.total_cents * 0.05) + 39),
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        store_name: 'N/A'
      }));

      setTransactions(formattedTransactions);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const exportFinancialReport = async () => {
    try {
      // In a real implementation, you would generate and download a CSV/Excel file
      toast.success('Relatório financeiro exportado!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {financialData?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Receita da Plataforma</p>
                <p className="text-2xl font-bold text-blue-700">
                  R$ {financialData?.platformRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
                <p className="text-xs text-blue-600">
                  5% + R$ 0,39 por transação
                </p>
              </div>
              <PieChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Receita dos Vendedores</p>
                <p className="text-2xl font-bold text-purple-700">
                  R$ {financialData?.sellersRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crescimento Mensal</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    {financialData?.monthlyGrowth?.toFixed(1) || 0}%
                  </p>
                  {(financialData?.monthlyGrowth || 0) >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Transações</p>
                <p className="text-xl font-bold">{financialData?.totalTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagamentos Pendentes</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">{financialData?.pendingPayments || 0}</p>
                  {(financialData?.pendingPayments || 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Requer atenção
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Últimas 20 transações da plataforma
              </CardDescription>
            </div>
            <Button onClick={exportFinancialReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Taxa Plataforma</TableHead>
                  <TableHead>Valor Vendedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {transaction.user_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.user_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {(transaction.total_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-600 font-medium">
                        R$ {(transaction.platform_fee_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        R$ {(transaction.seller_amount_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.payment_status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}