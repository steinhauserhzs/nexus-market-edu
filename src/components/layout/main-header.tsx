import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import CartSheet from "@/components/cart/cart-sheet";
import NotificationBadge from "@/components/ui/notification-badge";
import { BookOpen, Store, User, LogOut, Settings, Bell, Plus } from "lucide-react";

export default function MainHeader() {
  const { user, profile, signOut } = useAuth();

  const handleAuth = () => {
    window.location.href = '/auth';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-xl">Nexus Market</span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {user && profile && (
            <NotificationBadge count={0} size="sm">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-4 h-4" />
              </Button>
            </NotificationBadge>
          )}
          
          <CartSheet />
          
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">
                    {profile.full_name || 'Usuário'}
                  </span>
                  <Badge variant="outline" className="hidden sm:inline">
                    {profile.role === 'seller' ? 'Vendedor' : 'Usuário'}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                      <Store className="mr-2 h-4 w-4" />
                      Painel Vendedor
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleAuth}>
                Entrar
              </Button>
              <Button onClick={handleAuth}>
                Cadastrar
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}