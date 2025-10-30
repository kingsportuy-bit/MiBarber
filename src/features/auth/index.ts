// Exports públicos del módulo de autenticación
export { useAuth } from './hooks/useAuth';
export { useLogin } from './hooks/useLogin';
export { useBarberoData } from './hooks/useBarberoData';
export { ProtectedRoute } from './components/ProtectedRoute';
export { AuthService } from './services/AuthService';

// Reexportar useAuth como useBarberoAuth para mantener compatibilidad
export { useAuth as useBarberoAuth } from './hooks/useAuth';

// Types
export type { AuthSession, AuthState, LoginCredentials, BarberoData } from './types';