import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Zap } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price_cents: number;
  compare_price_cents?: number;
  thumbnail_url?: string;
  type: string;
}

interface StripeCheckoutProps {
  products: Product[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const StripeCheckout = ({ products, onSuccess, onError }: StripeCheckoutProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const total = products.reduce((sum, product) => sum + product.price_cents, 0);
  const originalTotal = products.reduce((sum, product) => 
    sum + (product.compare_price_cents || product.price_cents), 0
  );
  const savings = originalTotal - total;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para continuar com a compra",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          products: products.map(product => ({
            id: product.id,
            title: product.title,
            price_cents: product.price_cents,
            quantity: 1
          })),
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onSuccess?.();
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('Erro no checkout Stripe:', error);
      const errorMessage = error.message || 'Erro ao processar pagamento';
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
      
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagamento com Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium">Pagamento Seguro via Stripe</h4>
              <p className="text-sm text-muted-foreground">
                Processamento seguro com criptografia SSL. Aceita Visa, Mastercard, American Express.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm">Acesso Imediato</span>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm">100% Seguro</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3">
              {product.thumbnail_url && (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{product.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {product.type}
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatPrice(product.price_cents)}
                </div>
                {product.compare_price_cents && product.compare_price_cents > product.price_cents && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compare_price_cents)}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({products.length} item{products.length !== 1 ? 's' : ''})</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Economia</span>
                <span>-{formatPrice(savings)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            onClick={handleStripeCheckout}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processando...
              </div>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar com Cartão - {formatPrice(total)}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao clicar em "Pagar", você será redirecionado para o Stripe para completar sua compra de forma segura.
            Você terá acesso imediato ao conteúdo após a confirmação do pagamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeCheckout;