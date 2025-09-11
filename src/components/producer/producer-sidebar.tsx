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
    <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 min-h-screen">
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}