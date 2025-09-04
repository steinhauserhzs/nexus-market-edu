import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdvancedSigninForm from "@/components/auth/advanced-signin-form";
import AdvancedSignupForm from "@/components/auth/advanced-signup-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/biblioteca');
    }
  }, [authLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {!isMobile && "Voltar"}
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-2xl text-primary-foreground">Nexus Market</span>
          </div>
          
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Bem-vindo à Plataforma Completa
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Entre ou crie sua conta para acessar cursos e vender produtos
          </p>
        </div>

        {/* Auth Forms */}
        <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin" className="text-lg py-3">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-lg py-3">
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

        {/* Footer */}
        <div className="text-center mt-8 text-primary-foreground/60">
          <p className="text-sm">
            Ao continuar, você concorda com nossos{" "}
            <button className="underline hover:text-primary-foreground" onClick={(e) => e.preventDefault()}>
              Termos de Uso
            </button>{" "}
            e{" "}
            <button className="underline hover:text-primary-foreground" onClick={(e) => e.preventDefault()}>
              Política de Privacidade
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;