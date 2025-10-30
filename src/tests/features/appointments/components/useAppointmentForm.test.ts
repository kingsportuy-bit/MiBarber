import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppointmentForm } from '@/features/appointments/components/AppointmentModal/hooks/useAppointmentForm';
import type { Appointment } from '@/types/db';

describe('useAppointmentForm', () => {
  const mockAppointment = {
    id_cita: 'test-1',
    cliente_nombre: 'Juan Pérez',
    servicio: 'Corte de cabello',
    barbero: 'Carlos',
    fecha: '2023-01-01',
    hora: '10:00',
    estado: 'pendiente' as const,
    id_sucursal: 'sucursal-1',
    id_barberia: 'barberia-1',
    nota: null,
    creado: '2023-01-01T10:00:00Z',
    id_cliente: null,
    duracion: '30',
    ticket: 1500,
    nro_factura: null,
    id_barbero: 'barbero-1',
    id_servicio: 'servicio-1',
    updated_at: '2023-01-01T10:00:00Z',
    notificacion_barbero: 'false',
    notificacion_cliente: 'false',
  } satisfies Appointment;

  it('debe inicializar correctamente en modo creación', () => {
    const { result } = renderHook(() => useAppointmentForm());
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.formData).toEqual({ estado: 'pendiente' });
  });

  it('debe inicializar correctamente en modo edición', () => {
    const { result } = renderHook(() => useAppointmentForm(mockAppointment));
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isEditMode).toBe(true);
    expect(result.current.formData).toEqual(mockAppointment);
  });

  it('debe avanzar al siguiente paso cuando los datos son válidos', () => {
    const { result } = renderHook(() => useAppointmentForm());
    
    // Inicialmente en paso 1
    expect(result.current.currentStep).toBe(1);
    
    // Agregar datos válidos para el paso 1
    act(() => {
      result.current.updateFormData({ cliente_nombre: 'Juan Pérez' });
    });
    
    // Verificar que el paso 1 es válido
    expect(result.current.validateStep(1)).toBe(true);
    
    // Avanzar al paso 2
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(2);
  });

  it('no debe avanzar al siguiente paso cuando los datos no son válidos', () => {
    const { result } = renderHook(() => useAppointmentForm());
    
    // Inicialmente en paso 1
    expect(result.current.currentStep).toBe(1);
    
    // Verificar que el paso 1 no es válido sin datos
    expect(result.current.validateStep(1)).toBe(false);
    
    // Intentar avanzar sin datos válidos
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('debe actualizar los datos del formulario', () => {
    const { result } = renderHook(() => useAppointmentForm());
    
    act(() => {
      result.current.updateFormData({ cliente_nombre: 'Juan Pérez' });
    });
    
    expect(result.current.formData.cliente_nombre).toBe('Juan Pérez');
  });

  it('debe validar los pasos correctamente', () => {
    const { result } = renderHook(() => useAppointmentForm());
    
    // Paso 1: Validar cliente
    expect(result.current.validateStep(1)).toBe(false);
    
    act(() => {
      result.current.updateFormData({ cliente_nombre: 'Juan Pérez' });
    });
    
    expect(result.current.validateStep(1)).toBe(true);
    
    // Paso 2: Validar servicio y barbero
    expect(result.current.validateStep(2)).toBe(false);
    
    act(() => {
      result.current.updateFormData({ servicio: 'Corte de cabello', barbero: 'Carlos' });
    });
    
    expect(result.current.validateStep(2)).toBe(true);
    
    // Paso 3: Validar fecha y hora
    expect(result.current.validateStep(3)).toBe(false);
    
    act(() => {
      result.current.updateFormData({ fecha: '2023-01-01', hora: '10:00' });
    });
    
    expect(result.current.validateStep(3)).toBe(true);
  });
});