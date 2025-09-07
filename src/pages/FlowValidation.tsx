import { Helmet } from 'react-helmet-async';
import FlowValidator from '@/components/ui/flow-validator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FlowValidation() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Validação de Fluxos - Nexus Market EDU</title>
        <meta name="description" content="Validação automática de todos os fluxos críticos do sistema" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Validação Final de Fluxos</h1>
              <p className="text-muted-foreground">
                Teste automático de todos os fluxos críticos do sistema Nexus Market EDU
              </p>
            </div>
          </div>

          <FlowValidator />
        </div>
      </div>
    </>
  );
}