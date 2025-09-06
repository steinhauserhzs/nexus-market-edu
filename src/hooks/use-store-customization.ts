import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

export interface StoreTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

type StoreRow = Database['public']['Tables']['stores']['Row'];
type StoreUpdate = Database['public']['Tables']['stores']['Update'];

export const useStoreCustomization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStores = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Erro ao carregar lojas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStore = async (storeId: string, updates: StoreUpdate) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId);

      if (error) throw error;

      // Update local state
      setStores(prev => prev.map(store => 
        store.id === storeId ? { ...store, ...updates } : store
      ));

      toast({
        title: "Loja atualizada!",
        description: "Suas alterações foram salvas com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating store:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadStoreImage = async (
    file: File, 
    bucket: 'store-logos' | 'store-banners',
    storeId: string
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const applyTheme = (theme: StoreTheme) => {
    // Apply theme to CSS custom properties for real-time preview
    document.documentElement.style.setProperty('--store-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--store-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--store-accent', theme.accentColor);
    document.documentElement.style.setProperty('--store-background', theme.backgroundColor);
    document.documentElement.style.setProperty('--store-text', theme.textColor);
  };

  const resetTheme = () => {
    // Reset to default theme
    const defaultTheme: StoreTheme = {
      primaryColor: "#3b82f6",
      secondaryColor: "#6366f1",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    };
    applyTheme(defaultTheme);
  };

  useEffect(() => {
    fetchStores();
  }, [user]);

  return {
    stores,
    loading,
    saving,
    fetchStores,
    updateStore,
    uploadStoreImage,
    applyTheme,
    resetTheme,
  };
};