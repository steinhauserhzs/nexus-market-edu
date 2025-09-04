import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  BookOpen, 
  Store, 
  User, 
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Search, label: "Explorar", path: "/?search=true" },
    { icon: BookOpen, label: "Biblioteca", path: "/biblioteca", requireAuth: true },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-3">
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
                "flex flex-col items-center gap-1.5 h-auto py-2 px-3 relative rounded-xl min-w-[60px] transition-all duration-200",
                isActive && "text-primary bg-primary/10 shadow-sm"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;