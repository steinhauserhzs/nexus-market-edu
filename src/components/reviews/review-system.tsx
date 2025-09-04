import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewSystemProps {
  productId: string;
  hasAccess?: boolean;
  allowReviews?: boolean;
}

const ReviewSystem = ({ 
  productId, 
  hasAccess = false, 
  allowReviews = true 
}: ReviewSystemProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [userHasReview, setUserHasReview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles:profiles(full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      
      // Check if user already has a review
      if (user) {
        const userReview = data?.find(r => r.user_id === user.id);
        setUserHasReview(!!userReview);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Erro ao carregar avaliações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user || !newReview.rating) {
      toast({
        title: "Erro",
        description: "Faça login e selecione uma nota para avaliar.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating: newReview.rating,
          comment: newReview.comment || null
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por sua avaliação.",
      });

      setNewReview({ rating: 0, comment: '' });
      fetchReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size,
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
            onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: star })) : undefined}
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Avaliações dos Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center">
                  {renderStars(Math.round(averageRating), false, "w-5 h-5")}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star as keyof typeof ratingDistribution];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-8">{star}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Review Form */}
      {allowReviews && user && hasAccess && !userHasReview && (
        <Card>
          <CardHeader>
            <CardTitle>Avaliar Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sua Nota *</label>
              <div className="flex items-center gap-2">
                {renderStars(newReview.rating, true, "w-6 h-6")}
                <span className="text-sm text-muted-foreground ml-2">
                  {newReview.rating > 0 && `${newReview.rating} estrela${newReview.rating !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comentário (opcional)</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Compartilhe sua experiência com este produto..."
                rows={3}
              />
            </div>

            <Button 
              onClick={submitReview}
              disabled={submitting || newReview.rating === 0}
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma Avaliação</h3>
              <p className="text-muted-foreground">
                Seja o primeiro a avaliar este produto!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {review.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {review.profiles?.full_name || 'Usuário Anônimo'}
                        </p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {review.comment && (
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        Útil ({review.helpful_votes})
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsDown className="w-4 h-4" />
                        Não útil
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Access Notice */}
      {allowReviews && !hasAccess && (
        <Card className="bg-muted/20">
          <CardContent className="pt-6 text-center">
            <Badge variant="outline" className="mb-2">Avaliação Restrita</Badge>
            <p className="text-sm text-muted-foreground">
              Apenas usuários que adquiriram o produto podem fazer avaliações.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Already Reviewed */}
      {user && hasAccess && userHasReview && (
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6 text-center">
            <Badge variant="outline" className="mb-2">Avaliação Enviada</Badge>
            <p className="text-sm text-muted-foreground">
              Obrigado por sua avaliação! Você já avaliou este produto.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewSystem;