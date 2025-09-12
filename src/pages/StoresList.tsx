import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SEOHead from "@/components/ui/seo-head";
import { AdminLayout } from "@/components/layout/admin-layout";
import StoresSection from "@/components/dashboard/stores-section";

const StoresList = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
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
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <StoresSection />
        </div>
      </AdminLayout>
    </>
  );
};

export default StoresList;