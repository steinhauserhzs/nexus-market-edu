import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Tag, Check, X } from 'lucide-react';
import { useCoupons, CouponValidation } from '@/hooks/use-coupons';
import { cn } from '@/lib/utils';

interface CouponInputProps {
  orderTotal: number;
  productIds?: string[];
  onCouponApplied?: (validation: CouponValidation) => void;
  onCouponRemoved?: () => void;
  className?: string;
}

export default function CouponInput({
  orderTotal,
  productIds,
  onCouponApplied,
  onCouponRemoved,
  className
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [error, setError] = useState<string>('');
  
  const { validateCoupon, formatPrice, isValidating } = useCoupons();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setError('');
    const validation = await validateCoupon(couponCode, orderTotal, productIds);
    
    if (validation.valid) {
      setAppliedCoupon(validation);
      setCouponCode('');
      onCouponApplied?.(validation);
    } else {
      setError(validation.error || 'Cupom inválido');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setError('');
    onCouponRemoved?.();
  };

  const formatDiscount = (validation: CouponValidation) => {
    if (!validation.discount_amount) return '';
    return formatPrice(validation.discount_amount);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!appliedCoupon ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                className="pl-10 uppercase"
                disabled={isValidating}
              />
            </div>
            <Button 
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || isValidating}
              size="default"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Aplicar'
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <Alert className="border-success bg-success/10">
          <Check className="h-4 w-4 text-success" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium text-success">
                {appliedCoupon.name || 'Cupom aplicado'}
              </div>
              <div className="text-sm text-muted-foreground">
                Desconto: {formatDiscount(appliedCoupon)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {appliedCoupon && (
        <div className="flex justify-between items-center text-sm p-3 bg-success/5 rounded-lg border border-success/20">
          <span className="text-muted-foreground">Desconto aplicado:</span>
          <Badge variant="secondary" className="bg-success/20 text-success">
            -{formatDiscount(appliedCoupon)}
          </Badge>
        </div>
      )}
    </div>
  );
}