import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  'inicio': 'Início',
  'dashboard': 'Dashboard',
  'lojas': 'Minhas Lojas',
  'produtos': 'Meus Produtos',
  'produto': 'Produto',
  'novo': 'Novo',
  'editar': 'Editar',
  'loja': 'Loja',
  'configuracoes': 'Configurações',
  'clientes': 'Clientes',
  'analytics': 'Analytics',
  'perfil': 'Perfil',
  'checkout': 'Checkout',
  'auth': 'Entrar',
  'area-membro': 'Área do Membro',
  'netflix': 'Cursos'
};

export default function BreadcrumbNavigation() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0 || pathSegments[0] === 'inicio') {
    return null; // Não mostrar breadcrumbs na página inicial
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Início', href: '/inicio' }
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Pular IDs/slugs dinâmicos (assumindo que são UUIDs ou não têm tradução)
    if (segment.match(/^[a-f0-9-]{36}$/i) || !routeLabels[segment]) {
      return;
    }

    const isLast = index === pathSegments.length - 1;
    const label = routeLabels[segment] || segment;

    breadcrumbItems.push({
      label,
      href: isLast ? undefined : currentPath
    });
  });

  // Se só tem o item "Início", não renderizar
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="px-4 py-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={index}>
              {index === 0 ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href!} className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}