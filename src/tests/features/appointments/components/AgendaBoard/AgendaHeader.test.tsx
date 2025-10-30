import { render, screen } from '@testing-library/react';
// Test básico para verificar que el componente se exporta correctamente
import { AgendaHeader } from '@/features/appointments/components/AgendaBoard/AgendaHeader';

// Verificación de que el componente se puede importar
console.log('AgendaHeader importado correctamente:', typeof AgendaHeader === 'function');

describe('AgendaHeader', () => {
  const mockProps = {
    onNewAppointment: jest.fn(),
    formatDate: (date: Date) => date.toLocaleDateString(),
    canGoToPreviousDay: true,
    canGoToNextDay: true,
    goToPreviousDay: jest.fn(),
    goToNextDay: jest.fn(),
    goToToday: jest.fn(),
    currentDate: new Date(),
  };

  it('debería renderizar correctamente', () => {
    render(<AgendaHeader {...mockProps} />);
    
    expect(screen.getByText('Agenda')).toBeInTheDocument();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('debería mostrar el botón de nueva cita si se proporciona onNewAppointment', () => {
    render(<AgendaHeader {...mockProps} />);
    
    expect(screen.getByText('Nueva Cita')).toBeInTheDocument();
  });

  it('no debería mostrar el botón de nueva cita si no se proporciona onNewAppointment', () => {
    render(<AgendaHeader {...mockProps} onNewAppointment={undefined} />);
    
    expect(screen.queryByText('Nueva Cita')).not.toBeInTheDocument();
  });
});