import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Tag, 
  Edit2, 
  Trash2, 
  Copy,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useCoupons, Coupon } from '@/hooks/use-coupons';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const { 
    getCouponsForStore, 
    createCoupon, 
    updateCoupon, 
    toggleCouponStatus,
    formatDiscount,
    formatPrice,
    isCreating 
  } = useCoupons();
  
  const { toast } = useToast();

  // Mock store ID - would come from context or auth
  const storeId = "mock-store-id";

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await getCouponsForStore(storeId);
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    try {
      const newCoupon = await createCoupon({
        ...couponData,
        store_id: storeId
      });
      setCoupons(prev => [newCoupon, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const updated = await toggleCouponStatus(coupon.id, !coupon.is_active);
      setCoupons(prev => prev.map(c => c.id === coupon.id ? updated : c));
    } catch (error) {
      // Error already handled in hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código do cupom copiado para a área de transferência.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    
    const now = new Date();
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
    
    if (validUntil && now > validUntil) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return <Badge variant="outline">Esgotado</Badge>;
    }
    
    return <Badge variant="default" className="bg-success/20 text-success border-success/30">Ativo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando cupons...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Cupons - Nexus Market EDU</title>
        <meta name="description" content="Gerencie cupons de desconto para sua loja" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="w-6 h-6 text-accent" />
                Gerenciar Cupons
              </h1>
              <p className="text-muted-foreground">
                Crie e gerencie cupons de desconto para sua loja
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Cupom
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Cupons</p>
                    <p className="text-2xl font-bold">{coupons.length}</p>
                  </div>
                  <Tag className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cupons Ativos</p>
                    <p className="text-2xl font-bold text-success">
                      {coupons.filter(c => c.is_active).length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Usos</p>
                    <p className="text-2xl font-bold">
                      {coupons.reduce((sum, c) => sum + c.used_count, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Expirados</p>
                    <p className="text-2xl font-bold text-destructive">
                      {coupons.filter(c => {
                        const validUntil = c.valid_until ? new Date(c.valid_until) : null;
                        return validUntil && new Date() > validUntil;
                      }).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coupons List */}
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cupom criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro cupom para começar a oferecer descontos aos seus clientes.
                </p>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Cupom
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          {getStatusBadge(coupon)}
                        </div>
                        
                        <h3 className="font-semibold mb-1">{coupon.name}</h3>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {coupon.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Desconto:</span>
                            <p className="font-medium">{formatDiscount(coupon)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Usos:</span>
                            <p className="font-medium">
                              {coupon.used_count}
                              {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Válido até:</span>
                            <p className="font-medium">
                              {coupon.valid_until ? formatDate(coupon.valid_until) : 'Sem prazo'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pedido mín:</span>
                            <p className="font-medium">
                              {formatPrice(coupon.minimum_order_cents)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => handleToggleStatus(coupon)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCoupon(coupon)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create/Edit Form - Would be a separate component in real app */}
          {(showCreateForm || editingCoupon) && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>
                    {editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
                  </CardTitle>
                  <CardDescription>
                    Preencha os detalhes do cupom de desconto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Esta é uma interface de demonstração. Em produção, seria implementado um formulário completo.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCoupon(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button disabled={isCreating}>
                      {isCreating ? 'Salvando...' : 'Salvar Cupom'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}