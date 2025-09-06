import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/ui/seo-head";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Download, 
  Users, 
  Star,
  ArrowLeft,
  BookOpen,
  Video,
  FileText
} from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();

  const demoContent = [
    {
      icon: Video,
      title: "Curso Completo de React 2024",
      type: "Curso",
      description: "Aprenda React do zero ao avançado com projetos práticos",
      price: "R$ 199,00",
      status: "Comprado"
    },
    {
      icon: FileText,
      title: "Pack de Templates Figma",
      type: "Pack Digital",
      description: "Mais de 50 templates profissionais para seus projetos",
      price: "R$ 99,00",
      status: "Comprado"
    },
    {
      icon: BookOpen,
      title: "E-book: JavaScript Moderno",
      type: "E-book",
      description: "Guia completo das funcionalidades mais recentes do JavaScript",
      price: "R$ 49,00",
      status: "Comprado"
    }
  ];

  const exclusiveContent = [
    {
      title: "Guia de Setup Completo",
      type: "PDF",
      description: "Passo a passo para configurar seu ambiente de desenvolvimento"
    },
    {
      title: "Comunidade Exclusiva",
      type: "Discord",
      description: "Acesso à comunidade privada para networking e dúvidas"
    },
    {
      title: "Aulas Bônus",
      type: "Vídeo",
      description: "Conteúdo extra disponível apenas para membros"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Demonstração - Área de Membros Netflix Style"
        description="Veja como funciona uma área de membros criada com Nexus Market"
      />
      
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="font-bold text-xl">
            Demonstração - Área de Membros
          </div>
          <Button onClick={() => navigate("/auth?mode=signup&role=seller")}>
            Criar Minha Loja
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            🎬 Demonstração Interativa
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Área de Membros Estilo Netflix
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Esta é uma prévia de como seus alunos verão a área de membros exclusiva
          </p>
        </section>

        {/* Mais Vendidos */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Mais Vendidos</h2>
            <p className="text-muted-foreground">Os produtos mais populares desta loja</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoContent.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <item.icon className="w-8 h-8 text-primary mb-2" />
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold">{item.price}</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Continuar Assistindo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Conteúdo Exclusivo */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Conteúdo Exclusivo</h2>
            <p className="text-muted-foreground">Materiais especiais para membros</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exclusiveContent.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {item.type === 'PDF' && <Download className="w-5 h-5" />}
                    {item.type === 'Discord' && <Users className="w-5 h-5" />}
                    {item.type === 'Vídeo' && <Play className="w-5 h-5" />}
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <Badge variant="outline" className="w-fit">
                    {item.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    {item.type === 'PDF' && 'Baixar PDF'}
                    {item.type === 'Discord' && 'Acessar Comunidade'}
                    {item.type === 'Vídeo' && 'Assistir Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Suporte */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-6 h-6" />
                Suporte
              </CardTitle>
              <p className="text-muted-foreground">
                Precisa de ajuda? Entre em contato conosco
              </p>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1">
                Acessar Suporte
              </Button>
              <Button variant="secondary" className="flex-1">
                Ver Mais Produtos
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* CTA Final */}
        <section className="text-center py-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">
            Gostou do que viu?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Crie sua própria área de membros Netflix-style em minutos e ofereça uma experiência incrível para seus alunos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth?mode=signup&role=seller")}
            >
              Criar Minha Loja Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/")}
            >
              Ver Mais Recursos
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Demo;