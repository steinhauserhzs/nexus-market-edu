import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdvancedSearch, { SearchFilters } from '@/components/ui/advanced-search';
import { cn } from '@/lib/utils';

interface EnhancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  showAdvanced?: boolean;
  categories?: Array<{ id: string; name: string; }>;
}

export default function EnhancedSearchBar({
  onSearch,
  onClear,
  placeholder = "Buscar produtos, cursos...",
  className,
  showAdvanced = true,
  categories = []
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search suggestions - could be fetched from API
  const [suggestions] = useState([
    'Curso de React',
    'JavaScript Avançado',
    'Design System',
    'TypeScript',
    'Node.js',
    'Python para iniciantes',
    'Marketing Digital',
    'Photoshop',
    'WordPress'
  ]);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchFilters?: Partial<SearchFilters>) => {
    const filters: SearchFilters = {
      query,
      priceRange: [0, 50000],
      sortBy: 'relevance',
      ...searchFilters
    };
    onSearch(filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch({ query: suggestion });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    onClear?.();
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl mx-auto", className)}>
      {/* Main Search Input */}
      <div className={cn(
        "relative flex items-center transition-all duration-200",
        isFocused && "ring-2 ring-accent/20 rounded-lg"
      )}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-10 pr-20 h-12 text-base",
            "border-border/50 focus:border-accent/50",
            "bg-card/50 backdrop-blur-sm",
            query && "pr-24"
          )}
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={() => handleSearch()}
            size="sm"
            className="h-8 px-3"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border/30">
            <div className="text-xs text-muted-foreground font-medium">Sugestões de busca</div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-muted-foreground" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Search Component */}
      {showAdvanced && (
        <div className="mt-3">
          <AdvancedSearch
            onSearch={handleSearch}
            onClear={handleClear}
            categories={categories}
            initialFilters={{ query }}
          />
        </div>
      )}
    </div>
  );
}