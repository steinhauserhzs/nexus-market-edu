import { useState, useEffect } from 'react';
import { Plus, Store, Settings, BarChart3, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  is_active: boolean;
  created_at: string;
  theme?: any;
}

export function ProducerStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [user]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as lojas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !currentStatus })
        .eq('id', storeId);

      if (error) throw error;

      setStores(stores.map(store => 
        store.id === storeId 
          ? { ...store, is_active: !currentStatus }
          : store
      ));

      toast({
        title: "Sucesso",
        description: `Loja ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da loja",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Minhas Lojas</h1>
          <p className="text-muted-foreground">Gerencie suas lojas virtuais</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Loja
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">Nenhuma loja encontrada</CardTitle>
            <CardDescription className="mb-4">
              Crie sua primeira loja para começar a vender
            </CardDescription>
            <Button className="bg-gradient-to-r from-primary to-primary-glow">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Loja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={store.logo_url} alt={store.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-glow/20">
                        {store.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{store.slug}</p>
                    </div>
                  </div>
                  <Badge variant={store.is_active ? "default" : "secondary"}>
                    {store.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {store.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {store.description}
                  </p>
                )}
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Config
                  </Button>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStoreStatus(store.id, store.is_active)}
                    className={store.is_active ? "text-warning hover:text-warning" : "text-success hover:text-success"}
                  >
                    {store.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProducerStores;