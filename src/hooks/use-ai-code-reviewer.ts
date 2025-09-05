import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CodeReviewIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'bug' | 'improvement';
  line?: number;
  description: string;
  suggestion: string;
  code?: string;
}

export interface CodeReviewResult {
  fileName: string;
  reviewType: string;
  issues: CodeReviewIssue[];
  overallScore: number;
  summary: string;
}

export interface SystemReviewSummary {
  totalFiles: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  averageScore: number;
  securityScore: number;
  performanceScore: number;
  functionalityScore: number;
}

export const useAICodeReviewer = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState<CodeReviewResult[]>([]);
  const [systemSummary, setSystemSummary] = useState<SystemReviewSummary | null>(null);

  const reviewSingleFile = async (
    code: string, 
    fileName: string, 
    reviewType: 'security' | 'performance' | 'functionality' | 'complete' = 'complete',
    context?: string
  ): Promise<CodeReviewResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-code-reviewer', {
        body: { code, fileName, reviewType, context }
      });

      if (error) throw error;
      return data as CodeReviewResult;
    } catch (error) {
      console.error('Error reviewing file:', error);
      toast.error(`Erro ao revisar ${fileName}: ${error.message}`);
      throw error;
    }
  };

  const reviewMultipleFiles = async (
    files: Array<{ code: string; fileName: string; context?: string }>,
    reviewType: 'security' | 'performance' | 'functionality' | 'complete' = 'complete'
  ) => {
    setIsReviewing(true);
    const results: CodeReviewResult[] = [];

    try {
      for (const file of files) {
        toast.info(`Analisando ${file.fileName}...`);
        const result = await reviewSingleFile(file.code, file.fileName, reviewType, file.context);
        results.push(result);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setReviewResults(results);
      generateSystemSummary(results);
      toast.success(`Análise completa! ${results.length} arquivos revisados.`);
      
    } catch (error) {
      console.error('Error in batch review:', error);
      toast.error('Erro durante a análise em lote');
    } finally {
      setIsReviewing(false);
    }
  };

  const generateSystemSummary = (results: CodeReviewResult[]) => {
    const totalFiles = results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0);
    const highIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0);
    const mediumIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'medium').length, 0);
    const lowIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'low').length, 0);
    const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / totalFiles;

    // Calculate specific scores based on issue types
    const securityIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'security').length, 0);
    const performanceIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'performance').length, 0);
    const functionalityIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'bug').length, 0);

    const securityScore = Math.max(0, 100 - (securityIssues * 10));
    const performanceScore = Math.max(0, 100 - (performanceIssues * 8));
    const functionalityScore = Math.max(0, 100 - (functionalityIssues * 12));

    setSystemSummary({
      totalFiles,
      totalIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      averageScore,
      securityScore,
      performanceScore,
      functionalityScore
    });
  };

  const getReviewHistory = async () => {
    try {
      // For now, return empty array since the types aren't updated yet
      // This will be fixed when the Supabase types are regenerated
      console.log('Review history will be available after types update');
      return [];
    } catch (error) {
      console.error('Error fetching review history:', error);
      toast.error('Erro ao buscar histórico de revisões');
      return [];
    }
  };

  const exportReviewReport = (results: CodeReviewResult[]) => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: systemSummary,
      results: results,
      recommendations: generateRecommendations(results)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado com sucesso!');
  };

  const generateRecommendations = (results: CodeReviewResult[]): string[] => {
    const recommendations: string[] = [];
    const criticalCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0);
    const securityCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'security').length, 0);
    const performanceCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'performance').length, 0);

    if (criticalCount > 0) {
      recommendations.push('🚨 Priorize a correção dos problemas críticos imediatamente');
    }
    
    if (securityCount > 5) {
      recommendations.push('🔒 Implementar revisão de segurança mais rigorosa');
    }
    
    if (performanceCount > 10) {
      recommendations.push('⚡ Considerar otimizações de performance em todo o sistema');
    }

    recommendations.push('📋 Implementar testes automatizados para os problemas identificados');
    recommendations.push('🔄 Agendar revisões regulares de código');

    return recommendations;
  };

  return {
    isReviewing,
    reviewResults,
    systemSummary,
    reviewSingleFile,
    reviewMultipleFiles,
    getReviewHistory,
    exportReviewReport,
    generateSystemSummary
  };
};