import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SuccessAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SuccessAnimation({
  visible,
  onComplete,
  size = "md",
  className
}: SuccessAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  useEffect(() => {
    if (!visible) {
      setAnimationStep(0);
      return;
    }

    const timers = [
      setTimeout(() => setAnimationStep(1), 100),
      setTimeout(() => setAnimationStep(2), 300),
      setTimeout(() => {
        setAnimationStep(3);
        onComplete?.();
      }, 800)
    ];

    return () => timers.forEach(clearTimeout);
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full border-2 transition-all duration-300",
      sizeClasses[size],
      animationStep >= 1 && "border-green-500 bg-green-50",
      animationStep >= 2 && "scale-110",
      animationStep >= 3 && "scale-100",
      className
    )}>
      <Check className={cn(
        "transition-all duration-300",
        iconSizes[size],
        animationStep >= 2 ? "text-green-600 scale-100" : "text-transparent scale-50"
      )} />
    </div>
  );
}