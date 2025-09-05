import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  success: boolean;
  analysis?: string;
  fileName?: string;
  analysisType?: string;
  error?: string;
}

export const useAIStoreAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeCode = async (
    code: string, 
    fileName: string, 
    analysisType: string = 'store-customization'
  ): Promise<AnalysisResult> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-store-analyzer', {
        body: {
          code,
          fileName,
          analysisType
        }
      });

      if (error) {
        console.error('Error in AI analysis:', error);
        toast({
          title: "Erro na Análise",
          description: "Erro ao executar análise de IA",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      if (!data.success) {
        toast({
          title: "Falha na Análise",
          description: data.error || "Análise falhou",
          variant: "destructive",
        });
        return { success: false, error: data.error };
      }

      toast({
        title: "Análise Concluída!",
        description: `Análise do arquivo ${fileName} finalizada com sucesso`,
      });

      return {
        success: true,
        analysis: data.analysis,
        fileName: data.fileName,
        analysisType: data.analysisType
      };

    } catch (error: any) {
      console.error('Error calling AI analyzer:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o serviço de análise",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const analyzeMultipleFiles = async (files: Array<{
    code: string;
    fileName: string;
    analysisType?: string;
  }>): Promise<AnalysisResult[]> => {
    const results: AnalysisResult[] = [];
    
    for (const file of files) {
      const result = await analyzeCode(
        file.code, 
        file.fileName, 
        file.analysisType || 'store-customization'
      );
      results.push(result);
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  return {
    loading,
    analyzeCode,
    analyzeMultipleFiles
  };
};