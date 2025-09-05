import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamification } from "@/hooks/use-gamification";
import { Trophy, Star, TrendingUp, Users, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationDashboardProps {
  storeId: string;
  className?: string;
}

export const GamificationDashboard = ({ storeId, className }: GamificationDashboardProps) => {
  const {
    userPoints,
    achievements,
    leaderboard,
    loading,
    loadUserPoints,
    loadAchievements,
    loadLeaderboard
  } = useGamification(storeId);

  useEffect(() => {
    if (storeId) {
      loadUserPoints();
      loadAchievements();
      loadLeaderboard();
    }
  }, [storeId, loadUserPoints, loadAchievements, loadLeaderboard]);

  const getNextLevelXP = (currentLevel: number) => {
    return currentLevel * 1000;
  };

  const getCurrentLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelXP = (userPoints.level - 1) * 1000;
    const nextLevelXP = userPoints.level * 1000;
    const progressInLevel = userPoints.experience - currentLevelXP;
    const totalLevelXP = nextLevelXP - currentLevelXP;
    return Math.min(100, (progressInLevel / totalLevelXP) * 100);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Medal className="w-4 h-4 text-amber-600" />;
      default: return <span className="text-sm font-medium">#{rank}</span>;
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'video_completion': return '📹';
      case 'course_completion': return '🎓';
      case 'login_streak': return '🔥';
      case 'community_participation': return '💬';
      case 'content_creation': return '✨';
      default: return '🏆';
    }
  };

  if (loading && !userPoints) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.level || 1}</div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>{Math.round(getCurrentLevelProgress())}%</span>
              </div>
              <Progress value={getCurrentLevelProgress()} className="h-1" />
              <p className="text-xs text-muted-foreground">
                {userPoints ? getNextLevelXP(userPoints.level) - userPoints.experience : 1000} XP para o próximo nível
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.total_points || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userPoints?.experience || 0} XP acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              Badges desbloqueados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suas Conquistas</CardTitle>
              <CardDescription>
                Badges e marcos alcançados na sua jornada de aprendizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma conquista ainda</p>
                  <p className="text-sm">Complete vídeos e participe da comunidade para ganhar badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getAchievementIcon(achievement.achievement_type)}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.points_awarded} XP
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Mensal</CardTitle>
              <CardDescription>
                Top 10 membros mais ativos do mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ranking disponível</p>
                  <p className="text-sm">Seja o primeiro a aparecer no ranking!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                        entry.user_id === userPoints?.user_id ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {entry.profile?.full_name || 'Usuário Anônimo'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.points} pontos
                        </div>
                      </div>

                      {entry.user_id === userPoints?.user_id && (
                        <Badge variant="outline" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadLeaderboard()}
                  className="w-full"
                >
                  Atualizar Ranking
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};