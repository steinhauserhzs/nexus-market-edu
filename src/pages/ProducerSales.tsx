import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Package,
  CreditCard,
  Settings,
  Bell,
  User,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockSalesData = [
  { date: '01 Set', value: 3948 },
  { date: '02 Set', value: 3475 },
  { date: '03 Set', value: 3948 },
];

const mockTransactions = [
  {
    id: '#SMV1631R',
    product: 'FLASH TATTOO PACK',
    productType: 'E-book',
    buyer: 'Danielle Cortacho',
    buyerEmail: 'carlopstattoo.da...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '11/09/2025',
    time: 'às 06:31',
    method: 'credit_card',
    value: 23.31,
    status: 'approved'
  },
  {
    id: '#SQM1X1B3',
    product: 'Escolha os packs a...',
    productType: 'E-book',
    buyer: 'Kemerson Silveira ...',
    buyerEmail: 'kemersonpecancial-...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '10/09/2025',
    time: 'às 16:54',
    method: 'free',
    value: 0,
    status: 'approved'
  },
  {
    id: '#XEQ64EVE',
    product: '1000 OPÇÕES DE FLA...',
    productType: 'E-book e outros',
    buyer: 'Karina Menezes',
    buyerEmail: 'kaimapa@gmail.c...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '10/09/2025',
    time: 'às 10:49',
    method: 'credit_card',
    value: 66.37,
    status: 'approved'
  },
  {
    id: '#BYNW2DQM',
    product: '1000 OPÇÕES DE FLA...',
    productType: 'E-book e outros',
    buyer: 'Brasilino De Sousa...',
    buyerEmail: 'brasilinocoarcsggm...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '10/09/2025',
    time: 'às 06:40',
    method: 'credit_card',
    value: 66.37,
    status: 'approved'
  },
  {
    id: '#XEQC7VBY',
    product: '1000 OPÇÕES DE FLA...',
    productType: 'E-book e outros',
    buyer: 'Bruna Garcho Ramo...',
    buyerEmail: 'brunagarchodgfsor...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '09/09/2025',
    time: 'às 21:34',
    method: 'credit_card',
    value: 66.37,
    status: 'approved'
  },
  {
    id: '#XEQ67BGE',
    product: 'FLASH TATTOO LUCRA...',
    productType: 'Curso',
    buyer: 'Camila Cruz',
    buyerEmail: 'camiacriuz1@gmail...',
    seller: 'Matheus Da Silva S...',
    sellerType: 'Autoral',
    date: '09/09/2025',
    time: 'às 10:26',
    method: 'credit_card',
    value: 87.74,
    status: 'approved'
  }
];

const ProducerSales = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <div className="w-4 h-4 bg-green-600 rounded-sm"></div>;
      case 'free':
        return <span className="text-xs">-</span>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Aprovada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTransactions = mockTransactions.filter(transaction =>
    transaction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">KVN</div>
            <div className="h-8 w-px bg-gray-700"></div>
            <h1 className="text-xl font-semibold">Vendas</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Pessoa Física</p>
                <p className="text-xs text-gray-400">PF</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 min-h-screen">
          <nav className="p-4 space-y-2">
            <a href="/producer" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-gray-800 rounded-lg text-white">
              <TrendingUp className="h-4 w-4" />
              <span>Vendas</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300">
              <Package className="h-4 w-4" />
              <span>Produtos</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300">
              <DollarSign className="h-4 w-4" />
              <span>Finanças</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300">
              <Settings className="h-4 w-4" />
              <span>Integrações</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-800 rounded-lg text-gray-300">
              <ShoppingBag className="h-4 w-4" />
              <span>Compras</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Banner Notice */}
          <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <p className="text-green-400 font-medium">Já deixou seu voto? Kirvano no Prêmio Reclame Aqui 2025 🏆</p>
                  <p className="text-green-300 text-sm">Fomos indicados como um dos melhores meios de pagamento eletrônico do Brasil. Agora, precisamos do seu apoio para conquistar esse troféu.</p>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Votar na Kirvano</Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">Faturamento</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400 text-sm">14.4%</span>
                    <ArrowUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">R$ 3.948,90</p>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockSalesData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">Receita líquida</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400 text-sm">14.2%</span>
                    <ArrowUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">R$ 3.475,90</p>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockSalesData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">Total de vendas</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-400 text-sm">18.2%</span>
                    <ArrowUp className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-gray-500">vs período anterior</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">72</p>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={mockSalesData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por CPF, ID da transação, e-mail ou nome"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#2a2a2a] border-gray-700 text-white pl-10 w-80"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Produto(s)</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Comprador</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Vendedor</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Data da venda</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Método</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">{transaction.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{transaction.product}</p>
                              <p className="text-gray-400 text-sm">{transaction.productType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white">{transaction.buyer}</p>
                            <p className="text-gray-400 text-sm">{transaction.buyerEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white">{transaction.seller}</p>
                            <p className="text-gray-400 text-sm">{transaction.sellerType}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white">{transaction.date}</p>
                            <p className="text-gray-400 text-sm">{transaction.time}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 text-gray-300">
                            {getMethodIcon(transaction.method)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">
                            {transaction.value === 0 ? 'Gratuito' : `R$ ${transaction.value.toFixed(2)}`}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProducerSales;