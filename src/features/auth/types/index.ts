// Tipos compartidos para el sistema de autenticación
import type { Barbero } from '@/types/db';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string | null;
    name: string;
    username: string;
    nivel_permisos: number;
    admin: boolean;
    id_barberia: string | null;
    id_sucursal: string | null;
  };
  expiresAt: number; // timestamp en milisegundos
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

// Usar el tipo Barbero existente para mantener compatibilidad
export type BarberoData = Barbero;