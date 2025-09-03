import { cn } from "@/lib/utils";
import { Button } from "./button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ 
  title = "Algo deu errado",
  description = "Tente novamente em alguns minutos",
  onRetry,
  className
}: ErrorStateProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background p-4", className)}>
      <div className="text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  );
}