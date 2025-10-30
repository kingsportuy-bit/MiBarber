import { renderHook, act } from '@testing-library/react';
// Test básico para verificar que el hook se exporta correctamente
import { useAgendaLogic } from '@/features/appointments/components/AgendaBoard/hooks/useAgendaLogic';

// Verificación de que el hook se puede importar
console.log('useAgendaLogic importado correctamente:', typeof useAgendaLogic === 'function');

describe('useAgendaLogic', () => {
  it('debería exportar el hook correctamente', () => {
    expect(useAgendaLogic).toBeDefined();
  });

  it('debería inicializar con la fecha actual', () => {
    const { result } = renderHook(() => useAgendaLogic({}));
    
    expect(result.current.currentDate).toBeInstanceOf(Date);
    expect(result.current.isLoading).toBeDefined();
  });
});
