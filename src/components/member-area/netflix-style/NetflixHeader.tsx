// Nexus Netflix-Style Member Area - Header Component

import { Search, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NetflixHeaderProps {
  storeName: string;
  storeSlug: string;
  logo?: string;
  onSearchClick?: () => void;
  showBackButton?: boolean;
}

const NetflixHeader = ({ 
  storeName, 
  storeSlug,
  logo, 
  onSearchClick, 
  showBackButton = false 
}: NetflixHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/loja/${storeSlug}`);
  };

  const handleSettings = () => {
    navigate('/configuracoes');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border safe-area-inset-top">
      <div className="flex items-center justify-between px-3 sm:px-4 h-12 sm:h-14 safe-area-inset-left safe-area-inset-right">
        {/* Left side - Logo/Back */}
        <div className="flex items-center min-w-0 flex-1 gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center min-w-0 gap-2">
            {logo && (
              <img 
                src={logo} 
                alt={storeName}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            )}
            <h1 className="text-sm sm:text-lg font-bold text-primary truncate">
              {storeName}
            </h1>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Search Icon */}
          {onSearchClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="h-10 w-10 p-0"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {/* Settings Icon */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
            className="h-10 w-10 p-0"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default NetflixHeader;