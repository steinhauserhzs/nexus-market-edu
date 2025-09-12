import SEOHead from "@/components/ui/seo-head";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ProductForm from "@/components/products/product-form";
import { AdminLayout } from "@/components/layout/admin-layout";

const ProductNew = () => {
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
        title="Criar Produto - Nexus Market"
        description="Crie um novo produto para sua loja na Nexus Market."
      />
      
      <AdminLayout>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <ProductForm onSuccess={() => window.history.back()} />
        </div>
      </AdminLayout>
    </>
  );
};

export default ProductNew;