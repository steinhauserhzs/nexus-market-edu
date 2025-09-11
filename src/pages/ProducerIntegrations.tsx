import { useState } from 'react';
import { Settings, Check, AlertCircle, ExternalLink, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  category: 'payment' | 'email' | 'analytics' | 'crm' | 'other';
  config?: any;
}

const mockIntegrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Processamento de pagamentos com cartão de crédito',
    icon: '💳',
    status: 'connected',
    category: 'payment'
  },
  {
    id: 'pix',
    name: 'PIX',
    description: 'Pagamentos instantâneos via PIX',
    icon: '🏦',
    status: 'connected',
    category: 'payment'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Automação de email marketing',
    icon: '📧',
    status: 'disconnected',
    category: 'email'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Análise de tráfego e conversões',
    icon: '📊',
    status: 'error',
    category: 'analytics'
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Rastreamento de conversões do Facebook',
    icon: '📘',
    status: 'disconnected',
    category: 'analytics'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automações entre diferentes aplicações',
    icon: '⚡',
    status: 'disconnected',
    category: 'other'
  }
];

export function ProducerIntegrations() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success/20 text-success border-success/30">Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="outline">Desconectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todas', count: integrations.length },
    { id: 'payment', name: 'Pagamentos', count: integrations.filter(i => i.category === 'payment').length },
    { id: 'email', name: 'Email', count: integrations.filter(i => i.category === 'email').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'crm', name: 'CRM', count: integrations.filter(i => i.category === 'crm').length },
    { id: 'other', name: 'Outros', count: integrations.filter(i => i.category === 'other').length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Integrações</h1>
          <p className="text-muted-foreground">Conecte sua loja com ferramentas externas</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Categories Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-gradient-to-r from-primary to-primary-glow" : ""}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(integration.status)}
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="flex justify-between items-center">
                    <Switch 
                      checked={integration.status === 'connected'}
                      disabled={integration.status === 'error'}
                    />
                    <div className="flex space-x-2">
                      {integration.status === 'connected' && (
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Config
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Docs
                      </Button>
                    </div>
                  </div>

                  {integration.status === 'error' && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-sm text-destructive">
                        Erro na conexão. Verifique as configurações.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure URLs de webhook para receber notificações de eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Pagamento Aprovado</h4>
                    <p className="text-sm text-muted-foreground">https://minha-loja.com/webhook/payment-approved</p>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/30">Ativo</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Nova Venda</h4>
                    <p className="text-sm text-muted-foreground">https://minha-loja.com/webhook/new-sale</p>
                  </div>
                  <Badge variant="outline">Inativo</Badge>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProducerIntegrations;