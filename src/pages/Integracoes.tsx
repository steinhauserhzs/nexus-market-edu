import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Settings, Check, AlertCircle } from "lucide-react";

const Integracoes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando integrações...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const integrations = [
    {
      id: 1,
      name: "Stripe",
      description: "Processamento de pagamentos online",
      category: "Pagamentos",
      status: "Conectado",
      icon: "💳",
      isActive: true
    },
    {
      id: 2,
      name: "Mailchimp",
      description: "Email marketing e automação",
      category: "Marketing",
      status: "Não conectado",
      icon: "📧",
      isActive: false
    },
    {
      id: 3,
      name: "WhatsApp Business",
      description: "Mensagens e notificações",
      category: "Comunicação",
      status: "Conectado",
      icon: "📱",
      isActive: true
    },
    {
      id: 4,
      name: "Google Analytics",
      description: "Análise de tráfego e conversões",
      category: "Analytics",
      status: "Conectado",
      icon: "📊",
      isActive: true
    },
    {
      id: 5,
      name: "Facebook Pixel",
      description: "Rastreamento para anúncios",
      category: "Marketing",
      status: "Não conectado",
      icon: "👁️",
      isActive: false
    },
    {
      id: 6,
      name: "Zapier",
      description: "Automação entre aplicativos",
      category: "Automação",
      status: "Não conectado",
      icon: "⚡",
      isActive: false
    }
  ];

  const categories = ["Todos", "Pagamentos", "Marketing", "Comunicação", "Analytics", "Automação"];

  return (
    <>
      <SEOHead 
        title="Integrações - Nexus Market"
        description="Conecte suas ferramentas favoritas para automatizar seu negócio."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Integrações</h1>
            <p className="text-muted-foreground text-lg">
              Conecte suas ferramentas favoritas para automatizar seu negócio
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Integrações Ativas</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Disponíveis</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Pendentes</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Automações</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Settings className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button 
                    key={category} 
                    variant="outline" 
                    size="sm"
                    className={category === "Todos" ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <Switch checked={integration.isActive} />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={integration.status === 'Conectado' ? 'default' : 'secondary'}
                      className={integration.status === 'Conectado' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {integration.status}
                    </Badge>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={integration.status === 'Conectado' ? '' : 'text-primary'}
                    >
                      {integration.status === 'Conectado' ? (
                        <>
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1" />
                          Conectar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Automações Populares */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Automações Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Nova venda → Enviar para Mailchimp</h4>
                    <p className="text-sm text-muted-foreground">
                      Adiciona automaticamente novos compradores à sua lista de email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Produto visualizado → Facebook Pixel</h4>
                    <p className="text-sm text-muted-foreground">
                      Rastreia visualizações de produtos para remarketing
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Compra finalizada → WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">
                      Envia confirmação e dados de acesso via WhatsApp
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default Integracoes;