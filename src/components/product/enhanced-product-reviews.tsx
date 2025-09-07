import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, ThumbsUp, MoreVertical } from "lucide-react";
import { useProductReviews } from "@/hooks/use-product-reviews";
import { useAuth } from "@/contexts/AuthContext";
import RatingDisplay from "@/components/ui/rating-display";
import RatingInput from "@/components/ui/rating-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedProductReviewsProps {
  productId: string;
}

export default function EnhancedProductReviews({ productId }: EnhancedProductReviewsProps) {
  const { user } = useAuth();
  const { reviews, stats, loading, submitting, userReview, submitReview, deleteReview } = useProductReviews(productId);
  
  const [newRating, setNewRating] = useState(userReview?.rating || 0);
  const [newComment, setNewComment] = useState(userReview?.comment || "");
  const [isWritingReview, setIsWritingReview] = useState(false);

  const handleSubmitReview = async () => {
    if (newRating === 0) return;
    
    await submitReview(newRating, newComment);
    setIsWritingReview(false);
    setNewComment("");
    setNewRating(0);
  };

  const handleEditReview = () => {
    if (userReview) {
      setNewRating(userReview.rating);
      setNewComment(userReview.comment || "");
      setIsWritingReview(true);
    }
  };

  const handleCancelEdit = () => {
    setIsWritingReview(false);
    setNewRating(userReview?.rating || 0);
    setNewComment(userReview?.comment || "");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Avaliações ({stats.totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.totalReviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side - Overall rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <RatingDisplay rating={stats.averageRating} size="lg" showNumber={false} />
                <p className="text-muted-foreground mt-2">
                  Baseado em {stats.totalReviews} avaliação{stats.totalReviews !== 1 ? 'ões' : ''}
                </p>
              </div>

              {/* Right side - Rating distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}</span>
                    <RatingDisplay rating={rating} maxRating={1} size="sm" showNumber={false} />
                    <Progress 
                      value={(stats.ratingDistribution[rating] / stats.totalReviews) * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Seja o primeiro a avaliar</h3>
              <p className="text-muted-foreground">
                Compartilhe sua experiência com outros usuários
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Review Form */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>
              {userReview && !isWritingReview ? 'Sua Avaliação' : 'Escrever Avaliação'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userReview && !isWritingReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <RatingDisplay rating={userReview.rating} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleEditReview}>
                        Editar avaliação
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={deleteReview} className="text-destructive">
                        Remover avaliação
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {userReview.comment && (
                  <p className="text-sm">{userReview.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Avaliado em {new Date(userReview.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Sua avaliação</label>
                  <RatingInput
                    value={newRating}
                    onChange={setNewRating}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Comentário (opcional)
                  </label>
                  <Textarea
                    placeholder="Conte sobre sua experiência com este produto..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={newRating === 0 || submitting}
                    className="flex-1 sm:flex-none"
                  >
                    {submitting ? 'Enviando...' : userReview ? 'Atualizar' : 'Publicar Avaliação'}
                  </Button>
                  {isWritingReview && (
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Todas as Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials('Usuário')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                          <span className="font-medium">Usuário</span>
                          <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        {review.comment && (
                          <p className="text-sm mb-3 break-words">{review.comment}</p>
                        )}
                        
                        {review.helpful_votes > 0 && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">
                              {review.helpful_votes} pessoa{review.helpful_votes !== 1 ? 's' : ''} achou{review.helpful_votes === 1 ? 'ou' : 'aram'} útil
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator className="mt-6" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}