import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MemberAreaConfig {
  id?: string;
  store_id: string;
  custom_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  welcome_message: string | null;
  welcome_video_url: string | null;
  is_active: boolean;
  show_other_products: boolean;
  show_progress_tracking: boolean;
}

interface ExclusiveContent {
  id: string;
  title: string;
  content_type: 'text' | 'video' | 'download' | 'link';
  content: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Store {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  slug: string;
  owner_id: string;
}

export const useMemberArea = (storeSlug?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [config, setConfig] = useState<MemberAreaConfig | null>(null);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const checkMembership = async (storeId: string) => {
    if (!user) return false;

    const { data: userLicenses } = await supabase
      .from('licenses')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    const storeLicenses = userLicenses?.filter(
      license => license.product?.store_id === storeId
    ) || [];

    setLicenses(storeLicenses);
    return storeLicenses.length > 0;
  };

  const loadStore = async () => {
    if (!storeSlug) return null;

    const { data: storeData, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', storeSlug)
      .eq('is_active', true)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Loja não encontrada.",
        variant: "destructive",
      });
      return null;
    }

    setStore(storeData);
    setIsOwner(user?.id === storeData.owner_id);
    return storeData;
  };

  const loadMemberAreaConfig = async (storeId: string) => {
    const { data: configData } = await supabase
      .from('member_area_configs')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .single();

    setConfig(configData);
    return configData;
  };

  const loadExclusiveContent = async (storeId: string) => {
    const { data: contentData } = await supabase
      .from('member_exclusive_content')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('sort_order');

    const typedContent: ExclusiveContent[] = (contentData || []).map(item => ({
      ...item,
      content_type: item.content_type as 'text' | 'video' | 'download' | 'link'
    }));

    setExclusiveContent(typedContent);
    return typedContent;
  };

  const loadStoreProducts = async (storeId: string, excludeOwned = false) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('status', 'published');

    if (excludeOwned && licenses.length > 0) {
      const ownedProductIds = licenses.map(l => l.product_id);
      query = query.not('id', 'in', `(${ownedProductIds.join(',')})`);
    }

    const { data: productsData } = await query;
    setProducts(productsData || []);
    return productsData || [];
  };

  const saveMemberAreaConfig = async (configData: Partial<MemberAreaConfig>) => {
    if (!store) return false;

    try {
      if (config?.id) {
        const { error } = await supabase
          .from('member_area_configs')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('member_area_configs')
          .insert({ ...configData, store_id: store.id })
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addExclusiveContent = async (contentData: Omit<ExclusiveContent, 'id'>) => {
    if (!store) return false;

    try {
      const { data, error } = await supabase
        .from('member_exclusive_content')
        .insert({ ...contentData, store_id: store.id })
        .select()
        .single();

      if (error) throw error;

      setExclusiveContent(prev => [...prev, {
        ...data,
        content_type: data.content_type as 'text' | 'video' | 'download' | 'link'
      }]);

      toast({
        title: "Sucesso",
        description: "Conteúdo adicionado com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateExclusiveContent = async (contentId: string, updates: Partial<ExclusiveContent>) => {
    try {
      const { error } = await supabase
        .from('member_exclusive_content')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;

      setExclusiveContent(prev => prev.map(item => 
        item.id === contentId ? { ...item, ...updates } : item
      ));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return false;
    }
  };

  const removeExclusiveContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('member_exclusive_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setExclusiveContent(prev => prev.filter(item => item.id !== contentId));

      toast({
        title: "Sucesso",
        description: "Conteúdo removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conteúdo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const loadMemberArea = async () => {
    setLoading(true);
    try {
      const storeData = await loadStore();
      if (!storeData) return;

      const isMemberResult = await checkMembership(storeData.id);
      setIsMember(isMemberResult);

      if (isMemberResult || user?.id === storeData.owner_id) {
        await Promise.all([
          loadMemberAreaConfig(storeData.id),
          loadExclusiveContent(storeData.id),
          loadStoreProducts(storeData.id, true)
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar área de membros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar área de membros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeSlug && user) {
      loadMemberArea();
    } else if (!user) {
      setLoading(false);
    }
  }, [storeSlug, user]);

  return {
    store,
    config,
    exclusiveContent,
    licenses,
    products,
    loading,
    isMember,
    isOwner,
    saveMemberAreaConfig,
    addExclusiveContent,
    updateExclusiveContent,
    removeExclusiveContent,
    loadMemberArea,
    setConfig
  };
};