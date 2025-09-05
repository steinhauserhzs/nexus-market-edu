import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminLogs } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { 
  Search, 
  Store, 
  Calendar,
  Eye,
  Settings,
  TrendingUp,
  Package
} from 'lucide-react';

interface StoreWithOwner {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  created_at: string;
  is_active: boolean;
  owner: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  _count: {
    products: number;
    orders: number;
  };
  revenue?: number;
}

export function AdminStoresSection() {
  const [stores, setStores] = useState<StoreWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { logAction } = useAdminLogs();

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // Fetch stores with owner info
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select(`
          *,
          profiles:owner_id(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (storesError) throw storesError;

      // For each store, fetch products count and revenue
      const storesWithStats = await Promise.all(
        (storesData || []).map(async (store) => {
          const [productsResult, ordersResult] = await Promise.all([
            supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('store_id', store.id),
            supabase
              .from('order_items')
              .select('unit_price_cents, quantity')
              .in('product_id', [
                ...(await supabase
                  .from('products')
                  .select('id')
                  .eq('store_id', store.id)
                  .then(r => r.data?.map(p => p.id) || []))
              ])
          ]);

          const revenue = ordersResult.data?.reduce((sum, item) => 
            sum + (item.unit_price_cents * item.quantity), 0) || 0;

          return {
            ...store,
            owner: store.profiles,
            _count: {
              products: productsResult.count || 0,
              orders: ordersResult.data?.length || 0
            },
            revenue: revenue / 100 // Convert to reais
          };
        })
      );

      setStores(storesWithStats);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean, storeName: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId);

      if (error) throw error;

      await logAction(
        currentStatus ? 'STORE_DEACTIVATED' : 'STORE_ACTIVATED',
        'store',
        storeId,
        { store_name: storeName, new_status: !currentStatus }
      );

      toast.success(`Loja ${storeName} ${!currentStatus ? 'ativada' : 'desativada'}`);
      fetchStores();
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Erro ao atualizar status da loja');
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Gestão de Lojas
        </CardTitle>
        <CardDescription>
          Gerencie todas as lojas da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da loja ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stores Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loja</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={store.logo_url} />
                        <AvatarFallback className="text-xs">
                          {store.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{store.name}</span>
                        <span className="text-xs text-muted-foreground">
                          /{store.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={store.owner?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {store.owner?.full_name?.charAt(0) || store.owner?.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {store.owner?.full_name || 'Sem nome'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {store.owner?.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{store._count.products}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        R$ {store.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStoreStatus(store.id, store.is_active, store.name)}
                      className="p-1 h-auto"
                    >
                      <Badge 
                        className={store.is_active 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {store.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(store.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma loja encontrada
          </div>
        )}
      </CardContent>
    </Card>
  );
}