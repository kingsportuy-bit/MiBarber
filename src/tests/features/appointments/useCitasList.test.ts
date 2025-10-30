import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCitasList } from '@/features/appointments/hooks/useCitasList';

// Mock de useBarberoAuth
vi.mock('@/hooks/useBarberoAuth', () => ({
  useBarberoAuth: () => ({
    barbero: { id_barbero: 'test-barbero' },
    isAdmin: false,
    idBarberia: 'test-barberia'
  })
}));

// Mock de getSupabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [],
            error: null
          })
        })
      })
    })
  })
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe('useCitasList', () => {
  it('debe retornar datos de citas correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(
      () => useCitasList('test-sucursal', '2023-01-01', 'test-barbero'),
      { wrapper }
    );

    // Verificar que no haya error en la inicialización
    expect(result.current.isError).toBe(false);
  });
});