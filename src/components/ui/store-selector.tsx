import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useStores } from "@/contexts/StoreContext";
import { ChevronDown, Plus, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StoreSelector() {
  const { stores, currentStore, switchStore, loading } = useStores();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stores.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="text-center">
            <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Você ainda não tem lojas
            </p>
            <Button size="sm" onClick={() => navigate('/criar-loja')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira loja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Loja Ativa</span>
            </div>
            
            {currentStore ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {currentStore.name}
                </span>
                <Badge 
                  variant={currentStore.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {currentStore.is_active ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Nenhuma loja selecionada
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
            {stores.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Suas Lojas ({stores.length})
                  </div>
                  {stores.map((store) => (
                    <DropdownMenuItem
                      key={store.id}
                      onClick={() => switchStore(store.id)}
                      className={`${
                        currentStore?.id === store.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Store className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{store.name}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Badge 
                            variant={store.is_active ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {store.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                          {currentStore?.id === store.id && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem 
                    onClick={() => navigate('/criar-loja')}
                    className="border-t mt-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar nova loja
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}