import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import MobileNavigation from "./components/layout/mobile-navigation";
import MobileGestures from "./components/layout/mobile-gestures";
import PWAInstallPrompt from "./components/ui/pwa-install-prompt";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
            <BrowserRouter>
              <MobileGestures>
                <div className="pb-16 md:pb-0">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/biblioteca" element={<Library />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <MobileNavigation />
                  <PWAInstallPrompt />
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
