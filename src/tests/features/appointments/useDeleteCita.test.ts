import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDeleteCita } from '@/features/appointments/hooks/useDeleteCita';

// Mock de getSupabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
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

describe('useDeleteCita', () => {
  it('debe eliminar una cita correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(() => useDeleteCita(), { wrapper });

    result.current.mutate('test-id');

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});