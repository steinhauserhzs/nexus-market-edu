// Nexus Netflix-Style Member Area - Products List View

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NetflixHeader from './NetflixHeader';
import NetflixBottomTabs from './NetflixBottomTabs';
import NetflixCard from './NetflixCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useMemberAreaNetflix } from '@/hooks/use-member-area-netflix';

const NetflixProductsList = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { products, config, loading } = useMemberAreaNetflix(storeSlug);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'owned' && product.owned) ||
                         (filterType === 'available' && !product.owned) ||
                         (filterType === 'courses' && product.type === 'curso') ||
                         (filterType === 'digital' && product.type === 'digital');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NetflixHeader storeName="Carregando..." storeSlug={storeSlug || ''} showBackButton />
        <main className="pt-16 pb-20">
          <div className="animate-pulse p-4 space-y-6">
            <div className="h-10 bg-secondary rounded w-full max-w-md"></div>
            <div className="netflix-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <NetflixBottomTabs storeSlug={storeSlug || ''} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground">Esta loja não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Notice */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-500/90 backdrop-blur text-black text-center py-2 px-4 text-sm font-medium safe-area-inset-top">
        🎬 Preview da Área de Membros - Lista de Produtos
      </div>
      
      <NetflixHeader 
        storeName={config.storeName}
        storeSlug={config.storeSlug}
        showBackButton={true}
      />
      
      <main className="pt-12 sm:pt-16 pb-20 safe-area-inset-left safe-area-inset-right" style={{ marginTop: '32px' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Todos os Produtos</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="owned">Meus Produtos</SelectItem>
                <SelectItem value="available">Disponíveis</SelectItem>
                <SelectItem value="courses">Cursos</SelectItem>
                <SelectItem value="digital">Produtos Digitais</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum produto encontrado
              </p>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'netflix-grid' : 'space-y-4'}>
              {filteredProducts.map((product, index) => (
                viewMode === 'grid' ? (
                  <NetflixCard 
                    key={product.id}
                    product={product}
                    itemIndex={index}
                    storeSlug={config.storeSlug}
                  />
                ) : (
                  <div 
                    key={product.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/loja/${config.storeSlug}/area-membros/produto/${product.id}`)}
                  >
                    <img
                      src={product.cover}
                      alt={product.title}
                      className="w-16 h-24 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.title}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {product.type === 'curso' ? 'Curso' : 'Produto Digital'}
                      </p>
                      {product.owned ? (
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                          Adquirido
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </main>

      <NetflixBottomTabs storeSlug={config.storeSlug} />
    </div>
  );
};

export default NetflixProductsList;