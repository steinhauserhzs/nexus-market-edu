import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEOHead from "@/components/ui/seo-head";
import BackNavigation from "@/components/layout/back-navigation"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Store as StoreIcon,
  Globe,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Save
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  owner_id: string;
  created_at: string;
}

const StoreConfiguracoes = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (slug && user) {
      fetchStore();
    }
  }, [slug, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchStore = async () => {
    try {
      setLoading(true);
      
      const { data: storeData, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('owner_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Loja não encontrada",
            description: "Esta loja não existe ou você não tem permissão para editá-la",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setStore(storeData);
    } catch (error: any) {
      console.error('Error fetching store:', error);
      toast({
        title: "Erro ao carregar loja",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!store) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('stores')
        .update({ is_active: !store.is_active })
        .eq('id', store.id);

      if (error) throw error;

      setStore({ ...store, is_active: !store.is_active });
      
      toast({
        title: store.is_active ? "Loja desativada" : "Loja ativada",
        description: store.is_active 
          ? "Sua loja não aparecerá mais publicamente" 
          : "Sua loja está visível publicamente",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar loja",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Carregando..." />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Loja não encontrada" />
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <StoreIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            Esta loja não existe ou você não tem permissão para editá-la
          </p>
          <Button onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`Configurações - ${store.name} - Nexus Market`}
        description={`Configure as opções da loja ${store.name}.`}
      />
      
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Configurações da Loja" />
        
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Store Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <StoreIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{store.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Globe className="w-3 h-3 mr-1" />
                    {store.slug}
                  </Badge>
                  <Badge variant={store.is_active ? "default" : "secondary"}>
                    {store.is_active ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Inativa
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Cards */}
          <div className="space-y-6">
            {/* Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visibilidade da Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Status da Loja</h3>
                    <p className="text-sm text-muted-foreground">
                      {store.is_active 
                        ? "Sua loja está visível publicamente" 
                        : "Sua loja está oculta do público"
                      }
                    </p>
                  </div>
                  <Button
                    onClick={handleToggleActive}
                    disabled={saving}
                    variant={store.is_active ? "destructive" : "default"}
                  >
                    {saving ? (
                      "Salvando..."
                    ) : store.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Store Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Informações da Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Loja</label>
                    <p className="text-muted-foreground">{store.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL da Loja</label>
                    <p className="text-muted-foreground">{store.slug}</p>
                  </div>
                </div>
                {store.description && (
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <p className="text-muted-foreground">{store.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Criada em</label>
                  <p className="text-muted-foreground">
                    {new Date(store.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Ações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-destructive">Excluir Loja</h3>
                    <p className="text-sm text-muted-foreground">
                      Esta ação não pode ser desfeita. Todos os produtos e dados serão perdidos.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreConfiguracoes;