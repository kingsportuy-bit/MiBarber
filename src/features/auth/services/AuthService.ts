// Servicio con lógica de negocio para autenticación
import type { Barbero } from '@/types/db';
import { AuthSession } from '../types';

const SESSION_KEY = 'barber_auth_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export class AuthService {
  // Verificar password usando la librería de password existente
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const { verifyPassword } = await import('@/lib/password');
    return verifyPassword(plainPassword, hashedPassword);
  }

  // Guardar sesión en localStorage y cookie
  static saveSession(session: AuthSession): void {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    try {
      // Guardar en localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      // También establecer una cookie para que el middleware pueda detectar la sesión
      // Usar document.cookie con SameSite=None y Secure para mejor compatibilidad
      const cookieValue = encodeURIComponent(JSON.stringify(session));
      document.cookie = `barber_auth_session=${cookieValue}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax;`;
    } catch (error) {
      console.error('AuthService.saveSession - Error guardando sesión:', error);
    }
  }

  // Leer sesión de localStorage o cookie
  static loadSession(): AuthSession | null {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return null;
    
    try {
      // Primero intentar desde localStorage
      let sessionStr = localStorage.getItem(SESSION_KEY);
      
      // Si no está en localStorage, intentar desde cookies
      if (!sessionStr) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'barber_auth_session') {
            sessionStr = decodeURIComponent(value);
            break;
          }
        }
      }
      
      if (!sessionStr) {
        return null;
      }
      
      const session: AuthSession = JSON.parse(sessionStr);
      
      // Verificar si la sesión expiró
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('AuthService.loadSession - Error cargando sesión:', error);
      return null;
    }
  }

  // Limpiar sesión de localStorage y cookie
  static clearSession(): void {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    try {
      // Limpiar localStorage
      localStorage.removeItem(SESSION_KEY);
      
      // También eliminar la cookie
      document.cookie = `barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
    } catch (error) {
      console.error('AuthService.clearSession - Error limpiando sesión:', error);
    }
  }

  // Validar permisos de administrador
  static isAdmin(admin?: boolean): boolean {
    return admin === true; // true = Admin según especificaciones
  }

  // Crear sesión a partir de datos de barbero
  static createSessionFromBarbero(barbero: Barbero): AuthSession {
    const session: AuthSession = {
      user: {
        id: barbero.id_barbero,
        email: barbero.email || null,
        name: barbero.nombre,
        username: barbero.username || '',
        nivel_permisos: barbero.nivel_permisos ?? 2,
        admin: this.isAdmin(barbero.admin),
        id_barberia: barbero.id_barberia,
        id_sucursal: barbero.id_sucursal,
      },
      expiresAt: Date.now() + SESSION_DURATION,
    };
    return session;
  }
  
  // Verificar si la sesión sigue siendo válida
  static isSessionValid(): boolean {
    try {
      const session = this.loadSession();
      return session !== null;
    } catch (error) {
      console.error('AuthService.isSessionValid - Error verificando sesión:', error);
      return false;
    }
  }
}