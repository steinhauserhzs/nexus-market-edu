import { Suspense, lazy } from "react";
import PageLoader from "@/components/ui/page-loader";
import ErrorState from "@/components/ui/error-state";

interface LazyRouteProps {
  Component: React.ComponentType;
  fallback?: React.ReactNode;
}

export function LazyRoute({ 
  Component, 
  fallback = <PageLoader /> 
}: LazyRouteProps) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}

// Pre-configured lazy components with error boundaries
export const LazyDashboard = lazy(() => 
  import("@/pages/Dashboard").catch(() => ({
    default: () => <ErrorState title="Erro ao carregar Dashboard" onRetry={() => window.location.reload()} />
  }))
);

export const LazyCreateStore = lazy(() => 
  import("@/pages/CreateStore").catch(() => ({
    default: () => <ErrorState title="Erro ao carregar Criar Loja" onRetry={() => window.location.reload()} />
  }))
);

export const LazyLibrary = lazy(() => 
  import("@/pages/Library").catch(() => ({
    default: () => <ErrorState title="Erro ao carregar Biblioteca" onRetry={() => window.location.reload()} />
  }))
);

export const LazyProfile = lazy(() => 
  import("@/pages/Profile").catch(() => ({
    default: () => <ErrorState title="Erro ao carregar Perfil" onRetry={() => window.location.reload()} />
  }))
);