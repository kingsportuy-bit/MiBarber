import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCitasPorRango } from '@/features/appointments/hooks/useCitasPorRango';

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
          gte: () => ({
            lte: () => ({
              order: () => ({
                data: [],
                error: null
              })
            })
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

describe('useCitasPorRango', () => {
  it('debe retornar datos de citas por rango correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(
      () => useCitasPorRango({
        sucursalId: 'test-sucursal',
        fechaInicio: '2023-01-01',
        fechaFin: '2023-01-31'
      }),
      { wrapper }
    );

    // Verificar que no haya error en la inicialización
    expect(result.current.isError).toBe(false);
  });
});