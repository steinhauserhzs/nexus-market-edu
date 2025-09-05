import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, ShoppingCart, Store } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const PanelModeFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  // Determine current mode based on route
  const isSellerMode = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/criar-loja') ||
                      location.pathname.includes('/loja/') && location.pathname.includes('/customizar');
  
  const isBuyerMode = location.pathname.includes('/biblioteca') || 
                     location.pathname === '/' ||
                     location.pathname.includes('/produto/');

  // Don't show on auth or profile pages
  const shouldHide = location.pathname.includes('/auth') || 
                    location.pathname.includes('/perfil') ||
                    location.pathname.includes('/checkout') ||
                    location.pathname.includes('/admin');

  if (shouldHide) return null;

  const handleToggle = () => {
    if (isSellerMode) {
      navigate('/biblioteca');
    } else {
      navigate('/dashboard');
    }
  };

  const getCurrentMode = () => {
    if (isSellerMode) return 'seller';
    if (isBuyerMode) return 'buyer';
    return 'neutral';
  };

  const currentMode = getCurrentMode();

  return (
    <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
      <Button
        onClick={handleToggle}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          currentMode === 'seller' 
            ? "bg-blue-500 hover:bg-blue-600 text-white" 
            : "bg-accent hover:bg-accent/90"
        )}
        title={`Alternar para ${currentMode === 'seller' ? 'Modo Comprador' : 'Modo Vendedor'}`}
      >
        <div className="flex flex-col items-center gap-1">
          {currentMode === 'seller' ? (
            <ShoppingCart className="w-5 h-5" />
          ) : (
            <Store className="w-5 h-5" />
          )}
          <ArrowLeftRight className="w-3 h-3 opacity-70" />
        </div>
      </Button>
      
      {/* Mode indicator badge */}
      <Badge 
        variant={currentMode === 'seller' ? 'secondary' : 'default'} 
        className={cn(
          "absolute -top-2 -left-2 text-xs font-medium min-w-fit px-2 py-1",
          currentMode === 'seller' && "bg-blue-100 text-blue-800 border-blue-200"
        )}
      >
        {currentMode === 'seller' ? 'Vendedor' : currentMode === 'buyer' ? 'Comprador' : 'Modo'}
      </Badge>
    </div>
  );
};

export default PanelModeFab;