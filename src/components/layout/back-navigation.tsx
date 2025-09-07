import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface BackNavigationProps {
  showHome?: boolean;
  customAction?: () => void;
  title?: string;
}

const BackNavigation = ({ showHome = true, customAction, title }: BackNavigationProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const handleBack = () => {
    if (customAction) {
      customAction();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/inicio' : '/');
    }
  };

  const handleHome = () => {
    navigate(user ? '/inicio' : '/');
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 h-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {!isMobile && "Voltar"}
          </Button>
          
          {showHome && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleHome}
              className="flex items-center gap-2 h-8"
            >
              <Home className="w-4 h-4" />
              {!isMobile && "Início"}
            </Button>
          )}
          
          {title && (
            <div className="flex-1 ml-2">
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackNavigation;