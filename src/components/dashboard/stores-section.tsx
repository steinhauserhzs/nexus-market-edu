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
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Logo */}
                <div className="w-12 h-12 xs:w-16 xs:h-16 rounded-lg border flex items-center justify-center bg-background flex-shrink-0">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={`${store.name} logo`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <StoreIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                {/* Store Info and Actions Container */}
                <div className="flex-1 min-w-0 flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
                  {/* Store Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-sm sm:text-base">{store.name}</h3>
                      <Badge 
                        variant={store.is_active ? "default" : "secondary"}
                        className="text-xs flex-shrink-0"
                      >
                        {store.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">/{store.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{store._count?.products || 0} produtos</span>
                      </div>
                    </div>
                    
                    {store.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                        {store.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/loja/${store.slug}/customizar`)}
                      className="hidden sm:flex"
                    >
                      <Palette className="w-4 h-4 mr-1" />
                      Personalizar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/loja/${store.slug}/customizar`)}
                      className="sm:hidden"
                      title="Personalizar"
                    >
                      <Palette className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/loja/${store.slug}`)}
                      className="hidden xs:flex"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/loja/${store.slug}`)}
                      className="xs:hidden"
                      title="Ver loja"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/loja/${store.slug}/configuracoes`)}
                      title="Configurações"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant={store.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(store.id, store.is_active)}
                      className="text-xs px-2 sm:px-3"
                    >
                      <span className="hidden xs:inline">
                        {store.is_active ? "Desativar" : "Ativar"}
                      </span>
                      <span className="xs:hidden">
                        {store.is_active ? "Off" : "On"}
                      </span>
                    </Button>
                  </div>
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