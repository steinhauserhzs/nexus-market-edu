import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export default function NotificationBadge({
  count,
  max = 99,
  size = "md",
  className,
  children
}: NotificationBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm"
  };

  const displayCount = count > max ? `${max}+` : count.toString();
  const shouldShow = count > 0;

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      {shouldShow && (
        <div className={cn(
          "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground font-medium leading-none",
          sizeClasses[size],
          count > 9 && "px-1 min-w-fit"
        )}>
          {displayCount}
        </div>
      )}
    </div>
  );
}