import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import CartSheet from "@/components/cart/cart-sheet";
import NotificationBadge from "@/components/ui/notification-badge";
import PanelSwitch from "@/components/ui/panel-switch";
import { BookOpen, Store, User, LogOut, Settings, Bell, Plus, Menu, Home, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function MainHeader() {
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuth = () => {
    navigate('/auth');
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex gap-1", mobile ? "flex-col space-y-2" : "hidden md:flex items-center")}>
      <Button 
        variant="ghost" 
        size={mobile ? "default" : "sm"}
        onClick={() => {
          // Navigate to dashboard for logged users, home for guests
          navigate(user ? '/inicio' : '/');
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn("btn-icon-left", mobile && "justify-start w-full")}
      >
        <Home className="icon-sm" />
        Início
      </Button>
      <Button 
        variant="ghost" 
        size={mobile ? "default" : "sm"}
        onClick={() => {
          navigate('/biblioteca');
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn("btn-icon-left", mobile && "justify-start w-full")}
      >
        <BookOpen className="icon-sm" />
        Biblioteca
      </Button>
      {user && (
      <Button 
        variant="ghost" 
        size={mobile ? "default" : "sm"}
        onClick={() => {
          navigate('/dashboard');
          if (mobile) setMobileMenuOpen(false);
        }}
        className={cn("btn-icon-left", mobile && "justify-start w-full")}
      >
        <Store className="icon-sm" />
        Minhas Lojas
      </Button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl">
        {/* Left side - Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="icon-md" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 modal-content mobile-sheet bg-card/98 border-r-2 border-accent shadow-2xl safe-area-top">
              <SheetHeader className="text-left pb-4">
                <SheetTitle className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 bg-gradient-accent rounded-lg logo-center">
                    <span className="text-accent-foreground font-bold text-sm">N</span>
                  </div>
                  <span className="font-bold text-lg">Nexus Market</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6 px-1">
                {/* Navigation Links */}
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-4 px-1">Navegação</h3>
                  <NavLinks mobile />
                </div>

                {/* Panel Switch */}
                {user && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-4 px-1">Modo de Acesso</h3>
                    <PanelSwitch compact={false} showLabels={true} />
                  </div>
                )}

                {/* User Section */}
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-sm font-medium">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{profile?.full_name || 'Usuário'}</p>
                         <Badge variant="outline" className={`text-xs mt-1 ${profile?.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : profile?.role === 'seller' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}`}>
                           {profile?.role === 'admin' ? '👑 Admin' : profile?.role === 'seller' ? 'Vendedor' : 'Usuário'}
                         </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full btn-icon-left justify-start" onClick={() => {
                        navigate('/perfil');
                        setMobileMenuOpen(false);
                      }}>
                        <User className="icon-sm" />
                        Meu Perfil
                      </Button>
                      
                      <Button variant="ghost" className="w-full btn-icon-left justify-start" onClick={() => {
                        navigate('/criar-loja');
                        setMobileMenuOpen(false);
                      }}>
                        <Plus className="icon-sm" />
                        Criar Loja
                      </Button>
                      
                       <Button variant="ghost" className="w-full btn-icon-left justify-start">
                         <Settings className="icon-sm" />
                         Configurações
                       </Button>
                       
                       {/* Admin Button for Mobile */}
                       {isAdmin && (
                         <Button 
                           variant="ghost" 
                           className="w-full btn-icon-left justify-start bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200" 
                           onClick={() => {
                             navigate('/admin');
                             setMobileMenuOpen(false);
                           }}
                         >
                           <Settings className="icon-sm" />
                           🛡️ Painel Admin
                         </Button>
                       )}
                      
                      <Button 
                        variant="ghost" 
                        className="w-full btn-icon-left justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="icon-sm" />
                        Sair
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 px-1">
                    <Button 
                      className="w-full h-12 rounded-xl font-medium"
                      onClick={() => {
                        handleAuth();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Entrar
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full h-12 rounded-xl font-medium"
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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg logo-center">
              <span className="text-accent-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg md:text-xl">Nexus Market</span>
          </Link>
        </div>

        {/* Center - Desktop Navigation */}
        <div className="flex-1 flex justify-center">
          <NavLinks />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search - Hidden on mobile, can be added to mobile menu */}
          <Button variant="ghost" size="icon-sm" className="hidden lg:flex">
            <Search className="icon-sm" />
          </Button>

          {/* Notifications */}
          {user && (
            <NotificationBadge count={0} size="sm" className="hidden sm:flex">
              <Button variant="ghost" size="icon-sm">
                <Bell className="icon-sm" />
              </Button>
            </NotificationBadge>
          )}
          
          <CartSheet />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline max-w-24 truncate">
                    {profile?.full_name || 'Usuário'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card/98 border-2 border-border shadow-2xl">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{profile?.full_name || 'Usuário'}</p>
                     <Badge variant="outline" className={`text-xs ${profile?.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : profile?.role === 'seller' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}`}>
                       {profile?.role === 'admin' ? '👑 Administrador' : profile?.role === 'seller' ? 'Vendedor' : 'Usuário'}
                     </Badge>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/perfil')}>
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate('/biblioteca')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Minha Biblioteca
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/criar-loja')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Loja
                </DropdownMenuItem>

                  {profile?.role === 'seller' && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Store className="mr-2 h-4 w-4" />
                      Minhas Lojas
                    </DropdownMenuItem>
                  )}

                 {/* Admin Section */}
                 {isAdmin && (
                   <>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => navigate('/admin')} className="bg-red-50 text-red-700 focus:bg-red-100 focus:text-red-800">
                       <Settings className="mr-2 h-4 w-4" />
                       <span className="font-semibold">🛡️ Painel Admin</span>
                     </DropdownMenuItem>
                   </>
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