import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import SEOHead from "@/components/ui/seo-head";
import MainHeader from "@/components/layout/main-header";
import BackNavigation from "@/components/layout/back-navigation";
import OptimizedImage from "@/components/ui/optimized-image";
import { useProducts, useCategories } from "@/hooks/use-products";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import DeleteProductDialog from "@/components/products/delete-product-dialog";
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Star,
  Clock,
  BookOpen,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

const ProductsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId?: string; productTitle?: string }>({ 
    open: false 
  });

  const { products, loading: productsLoading, refetch } = useProducts({
    storeId: user ? undefined : undefined // Para agora vamos buscar todos os produtos do usuário
  });
  
  const { categories, loading: categoriesLoading } = useCategories();

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  if (!user) {
    return (
      <>
        <SEOHead 
          title="Meus Produtos - Nexus Market"
          description="Gerencie seus produtos digitais na Nexus Market"
        />
        <MainHeader />
        <div className="min-h-screen bg-background">
          <BackNavigation title="Meus Produtos" />
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
                <p className="text-muted-foreground mb-4">
                  Faça login para gerenciar seus produtos
                </p>
                <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Meus Produtos - Nexus Market"
        description="Gerencie seus produtos digitais na Nexus Market"
      />
      <MainHeader />
      
      <div className="min-h-screen bg-background pb-20">
        <BackNavigation title="Meus Produtos" />
        
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Meus Produtos</h1>
              <p className="text-muted-foreground">Gerencie seus produtos digitais e cursos</p>
            </div>
            <Button onClick={() => navigate('/produto/novo')} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {products.length === 0 ? 'Nenhum produto encontrado' : 'Nenhum produto corresponde aos filtros'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 
                    ? 'Crie seu primeiro produto para começar a vender'
                    : 'Tente ajustar os filtros para encontrar produtos'
                  }
                </p>
                {products.length === 0 && (
                  <Button onClick={() => navigate('/produto/novo')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <div onClick={() => navigate(`/produto/${product.slug}`)}>
                    <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                      {product.thumbnail_url ? (
                        <OptimizedImage
                          src={product.thumbnail_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <Badge variant={getStatusColor(product.status)}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </div>

                      {/* Featured badge */}
                      {product.featured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-yellow-500 text-yellow-50">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Title and description */}
                      <div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {product.type}
                        </Badge>
                        {product.total_lessons && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {product.total_lessons} aulas
                          </div>
                        )}
                        {product.total_duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.ceil(product.total_duration_minutes / 60)}h
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {product.compare_price_cents && product.compare_price_cents > product.price_cents && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.compare_price_cents)}
                            </span>
                          )}
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.price_cents)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/produto/${product.slug}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           className="flex-1"
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/produto/${product.slug}/editar`);
                           }}
                         >
                           <Edit className="w-4 h-4 mr-1" />
                           Editar
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           className="text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                           onClick={(e) => {
                             e.stopPropagation();
                             setDeleteDialog({ 
                               open: true, 
                               productId: product.id, 
                               productTitle: product.title 
                             });
                           }}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results info */}
          {!productsLoading && filteredProducts.length > 0 && (
            <div className="text-center text-sm text-muted-foreground mt-6">
              Exibindo {filteredProducts.length} de {products.length} produtos
            </div>
          )}
        </div>

        {/* Delete Product Dialog */}
        <DeleteProductDialog
          productId={deleteDialog.productId || ''}
          productTitle={deleteDialog.productTitle || ''}
          isOpen={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open })}
          onDeleted={() => {
            refetch();
            setDeleteDialog({ open: false });
          }}
        />
      </div>
    </>
  );
};

export default ProductsList;