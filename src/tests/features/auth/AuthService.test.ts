import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@/features/auth/services/AuthService';
import type { Barbero } from '@/types/db';

describe('AuthService', () => {
  const mockBarbero: Barbero = {
    id_barbero: 'barbero-1',
    nombre: 'Test Barbero',
    telefono: '123456789',
    email: 'test@example.com',
    especialidades: ['corte', 'barba'],
    activo: true,
    id_barberia: 'barberia-1',
    id_sucursal: 'sucursal-1',
    admin: true,
    nivel_permisos: 1,
    username: 'testuser',
    password_hash: '$2a$10$example', // bcrypt hash
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('session management', () => {
    it('debe guardar y cargar sesión correctamente', () => {
      const session = AuthService.createSessionFromBarbero(mockBarbero);
      
      AuthService.saveSession(session);
      const loadedSession = AuthService.loadSession();
      
      expect(loadedSession).toEqual(session);
    });

    it('debe limpiar sesión correctamente', () => {
      const session = AuthService.createSessionFromBarbero(mockBarbero);
      
      AuthService.saveSession(session);
      expect(AuthService.loadSession()).not.toBeNull();
      
      AuthService.clearSession();
      expect(AuthService.loadSession()).toBeNull();
    });

    it('debe detectar sesión expirada', () => {
      const expiredSession = {
        ...AuthService.createSessionFromBarbero(mockBarbero),
        expiresAt: Date.now() - 3600000, // 1 hora atrás
      };
      
      AuthService.saveSession(expiredSession);
      const loadedSession = AuthService.loadSession();
      
      expect(loadedSession).toBeNull();
    });
  });

  describe('permissions', () => {
    it('debe identificar correctamente administradores (true)', () => {
      expect(AuthService.isAdmin(true)).toBe(true);
    });

    it('debe identificar correctamente barberos normales (false)', () => {
      expect(AuthService.isAdmin(false)).toBe(false);
    });
  });
});