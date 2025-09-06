import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ProductForm from "@/components/products/product-form";
import BackNavigation from "@/components/layout/back-navigation";

const ProductNew = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <SEOHead 
        title="Criar Produto - Nexus Market"
        description="Crie um novo produto para sua loja na Nexus Market."
      />
      
      <div className="min-h-screen bg-background">
        <BackNavigation title="Criar Produto" />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <ProductForm onSuccess={() => window.history.back()} />
        </div>
      </div>
    </>
  );
};

export default ProductNew;