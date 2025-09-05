import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAdminLogs } from '@/hooks/use-admin';
import { useState } from 'react';
import { 
  Search, 
  Shield, 
  Calendar,
  User,
  Activity,
  RefreshCw
} from 'lucide-react';

export function AdminLogsSection() {
  const { logs, loading, refetch } = useAdminLogs();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ACTIVATED')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (action.includes('DELETE') || action.includes('DEACTIVATED')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (action.includes('UPDATE') || action.includes('MODIFIED')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Logs Administrativos
            </CardTitle>
            <CardDescription>
              Histórico de todas as ações administrativas realizadas na plataforma
            </CardDescription>
          </div>
          <Button onClick={refetch} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ação, admin ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Logs Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Tipo/Recurso</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {log.admin_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.target_type && (
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm capitalize">
                          {log.target_type}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(log.details).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="text-xs text-muted-foreground">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                          {Object.keys(log.details).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{Object.keys(log.details).length - 2} mais...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <div className="flex flex-col">
                        <span>
                          {new Date(log.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs">
                          {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhum log encontrado com os critérios de busca' : 'Nenhum log administrativo disponível'}
          </div>
        )}

        {/* Summary Stats */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Mostrando {filteredLogs.length} de {logs.length} logs
          </span>
          <span className="text-sm text-muted-foreground">
            Logs são mantidos por 90 dias
          </span>
        </div>
      </CardContent>
    </Card>
  );
}