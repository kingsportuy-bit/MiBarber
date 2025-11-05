// Tests para el componente BloqueosManager
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BloqueosManager } from './BloqueosManager';

// Mock de hooks y contextos
vi.mock('@/hooks/useBarberoAuth', () => ({
  useBarberoAuth: () => ({
    idBarberia: 'test-barberia-id',
    barbero: { id_barbero: 'test-barbero-id', nombre: 'Test Barbero' },
    isAdmin: false
  })
}));

vi.mock('@/hooks/useBloqueosBarbero', () => ({
  useBloqueosPorDia: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn()
  }),
  useBloqueosBarbero: () => ({
    create: { mutateAsync: vi.fn(), isPending: false },
    remove: { mutateAsync: vi.fn(), isPending: false }
  })
}));

vi.mock('@/hooks/useSucursales', () => ({
  useSucursales: () => ({
    sucursales: [{ id: 'test-sucursal-id', nombre_sucursal: 'Test Sucursal' }],
    isLoading: false
  })
}));

vi.mock('@/hooks/useBarberosList', () => ({
  useBarberosList: () => ({
    data: [{ id_barbero: 'test-barbero-id', nombre: 'Test Barbero' }],
    isLoading: false
  })
}));

vi.mock('@/contexts/GlobalFiltersContext', () => ({
  useGlobalFilters: () => ({
    filters: { sucursalId: 'test-sucursal-id', barberoId: 'test-barbero-id' }
  })
}));

vi.mock('@/components/CustomDatePicker', () => ({
  CustomDatePicker: ({ value, onChange }: { value: string; onChange: (date: string) => void }) => (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="custom-date-picker"
    />
  )
}));

describe('BloqueosManager', () => {
  it('debería renderizar correctamente en modo barbero', () => {
    render(<BloqueosManager mode="barbero" />);
    
    // Verificar que se muestren los elementos principales
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crear bloqueo' })).toBeInTheDocument();
    expect(screen.getByText('Bloqueos del día')).toBeInTheDocument();
  });

  it('debería renderizar correctamente en modo admin', () => {
    render(<BloqueosManager mode="admin" />);
    
    // Verificar que se muestren los elementos principales
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crear bloqueo' })).toBeInTheDocument();
    expect(screen.getByText('Bloqueos del día')).toBeInTheDocument();
  });

  it('debería mostrar los campos de formulario correctos', () => {
    render(<BloqueosManager mode="barbero" />);
    
    // Verificar campos del formulario
    expect(screen.getByRole('combobox', { name: 'Tipo de bloqueo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Motivo (opcional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora de inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora de fin')).toBeInTheDocument();
  });
});