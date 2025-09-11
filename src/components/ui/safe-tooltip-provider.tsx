import React from "react";

// Plano B temporário para evitar tela branca enquanto React estabiliza
export const SafeTooltipProvider: React.FC<React.PropsWithChildren> = ({ children }) => <>{children}</>;

export default SafeTooltipProvider;