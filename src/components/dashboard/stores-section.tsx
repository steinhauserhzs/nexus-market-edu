import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Store as StoreIcon, 
  Plus, 
  Eye, 
  Settings, 
  Package,
  Globe,
  Users,
  TrendingUp,
  Palette
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  theme: any;
  is_active: boolean;
  created_at: string;
  _count?: {
    products: number;
  };
}

const StoresSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      const { data: storesData, error } = await supabase
        .from('stores')
        .select(`
          *,
          products(count)
        `)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include product count
      const storesWithCount = storesData?.map(store => ({
        ...store,
        _count: {
          products: store.products?.length || 0
        }
      })) || [];

      setStores(storesWithCount);
      
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Erro ao carregar lojas",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !currentStatus })
        .eq('id', storeId);

      if (error) throw error;

      setStores(prev => prev.map(store => 
        store.id === storeId 
          ? { ...store, is_active: !currentStatus }
          : store
      ));

      toast({
        title: currentStatus ? "Loja desativada" : "Loja ativada",
        description: `Sua loja foi ${currentStatus ? 'desativada' : 'ativada'} com sucesso`,
      });
      
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon className="w-5 h-5" />
            Minhas Lojas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StoreIcon className="w-5 h-5" />
          Minhas Lojas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stores.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <StoreIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma loja ainda</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira loja personalizada e comece a vender
            </p>
            <Button onClick={() => navigate('/criar-loja')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Loja
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex flex-col gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Header: Logo + Store Info */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg border flex items-center justify-center bg-background flex-shrink-0">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <StoreIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base leading-tight">{store.name}</h3>
                      <Badge 
                        variant={store.is_active ? "default" : "secondary"}
                        className="text-xs flex-shrink-0"
                      >
                        {store.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">/{store.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 flex-shrink-0" />
                        <span>{store._count?.products || 0} produtos</span>
                      </div>
                    </div>
                    
                    {store.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {store.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/loja/${store.slug}/customizar`)}
                    className="flex items-center gap-2 flex-1 min-w-[120px]"
                  >
                    <Palette className="w-4 h-4" />
                    Personalizar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/loja/${store.slug}/membros-config`)}
                    className="flex items-center gap-2 flex-1 min-w-[130px]"
                  >
                    <Users className="w-4 h-4" />
                    Área Membros
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/loja/${store.slug}`)}
                    className="flex items-center gap-2 flex-1 min-w-[90px]"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Loja
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/loja/${store.slug}/configuracoes`)}
                    className="w-10 h-8 p-0 flex items-center justify-center"
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant={store.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(store.id, store.is_active)}
                    className="flex items-center gap-2 min-w-[80px]"
                  >
                    {store.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoresSection;