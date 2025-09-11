import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MemberAreaContent {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  thumbnail_url?: string;
  duration?: number;
  completed?: boolean;
}

interface MemberAreaData {
  store: {
    id: string;
    name: string;
    description: string;
    logo_url?: string;
  };
  content: MemberAreaContent[];
  progress: number;
}

const NetflixMemberArea = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<MemberAreaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !storeSlug) return;
    
    loadMemberArea();
  }, [user, storeSlug]);

  const loadMemberArea = async () => {
    try {
      // Fetch store data
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, name, description, logo_url')
        .eq('slug', storeSlug)
        .single();

      if (storeError) throw storeError;

      // Check if user has access (has active license for any product in this store)
      const { data: licenses, error: licensesError } = await supabase
        .from('licenses')
        .select(`
          id,
          products:product_id(
            id,
            title,
            type,
            store_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (licensesError) throw licensesError;

      const hasAccess = licenses?.some((license: any) => 
        license.products?.store_id === store.id
      );

      if (!hasAccess) {
        toast({
          title: "Acesso negado",
          description: "Você não tem acesso a esta área de membros.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Fetch member area content
      const { data: content, error: contentError } = await supabase
        .from('member_exclusive_content')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('sort_order');

      if (contentError) throw contentError;

      // Mock progress calculation
      const progress = Math.floor(Math.random() * 100);

      setData({
        store,
        content: (content || []).map(item => ({
          id: item.id,
          title: item.title,
          type: item.content_type as 'video' | 'text' | 'quiz',
          thumbnail_url: undefined,
          duration: undefined,
          completed: false
        })),
        progress
      });

    } catch (error) {
      console.error('Error loading member area:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar área de membros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (contentId: string, type: string) => {
    if (type === 'video') {
      navigate(`/member-area/${storeSlug}/content/${contentId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Área de membros não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {data.store.logo_url && (
                <img 
                  src={data.store.logo_url} 
                  alt={data.store.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{data.store.name}</h1>
                <p className="text-gray-400 text-sm">Área de Membros</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                {data.progress}% Concluído
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            {data.store.description || 'Continue seu aprendizado com nosso conteúdo exclusivo.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Conteúdos
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.content.length}</div>
              <p className="text-xs text-gray-500">
                Disponíveis para você
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Progresso
              </CardTitle>
              <Trophy className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{data.progress}%</div>
              <p className="text-xs text-gray-500">
                Do curso concluído
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Comunidade
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1.2k</div>
              <p className="text-xs text-gray-500">
                Membros ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold mb-6">Conteúdo Exclusivo</h3>
          
          {data.content.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                  <h4 className="text-lg font-medium text-gray-300 mb-2">
                    Nenhum conteúdo disponível
                  </h4>
                  <p className="text-gray-500">
                    O criador ainda não adicionou conteúdo exclusivo.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.content.map((item) => (
                <Card 
                  key={item.id} 
                  className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  onClick={() => handleContentClick(item.id, item.type)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-video bg-gray-800 rounded-t-lg flex items-center justify-center">
                        {item.type === 'video' && (
                          <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                        )}
                        {item.type === 'text' && (
                          <BookOpen className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <Badge 
                        className="absolute top-2 right-2 bg-red-600/90 text-white"
                      >
                        {item.type === 'video' ? 'Vídeo' : 'Texto'}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-white mb-2">{item.title}</h4>
                      {item.duration && (
                        <p className="text-sm text-gray-400">
                          {Math.floor(item.duration / 60)}min
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetflixMemberArea;