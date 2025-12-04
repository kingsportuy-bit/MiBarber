import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function InfoCard({ title, children, className = '' }: InfoCardProps) {
  return (
    <div className={`bg-black/60 rounded-xl border border-qoder-dark-border p-6 ${className}`}>
      <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2 text-sm text-gray-300">
        {children}
      </div>
    </div>
  );
}