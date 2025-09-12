import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LandingProducers from "./LandingProducers";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Não redirecionar automaticamente - usuário escolhe na tela de login

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Mostra sempre a landing page (logado ou não)
  return <LandingProducers />;
};

export default Index;