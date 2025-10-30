// Componente HOC para proteger rutas
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirigir a login si no está autenticado
      router.push('/login');
    } else if (!loading && requireAdmin && !isAdmin) {
      // Redirigir a inicio si se requiere admin pero no lo es
      router.push('/inicio');
    }
  }, [isAuthenticated, isAdmin, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}