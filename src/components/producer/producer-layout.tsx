import { ReactNode } from 'react';
import { ProducerSidebar } from './producer-sidebar';
import { ProducerHeader } from './producer-header';

interface ProducerLayoutProps {
  children: ReactNode;
}

export function ProducerLayout({ children }: ProducerLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(var(--background)_/_0.95)] flex">
      <ProducerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ProducerHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}