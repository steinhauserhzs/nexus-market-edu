import React from 'react';
import { AdvancedCheckout } from '@/components/checkout/AdvancedCheckout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedCheckoutDemo = () => {
  const navigate = useNavigate();

  // Demo products
  const demoProducts = [
    {
      id: "demo-curso-marketing",
      title: "Curso de Marketing Digital",
      price_cents: 29900,
      type: "curso",
      thumbnail_url: undefined
    },
    {
      id: "demo-plano-premium",
      title: "Plano Premium Mensal",
      price_cents: 9990,
      type: "subscription",
      thumbnail_url: undefined
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Demo - Checkout Avançado</h1>
              <p className="text-sm text-muted-foreground">
                Demonstração do sistema de checkout integrado com Stripe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Component */}
      <AdvancedCheckout 
        products={demoProducts}
        onSuccess={() => {
          console.log('Checkout success callback');
        }}
      />
    </div>
  );
};

export default AdvancedCheckoutDemo;