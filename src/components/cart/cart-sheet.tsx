import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function CartSheet() {
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleCheckout = () => {
    setOpen(false);
    window.location.href = '/checkout';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="w-4 h-4" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingCart className="w-16 h-16 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Carrinho vazio</h3>
              <p className="text-muted-foreground">
                Adicione produtos ao seu carrinho para continuar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-accent flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-accent-foreground/80" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    <p className="text-sm font-semibold text-accent">
                      {formatPrice(item.price_cents)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subtotal:</span>
                <span className="font-semibold">{formatPrice(totalAmount)}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg text-accent">{formatPrice(totalAmount)}</span>
            </div>
            
            <Button className="w-full" onClick={handleCheckout}>
              Finalizar Compra
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}