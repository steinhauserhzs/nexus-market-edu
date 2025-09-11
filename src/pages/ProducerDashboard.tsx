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
  Clock
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
  { name: 'Boleto', percentage: 0, value: 0 },
  { name: 'PicPay', percentage: 0, value: 0 },
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
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with real Supabase queries
      setStats({
        totalRevenue: 34847.19,
        availableBalance: 800.56,
        pendingBalance: 791.20,
        totalSales: 72,
        conversionRate: 18.2,
        averageTicket: 483.99
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProducerLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout title="Dashboard">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Olá, {user?.email?.split('@')[0]} 👋</h2>
                <p className="text-gray-400">Pequenas ações geram grandes resultados</p>
              </div>
              <p className="text-sm text-gray-400">
                Hoje é {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">R$ {stats.availableBalance.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Saldo disponível</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">R$ {stats.pendingBalance.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Saldo pendente</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-400 text-sm">+3.1%</span>
                      <ArrowUp className="h-3 w-3 text-green-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
                    <p className="text-sm text-gray-400">A saúde da conta está ótima</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardTitle>
                    <p className="text-sm text-gray-400 flex items-center space-x-1">
                      <span>-14.2%</span>
                      <ArrowDown className="h-3 w-3 text-red-400" />
                    </p>
                    <p className="text-xs text-gray-500">Receita líquida</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Achievement Section */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Jornada de conquistas</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-400">
                  Saiba mais
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Você é Avançado</span>
                    <span className="text-sm text-gray-300">Próximo nível Expert</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-1">
                        <span className="text-white text-xs">10x</span>
                      </div>
                      <p className="text-xs text-gray-400">Avançado</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-1">
                        <span className="text-white text-xs">100x</span>
                      </div>
                      <p className="text-xs text-gray-400">Expert</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-1">
                        <span className="text-gray-400 text-xs">500x</span>
                      </div>
                      <p className="text-xs text-gray-400">Prata</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Métodos de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {mockPaymentMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{method.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-white">{method.percentage}%</span>
                        <span className="text-sm text-blue-400">{method.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full" 
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
    </ProducerLayout>
  );
};

export default ProducerDashboard;