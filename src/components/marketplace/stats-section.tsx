import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, BookOpen, Star, Award, PlayCircle } from "lucide-react";

interface StatsSectionProps {
  stats?: {
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    averageRating: number;
    totalHours: number;
    completionRate: number;
  };
}

export default function StatsSection({ 
  stats = {
    totalCourses: 1247,
    totalStudents: 52340,
    totalInstructors: 186,
    averageRating: 4.8,
    totalHours: 8920,
    completionRate: 89
  }
}: StatsSectionProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statItems = [
    {
      icon: BookOpen,
      label: "Cursos Disponíveis",
      value: formatNumber(stats.totalCourses),
      description: "Conteúdo sempre atualizado",
      color: "text-blue-500"
    },
    {
      icon: Users,
      label: "Alunos Ativos",
      value: formatNumber(stats.totalStudents),
      description: "Comunidade engajada",
      color: "text-accent"
    },
    {
      icon: Award,
      label: "Instrutores Especialistas",
      value: formatNumber(stats.totalInstructors),
      description: "Profissionais qualificados",
      color: "text-purple-500"
    },
    {
      icon: Star,
      label: "Avaliação Média",
      value: stats.averageRating.toFixed(1),
      description: "Satisfação garantida",
      color: "text-yellow-500"
    },
    {
      icon: PlayCircle,
      label: "Horas de Conteúdo",
      value: formatNumber(stats.totalHours),
      description: "Aprendizado completo",
      color: "text-red-500"
    },
    {
      icon: TrendingUp,
      label: "Taxa de Conclusão",
      value: `${stats.completionRate}%`,
      description: "Resultados comprovados",
      color: "text-accent"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Números que Falam por Si
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Uma plataforma em constante crescimento com milhares de alunos transformando suas carreiras todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          {statItems.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-muted group-hover:bg-accent/10 transition-colors">
                      <IconComponent className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {stat.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}