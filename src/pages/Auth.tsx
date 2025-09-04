import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedSigninForm from "@/components/auth/advanced-signin-form";
import AdvancedSignupForm from "@/components/auth/advanced-signup-form";
import ResetPasswordDialog from "@/components/auth/reset-password-dialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = url.hash || "";
    const searchParams = url.searchParams;
    const isRecovery = hash.includes("type=recovery") || searchParams.get("type") === "recovery";
    const code = searchParams.get("code");

    const activateSessionFromUrl = async () => {
      try {
        // Newer flow (?code=...) — exchange for a session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) console.error("exchangeCodeForSession error", error);
        } else {
          // Legacy flow (#access_token, #refresh_token)
          const params = new URLSearchParams(hash.replace('#', ''));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) console.error("setSession error", error);
          }
        }
      } finally {
        // Clean URL to avoid leaking tokens/params
        if (code || hash.includes('access_token')) {
          window.history.replaceState({}, document.title, `${window.location.origin}/auth?type=recovery`);
        }
        if (isRecovery) setShowRecovery(true);
      }
    };

    if (isRecovery) {
      activateSessionFromUrl();
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      // If user is signed in and not in recovery, redirect
      if (!showRecovery) navigate('/biblioteca');
    }
  }, [authLoading, user, navigate, showRecovery]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 sm:p-6 safe-area-top safe-area-bottom">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 px-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-primary-foreground hover:bg-primary-foreground/10 z-10 min-h-[48px] min-w-[48px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {!isMobile && "Voltar"}
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-xl sm:text-2xl text-primary-foreground">Nexus Market</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-2">
            Bem-vindo à Plataforma Completa
          </h1>
          <p className="text-primary-foreground/80 text-base sm:text-lg px-4">
            Entre ou crie sua conta para acessar cursos e vender produtos
          </p>
        </div>

        {/* Auth Forms */}
        <div className="bg-background/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl mx-2 sm:mx-0 modal-content">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-12 sm:h-auto">
              <TabsTrigger value="signin" className="text-sm sm:text-lg py-2 sm:py-3 font-medium">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-lg py-2 sm:py-3 font-medium">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <AdvancedSigninForm />
            </TabsContent>

            <TabsContent value="signup">
              <AdvancedSignupForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Password recovery dialog */}
        <ResetPasswordDialog open={showRecovery} onOpenChange={setShowRecovery} />

        <div className="text-center mt-6 sm:mt-8 text-primary-foreground/60 px-4">
          <p className="text-xs sm:text-sm">
            Ao continuar, você concorda com nossos{" "}
            <button className="underline hover:text-primary-foreground min-h-[48px] px-2" onClick={(e) => e.preventDefault()}>
              Termos de Uso
            </button>{" "}
            e{" "}
            <button className="underline hover:text-primary-foreground min-h-[48px] px-2" onClick={(e) => e.preventDefault()}>
              Política de Privacidade
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;