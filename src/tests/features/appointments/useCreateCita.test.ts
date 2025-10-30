import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCita } from '@/features/appointments/hooks/useCreateCita';
import type { Appointment } from '@/types/db';

// Mock de getSupabaseClient
vi.mock('@/lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => ({
            data: { id_cita: 'test-id', cliente_nombre: 'Test Cliente' },
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

describe('useCreateCita', () => {
  it('debe crear una cita correctamente', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      )
    );

    const { result } = renderHook(() => useCreateCita(), { wrapper });

    const newCita: Omit<Appointment, "id_cita"> = {
      fecha: '2023-01-01',
      hora: '10:00',
      cliente_nombre: 'Test Cliente',
      servicio: 'Corte de cabello',
      barbero: 'Test Barbero',
      id_sucursal: 'test-sucursal',
      id_barberia: 'test-barberia',
      estado: 'pendiente',
      nota: null,
      creado: new Date().toISOString(),
      id_cliente: null,
      duracion: '30m',
      notificacion_barbero: null,
      notificacion_cliente: null,
      ticket: 100,
      nro_factura: null,
      metodo_pago: null,
      id_barbero: null,
      id_servicio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    result.current.mutate(newCita);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});