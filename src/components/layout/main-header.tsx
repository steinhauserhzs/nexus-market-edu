import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import CartSheet from "@/components/cart/cart-sheet";
import NotificationBadge from "@/components/ui/notification-badge";
import { BookOpen, Store, User, LogOut, Settings, Bell, Plus, Menu, Home, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function MainHeader() {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuth = () => {
    window.location.href = '/auth';
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex gap-1", mobile ? "flex-col space-y-1" : "hidden md:flex items-center")}>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          window.location.href = '/';
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn(mobile && "justify-start")}
      >
        <Home className="w-4 h-4 mr-2" />
        Início
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => {
          window.location.href = '/biblioteca';
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn(mobile && "justify-start")}
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Cursos
      </Button>
      {user && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            window.location.href = '/dashboard';
            if (mobile) setMobileMenuOpen(false);
          }}
          className={cn(mobile && "justify-start")}
        >
          <Store className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <span className="text-accent-foreground font-bold text-sm">N</span>
                  </div>
                  Nexus Market
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Navigation Links */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-3">Navegação</h3>
                  <NavLinks mobile />
                </div>

                {/* User Section */}
                {user && profile ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{profile.full_name || 'Usuário'}</p>
                        <Badge variant="outline" className="text-xs">
                          {profile.role === 'seller' ? 'Vendedor' : 'Usuário'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => {
                        window.location.href = '/perfil';
                        setMobileMenuOpen(false);
                      }}>
                        <User className="w-4 h-4 mr-3" />
                        Meu Perfil
                      </Button>
                      
                      <Button variant="ghost" className="w-full justify-start" onClick={() => {
                        window.location.href = '/criar-loja';
                        setMobileMenuOpen(false);
                      }}>
                        <Plus className="w-4 h-4 mr-3" />
                        Criar Loja
                      </Button>
                      
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-3" />
                        Configurações
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sair
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        handleAuth();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Entrar
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleAuth();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Cadastrar
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg md:text-xl">Nexus Market</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <NavLinks />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Hidden on mobile, can be added to mobile menu */}
          <Button variant="ghost" size="sm" className="hidden lg:flex p-2">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          {user && profile && (
            <NotificationBadge count={0} size="sm" className="hidden sm:flex">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-4 h-4" />
              </Button>
            </NotificationBadge>
          )}
          
          <CartSheet />
          
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline max-w-24 truncate">
                    {profile.full_name || 'Usuário'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{profile.full_name || 'Usuário'}</p>
                    <Badge variant="outline" className="text-xs">
                      {profile.role === 'seller' ? 'Vendedor' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => window.location.href = '/perfil'}>
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => window.location.href = '/biblioteca'}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Minha Biblioteca
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => window.location.href = '/criar-loja'}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Loja
                </DropdownMenuItem>

                {profile.role === 'seller' && (
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                    <Store className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleAuth}>
                Entrar
              </Button>
              <Button size="sm" onClick={handleAuth}>
                Cadastrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}