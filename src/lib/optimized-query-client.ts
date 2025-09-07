import { QueryClient } from "@tanstack/react-query";

// Configuração otimizada do QueryClient para performance
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache por 10 minutos para dados estáticos
        staleTime: 10 * 60 * 1000, 
        // Cache em background por 15 minutos
        gcTime: 15 * 60 * 1000,
        // Retry apenas 1 vez para falhas de rede
        retry: 1,
        // Retry delay com backoff exponencial
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Não refetch automaticamente no window focus para economizar recursos
        refetchOnWindowFocus: false,
        // Refetch na reconexão apenas para queries importantes
        refetchOnReconnect: 'always',
        // Não refetch no mount se os dados ainda são fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations apenas 1 vez
        retry: 1,
        // Timeout para mutations (use gcTime instead of mutationCacheTime)
        gcTime: 5 * 60 * 1000,
      },
    },
  });
};