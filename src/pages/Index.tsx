import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LandingProducers from "./LandingProducers";
import LoadingSpinner from "@/components/ui/loading-spinner";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redireciona usuário logado para o dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não estiver logado, mostra a landing page
  if (!user) {
    return <LandingProducers />;
  }

  // Se chegou até aqui, está redirecionando
  return null;
};

export default Index;