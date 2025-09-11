import { ReactNode } from 'react';
import { ProducerHeader } from './producer-header';
import { ProducerSidebar } from './producer-sidebar';

interface ProducerLayoutProps {
  children: ReactNode;
  title: string;
}

export function ProducerLayout({ children, title }: ProducerLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ProducerHeader title={title} />
      <div className="flex">
        <ProducerSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}