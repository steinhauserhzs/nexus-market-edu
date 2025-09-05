import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, Award, Download, PlayCircle } from "lucide-react";

interface ProductInfoProps {
  description?: string;
  metaDescription?: string;
  productType: string;
}

export default function ProductInfo({ 
  description, 
  metaDescription, 
  productType 
}: ProductInfoProps) {
  // Mock features based on product type
  const getFeatures = (type: string) => {
    const baseFeatures = [
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão",
      "Suporte direto com instrutor",
      "30 dias de garantia"
    ];

    switch (type.toLowerCase()) {
      case 'digital':
      case 'curso':
        return [
          ...baseFeatures,
          "Material complementar para download",
          "Exercícios práticos",
          "Acesso via mobile e desktop",
          "Fórum exclusivo de alunos"
        ];
      case 'ebook':
        return [
          "Download em PDF",
          "Compatível com todos os dispositivos",
          "Atualizações gratuitas",
          "Bônus exclusivos"
        ];
      default:
        return baseFeatures;
    }
  };

  const features = getFeatures(productType);

  const benefits = [
    {
      icon: Clock,
      title: "Aprenda no seu ritmo",
      description: "Acesse quando e onde quiser, sem pressa"
    },
    {
      icon: Users,
      title: "Comunidade ativa",
      description: "Conecte-se com outros alunos e networking"
    },
    {
      icon: Award,
      title: "Certificado reconhecido",
      description: "Comprove suas habilidades com certificação"
    },
    {
      icon: Download,
      title: "Material completo",
      description: "Downloads, templates e recursos extras"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Description */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Sobre este produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {description || "Produto incrível com conteúdo de alta qualidade para transformar sua carreira e conhecimento."}
          </p>
          
          {metaDescription && metaDescription !== description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {metaDescription}
            </p>
          )}
        </CardContent>
      </Card>

      {/* What You'll Get */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">O que você vai receber</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 sm:gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <Card key={index}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10 flex-shrink-0">
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium mb-1 text-sm sm:text-base">{benefit.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Prerequisites */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Pré-requisitos</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Acesso à internet</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Computador, tablet ou smartphone</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Vontade de aprender</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}