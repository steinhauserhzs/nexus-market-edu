import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  FileX, 
  Lock, 
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  action: string;
  severity: string;
  details: any;
  created_at: string;
  user_id?: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highRiskEvents: number;
  blockedUploads: number;
  suspiciousUrls: number;
}

export const SecurityAuditDashboard = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    highRiskEvents: 0,
    blockedUploads: 0,
    suspiciousUrls: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    if (isAdmin) {
      fetchSecurityEvents();
      calculateStats();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchSecurityEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_security_analytics');

      if (error) throw error;
      
      const newStats = {
        totalEvents: data?.length || 0,
        criticalEvents: data?.filter((e: any) => e.severity === 'critical')?.length || 0,
        highRiskEvents: data?.filter((e: any) => e.severity === 'high')?.length || 0,
        blockedUploads: data?.filter((e: any) => e.action.includes('file'))?.length || 0,
        suspiciousUrls: data?.filter((e: any) => e.action.includes('url'))?.length || 0
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const exportSecurityReport = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, `security-report-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting security report:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['Timestamp', 'Action', 'Severity', 'User ID', 'Details'];
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.created_at,
        row.action,
        row.severity,
        row.user_id || 'Anonymous',
        JSON.stringify(row.details || {}).replace(/"/g, '""')
      ].map(field => `"${field}"`).join(','))
    ];
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatEventDetails = (details: any) => {
    if (!details) return 'No details';
    return Object.entries(details)
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. This dashboard is only available to administrators.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSecurityEvents}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportSecurityReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highRiskEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileX className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Blocked Files</p>
                <p className="text-2xl font-bold">{stats.blockedUploads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Suspicious URLs</p>
                <p className="text-2xl font-bold">{stats.suspiciousUrls}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted h-16 rounded" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No security events found
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{event.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatEventDetails(event.details)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};