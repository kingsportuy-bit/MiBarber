import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  noPadding?: boolean;
}

export function PageContainer({ 
  children, 
  maxWidth = 'xl',
  noPadding = false 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-3xl',      // 768px - para login/registro
    md: 'max-w-5xl',      // 1024px - para formularios
    lg: 'max-w-6xl',      // 1280px - para dashboards compactos
    xl: 'max-w-7xl',      // 1536px - para páginas con grids (DEFAULT)
    '2xl': 'max-w-[1800px]', // para tableros Kanban
    full: 'max-w-full'    // sin límite de ancho
  };

  return (
    <div className={`
      w-full mx-auto 
      ${maxWidthClasses[maxWidth]} 
      ${noPadding ? '' : 'px-4 md:px-6 py-6'}
    `}>
      {children}
    </div>
  );
}