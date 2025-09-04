import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface StorePreviewModeProps {
  children: React.ReactNode;
}

const StorePreviewMode = ({ children }: StorePreviewModeProps) => {
  const [searchParams] = useSearchParams();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPreviewBar, setShowPreviewBar] = useState(true);

  useEffect(() => {
    const preview = searchParams.get('preview');
    setIsPreviewMode(preview === '1');
  }, [searchParams]);

  const refreshPreview = () => {
    window.location.reload();
  };

  const exitPreview = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('preview');
    window.location.href = currentUrl.toString();
  };

  if (!isPreviewMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Preview Bar */}
      {showPreviewBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Modo Visualização</span>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Preview
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshPreview}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Atualizar
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreviewBar(false)}
              className="text-white hover:bg-white/20"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={exitPreview}
              className="bg-white text-amber-500 hover:bg-gray-100"
            >
              Sair do Preview
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={showPreviewBar && isPreviewMode ? 'pt-16' : ''}>
        {children}
      </div>

      {/* Floating Preview Toggle (when bar is hidden) */}
      {!showPreviewBar && isPreviewMode && (
        <button
          onClick={() => setShowPreviewBar(true)}
          className="fixed top-4 right-4 z-50 bg-amber-500 text-white p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default StorePreviewMode;