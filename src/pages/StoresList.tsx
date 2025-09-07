import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import BackNavigation from "@/components/layout/back-navigation";
import StoresSection from "@/components/dashboard/stores-section";

const StoresList = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <SEOHead 
        title="Minhas Lojas - Nexus Market"
        description="Gerencie todas as suas lojas na Nexus Market."
      />
      
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Minhas Lojas" />
        
        <div className="container mx-auto px-3 py-4 max-w-4xl">
          <StoresSection />
        </div>
      </div>
    </>
  );
};

export default StoresList;