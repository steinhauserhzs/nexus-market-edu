import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  helpful_votes: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function useProductReviews(productId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchUserReview();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      setUserReview(data);
    } catch (error) {
      // Usuário não tem review ainda
      setUserReview(null);
    }
  };

  const calculateStats = (reviewsData: ProductReview[]) => {
    const totalReviews = reviewsData.length;
    
    if (totalReviews === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      return;
    }

    const ratingSum = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = ratingSum / totalReviews;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    setStats({
      averageRating,
      totalReviews,
      ratingDistribution
    });
  };

  const submitReview = async (rating: number, comment?: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para avaliar');
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        // Atualizar review existente
        const { error } = await supabase
          .from('product_reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success('Avaliação atualizada com sucesso!');
      } else {
        // Criar nova review
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            product_id: productId,
            user_id: user.id,
            rating,
            comment
          });

        if (error) throw error;
        toast.success('Avaliação enviada com sucesso!');
      }

      await fetchReviews();
      await fetchUserReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!userReview || !user) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', userReview.id);

      if (error) throw error;

      toast.success('Avaliação removida com sucesso!');
      await fetchReviews();
      setUserReview(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erro ao remover avaliação');
    }
  };

  return {
    reviews,
    stats,
    loading,
    submitting,
    userReview,
    submitReview,
    deleteReview,
    refetch: fetchReviews
  };
}