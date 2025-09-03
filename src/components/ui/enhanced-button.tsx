import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  success?: boolean;
  successText?: string;
  icon?: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    children, 
    loading = false, 
    loadingText,
    success = false,
    successText,
    icon,
    disabled,
    className,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "relative transition-all duration-200",
          loading && "cursor-wait",
          success && "bg-green-600 hover:bg-green-700",
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!loading && icon && (
          <span className="mr-2">{icon}</span>
        )}
        {loading ? (loadingText || "Carregando...") : 
         success ? (successText || "Sucesso!") : 
         children}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };