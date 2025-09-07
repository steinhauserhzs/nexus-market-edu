import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

// Mock data - in real app, this would come from API
const mockReviews: Review[] = [
  {
    id: "1",
    userName: "Maria Santos",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    comment: "Curso excelente! Muito bem estruturado e com exemplos práticos. O instrutor explica de forma clara e didática. Recomendo demais!",
    date: "2024-01-15",
    helpful: 12,
    verified: true
  },
  {
    id: "2", 
    userName: "João Silva",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    comment: "Bom conteúdo, mas algumas aulas poderiam ser mais detalhadas. No geral, vale a pena!",
    date: "2024-01-10",
    helpful: 8,
    verified: true
  },
  {
    id: "3",
    userName: "Ana Costa",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", 
    rating: 5,
    comment: "Simplesmente incrível! Aprendi muito e já estou aplicando no meu trabalho. Material de apoio muito bom também.",
    date: "2024-01-08",
    helpful: 15,
    verified: true
  },
  {
    id: "4",
    userName: "Pedro Oliveira",
    rating: 3,
    comment: "Curso ok, mas esperava mais conteúdo prático. A parte teórica é boa.",
    date: "2024-01-05",
    helpful: 3,
    verified: false
  }
];

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews] = useState<Review[]>(mockReviews);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [sortBy, setSortBy] = useState("recent");

  const averageRating = 4.8;
  const totalReviews = 234;
  
  const ratingDistribution = [
    { stars: 5, count: 156, percentage: 67 },
    { stars: 4, count: 52, percentage: 22 },
    { stars: 3, count: 18, percentage: 8 },
    { stars: 2, count: 5, percentage: 2 },
    { stars: 1, count: 3, percentage: 1 },
  ];

  const handleSubmitReview = () => {
    if (newReview.trim() && newRating > 0) {
      // In real app, submit to API
      // Submit review functionality would be implemented here
      setNewReview("");
      setNewRating(0);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Avaliações dos Alunos</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">{averageRating}</div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.floor(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                {totalReviews} avaliações
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 w-10 sm:w-12">
                    <span className="text-xs sm:text-sm">{item.stars}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={item.percentage} className="flex-1" />
                  <div className="text-xs sm:text-sm text-muted-foreground w-6 sm:w-8">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Review */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Deixe sua Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <div>
            <label className="text-xs sm:text-sm font-medium">Sua nota:</label>
            <div className="mt-1">
              {renderStars(newRating, true, setNewRating)}
            </div>
          </div>
          
          <div>
            <label className="text-xs sm:text-sm font-medium">Seu comentário:</label>
            <Textarea
              placeholder="Compartilhe sua experiência com este curso..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="mt-1 text-sm"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSubmitReview}
            disabled={!newReview.trim() || newRating === 0}
            className="w-full sm:w-auto"
          >
            Enviar Avaliação
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg">Comentários dos Alunos</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="recent">Mais recentes</option>
                <option value="rating">Maior nota</option>
                <option value="helpful">Mais úteis</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 sm:pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage src={review.userAvatar} alt={review.userName} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {review.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-medium text-sm sm:text-base truncate">{review.userName}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Verificado
                          </Badge>
                        )}
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        Útil ({review.helpful})
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                        <ThumbsDown className="w-3 h-3" />
                        Não útil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4 sm:mt-6">
            <Button variant="outline" className="w-full sm:w-auto">
              Ver mais avaliações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}