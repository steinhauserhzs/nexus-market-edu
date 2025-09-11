import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Settings,
  ShoppingBag,
  Users,
  FileText,
  CreditCard,
  Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/producer',
    icon: BarChart3,
  },
  {
    title: 'Vendas',
    href: '/producer/sales',
    icon: TrendingUp,
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: Package,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Finanças',
    href: '/analytics',
    icon: DollarSign,
  },
  {
    title: 'Cupons',
    href: '/cupons',
    icon: FileText,
  },
  {
    title: 'Afiliados',
    href: '#',
    icon: Megaphone,
  },
  {
    title: 'Integrações',
    href: '#',
    icon: Settings,
  },
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

export function ProducerSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-b from-[hsl(var(--sidebar-bg))] to-[hsl(var(--background))] border-r border-border min-h-screen shadow-[var(--shadow-elevated)]">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Painel</h2>
            <p className="text-xs text-muted-foreground">Produtor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 shadow-[var(--shadow-glow)]" 
                  : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-glow rounded-r-full" />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive ? "text-primary scale-110" : "group-hover:scale-105"
              )} />
              <span className="font-medium transition-colors duration-300">{item.title}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}