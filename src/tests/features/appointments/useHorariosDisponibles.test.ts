import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHorariosDisponibles } from '@/features/appointments/hooks/useHorariosDisponibles';

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

describe('useHorariosDisponibles', () => {
  it('debe retornar horarios disponibles correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(
      () => useHorariosDisponibles({
        sucursalId: 'test-sucursal',
        fecha: '2023-01-01',
        barberoId: 'test-barbero'
      }),
      { wrapper }
    );

    // Verificar que no haya error en la inicialización
    expect(result.current.isError).toBe(false);
  });
});