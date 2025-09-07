import { lazy, memo } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AdminStatsSkeleton, TableSkeleton } from '@/components/ui/skeleton-loading';

// Lazy load admin sections para melhor performance
const LazyAdminUsersSection = lazy(() => import('@/components/admin/admin-users-section').then(m => ({ default: m.AdminUsersSection })));
const LazyAdminStoresSection = lazy(() => import('@/components/admin/admin-stores-section').then(m => ({ default: m.AdminStoresSection })));
const LazyAdminFinancialSection = lazy(() => import('@/components/admin/admin-financial-section').then(m => ({ default: m.AdminFinancialSection })));
const LazyAdminLogsSection = lazy(() => import('@/components/admin/admin-logs-section').then(m => ({ default: m.AdminLogsSection })));
const LazyAdminConfigsSection = lazy(() => import('@/components/admin/admin-configs-section').then(m => ({ default: m.AdminConfigsSection })));
const LazyAdminWhatsAppSection = lazy(() => import('@/components/admin/admin-whatsapp-section').then(m => ({ default: m.AdminWhatsAppSection })));
const LazyAdminDiagnosticsSection = lazy(() => import('@/components/admin/admin-diagnostics-section').then(m => ({ default: m.AdminDiagnosticsSection })));
const LazyAISystemReviewer = lazy(() => import('@/components/admin/ai-system-reviewer').then(m => ({ default: m.AISystemReviewer })));
const LazyAdminFlowValidationSection = lazy(() => import('@/components/admin/admin-flow-validation-section'));

// Error fallback otimizado para sections
const SectionErrorFallback = memo(({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
    <div className="text-center space-y-2">
      <h3 className="font-medium text-destructive">Erro ao carregar seção</h3>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={resetError}
        className="text-sm underline text-primary hover:no-underline"
      >
        Tentar novamente
      </button>
    </div>
  </div>
));

SectionErrorFallback.displayName = 'SectionErrorFallback';

// Wrapper component com error boundary
const OptimizedAdminSection = memo<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}>(({ children, fallback = <TableSkeleton /> }) => (
  <ErrorBoundary>
    <div className="min-h-[200px]">
      {children}
    </div>
  </ErrorBoundary>
));

OptimizedAdminSection.displayName = 'OptimizedAdminSection';

// Exported sections com suspense e error boundaries
export const OptimizedAdminUsersSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminUsersSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminStoresSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminStoresSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminFinancialSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminFinancialSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminLogsSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminLogsSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminConfigsSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminConfigsSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminWhatsAppSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminWhatsAppSection />
  </OptimizedAdminSection>
));

export const OptimizedAdminDiagnosticsSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminDiagnosticsSection />
  </OptimizedAdminSection>
));

export const OptimizedAISystemReviewer = memo(() => (
  <OptimizedAdminSection fallback={<AdminStatsSkeleton />}>
    <LazyAISystemReviewer />
  </OptimizedAdminSection>
));

export const OptimizedAdminFlowValidationSection = memo(() => (
  <OptimizedAdminSection>
    <LazyAdminFlowValidationSection />
  </OptimizedAdminSection>
));

export default OptimizedAdminSection;