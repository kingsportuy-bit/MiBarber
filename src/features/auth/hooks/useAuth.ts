// Hook principal para gestión de estado de autenticación
import { useState, useEffect, useCallback } from 'react';
import type { Barbero } from '@/types/db';
import { AuthState, AuthSession } from '../types';
import { AuthService } from '../services/AuthService';
import { useLogin } from './useLogin';

interface UseAuthReturn extends AuthState {
  refreshSession: () => void;
  barbero: Barbero | null;
  idBarberia: string | null;
  idSucursal: string | null; // ✅ Agregar idSucursal
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  data?: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    barbero: Barbero | null;
    idBarberia: string | null;
  };
  login: ReturnType<typeof useLogin>['login'];
  logout: () => void;
  refetch?: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  session: null,
  loading: true,
  error: null,
};

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const { login, logout } = useLogin();

  // Función para cargar la sesión
  const loadSession = useCallback(() => {
    try {
      const session = AuthService.loadSession();
      
      if (session) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: session.user.admin,
          session,
          loading: false,
          error: null,
        });
      } else {
        console.log('useAuth - No se encontró sesión válida');
        setAuthState({
          ...initialState,
          loading: false,
        });
      }
    } catch (error) {
      console.error('useAuth - Error al cargar la sesión:', error);
      setAuthState({
        ...initialState,
        loading: false,
        error: 'Error al cargar la sesión',
      });
    }
  }, []);

  // Cargar sesión al iniciar
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Listener para cambios de autenticación
    const handleAuthChange = (event: CustomEvent) => {
      loadSession();
    };

    // Cargar sesión inicial
    loadSession();

    // Agregar listener para eventos de cambio de autenticación
    window.addEventListener('barberAuthChange', handleAuthChange as EventListener);

    // Limpiar listener
    return () => {
      window.removeEventListener('barberAuthChange', handleAuthChange as EventListener);
    };
  }, [loadSession]);

  // Refrescar sesión con mecanismo de recuperación
  const refreshSession = useCallback(() => {
    console.log('useAuth - Refrescando sesión...');
    
    try {
      const session = AuthService.loadSession();
      if (session) {
        setAuthState({
          isAuthenticated: true,
          isAdmin: session.user.admin,
          session,
          loading: false,
          error: null,
        });
      } else {
        console.log('useAuth - No se pudo refrescar la sesión');
        // Si no hay sesión, asegurarnos de que el estado sea consistente
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          session: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('useAuth - Error al refrescar la sesión:', error);
      // En caso de error, intentar cargar de nuevo
      loadSession();
    }
  }, [loadSession]);

  // Verificar periódicamente que la sesión sigue activa
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    if (authState.isAuthenticated && authState.session) {
      const interval = setInterval(() => {
        const session = AuthService.loadSession();
        
        // Si la sesión ha cambiado o se ha perdido, actualizar el estado
        if (!session || 
            session.user.id !== authState.session?.user.id ||
            session.user.id_barberia !== authState.session?.user.id_barberia) {
          refreshSession();
        }
      }, 30000); // Verificar cada 30 segundos
      
      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, authState.session, refreshSession]);

  // Combinar los estados de loading
  const isLoading = authState.loading;

  // Función para refetch (compatibilidad)
  const refetch = useCallback(() => {
    refreshSession();
  }, [refreshSession]);

  // Crear objeto barbero a partir de los datos de la sesión
  const barberoFromSession = authState.session ? {
    id_barbero: authState.session.user.id,
    nombre: authState.session.user.name,
    email: authState.session.user.email,
    username: authState.session.user.username,
    nivel_permisos: authState.session.user.nivel_permisos,
    admin: authState.session.user.admin,
    id_barberia: authState.session.user.id_barberia,
    id_sucursal: authState.session.user.id_sucursal,
    // Valores por defecto para campos que no están en la sesión
    telefono: null,
    especialidades: [],
    activo: true,
    password_hash: null,
    conf_inicial: null, // Valor por defecto para la nueva columna
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } : null;


  return {
    ...authState,
    refreshSession,
    barbero: barberoFromSession, // ✅ Usar datos del barbero de la sesión
    idBarberia: authState.session?.user.id_barberia || null,
    idSucursal: authState.session?.user.id_sucursal || null, // ✅ Agregar idSucursal
    isLoading,
    isError: !!authState.error,
    error: authState.error || null,
    data: {
      isAuthenticated: authState.isAuthenticated,
      isAdmin: authState.isAdmin,
      barbero: barberoFromSession, // ✅ Usar datos del barbero de la sesión
      idBarberia: authState.session?.user.id_barberia || null,
    },
    login,
    logout,
    refetch,
  };
}