import React from "react";

// Arquivo de diagnóstico temporário para verificar se React está funcionando
console.log("React is null?", React == null);
console.log("React object:", React);
console.log("React.useEffect exists?", typeof React.useEffect === 'function');

export const ReactDiagnostics = () => {
  console.log("Component render - React is null?", React == null);
  return <div>React diagnostics loaded</div>;
};