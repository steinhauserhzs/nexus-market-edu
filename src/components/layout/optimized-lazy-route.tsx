import { Suspense, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface OptimizedLazyRouteProps {
  Component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Componente de loading otimizado
const OptimizedLoadingFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner />
      <p className="text-sm text-muted-foreground animate-pulse">
        Carregando...
      </p>
    </div>
  </div>
));

OptimizedLoadingFallback.displayName = 'OptimizedLoadingFallback';

// Error fallback otimizado
const OptimizedErrorFallback = memo(({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center space-y-4 max-w-md">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
        <span className="text-destructive text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        Erro ao carregar página
      </h2>
      <p className="text-sm text-muted-foreground">
        {error.message || 'Ocorreu um erro inesperado'}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  </div>
));

OptimizedErrorFallback.displayName = 'OptimizedErrorFallback';

// Route component otimizado com error boundary e suspense
const OptimizedLazyRoute = memo<OptimizedLazyRouteProps>(({ 
  Component, 
  fallback,
  errorFallback 
}) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <OptimizedLoadingFallback />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
});

OptimizedLazyRoute.displayName = 'OptimizedLazyRoute';

export default OptimizedLazyRoute;