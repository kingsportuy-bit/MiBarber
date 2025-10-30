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
    try {
      console.log('AuthService.saveSession - Guardando sesión:', session);
      
      // Guardar en localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      // También establecer una cookie para que el middleware pueda detectar la sesión
      // Usar document.cookie con SameSite=None y Secure para mejor compatibilidad
      const cookieValue = encodeURIComponent(JSON.stringify(session));
      document.cookie = `barber_auth_session=${cookieValue}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax;`;
      
      console.log('AuthService.saveSession - Sesión guardada correctamente');
    } catch (error) {
      console.error('AuthService.saveSession - Error guardando sesión:', error);
    }
  }

  // Leer sesión de localStorage o cookie
  static loadSession(): AuthSession | null {
    try {
      console.log('AuthService.loadSession - Intentando cargar sesión...');
      
      // Primero intentar desde localStorage
      let sessionStr = localStorage.getItem(SESSION_KEY);
      console.log('AuthService.loadSession - sessionStr desde localStorage:', sessionStr);
      
      // Si no está en localStorage, intentar desde cookies
      if (!sessionStr) {
        console.log('AuthService.loadSession - No encontrado en localStorage, buscando en cookies...');
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'barber_auth_session') {
            sessionStr = decodeURIComponent(value);
            console.log('AuthService.loadSession - sessionStr desde cookie:', sessionStr);
            break;
          }
        }
      }
      
      if (!sessionStr) {
        console.log('AuthService.loadSession - No se encontró sesión en localStorage ni en cookies');
        return null;
      }
      
      const session: AuthSession = JSON.parse(sessionStr);
      console.log('AuthService.loadSession - Sesión parseada:', session);
      
      // Verificar si la sesión expiró
      if (Date.now() > session.expiresAt) {
        console.log('AuthService.loadSession - Sesión expirada, limpiando...');
        this.clearSession();
        return null;
      }
      
      console.log('AuthService.loadSession - Sesión válida cargada');
      return session;
    } catch (error) {
      console.error('AuthService.loadSession - Error cargando sesión:', error);
      return null;
    }
  }

  // Limpiar sesión de localStorage y cookie
  static clearSession(): void {
    try {
      console.log('AuthService.clearSession - Limpiando sesión...');
      
      // Limpiar localStorage
      localStorage.removeItem(SESSION_KEY);
      
      // También eliminar la cookie
      document.cookie = `barber_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;`;
      
      console.log('AuthService.clearSession - Sesión limpiada correctamente');
    } catch (error) {
      console.error('AuthService.clearSession - Error limpiando sesión:', error);
    }
  }

  // Validar permisos de administrador
  static isAdmin(admin: boolean): boolean {
    return admin === true; // true = Admin según especificaciones
  }

  // Crear sesión a partir de datos de barbero
  static createSessionFromBarbero(barbero: Barbero): AuthSession {
    console.log('AuthService.createSessionFromBarbero - Creando sesión para barbero:', barbero);
    const session = {
      user: {
        id: barbero.id_barbero,
        email: barbero.email,
        name: barbero.nombre,
        username: barbero.username || '',
        nivel_permisos: barbero.nivel_permisos,
        admin: this.isAdmin(barbero.admin),
        id_barberia: barbero.id_barberia,
        id_sucursal: barbero.id_sucursal,
      },
      expiresAt: Date.now() + SESSION_DURATION,
    };
    console.log('AuthService.createSessionFromBarbero - Sesión creada:', session);
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