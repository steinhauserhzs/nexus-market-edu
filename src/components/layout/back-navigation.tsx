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
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "default"}
        onClick={handleBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {!isMobile && "Voltar"}
      </Button>
      
      {showHome && (
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={handleHome}
          className="flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          {!isMobile && "Início"}
        </Button>
      )}
      
      {title && (
        <div className="flex-1">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
      )}
    </div>
  );
};

export default BackNavigation;