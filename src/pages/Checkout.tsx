import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShoppingCart, User, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainHeader from "@/components/layout/main-header";
import BackNavigation from "@/components/layout/back-navigation";

const Checkout = () => {
  const { user, profile } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
  });
  const { toast } = useToast();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const createOrder = async () => {
    if (!user || items.length === 0) return;

    setLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          total_cents: totalAmount,
          status: 'pending',
          currency: 'BRL',
          gateway: 'pix',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        unit_price_cents: item.price_cents,
        quantity: item.quantity,
        seller_share_cents: Math.floor(item.price_cents * 0.85), // 85% para o vendedor
        platform_share_cents: Math.floor(item.price_cents * 0.15), // 15% para a plataforma
        affiliate_share_cents: 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect
      clearCart();
      
      toast({
        title: "Pedido criado!",
        description: "Seu pedido foi criado com sucesso. Você receberá instruções de pagamento por email.",
      });

      // Redirect to success page or order details
      window.location.href = `/pedido/${order.id}`;

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Faça login para finalizar sua compra
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Carrinho Vazio</h2>
              <p className="text-muted-foreground">
                Adicione produtos ao carrinho para continuar
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Explorar Produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="container mx-auto px-4 py-8">
        <BackNavigation title="Finalizar Compra" />
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Finalizar Compra</h1>
            <p className="text-muted-foreground">
              Revise seu pedido e complete a compra
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">PIX</span>
                        </div>
                        <div>
                          <h4 className="font-medium">PIX</h4>
                          <p className="text-sm text-muted-foreground">
                            Pagamento instantâneo via PIX
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Disponível</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {item.thumbnail_url ? (
                            <img 
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-accent flex items-center justify-center">
                              <ShoppingCart className="w-4 h-4 text-accent-foreground/80" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Qtd: {item.quantity}
                            </span>
                            <span className="text-sm font-semibold">
                              {formatPrice(item.price_cents * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-semibold">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de processamento:</span>
                      <span className="font-semibold">Grátis</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg text-accent">{formatPrice(totalAmount)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={createOrder}
                    disabled={loading || !customerInfo.name || !customerInfo.email}
                  >
                    {loading ? 'Processando...' : 'Finalizar Compra'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Ao finalizar a compra, você receberá as instruções de pagamento PIX por email.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;