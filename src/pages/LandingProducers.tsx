import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { MonitorPlay, Users, Trophy, BarChart3, Smartphone, Bot, ArrowRight, Check } from "lucide-react";

const LandingProducers = () => {
  const navigate = useNavigate();

  const features = [
    { icon: MonitorPlay, title: "Streaming de Cursos", description: "Experiência estilo Netflix para seus conteúdos" },
    { icon: Users, title: "Comunidade Integrada", description: "Chat, fóruns e engajamento em tempo real" },
    { icon: Trophy, title: "Gamificação", description: "Pontos, badges e rankings para motivar seus alunos" },
    { icon: BarChart3, title: "Analytics", description: "Vendas, retenção e progresso em um só lugar" },
    { icon: Smartphone, title: "PWA Nativo", description: "Use como app sem precisar publicar nas stores" },
    { icon: Bot, title: "IA Integrada", description: "AI Store Analyzer para otimizar sua loja" },
  ];

  const plans = [
    {
      name: "Starter", price: "Grátis", period: "", description: "Perfeito para começar",
      features: ["Até 3 produtos", "Área de membros básica", "Stripe integrado", "Suporte por e-mail"],
      cta: "Começar Grátis", popular: false
    },
    {
      name: "Pro", price: "R$ 97", period: "/mês", description: "Para produtores sérios",
      features: ["Produtos ilimitados", "Comunidade completa", "Analytics avançado", "Multi-nicho", "IA Store Analyzer", "Suporte prioritário"],
      cta: "Assinar Pro", popular: true
    },
    {
      name: "Enterprise", price: "R$ 297", period: "/mês", description: "Para escalar sem limites",
      features: ["Tudo do Pro", "White-label", "API personalizada", "Suporte 24/7", "Setup dedicado"],
      cta: "Falar com Vendas", popular: false
    },
  ];

  const steps = [
    { number: "1", title: "Crie sua loja", description: "Defina marca, cores e layout em minutos" },
    { number: "2", title: "Publique produtos", description: "Cursos, PDFs, packs e preços em poucos cliques" },
    { number: "3", title: "Receba pagamentos", description: "Stripe (e Pix, se habilitado) com confirmação automática" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Nexus Market para Produtores" description="Venda cursos, packs e comunidade no estilo Netflix." />
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="font-bold text-xl">Nexus Market</div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")}>Entrar</Button>
          <Button onClick={() => navigate("/auth?mode=signup&role=seller")}>Criar Loja Grátis</Button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* HERO */}
        <section className="py-10 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm mb-4">
              <span>🚀 Nova versão para produtores</span>
              <Badge variant="secondary">B2B</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Sua plataforma de membros <span className="text-primary">estilo Netflix</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Publique cursos, packs e PDFs. Ofereça comunidade, gamificação e suporte — tudo num só lugar.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate("/auth?mode=signup&role=seller")}>
                Criar Minha Loja Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/loja/demo/membros")}>
                Ver Demonstração
              </Button>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="py-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s) => (
              <Card key={s.number}>
                <CardHeader>
                  <Badge>{s.number}</Badge>
                  <CardTitle className="mt-2">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{s.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* RECURSOS */}
        <section className="py-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Recursos que fazem a diferença</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Card key={i}>
                <CardHeader className="flex items-center gap-2">
                  <f.icon className="h-5 w-5" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{f.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* PLANOS */}
        <section className="py-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Escolha seu plano</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <Card key={p.name} className={p.popular ? "border-primary" : ""}>
                <CardHeader>
                  {p.popular && <Badge className="w-fit">Mais Popular</Badge>}
                  <CardTitle>{p.name}</CardTitle>
                  <div className="text-3xl font-extrabold">
                    {p.price}<span className="text-base font-medium">{p.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{p.description}</p>
                  <ul className="space-y-1 text-sm">
                    {p.features.map((ft) => (
                      <li key={ft} className="flex items-center gap-2"><Check className="h-4 w-4" /> {ft}</li>
                    ))}
                  </ul>
                  <Button className="mt-3" onClick={() => {
                    if (p.name === "Enterprise") navigate("/contato");
                    else navigate("/auth?mode=signup&role=seller");
                  }}>
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingProducers;