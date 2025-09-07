import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Star,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  query: string;
  category?: string;
  priceRange: [number, number];
  rating?: number;
  type?: string;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  difficulty?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear?: () => void;
  initialFilters?: Partial<SearchFilters>;
  categories?: Array<{ id: string; name: string; }>;
  className?: string;
}

const defaultFilters: SearchFilters = {
  query: '',
  priceRange: [0, 50000], // R$ 0 - R$ 500
  sortBy: 'relevance'
};

export default function AdvancedSearch({
  onSearch,
  onClear,
  initialFilters = {},
  categories = [],
  className
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onClear?.();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.category) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.rating) count++;
    if (filters.type) count++;
    if (filters.difficulty) count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, cursos..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              </div>

              <Separator />

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Categoria
                  </Label>
                  <Select 
                    value={filters.category || ""} 
                    onValueChange={(value) => updateFilter('category', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Faixa de Preço
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={50000}
                    min={0}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Avaliação Mínima
                </Label>
                <Select 
                  value={filters.rating?.toString() || ""} 
                  onValueChange={(value) => updateFilter('rating', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer avaliação</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="1">1+ estrela</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Produto</Label>
                <Select 
                  value={filters.type || ""} 
                  onValueChange={(value) => updateFilter('type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="curso">Curso</SelectItem>
                    <SelectItem value="ebook">E-book</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nível de Dificuldade</Label>
                <Select 
                  value={filters.difficulty || ""} 
                  onValueChange={(value) => updateFilter('difficulty', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer nível</SelectItem>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ordenar Por
                </Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => updateFilter('sortBy', value as SearchFilters['sortBy'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevância</SelectItem>
                    <SelectItem value="popular">Mais Popular</SelectItem>
                    <SelectItem value="newest">Mais Recente</SelectItem>
                    <SelectItem value="rating">Melhor Avaliado</SelectItem>
                    <SelectItem value="price_asc">Menor Preço</SelectItem>
                    <SelectItem value="price_desc">Maior Preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              "{filters.query}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('query', '')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Categoria: {categories.find(c => c.id === filters.category)?.name}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('category', undefined)}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) && (
            <Badge variant="secondary" className="gap-1">
              {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('priceRange', [0, 50000])}
              />
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="gap-1">
              {filters.rating}+ estrelas
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => updateFilter('rating', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}