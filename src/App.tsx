import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { LazyRoute, LazyDashboard, LazyLibrary, LazyProfile, LazyCreateStore } from "./components/layout/lazy-route";
import { lazy } from "react";

// Lazy load less critical pages
const LazyCheckout = lazy(() => import("./pages/Checkout"));
const LazyStore = lazy(() => import("./pages/Store"));
const LazyProductDetails = lazy(() => import("./pages/ProductDetails"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));
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
                    <Route path="/biblioteca" element={<LazyRoute Component={LazyLibrary} />} />
                    <Route path="/dashboard" element={<LazyRoute Component={LazyDashboard} />} />
                    <Route path="/perfil" element={<LazyRoute Component={LazyProfile} />} />
                    <Route path="/checkout" element={<LazyRoute Component={LazyCheckout} />} />
                    <Route path="/criar-loja" element={<LazyRoute Component={LazyCreateStore} />} />
                    <Route path="/loja/:slug" element={<LazyRoute Component={LazyStore} />} />
                    <Route path="/produto/:slug" element={<LazyRoute Component={LazyProductDetails} />} />
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
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
