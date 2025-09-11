import { Button } from '@/components/ui/button';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProducerHeaderProps {
  title: string;
}

export function ProducerHeader({ title }: ProducerHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-blue-600">KVN</div>
          <div className="h-8 w-px bg-gray-700"></div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Pessoa Física</p>
              <p className="text-xs text-gray-400">PF</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}