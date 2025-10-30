import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCitas } from '@/hooks/useCitas';

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
      }),
      insert: () => ({
        select: () => ({
          single: () => ({
            data: { id_cita: 'test-id', cliente_nombre: 'Test Cliente' },
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: { id_cita: 'test-id', cliente_nombre: 'Test Cliente Actualizado' },
              error: null
            })
          })
        })
      }),
      delete: () => ({
        eq: () => ({
          data: null,
          error: null
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

describe('useCitas', () => {
  it('debe exponer las mutaciones correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(
      () => useCitas('test-sucursal', '2023-01-01', 'test-barbero'),
      { wrapper }
    );

    // Verificar que las mutaciones estén disponibles
    expect(result.current.createMutation).toBeDefined();
    expect(result.current.updateMutation).toBeDefined();
    expect(result.current.deleteMutation).toBeDefined();
    
    // Verificar que mutateAsync esté disponible en createMutation
    expect(result.current.createMutation.mutateAsync).toBeDefined();
    
    // Verificar que mutateAsync esté disponible en updateMutation
    expect(result.current.updateMutation.mutateAsync).toBeDefined();
    
    // Verificar que mutateAsync esté disponible en deleteMutation
    expect(result.current.deleteMutation.mutateAsync).toBeDefined();
  });
});