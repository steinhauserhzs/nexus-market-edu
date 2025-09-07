import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  compare_price_cents: number | null;
  type: string;
  featured: boolean;
  total_lessons: number | null;
  total_duration_minutes: number | null;
  status: string;
  store_id: string | null;
  category_id: string | null;
  slug: string;
  stores?: {
    name: string;
    slug: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

// Cache global para produtos
const productsCache = new Map<string, { data: Product[]; timestamp: number }>();

// Cache global para categorias (dados mais estáticos)
let categoriesCache: { data: Category[]; timestamp: number } = { data: [], timestamp: 0 };

export const useOptimizedProducts = (filters?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  storeId?: string;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create cache key based on filters
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      category: filters?.category,
      featured: filters?.featured,
      limit: filters?.limit,
      storeId: filters?.storeId
    });
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    // Check cache first (3 minutes)
    const cached = productsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3 * 60 * 1000) {
      setProducts(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select(`
          *,
          stores:stores(name, slug),
          categories:categories(name, slug)
        `)
        .eq('status', 'published');

      if (filters?.category) {
        query = query.eq('categories.slug', filters.category);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.storeId) {
        query = query.eq('store_id', filters.storeId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const productData = data || [];
      
      // Cache the result
      productsCache.set(cacheKey, { data: productData, timestamp: Date.now() });
      setProducts(productData);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.featured, filters?.limit, filters?.storeId, cacheKey, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useOptimizedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    // Check cache first (10 minutes - categorias mudam pouco)
    if (categoriesCache.data.length > 0 && Date.now() - categoriesCache.timestamp < 10 * 60 * 1000) {
      setCategories(categoriesCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const categoryData = data || [];
      
      // Cache the result
      categoriesCache = { data: categoryData, timestamp: Date.now() };
      setCategories(categoryData);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error.message);
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};