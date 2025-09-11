import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, User, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !user) {
      navigate('/');
      return;
    }

    processSuccessfulPayment();
  }, [sessionId, user]);

  const processSuccessfulPayment = async () => {
    try {
      // Call edge function to process the payment success
      const { data, error } = await supabase.functions.invoke('process-payment-success', {
        body: { 
          session_id: sessionId,
          user_id: user?.id 
        }
      });

      if (error) {
        console.error('Error processing payment:', error);
        toast({
          title: "Erro",
          description: "Erro ao processar pagamento. Entre em contato com o suporte.",
          variant: "destructive"
        });
        return;
      }

      setOrderData(data);
      
      toast({
        title: "Pagamento aprovado!",
        description: "Seu pedido foi processado com sucesso.",
      });

    } catch (error) {
      console.error('Error processing successful payment:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar pagamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Processando seu pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-gray-600">
            Obrigado pela sua compra. Seu pedido foi processado com sucesso.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Detalhes do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderData ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Pedido:</span>
                  <span className="font-medium">{orderData.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pago:</span>
                  <span className="font-medium text-green-600">
                    R$ {(orderData.total_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Aprovado</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Carregando detalhes do pedido...</p>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Acesso liberado</p>
                  <p className="text-sm text-gray-600">
                    Você já tem acesso aos produtos adquiridos
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Email de confirmação</p>
                  <p className="text-sm text-gray-600">
                    Enviamos um email com os detalhes da compra
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="font-medium">Suporte disponível</p>
                  <p className="text-sm text-gray-600">
                    Entre em contato caso tenha dúvidas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/biblioteca')}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Acessar Biblioteca
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Voltar ao Início
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato conosco pelo{' '}
            <a href="mailto:suporte@nexus.com" className="text-primary hover:underline">
              suporte@nexus.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;