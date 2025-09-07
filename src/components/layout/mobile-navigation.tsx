import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { 
  Home, 
  BookOpen, 
  Store, 
  User, 
  Search,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isAdmin } = useAdmin();

  const navItems = [
    { 
      icon: Home, 
      label: "Início", 
      path: user ? "/inicio" : "/",
      requireAuth: false
    },
    { 
      icon: BookOpen, 
      label: "Biblioteca", 
      path: "/biblioteca", 
      requireAuth: true 
    },
    ...(user ? [
      { 
        icon: Store, 
        label: "Lojas", 
        path: "/dashboard", 
        requireAuth: true 
      }
    ] : []),
    ...(isAdmin ? [
      { 
        icon: Settings, 
        label: "Admin", 
        path: "/admin", 
        requireAuth: true,
        isAdmin: true
      }
    ] : []),
    { 
      icon: User, 
      label: user ? "Perfil" : "Entrar", 
      path: user ? "/perfil" : "/auth" 
    }
  ];

  const handleNavigation = (path: string) => {
    const item = navItems.find(item => item.path === path);
    if (!item) return;
    
    if (item.requireAuth && !user) {
      navigate('/auth');
      return;
    }
    
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[80] bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden safe-area-bottom mobile-nav">
      <div className="flex items-center justify-around px-2 sm:px-4 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path === "/" && location.pathname === "/" && !location.search) ||
                          (item.path === "/inicio" && location.pathname === "/");
          const canAccess = !item.requireAuth || user;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 h-auto min-w-[60px] transition-colors duration-200 rounded-lg mobile-nav-item",
                isActive && "text-accent bg-accent/10 active",
                (item as any).isAdmin && "mobile-nav-admin"
              )}
              disabled={!canAccess}
            >
              <div className="icon-center">
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-all duration-200 text-center truncate max-w-[50px] leading-tight",
                isActive ? "text-accent font-semibold" : "text-muted-foreground",
                (item as any).isAdmin && "text-red-600 font-medium"
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