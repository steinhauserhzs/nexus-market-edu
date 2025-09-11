import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, ShoppingCart, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price_cents: number;
  thumbnail_url?: string;
  type: string;
}

interface CartItem {
  id?: string;
  product_id?: string;
  title: string;
  price_cents: number;
  thumbnail_url?: string;
  type: string;
  quantity?: number;
}

interface AdvancedCheckoutProps {
  products?: Product[];
  onSuccess?: () => void;
}

export const AdvancedCheckout: React.FC<AdvancedCheckoutProps> = ({ 
  products, 
  onSuccess 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
  });

  // Use products prop or cart items
  const checkoutItems: (Product | CartItem)[] = products || items;
  const checkoutTotal = products ? 
    products.reduce((sum, p) => sum + p.price_cents, 0) : 
    totalAmount;

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getItemId = (item: Product | CartItem): string => {
    return 'product_id' in item && item.product_id ? item.product_id : item.id;
  };

  const getItemQuantity = (item: Product | CartItem): number => {
    return 'quantity' in item && item.quantity ? item.quantity : 1;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para finalizar a compra.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (checkoutItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Prepare products data
      const productsData = checkoutItems.map(item => ({
        id: getItemId(item),
        title: item.title,
        price_cents: item.price_cents,
        quantity: getItemQuantity(item)
      }));

      // Call advanced checkout edge function
      const { data, error } = await supabase.functions.invoke('nexus-advanced-checkout', {
        body: {
          products: productsData,
          customer_info: customerInfo,
          success_url: `${window.location.origin}/checkout-success`,
          cancel_url: `${window.location.origin}/checkout`
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Erro ao processar checkout');
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.open(data.url, '_blank');
        onSuccess?.();
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione produtos ao carrinho para continuar
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Explorar Produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkoutItems.map((item) => (
                <div key={getItemId(item)} className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.type || 'Digital'}
                      </Badge>
                      {getItemQuantity(item) > 1 && (
                        <span className="text-sm text-muted-foreground">
                          Qty: {getItemQuantity(item)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(item.price_cents * getItemQuantity(item))}
                    </p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(checkoutTotal)}</span>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Acesso imediato após pagamento
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Garantia de 7 dias
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Suporte especializado
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Finalizar Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    disabled={!!user?.email}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <Separator />

              {/* Security Badges */}
              <div className="flex items-center justify-center space-x-4 py-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  SSL Seguro
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Pagamento Protegido
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={handleCheckout}
                disabled={loading || !customerInfo.name || !customerInfo.email}
                className="w-full py-6 text-lg font-medium"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  <>
                    Finalizar Compra - {formatPrice(checkoutTotal)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao continuar, você concorda com nossos{' '}
                <a href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};