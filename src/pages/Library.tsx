import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, BookOpen, Clock, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackNavigation from "@/components/layout/back-navigation";
import MainHeader from "@/components/layout/main-header";

interface License {
  id: string;
  product: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    type: string;
    total_lessons: number;
    total_duration_minutes: number;
  };
  expires_at: string | null;
  created_at: string;
}

const Library = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchLicenses();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchLicenses = async () => {
    try {
      console.log('[Library] Fetching licenses...');
      // 1) Buscar apenas dados da licença (sem join, pois não há FK configurada)
      const { data: licenseRows, error: licError } = await supabase
        .from('licenses')
        .select('id, product_id, expires_at, created_at')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (licError) throw licError;

      if (!licenseRows || licenseRows.length === 0) {
        console.log('[Library] No licenses');
        setLicenses([]);
        return;
      }

      const productIds = licenseRows
        .map((l: any) => l.product_id)
        .filter(Boolean);

      if (productIds.length === 0) {
        setLicenses([]);
        return;
      }

      // 2) Buscar produtos separados e mesclar
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, title, description, thumbnail_url, type, total_lessons, total_duration_minutes, status')
        .in('id', productIds);

      if (prodError) throw prodError;

      const productMap = new Map(products?.map((p: any) => [p.id, p]));

      const merged: License[] = licenseRows.map((l: any) => ({
        id: l.id,
        expires_at: l.expires_at,
        created_at: l.created_at,
        product: {
          id: l.product_id,
          title: productMap.get(l.product_id)?.title ?? 'Produto indisponível',
          description: productMap.get(l.product_id)?.description ?? 'Este item não está disponível no momento.',
          thumbnail_url: productMap.get(l.product_id)?.thumbnail_url ?? null,
          type: productMap.get(l.product_id)?.type ?? 'digital',
          total_lessons: productMap.get(l.product_id)?.total_lessons ?? 0,
          total_duration_minutes: productMap.get(l.product_id)?.total_duration_minutes ?? 0,
        }
      }));

      setLicenses(merged);
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      toast({
        title: 'Erro ao carregar biblioteca',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('[Library] Loading finished');
    }
  };
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'digital': 'Digital',
      'curso': 'Curso',
      'fisico': 'Físico',
      'servico': 'Serviço',
      'bundle': 'Bundle',
      'assinatura': 'Assinatura'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Faça login para acessar sua biblioteca
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <BackNavigation title="Minha Biblioteca" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minha Biblioteca</h1>
          <p className="text-muted-foreground">
            Acesse todos os seus cursos e conteúdos adquiridos
          </p>
        </div>

        {licenses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
                <h2 className="text-xl font-semibold">Biblioteca Vazia</h2>
                <p className="text-muted-foreground">
                  Você ainda não possui nenhum curso ou conteúdo.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Explorar Cursos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map((license) => (
              <Card key={license.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                    {license.product.thumbnail_url ? (
                      <img 
                        src={license.product.thumbnail_url}
                        alt={license.product.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-accent">
                        <Play className="w-12 h-12 text-accent-foreground/80" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {getTypeLabel(license.product.type)}
                      </Badge>
                    </div>
                    
                    {license.expires_at && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                          Expira em {new Date(license.expires_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {license.product.title}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {license.product.description}
                  </p>
                  
                  {license.product.type === 'curso' && (
                    <>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {license.product.total_lessons > 0 && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            <span>{license.product.total_lessons} aulas</span>
                          </div>
                        )}
                        
                        {license.product.total_duration_minutes > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(license.product.total_duration_minutes)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progresso</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2" />
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      {license.product.type === 'curso' ? 'Continuar' : 'Acessar'}
                    </Button>
                    
                    {license.product.type === 'curso' && (
                      <Button variant="outline" size="sm">
                        <Award className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;