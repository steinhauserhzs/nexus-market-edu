import { cn } from "@/lib/utils";
import LoadingSpinner from "./loading-spinner";

interface PageLoaderProps {
  className?: string;
  text?: string;
}

export default function PageLoader({ 
  className,
  text = "Carregando..."
}: PageLoaderProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-background", className)}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}