import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { AuthService } from '@/features/auth/services/AuthService';

// Mock de Supabase
const mockSingle = vi.fn();
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
};

vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: () => mockSupabaseClient,
}));

// Crear un wrapper con QueryClient para los tests
const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );
  };
};

describe('useLogin', () => {
  const mockBarbero = {
    id_barbero: 'barbero-1',
    nombre: 'Test Barbero',
    username: 'testuser',
    password_hash: '$2a$10$example', // bcrypt hash
    nivel_permisos: 1,
    admin: true,
    id_barberia: 'barberia-1',
    id_sucursal: 'sucursal-1',
    email: 'test@example.com',
    telefono: '123456789',
    especialidades: ['corte', 'barba'],
    activo: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
    // Limpiar también las cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
    vi.clearAllMocks();
  });

  it('debe autenticar correctamente con credenciales válidas', async () => {
    // Mock de Supabase para devolver barbero válido
    mockSingle.mockResolvedValue({ data: mockBarbero, error: null });
    
    // Mock de bcrypt para verificar password
    vi.spyOn(AuthService, 'verifyPassword').mockResolvedValue(true);
    
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    
    await act(async () => {
      const response = await result.current.login({
        username: 'testuser',
        password: 'correctpassword',
      });
      
      expect(response.success).toBe(true);
    });
    
    // Verificar que la sesión se guardó
    const savedSession = AuthService.loadSession();
    expect(savedSession).not.toBeNull();
    expect(savedSession?.user.id).toBe('barbero-1');
  });

  it('debe rechazar credenciales inválidas', async () => {
    // Mock de Supabase para devolver barbero válido
    mockSingle.mockResolvedValue({ data: mockBarbero, error: null });
    
    // Mock de bcrypt para rechazar password
    vi.spyOn(AuthService, 'verifyPassword').mockResolvedValue(false);
    
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });
    
    await act(async () => {
      const response = await result.current.login({
        username: 'testuser',
        password: 'wrongpassword',
      });
      
      expect(response.success).toBe(false);
      expect(response.error).toBe('Usuario o contraseña incorrectos');
    });
    
    // Verificar que la sesión NO se guardó
    const savedSession = AuthService.loadSession();
    expect(savedSession).toBeNull();
  });
});