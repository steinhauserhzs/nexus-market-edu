import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAICodeReviewer, CodeReviewResult, CodeReviewIssue } from '@/hooks/use-ai-code-reviewer';
import { 
  Shield, 
  Zap, 
  Bug, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Play,
  Clock,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

// Simulated file list - in a real implementation, this would come from your file system or git
const SYSTEM_FILES = [
  { fileName: 'src/components/auth/advanced-signin-form.tsx', context: 'Authentication component' },
  { fileName: 'src/hooks/use-secure-payment-info.ts', context: 'Payment security hook' },  
  { fileName: 'src/pages/AdminDashboard.tsx', context: 'Admin dashboard with sensitive data' },
  { fileName: 'src/integrations/supabase/client.ts', context: 'Database client configuration' },
  { fileName: 'supabase/functions/create-stripe-checkout/index.ts', context: 'Payment edge function' },
  { fileName: 'src/components/security/SecurityProvider.tsx', context: 'Security context provider' },
  { fileName: 'src/hooks/use-admin.ts', context: 'Admin functionality hook' },
  { fileName: 'src/components/ui/enhanced-file-upload.tsx', context: 'File upload component' },
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'outline';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default: return <Bug className="h-4 w-4" />;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'security': return <Shield className="h-4 w-4" />;
    case 'performance': return <Zap className="h-4 w-4" />;
    case 'bug': return <Bug className="h-4 w-4" />;
    case 'improvement': return <TrendingUp className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

interface IssueCardProps {
  issue: CodeReviewIssue;
  fileName: string;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, fileName }) => (
  <Card className="mb-4">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getSeverityIcon(issue.severity)}
          <Badge variant={getSeverityColor(issue.severity) as any}>
            {issue.severity.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getTypeIcon(issue.type)}
            {issue.type}
          </Badge>
        </div>
        {issue.line && (
          <Badge variant="secondary">Linha {issue.line}</Badge>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <h4 className="font-medium mb-2">{issue.description}</h4>
      <p className="text-sm text-muted-foreground mb-3">{issue.suggestion}</p>
      {issue.code && (
        <div className="bg-muted p-3 rounded-md">
          <p className="text-xs text-muted-foreground mb-2">Código sugerido:</p>
          <pre className="text-sm overflow-x-auto">
            <code>{issue.code}</code>
          </pre>
        </div>
      )}
    </CardContent>
  </Card>
);

export const AISystemReviewer: React.FC = () => {
  const { 
    isReviewing, 
    reviewResults, 
    systemSummary, 
    reviewMultipleFiles,
    exportReviewReport 
  } = useAICodeReviewer();

  const [selectedReviewType, setSelectedReviewType] = useState<'security' | 'performance' | 'functionality' | 'complete'>('complete');

  const handleSystemReview = useCallback(async () => {
    try {
      // In a real implementation, you would fetch actual file contents
      // For demo purposes, we'll use placeholder content
      const filesWithContent = SYSTEM_FILES.map(file => ({
        ...file,
        code: `// Placeholder content for ${file.fileName}\n// This would contain the actual file content in a real implementation`
      }));

      await reviewMultipleFiles(filesWithContent, selectedReviewType);
    } catch (error) {
      console.error('Error during system review:', error);
      toast.error('Erro durante a revisão do sistema');
    }
  }, [reviewMultipleFiles, selectedReviewType]);

  const handleExportReport = useCallback(() => {
    if (reviewResults.length > 0) {
      exportReviewReport(reviewResults);
    } else {
      toast.error('Nenhuma análise disponível para exportar');
    }
  }, [reviewResults, exportReviewReport]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revisor Automático de Sistema - IA
          </CardTitle>
          <CardDescription>
            Análise completa do sistema usando IA para identificar problemas de segurança, performance e funcionalidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tipo de Análise:</label>
              <select 
                value={selectedReviewType} 
                onChange={(e) => setSelectedReviewType(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="complete">Completa</option>
                <option value="security">Segurança</option>
                <option value="performance">Performance</option>
                <option value="functionality">Funcionalidade</option>
              </select>
            </div>
            
            <Button 
              onClick={handleSystemReview} 
              disabled={isReviewing}
              className="flex items-center gap-2"
            >
              {isReviewing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar Análise
                </>
              )}
            </Button>

            {reviewResults.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleExportReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Relatório
              </Button>
            )}
          </div>

          {systemSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Score Geral</p>
                      <p className="text-2xl font-bold">{Math.round(systemSummary.averageScore)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                  <Progress value={systemSummary.averageScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Segurança</p>
                      <p className="text-2xl font-bold">{Math.round(systemSummary.securityScore)}</p>
                    </div>
                    <Shield className={`h-8 w-8 ${systemSummary.securityScore > 80 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <Progress value={systemSummary.securityScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Performance</p>
                      <p className="text-2xl font-bold">{Math.round(systemSummary.performanceScore)}</p>
                    </div>
                    <Zap className={`h-8 w-8 ${systemSummary.performanceScore > 80 ? 'text-green-500' : 'text-orange-500'}`} />
                  </div>
                  <Progress value={systemSummary.performanceScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Issues Críticos</p>
                      <p className="text-2xl font-bold text-red-500">{systemSummary.criticalIssues}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {reviewResults.length > 0 && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="critical">Críticos ({systemSummary?.criticalIssues || 0})</TabsTrigger>
            <TabsTrigger value="high">Altos ({systemSummary?.highIssues || 0})</TabsTrigger>
            <TabsTrigger value="all">Todos ({systemSummary?.totalIssues || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{systemSummary?.totalFiles}</p>
                    <p className="text-sm text-muted-foreground">Arquivos Analisados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{systemSummary?.criticalIssues}</p>
                    <p className="text-sm text-muted-foreground">Críticos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-500">{systemSummary?.highIssues}</p>
                    <p className="text-sm text-muted-foreground">Altos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">{systemSummary?.mediumIssues}</p>
                    <p className="text-sm text-muted-foreground">Médios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{result.fileName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Score: {result.overallScore}</Badge>
                      <Badge variant="secondary">{result.issues.length} issues</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{result.summary}</p>
                    <div className="flex gap-1">
                      {result.issues.filter(i => i.severity === 'critical').length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {result.issues.filter(i => i.severity === 'critical').length} críticos
                        </Badge>
                      )}
                      {result.issues.filter(i => i.severity === 'high').length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {result.issues.filter(i => i.severity === 'high').length} altos
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="critical">
            <ScrollArea className="h-96">
              {reviewResults.map((result) => 
                result.issues
                  .filter(issue => issue.severity === 'critical')
                  .map((issue, index) => (
                    <IssueCard key={`${result.fileName}-${index}`} issue={issue} fileName={result.fileName} />
                  ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="high">
            <ScrollArea className="h-96">
              {reviewResults.map((result) => 
                result.issues
                  .filter(issue => issue.severity === 'high')
                  .map((issue, index) => (
                    <IssueCard key={`${result.fileName}-${index}`} issue={issue} fileName={result.fileName} />
                  ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all">
            <ScrollArea className="h-96">
              {reviewResults.map((result) => (
                <div key={result.fileName} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {result.fileName}
                    <Badge variant="outline">Score: {result.overallScore}</Badge>
                  </h3>
                  {result.issues.map((issue, index) => (
                    <IssueCard key={index} issue={issue} fileName={result.fileName} />
                  ))}
                  <Separator className="my-4" />
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};