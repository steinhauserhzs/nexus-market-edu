import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import PanelSwitch from "@/components/ui/panel-switch";

interface NetflixHeaderProps {
  transparent?: boolean;
  className?: string;
}

export const NetflixHeader = ({ 
  transparent = false, 
  className 
}: NetflixHeaderProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Handle search logic here
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

  const navigationItems = [
    { label: "Início", href: "/" },
    { label: "Biblioteca", href: "/biblioteca" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[60] transition-all duration-300 fixed-header relative",
      transparent 
        ? "bg-transparent backdrop-blur-sm" 
        : "bg-background/95 backdrop-blur-md border-b border-border/50",
      "safe-area-top",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16 sm:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Nexus Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 h-8 text-sm bg-background/50 border-border/50"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/carrinho')}
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <Badge 
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary text-primary-foreground"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Panel Switch - Desktop */}
            {user && (
              <div className="hidden md:block">
                <PanelSwitch compact={true} showLabels={false} />
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/perfil')}
              >
                <User className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-border/50 hover:bg-secondary/50"
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card/98 backdrop-blur-md border-b-2 border-border shadow-2xl py-4 z-[70]">
            <div className="container mx-auto px-4 space-y-4">
              {/* Panel Switch - Mobile */}
              {user && (
                <div className="pb-2 border-b border-border/30">
                  <PanelSwitch compact={false} showLabels={true} />
                </div>
              )}
              
              <nav className="flex flex-col gap-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="menu-item-enhanced text-foreground/80 hover:text-foreground transition-all duration-200 py-3 px-4 text-sm font-medium rounded-lg border border-transparent hover:border-accent/30 hover:bg-accent/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};