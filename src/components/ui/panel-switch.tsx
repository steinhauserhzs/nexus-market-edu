import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Store, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PanelSwitchProps {
  onModeChange?: (mode: 'buyer' | 'seller') => void;
  compact?: boolean;
  showLabels?: boolean;
}

const PanelSwitch = ({ onModeChange, compact = false, showLabels = true }: PanelSwitchProps) => {
  const [currentMode, setCurrentMode] = useState<'buyer' | 'seller'>('buyer');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleModeToggle = (checked: boolean) => {
    const newMode = checked ? 'seller' : 'buyer';
    setCurrentMode(newMode);
    onModeChange?.(newMode);
    
    // Navigate to appropriate dashboard
    if (newMode === 'seller') {
      navigate('/dashboard');
    } else {
      navigate('/biblioteca');
    }
  };

  if (!user) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <ShoppingCart className={`w-4 h-4 ${currentMode === 'buyer' ? 'text-accent' : 'text-muted-foreground'}`} />
          <Switch
            id="panel-mode"
            checked={currentMode === 'seller'}
            onCheckedChange={handleModeToggle}
            className="data-[state=checked]:bg-blue-500"
          />
          <Store className={`w-4 h-4 ${currentMode === 'seller' ? 'text-blue-500' : 'text-muted-foreground'}`} />
        </div>
        {showLabels && (
          <Badge variant={currentMode === 'buyer' ? 'default' : 'secondary'} className="text-xs">
            {currentMode === 'buyer' ? 'Comprador' : 'Vendedor'}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 space-y-3">
      <div className="text-sm font-medium text-center">Modo de Visualização</div>
      
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="panel-mode" className="flex items-center gap-2 cursor-pointer">
          <ShoppingCart className={`w-4 h-4 ${currentMode === 'buyer' ? 'text-accent' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${currentMode === 'buyer' ? 'font-medium text-accent' : 'text-muted-foreground'}`}>
            Comprador
          </span>
        </Label>
        
        <Switch
          id="panel-mode"
          checked={currentMode === 'seller'}
          onCheckedChange={handleModeToggle}
          className="data-[state=checked]:bg-blue-500"
        />
        
        <Label htmlFor="panel-mode" className="flex items-center gap-2 cursor-pointer">
          <Store className={`w-4 h-4 ${currentMode === 'seller' ? 'text-blue-500' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${currentMode === 'seller' ? 'font-medium text-blue-500' : 'text-muted-foreground'}`}>
            Vendedor
          </span>
        </Label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={currentMode === 'buyer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeToggle(false)}
          className="h-8 text-xs"
        >
          <User className="w-3 h-3 mr-1" />
          Biblioteca
        </Button>
        <Button
          variant={currentMode === 'seller' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeToggle(true)}
          className="h-8 text-xs"
        >
          <Settings className="w-3 h-3 mr-1" />
          Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PanelSwitch;