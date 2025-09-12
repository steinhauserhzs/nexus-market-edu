import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Settings,
  Users,
  FileText,
  Megaphone,
  Home,
  ShoppingBag,
  Store,
  PlusCircle,
  CreditCard,
  UserCheck,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Início',
    href: '/inicio',
    icon: Home,
  },
];

const businessNavItems = [
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
    title: 'Nova Produto',
    href: '/produto/novo',
    icon: PlusCircle,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Lojas',
    href: '/stores',
    icon: Store,
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
];

const toolsNavItems = [
  {
    title: 'Afiliados',
    href: '/producer/affiliates',
    icon: Megaphone,
  },
  {
    title: 'Integrações',
    href: '/producer/integrations',
    icon: Wrench,
  },
];

const settingsNavItems = [
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
  {
    title: 'Perfil',
    href: '/profile',
    icon: UserCheck,
  },
];

const adminNavItems = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const { state } = useSidebar();
  
  const isActive = (href: string) => location.pathname === href;
  const isAdmin = profile?.role === 'admin';

  const NavGroup = ({ title, items }: { title: string; items: typeof mainNavItems }) => (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={state === 'collapsed' ? item.title : undefined}
              >
                <NavLink to={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          {state === 'expanded' && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Nexus Platform</span>
              <span className="text-xs text-muted-foreground">
                {profile?.full_name || user?.email}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup title="Principal" items={mainNavItems} />
        <NavGroup title="Negócio" items={businessNavItems} />
        <NavGroup title="Ferramentas" items={toolsNavItems} />
        <NavGroup title="Configurações" items={settingsNavItems} />
        {isAdmin && <NavGroup title="Administração" items={adminNavItems} />}
      </SidebarContent>
    </Sidebar>
  );
}