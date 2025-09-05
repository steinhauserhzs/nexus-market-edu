import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Target } from "lucide-react";

interface AchievementBadgeProps {
  type: string;
  title: string;
  description: string;
  points: number;
  earnedAt?: string;
  className?: string;
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'course_completion':
      return Trophy;
    case 'video_completion':
      return Star;
    case 'community_participation':
      return Award;
    default:
      return Target;
  }
};

const getAchievementColor = (type: string) => {
  switch (type) {
    case 'course_completion':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'video_completion':
      return 'bg-gradient-to-r from-blue-400 to-purple-500';
    case 'community_participation':
      return 'bg-gradient-to-r from-green-400 to-teal-500';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

export default function AchievementBadge({
  type,
  title,
  description,
  points,
  earnedAt,
  className
}: AchievementBadgeProps) {
  const Icon = getAchievementIcon(type);
  const colorClass = getAchievementColor(type);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      <div className={cn("absolute inset-0 opacity-10", colorClass)} />
      
      <div className="relative flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full text-white",
          colorClass
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              +{points} pts
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {earnedAt && (
            <p className="text-xs text-muted-foreground">
              Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}