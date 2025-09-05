import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PageLoader from '@/components/ui/page-loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import CommunityHub from '@/components/community/CommunityHub';
import RealTimeChat from '@/components/chat/RealTimeChat';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import MemberAreaEditor from '@/components/editor/MemberAreaEditor';
import { MemberAreaDashboard } from '@/components/analytics/MemberAreaDashboard';
import { BookOpen, Users, MessageCircle, Gamepad2, Settings, BarChart3 } from 'lucide-react';

export default function MemberAreaAdvanced() {
  const { storeId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !storeId) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has access to this store
        const { data: licenses } = await supabase
          .from('licenses')
          .select(`
            *,
            product:products(
              *,
              store:stores(*)
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        const storeAccess = licenses?.find(license => 
          license.product?.store?.id === storeId
        );

        if (storeAccess) {
          setHasAccess(true);
          setStore(storeAccess.product.store);
          
          // Load member area config
          const { data: configData } = await supabase
            .from('member_area_configs')
            .select('*')
            .eq('store_id', storeId)
            .eq('is_active', true)
            .single();
          
          setConfig(configData);
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, storeId]);

  if (loading) {
    return <PageLoader text="Carregando área do membro..." />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você não tem acesso a esta área de membros.
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {store?.name} - Área do Membro
              </h1>
              <p className="text-muted-foreground">
                {config?.welcome_message || 'Bem-vindo à sua área exclusiva!'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <VoiceAssistant />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Comunidade
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Gamificação
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <div className="grid gap-6">
              {config?.welcome_video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vídeo de Boas-vindas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video 
                      src={config.welcome_video_url} 
                      controls 
                      className="w-full rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {config?.exclusive_content && config.exclusive_content.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo Exclusivo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.exclusive_content.map((content: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-semibold">{content.title}</h3>
                          <p className="text-muted-foreground">{content.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <CommunityHub storeId={storeId!} />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <RealTimeChat storeId={storeId!} />
          </TabsContent>

          <TabsContent value="gamification" className="mt-6">
            <GamificationDashboard storeId={storeId!} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <MemberAreaDashboard storeId={storeId!} />
          </TabsContent>

          <TabsContent value="editor" className="mt-6">
            <MemberAreaEditor storeId={storeId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}