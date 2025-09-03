import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Eye,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface ChartData {
  date: string;
  revenue: number;
  orders: number;
  views: number;
}

interface TopProduct {
  id: string;
  title: string;
  revenue: number;
  orders: number;
  views: number;
}

const SalesDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalViews: 0,
    conversionRate: 0,
    averageOrderValue: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dateRange, setDateRange] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch user's stores first
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id);

      if (storesError) throw storesError;

      const storeIds = stores?.map(store => store.id) || [];

      if (storeIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch orders and related data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              store_id
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Filter orders for user's stores
      const userOrders = orders?.filter(order => 
        order.order_items?.some(item => 
          storeIds.includes(item.products?.store_id)
        )
      ) || [];

      // Fetch product views
      const { data: views, error: viewsError } = await supabase
        .from('product_views')
        .select(`
          *,
          products (
            id,
            title,
            store_id
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (viewsError) throw viewsError;

      // Filter views for user's products
      const userViews = views?.filter(view => 
        storeIds.includes(view.products?.store_id)
      ) || [];

      // Calculate metrics
      const totalRevenue = userOrders.reduce((sum, order) => sum + order.total_cents, 0);
      const totalOrders = userOrders.length;
      const uniqueCustomers = new Set(userOrders.map(order => order.user_id)).size;
      const totalViews = userViews.length;
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setMetrics({
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        totalViews,
        conversionRate,
        averageOrderValue
      });

      // Generate chart data (daily aggregation)
      const dateMap = new Map<string, { revenue: number; orders: number; views: number }>();
      
      userOrders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { revenue: 0, orders: 0, views: 0 };
        dateMap.set(date, {
          ...existing,
          revenue: existing.revenue + order.total_cents,
          orders: existing.orders + 1
        });
      });

      userViews.forEach(view => {
        const date = new Date(view.created_at).toISOString().split('T')[0];
        const existing = dateMap.get(date) || { revenue: 0, orders: 0, views: 0 };
        dateMap.set(date, {
          ...existing,
          views: existing.views + 1
        });
      });

      const chartDataArray = Array.from(dateMap.entries())
        .map(([date, data]) => ({
          date,
          ...data
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setChartData(chartDataArray);

      // Calculate top products
      const productMap = new Map<string, { title: string; revenue: number; orders: number; views: number }>();
      
      userOrders.forEach(order => {
        order.order_items?.forEach(item => {
          if (item.products && storeIds.includes(item.products.store_id)) {
            const existing = productMap.get(item.products.id) || 
              { title: item.products.title, revenue: 0, orders: 0, views: 0 };
            productMap.set(item.products.id, {
              ...existing,
              revenue: existing.revenue + (item.unit_price_cents * item.quantity),
              orders: existing.orders + item.quantity
            });
          }
        });
      });

      userViews.forEach(view => {
        if (view.products && storeIds.includes(view.products.store_id)) {
          const existing = productMap.get(view.products.id) || 
            { title: view.products.title, revenue: 0, orders: 0, views: 0 };
          productMap.set(view.products.id, {
            ...existing,
            views: existing.views + 1
          });
        }
      });

      const topProductsArray = Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setTopProducts(topProductsArray);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erro ao carregar analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pieData = topProducts.slice(0, 5).map((product, index) => ({
    name: product.title,
    value: product.revenue,
    color: `hsl(${index * 72}, 70%, 50%)`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics de Vendas</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho dos seus produtos e vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        {['7d', '30d', '90d'].map((range) => (
          <Button
            key={range}
            variant={dateRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(range)}
          >
            {range === '7d' ? '7 dias' : range === '30d' ? '30 dias' : '90 dias'}
          </Button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: {formatCurrency(metrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Conversão: {metrics.conversionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Únicos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Produtos visitados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="orders">Vendas</TabsTrigger>
          <TabsTrigger value="views">Visualizações</TabsTrigger>
          <TabsTrigger value="products">Top Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita por Dia</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value: number) => [value, 'Vendas']}
                  />
                  <Bar dataKey="orders" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações por Dia</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(value)}
                    formatter={(value: number) => [value, 'Visualizações']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Produtos por Receita</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Top Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.orders} vendas • {product.views} visualizações
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {((product.orders / product.views) * 100).toFixed(1)}% conversão
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesDashboard;