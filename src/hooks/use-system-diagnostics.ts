import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DiagnosticResult {
  name: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  details?: any;
  executionTime?: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  results: DiagnosticResult[];
  lastCheck: Date;
}

export function useSystemDiagnostics() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async (testName: string, testFn: () => Promise<any>): Promise<DiagnosticResult> => {
    const startTime = performance.now();
    try {
      const result = await testFn();
      const executionTime = performance.now() - startTime;
      
      return {
        name: testName,
        status: 'pass',
        message: 'Teste executado com sucesso',
        details: result,
        executionTime: Math.round(executionTime)
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      logger.error(`Diagnostic test failed: ${testName}`, error);
      
      return {
        name: testName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime: Math.round(executionTime)
      };
    }
  };

  const checkDatabaseConnectivity = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw new Error(`Erro de conectividade: ${error.message}`);
    return { connected: true, response_time: 'OK' };
  };

  const checkStorageBuckets = async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(`Erro no Storage: ${error.message}`);
    
    const buckets = ['store-assets', 'store-logos', 'store-banners', 'user-avatars'];
    const missingBuckets = buckets.filter(bucket => 
      !data.find(b => b.name === bucket)
    );
    
    if (missingBuckets.length > 0) {
      throw new Error(`Buckets ausentes: ${missingBuckets.join(', ')}`);
    }
    
    return { buckets: data.length, expected: buckets.length };
  };

  const checkEdgeFunctions = async () => {
    const functions = [
      'create-stripe-checkout',
      'security-utils',
      'send-notification-email',
      'upload-file'
    ];
    
    const results = [];
    for (const func of functions) {
      try {
        const { error } = await supabase.functions.invoke(func, {
          body: { test: true }
        });
        results.push({ function: func, status: error ? 'error' : 'ok' });
      } catch (err) {
        results.push({ function: func, status: 'error', error: err });
      }
    }
    
    return results;
  };

  const checkDataIntegrity = async () => {
    // Verificar inconsistências nos dados
    const { data: orphanedProducts } = await supabase
      .from('products')
      .select('id, title')
      .is('store_id', null);

    const { data: orphanedOrders } = await supabase
      .from('orders')
      .select('id')
      .is('user_id', null);

    const issues = [];
    if (orphanedProducts?.length) {
      issues.push(`${orphanedProducts.length} produtos sem loja`);
    }
    if (orphanedOrders?.length) {
      issues.push(`${orphanedOrders.length} pedidos sem usuário`);
    }

    return {
      orphaned_products: orphanedProducts?.length || 0,
      orphaned_orders: orphanedOrders?.length || 0,
      issues: issues.length > 0 ? issues : ['Nenhum problema encontrado']
    };
  };

  const checkPerformanceMetrics = async () => {
    const metrics = {
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      navigation: performance.getEntriesByType('navigation')[0],
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };

    return metrics;
  };

  const checkSystemConfigs = async () => {
    const { data: configs, error } = await supabase
      .from('system_configs')
      .select('config_key, config_value');

    if (error) throw new Error(`Erro ao carregar configurações: ${error.message}`);

    const requiredConfigs = [
      'platform_fee_percentage',
      'max_file_size_mb',
      'allowed_file_types'
    ];

    const missing = requiredConfigs.filter(key => 
      !configs?.find(c => c.config_key === key)
    );

    return {
      total_configs: configs?.length || 0,
      missing_configs: missing,
      all_required_present: missing.length === 0
    };
  };

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    
    try {
      const results: DiagnosticResult[] = [];

      // Executar todos os testes
      results.push(await runDiagnostic('Conectividade do Banco', checkDatabaseConnectivity));
      results.push(await runDiagnostic('Storage Buckets', checkStorageBuckets));
      results.push(await runDiagnostic('Edge Functions', checkEdgeFunctions));
      results.push(await runDiagnostic('Integridade de Dados', checkDataIntegrity));
      results.push(await runDiagnostic('Métricas de Performance', checkPerformanceMetrics));
      results.push(await runDiagnostic('Configurações do Sistema', checkSystemConfigs));

      // Calcular saúde geral
      const passCount = results.filter(r => r.status === 'pass').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      const score = Math.round((passCount / results.length) * 100);
      
      let overall: 'healthy' | 'warning' | 'critical';
      if (errorCount > 0) {
        overall = 'critical';
      } else if (warningCount > 0) {
        overall = 'warning';
      } else {
        overall = 'healthy';
      }

      setHealth({
        overall,
        score,
        results,
        lastCheck: new Date()
      });

    } catch (error) {
      logger.error('Failed to run system diagnostics', error);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    health,
    isRunning,
    runFullDiagnostics
  };
}