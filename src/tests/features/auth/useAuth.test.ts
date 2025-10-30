import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthService } from '@/features/auth/services/AuthService';

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

describe('useAuth', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  it('debe cargar sesión existente de localStorage', async () => {
    // Mock de sesión válida
    const mockSession = {
      user: {
        id: 'barbero-1',
        email: 'test@example.com',
        name: 'Test Barbero',
        username: 'testuser',
        nivel_permisos: 1,
        admin: true,
        id_barberia: 'barberia-1',
        id_sucursal: 'sucursal-1',
      },
      expiresAt: Date.now() + 3600000, // 1 hora
    };
    
    AuthService.saveSession(mockSession);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  it('debe manejar sesión expirada', async () => {
    // Mock de sesión expirada
    const mockSession = {
      user: {
        id: 'barbero-1',
        email: 'test@example.com',
        name: 'Test Barbero',
        username: 'testuser',
        nivel_permisos: 1,
        admin: true,
        id_barberia: 'barberia-1',
        id_sucursal: 'sucursal-1',
      },
      expiresAt: Date.now() - 3600000, // 1 hora atrás
    };
    
    AuthService.saveSession(mockSession);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.session).toBeNull();
    });
  });
});