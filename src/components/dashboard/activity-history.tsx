import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  Package, 
  Store, 
  User, 
  Settings, 
  Trash2,
  Edit,
  Plus,
  Eye,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ActivityHistory = () => {
  const { logs, loading, error } = useActivityLogs();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PRODUCT_CREATED':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'PRODUCT_UPDATED':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'PRODUCT_DELETED':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'PRODUCT_VIEWED':
        return <Eye className="w-4 h-4 text-gray-500" />;
      case 'STORE_CREATED':
        return <Store className="w-4 h-4 text-purple-500" />;
      case 'STORE_UPDATED':
        return <Settings className="w-4 h-4 text-orange-500" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'PRODUCT_CREATED':
        return 'Produto criado';
      case 'PRODUCT_UPDATED':
        return 'Produto atualizado';
      case 'PRODUCT_DELETED':
        return 'Produto excluído';
      case 'PRODUCT_VIEWED':
        return 'Produto visualizado';
      case 'STORE_CREATED':
        return 'Loja criada';
      case 'STORE_UPDATED':
        return 'Loja atualizada';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'PRODUCT_CREATED':
        return 'default';
      case 'PRODUCT_UPDATED':
        return 'secondary';
      case 'PRODUCT_DELETED':
        return 'destructive';
      case 'PRODUCT_VIEWED':
        return 'outline';
      case 'STORE_CREATED':
        return 'default';
      case 'STORE_UPDATED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-destructive">Erro ao carregar histórico: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico de Atividades
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas {logs.length} atividades realizadas
        </p>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma atividade registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionColor(log.action) as any}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {log.entity_name && (
                      <p className="text-sm font-medium">{log.entity_name}</p>
                    )}
                    
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {log.details.product_type && (
                          <span>Tipo: {log.details.product_type}</span>
                        )}
                        {log.details.price_cents && (
                          <span className="ml-2">
                            Preço: R$ {(log.details.price_cents / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;