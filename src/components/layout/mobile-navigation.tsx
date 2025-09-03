import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { 
  Home, 
  BookOpen, 
  Store, 
  User, 
  ShoppingCart,
  Search,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { items } = useCart();

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Search, label: "Explorar", path: "/?search=true" },
    { icon: Calendar, label: "Eventos", path: "/eventos" },
    { icon: BookOpen, label: "Biblioteca", path: "/biblioteca", requireAuth: true },
    { icon: ShoppingCart, label: "Carrinho", path: "/checkout", badge: items.length },
    ...(profile?.role === 'seller' ? [
      { icon: Store, label: "Dashboard", path: "/dashboard", requireAuth: true }
    ] : []),
    { icon: User, label: user ? "Perfil" : "Entrar", path: user ? "/perfil" : "/auth" }
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.requireAuth && !user) {
      navigate('/auth');
      return;
    }
    
    if (item.path === "/?search=true") {
      navigate('/');
      // Trigger search focus after navigation
      setTimeout(() => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
      return;
    }
    
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 relative",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;