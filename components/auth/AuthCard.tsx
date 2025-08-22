import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AuthCardProps {
  children: ReactNode;
  title?: string;
}

export function AuthCard({ children, title }: AuthCardProps) {
  return (
    <Card className="p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      {title && (
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {title}
        </h2>
      )}
      {children}
    </Card>
  );
}