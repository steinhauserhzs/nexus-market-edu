import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw,
  AlertTriangle,
  Smartphone,
  ShoppingCart,
  User,
  Store,
  Heart,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowTest {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: string[];
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
  duration?: number;
}

interface FlowValidatorProps {
  className?: string;
}

export default function FlowValidator({ className }: FlowValidatorProps) {
  const [tests, setTests] = useState<FlowTest[]>([
    {
      id: 'purchase-flow',
      name: 'Fluxo de Compra Completo',
      description: 'Carrinho → Checkout → Pagamento → Licença',
      icon: ShoppingCart,
      steps: [
        'Adicionar produto ao carrinho',
        'Aplicar cupom de desconto',
        'Navegar para checkout',
        'Simular pagamento',
        'Verificar criação de licença',
        'Testar acesso ao conteúdo'
      ],
      status: 'pending'
    },
    {
      id: 'user-flow',
      name: 'Fluxo de Usuário',
      description: 'Registro → Verificação → Primeiro Produto → Área do Membro',
      icon: User,
      steps: [
        'Criar nova conta',
        'Confirmar email',
        'Comprar primeiro produto',
        'Acessar área do membro',
        'Navegar pelo conteúdo',
        'Atualizar perfil'
      ],
      status: 'pending'
    },
    {
      id: 'seller-flow',
      name: 'Fluxo de Vendedor',
      description: 'Cadastro Loja → Criar Produto → Primeira Venda → Analytics',
      icon: Store,
      steps: [
        'Criar nova loja',
        'Configurar dados de pagamento',
        'Criar primeiro produto',
        'Publicar produto',
        'Simular primeira venda',
        'Verificar analytics'
      ],
      status: 'pending'
    },
    {
      id: 'mobile-flow',
      name: 'Fluxo Mobile',
      description: 'Navegação → Busca → Compra → Visualização',
      icon: Smartphone,
      steps: [
        'Testar navegação mobile',
        'Usar busca avançada',
        'Processo de compra mobile',
        'Responsividade de telas',
        'Gestos de toque',
        'Safe area handling'
      ],
      status: 'pending'
    },
    {
      id: 'followers-flow',
      name: 'Sistema de Seguidores',
      description: 'Follow → Notificações → Analytics',
      icon: Heart,
      steps: [
        'Seguir uma loja',
        'Deixar de seguir',
        'Verificar notificações',
        'Testar analytics de seguidores',
        'Verificar contador',
        'Testar em mobile'
      ],
      status: 'pending'
    },
    {
      id: 'reviews-flow',
      name: 'Sistema de Reviews',
      description: 'Criar → Editar → Visualizar → Moderar',
      icon: Star,
      steps: [
        'Criar review',
        'Editar review própria',
        'Visualizar reviews',
        'Testar rating display',
        'Verificar ordenação',
        'Testar responsividade'
      ],
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  const runTest = async (testId: string) => {
    setCurrentTest(testId);
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ));

    // Simulate test execution
    const startTime = Date.now();
    try {
      // Simulate different test scenarios
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      const duration = Date.now() - startTime;
      
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: success ? 'success' as const : 'error' as const,
              error: success ? undefined : 'Erro simulado para demonstração',
              duration
            }
          : test
      ));
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'error' as const,
              error: 'Erro durante execução do teste',
              duration: Date.now() - startTime
            }
          : test
      ));
    }
    
    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallProgress(0);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending' as const, 
      error: undefined,
      duration: undefined
    })));

    for (let i = 0; i < tests.length; i++) {
      setOverallProgress((i / tests.length) * 100);
      await runTest(tests[i].id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    setOverallProgress(100);
    setIsRunning(false);
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending' as const, 
      error: undefined,
      duration: undefined
    })));
    setOverallProgress(0);
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: FlowTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'running':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FlowTest['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendente',
      running: 'Executando...',
      success: 'Sucesso',
      error: 'Erro'
    };

    return (
      <Badge variant={variants[status]} className={cn(
        status === 'success' && 'bg-success/20 text-success border-success/30',
        status === 'running' && 'animate-pulse'
      )}>
        {labels[status]}
      </Badge>
    );
  };

  const completedTests = tests.filter(test => test.status === 'success').length;
  const failedTests = tests.filter(test => test.status === 'error').length;

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Validação Final de Fluxos
              </CardTitle>
              <CardDescription>
                Teste automático de todos os fluxos críticos do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Executando...' : 'Executar Todos'}
              </Button>
              <Button
                variant="outline"
                onClick={resetTests}
                disabled={isRunning}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso geral:</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex justify-between items-center text-sm">
              <span>Status Geral:</span>
              <div className="flex gap-4">
                <span className="text-success">✓ {completedTests} Sucesso</span>
                <span className="text-destructive">✗ {failedTests} Falhas</span>
                <span className="text-muted-foreground">Pendentes: {tests.length - completedTests - failedTests}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {tests.map((test) => {
          const IconComponent = test.icon;
          
          return (
            <Card key={test.id} className={cn(
              'transition-all duration-200',
              test.status === 'success' && 'border-success/50 bg-success/5',
              test.status === 'error' && 'border-destructive/50 bg-destructive/5',
              test.status === 'running' && 'border-warning/50 bg-warning/5',
              currentTest === test.id && 'ring-2 ring-accent/50'
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-accent" />
                    <div>
                      <CardTitle className="text-base">{test.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {test.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Passos do Teste:</div>
                  <ul className="text-xs space-y-1">
                    {test.steps.map((step, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {test.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{test.error}</AlertDescription>
                  </Alert>
                )}

                {test.duration && (
                  <div className="text-xs text-muted-foreground">
                    Executado em {(test.duration / 1000).toFixed(1)}s
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(test.id)}
                  disabled={isRunning}
                  className="w-full"
                >
                  {test.status === 'running' ? 'Executando...' : 'Executar Teste'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}