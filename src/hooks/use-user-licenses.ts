import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserLicense {
  id: string;
  product_id: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  product: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    slug: string;
    type: string;
    store_id: string;
    store: {
      name: string;
      slug: string;
    };
  };
}

export function useUserLicenses() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<UserLicense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLicenses();
    }
  }, [user]);

  const fetchLicenses = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select(`
          id,
          product_id,
          is_active,
          expires_at,
          created_at,
          products!inner(
            id,
            title,
            description,
            thumbnail_url,
            slug,
            type,
            store_id,
            stores!inner(
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar os dados para o formato esperado
      const formattedLicenses = data?.map(license => ({
        id: license.id,
        product_id: license.product_id,
        is_active: license.is_active,
        expires_at: license.expires_at,
        created_at: license.created_at,
        product: {
          id: license.products.id,
          title: license.products.title,
          description: license.products.description,
          thumbnail_url: license.products.thumbnail_url,
          slug: license.products.slug,
          type: license.products.type,
          store_id: license.products.store_id,
          store: {
            name: license.products.stores.name,
            slug: license.products.stores.slug
          }
        }
      })) || [];

      setLicenses(formattedLicenses);
    } catch (error) {
      console.error('Error fetching user licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasLicense = (productId: string) => {
    return licenses.some(license => 
      license.product_id === productId && 
      license.is_active &&
      (!license.expires_at || new Date(license.expires_at) > new Date())
    );
  };

  const getLicenseByProductId = (productId: string) => {
    return licenses.find(license => 
      license.product_id === productId && 
      license.is_active &&
      (!license.expires_at || new Date(license.expires_at) > new Date())
    );
  };

  return {
    licenses,
    loading,
    hasLicense,
    getLicenseByProductId,
    refetch: fetchLicenses
  };
}