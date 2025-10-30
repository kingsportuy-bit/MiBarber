import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCita } from '@/features/appointments/hooks/useUpdateCita';
import type { Appointment } from '@/types/db';

// Mock de getSupabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: { id_cita: 'test-id', cliente_nombre: 'Test Cliente Actualizado' },
              error: null
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

describe('useUpdateCita', () => {
  it('debe actualizar una cita correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(() => useUpdateCita(), { wrapper });

    const updateData: Partial<Appointment> & { id_cita: string } = {
      id_cita: 'test-id',
      cliente_nombre: 'Test Cliente Actualizado'
    };

    result.current.mutate(updateData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});