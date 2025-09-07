import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  Play,
  Smartphone,
  ShoppingCart,
  User,
  Store,
  Heart,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminFlowValidationSection() {
  const navigate = useNavigate();

  const criticalFlows = [
    {
      name: 'Fluxo de Compra',
      icon: ShoppingCart,
      status: 'pending',
      description: 'Carrinho → Checkout → Pagamento → Licença'
    },
    {
      name: 'Fluxo Mobile',
      icon: Smartphone,
      status: 'warning',
      description: 'Responsividade e gestos de toque'
    },
    {
      name: 'Sistema de Cupons',
      icon: Star,
      status: 'success',
      description: 'Validação e aplicação de descontos'
    },
    {
      name: 'Fluxo de Vendedor',
      icon: Store,
      status: 'pending',
      description: 'Criação de loja e produtos'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const successCount = criticalFlows.filter(f => f.status === 'success').length;
  const warningCount = criticalFlows.filter(f => f.status === 'warning').length;
  const errorCount = criticalFlows.filter(f => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Validação de Fluxos Críticos
            </CardTitle>
            <CardDescription>
              Status dos fluxos principais do sistema
            </CardDescription>
          </div>
          <Button
            onClick={() => navigate('/flow-validation')}
            variant="outline"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Validador
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">{successCount} OK</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">{warningCount} Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{errorCount} Erro</span>
          </div>
        </div>

        {/* Flow Status List */}
        <div className="space-y-3">
          {criticalFlows.map((flow, index) => {
            const IconComponent = flow.icon;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-accent" />
                  <div>
                    <div className="font-medium text-sm">{flow.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {flow.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(flow.status)}
                  <Badge
                    variant={flow.status === 'success' ? 'default' : 'secondary'}
                    className={flow.status === 'success' ? 'bg-success/20 text-success border-success/30' : ''}
                  >
                    {flow.status === 'success' ? 'OK' : 
                     flow.status === 'warning' ? 'Atenção' : 
                     flow.status === 'error' ? 'Erro' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/flow-validation')}
            className="flex-1 gap-2"
          >
            <Play className="w-4 h-4" />
            Executar Todos os Testes
          </Button>
          <Button
            onClick={() => navigate('/cupons')}
            variant="outline"
            className="gap-2"
          >
            <Star className="w-4 h-4" />
            Gerenciar Cupons
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}