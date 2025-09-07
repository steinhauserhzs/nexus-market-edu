import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BreadcrumbNavigation from "@/components/layout/breadcrumb-navigation";
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
const LazyCoursePlayer = lazy(() => import('./pages/CoursePlayer'));
const LazyAdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LazyNotFound = lazy(() => import('./pages/NotFound'));
const LazyContact = lazy(() => import('./pages/Contact'));
const LazyProductNew = lazy(() => import('./pages/ProductNew'));
const LazyProductsList = lazy(() => import('./pages/ProductsList'));
const LazyProductEdit = lazy(() => import('./pages/ProductEdit'));
const LazyPersonalizarLoja = lazy(() => import('./pages/PersonalizarLoja'));
const LazyAnalytics = lazy(() => import('./pages/Analytics'));
const LazyClientes = lazy(() => import('./pages/Clientes'));
const LazyFlowValidation = lazy(() => import('./pages/FlowValidation'));
const LazyCouponManagement = lazy(() => import('./pages/CouponManagement'));
const LazyDashboardHome = lazy(() => import('./pages/DashboardHome'));
const LazyStoresList = lazy(() => import('./pages/StoresList'));
const LazyStoreConfiguracoes = lazy(() => import('./pages/StoreConfiguracoes'));
import MobileNavigation from "./components/layout/mobile-navigation";
import MobileGestures from "./components/layout/mobile-gestures";
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
                <BreadcrumbNavigation />
            <MobileGestures>
              <div className="pb-16 md:pb-0">
                 <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<LazyRoute Component={LazyDashboard} />} />
          <Route path="/vendedor" element={<LazyRoute Component={LazySellerDashboardSlim} />} />
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
                   <Route path="/curso/:slug/aula/:lessonId" element={<LazyRoute Component={LazyCoursePlayer} />} />
                   <Route path="/admin" element={<LazyRoute Component={LazyAdminDashboard} />} />
                   <Route path="/contato" element={<LazyRoute Component={LazyContact} />} />
                   <Route path="/flow-validation" element={<LazyRoute Component={LazyFlowValidation} />} />
                   <Route path="/cupons" element={<LazyRoute Component={LazyCouponManagement} />} />
            <Route path="/produto/novo" element={<LazyRoute Component={LazyProductNew} />} />
            <Route path="/produtos" element={<LazyRoute Component={LazyProductsList} />} />
            <Route path="/produto/:slug/editar" element={<LazyRoute Component={LazyProductEdit} />} />
                   <Route path="/personalizar-loja" element={<LazyRoute Component={LazyPersonalizarLoja} />} />
                   <Route path="/analytics" element={<LazyRoute Component={LazyAnalytics} />} />
                   <Route path="/inicio" element={<LazyRoute Component={LazyDashboardHome} />} />
                   <Route path="/lojas" element={<LazyRoute Component={LazyStoresList} />} />
                   <Route path="/loja/:slug/configuracoes" element={<LazyRoute Component={LazyStoreConfiguracoes} />} />
                   <Route path="/clientes" element={<LazyRoute Component={LazyClientes} />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                   <Route path="*" element={<LazyRoute Component={LazyNotFound} />} />
                </Routes>
                <MobileNavigation />
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
