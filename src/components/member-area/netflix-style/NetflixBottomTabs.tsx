// Nexus Netflix-Style Member Area - Bottom Tab Navigation

import { Home, Package, GraduationCap, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NetflixBottomTabsProps {
  storeSlug: string;
}

const NetflixBottomTabs = ({ storeSlug }: NetflixBottomTabsProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { 
      id: 'home', 
      label: 'Início', 
      icon: Home, 
      path: `/loja/${storeSlug}/area-membros` 
    },
    { 
      id: 'products', 
      label: 'Produtos', 
      icon: Package, 
      path: `/loja/${storeSlug}/area-membros/produtos` 
    },
    { 
      id: 'courses', 
      label: 'Cursos', 
      icon: GraduationCap, 
      path: `/loja/${storeSlug}/area-membros/cursos` 
    },
    { 
      id: 'settings', 
      label: 'Conta', 
      icon: Settings, 
      path: '/configuracoes' 
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 sm:h-14 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center p-1 min-w-0 flex-1 transition-colors min-h-[44px] ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : ''}`} />
              <span className={`text-xs leading-none truncate max-w-full ${active ? 'text-primary font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NetflixBottomTabs;