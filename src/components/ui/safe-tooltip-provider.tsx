import React from "react";

// Fallback provider to avoid crashes if Radix Tooltip causes issues due to React duplication
// Temporarily replace <TooltipProvider> with <SafeTooltipProvider> if needed.
export const SafeTooltipProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

export default SafeTooltipProvider;
