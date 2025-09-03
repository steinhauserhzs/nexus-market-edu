import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const result = await asyncFunction();
      setState({ loading: false, error: null, data: result });
    } catch (error) {
      setState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        data: null 
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}