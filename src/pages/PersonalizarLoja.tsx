import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackNavigation from "@/components/layout/back-navigation";
import { Palette, Layout, Image, Settings } from "lucide-react";

const PersonalizarLoja = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const customizationOptions = [
    {
      icon: Palette,
      title: "Cores e Tema",
      description: "Customize as cores da sua loja",
      action: "Personalizar Cores"
    },
    {
      icon: Layout,
      title: "Layout da Página",
      description: "Altere o layout e estrutura",
      action: "Editar Layout"
    },
    {
      icon: Image,
      title: "Imagens e Logo",
      description: "Atualize logo e banners",
      action: "Gerenciar Imagens"
    },
    {
      icon: Settings,
      title: "Configurações",
      description: "Ajustes gerais da loja",
      action: "Configurar"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Personalizar Loja - Nexus Market"
        description="Personalize o visual e comportamento da sua loja na Nexus Market."
      />
      
      <div className="min-h-screen bg-background">
        <BackNavigation title="Personalizar Loja" />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Personalizar Loja</h1>
            <p className="text-muted-foreground text-lg">
              Customize sua loja para refletir sua marca
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customizationOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <option.icon className="w-6 h-6 text-primary" />
                    </div>
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <Button className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Prévia da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Prévia da sua loja aparecerá aqui
                </p>
                <Button variant="outline" className="mt-4">
                  Ver Loja Completa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PersonalizarLoja;