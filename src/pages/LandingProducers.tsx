import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Users, 
  BarChart3, 
  Smartphone, 
  Bot, 
  MessageCircle,
  Trophy,
  CreditCard,
  Check,
  ArrowRight,
  Star,
  MonitorPlay
} from "lucide-react";

const LandingProducers = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MonitorPlay,
      title: "Streaming de Cursos",
      description: "Plataforma estilo Netflix para seus cursos e conteúdos educacionais"
    },
    {
      icon: Users,
      title: "Comunidade Integrada",
      description: "Chat em tempo real e fóruns para engajar seus alunos"
    },
    {
      icon: Trophy,
      title: "Gamificação",
      description: "Sistema de pontos, badges e leaderboards para motivar"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Métricas detalhadas de vendas, engajamento e progressão"
    },
    {
      icon: Smartphone,
      title: "App Nativo (PWA)",
      description: "Seus alunos podem instalar como app no celular"
    },
    {
      icon: Bot,
      title: "IA Integrada",
      description: "AI Store Analyzer para otimizar automaticamente sua loja"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Grátis",
      period: "",
      description: "Perfeito para começar",
      features: [
        "Até 3 produtos",
        "Área de membros básica",
        "Pagamentos via Stripe",
        "Suporte por email"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Pro",
      price: "R$ 97",
      period: "/mês",
      description: "Para produtores sérios",
      features: [
        "Produtos ilimitados",
        "Comunidade completa",
        "Analytics avançado",
        "Multi-nicho",
        "Suporte prioritário",
        "IA Store Analyzer"
      ],
      cta: "Assinar Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 297",
      period: "/mês",
      description: "Para escalar sem limites",
      features: [
        "Tudo do Pro",
        "White-label completo",
        "API personalizada",
        "Suporte 24/7",
        "Setup dedicado"
      ],
      cta: "Falar com Vendas",
      popular: false
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Crie sua loja",
      description: "Configure sua marca, cores e layout em minutos"
    },
    {
      number: "2", 
      title: "Publique produtos",
      description: "Adicione cursos, PDFs, packs e configure preços"
    },
    {
      number: "3",
      title: "Receba pagamentos",
      description: "Integração automática com Stripe e PIX"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Nexus Market - Plataforma para Produtores Digitais"
        description="Crie sua plataforma de cursos e membros estilo Netflix. Venda cursos, packs e PDFs com streaming, comunidade e gamificação integrados."
        keywords="plataforma produtores digitais, cursos online, netflix educacional, marketplace produtos digitais"
      />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nexus Market
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup&role=seller")}>
              Criar Loja Grátis
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              🚀 Transforme conhecimento em receita
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Sua plataforma de membros
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                estilo Netflix
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Publique cursos, packs e PDFs. Ofereça comunidade, gamificação e suporte — 
              tudo em uma plataforma que seus alunos vão amar usar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate("/auth?mode=signup&role=seller")}
              >
                <Play className="w-5 h-5 mr-2" />
                Criar Minha Loja Grátis
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate("/demo")}
              >
                <MonitorPlay className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 produtores satisfeitos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>500+ lojas ativas</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>R$ 2M+ processados</span>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Como funciona
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Três passos simples para começar a vender
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/20 transition-colors">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recursos que fazem a diferença
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para criar uma experiência incrível
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/20 transition-colors h-full">
                  <CardHeader>
                    <feature.icon className="w-12 h-12 text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Escolha seu plano
              </h2>
              <p className="text-lg text-muted-foreground">
                Comece grátis e escale conforme cresce
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative border-2 transition-all hover:scale-105 ${
                    plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/20'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm text-muted-foreground font-normal">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => navigate("/auth?mode=signup&role=seller")}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se a centenas de produtores que já transformaram conhecimento em renda recorrente
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => navigate("/auth?mode=signup&role=seller")}
            >
              Criar Minha Loja Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingProducers;