import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import { LazyRoute, LazyDashboard, LazyLibrary, LazyProfile } from "./components/layout/lazy-route";
import { lazy } from "react";

const LazySellerDashboardSlim = lazy(() => import('./pages/SellerDashboardSlim'));
const LazyCreateStore = lazy(() => import('./pages/CreateStore'));
const LazyStore = lazy(() => import('./pages/Store'));
const LazyStoreCustomizer = lazy(() => import('./pages/StoreCustomizer'));
const LazyProductDetails = lazy(() => import('./pages/ProductDetails'));
const LazyCheckout = lazy(() => import('./pages/Checkout'));
const LazyMemberArea = lazy(() => import('./pages/MemberArea'));
const LazyMemberAreaConfig = lazy(() => import('./pages/MemberAreaConfig'));
const LazyMemberAreaAdvanced = lazy(() => import('./pages/MemberAreaAdvanced'));
const LazyNetflixDashboard = lazy(() => import('./pages/NetflixDashboard'));
const LazyAdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LazyNotFound = lazy(() => import('./pages/NotFound'));
const LazyContact = lazy(() => import('./pages/Contact'));
const LazyProductNew = lazy(() => import('./pages/ProductNew'));
const LazyPersonalizarLoja = lazy(() => import('./pages/PersonalizarLoja'));
const LazyAnalytics = lazy(() => import('./pages/Analytics'));
const LazyDashboardHome = lazy(() => import('./pages/DashboardHome'));
import MobileNavigation from "./components/layout/mobile-navigation";
import MobileGestures from "./components/layout/mobile-gestures";
import PWAInstallPrompt from "./components/ui/pwa-install-prompt";
import PerformanceMonitor from "./components/ui/performance-monitor";

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter 
                future={{ 
                  v7_startTransition: true,
                  v7_relativeSplatPath: true 
                }}
              >
            <MobileGestures>
              <div className="pb-16 md:pb-0">
                 <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<LazyRoute Component={LazySellerDashboardSlim} />} />
          <Route path="/biblioteca" element={<LazyRoute Component={LazyLibrary} />} />
                  <Route path="/perfil" element={<LazyRoute Component={LazyProfile} />} />
                  <Route path="/checkout" element={<LazyRoute Component={LazyCheckout} />} />
                  <Route path="/carrinho" element={<LazyRoute Component={LazyCheckout} />} />
                  <Route path="/criar-loja" element={<LazyRoute Component={LazyCreateStore} />} />
                   <Route path="/loja/:slug" element={<LazyRoute Component={LazyStore} />} />
                   <Route path="/loja/:slug/membros" element={<LazyRoute Component={LazyMemberArea} />} />
                   <Route path="/loja/:slug/configurar-membros" element={<LazyRoute Component={LazyMemberAreaConfig} />} />
                   <Route path="/loja/:slug/customizar" element={<LazyRoute Component={LazyStoreCustomizer} />} />
                   <Route path="/produto/:slug" element={<LazyRoute Component={LazyProductDetails} />} />
                   <Route path="/member-area-advanced/:storeId" element={<LazyRoute Component={LazyMemberAreaAdvanced} />} />
                   <Route path="/demo" element={<Demo />} />
                   <Route path="/netflix" element={<LazyRoute Component={LazyNetflixDashboard} />} />
                   <Route path="/admin" element={<LazyRoute Component={LazyAdminDashboard} />} />
                   <Route path="/contato" element={<LazyRoute Component={LazyContact} />} />
                   <Route path="/produto/novo" element={<LazyRoute Component={LazyProductNew} />} />
                   <Route path="/personalizar-loja" element={<LazyRoute Component={LazyPersonalizarLoja} />} />
                   <Route path="/analytics" element={<LazyRoute Component={LazyAnalytics} />} />
                   <Route path="/inicio" element={<LazyRoute Component={LazyDashboardHome} />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                   <Route path="*" element={<LazyRoute Component={LazyNotFound} />} />
                </Routes>
                <MobileNavigation />
                <PWAInstallPrompt />
                <PerformanceMonitor />
              </div>
            </MobileGestures>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
</ErrorBoundary>
);

export default App;
