import { describe, it, expect } from 'vitest';
import {
  isTimeSlotOccupied,
  isDateInPast,
  isDateAvailable,
  getDisabledDates
} from '@/features/appointments/utils/citasHelpers';
import type { Appointment } from '@/types/db';

describe('citasHelpers', () => {
  describe('isTimeSlotOccupied', () => {
    it('debe retornar false cuando no hay citas', () => {
      const result = isTimeSlotOccupied(
        10, 0, undefined, 'test-barbero', '2023-01-01', 30
      );
      expect(result).toBe(false);
    });

    it('debe retornar false cuando no hay solapamiento', () => {
      const citas: Appointment[] = [
        {
          id_cita: '1',
          fecha: '2023-01-01',
          hora: '09:00:00',
          cliente_nombre: 'Test Cliente',
          servicio: 'Corte de cabello',
          barbero: 'Test Barbero',
          id_barbero: 'test-barbero',
          id_sucursal: 'test-sucursal',
          id_barberia: 'test-barberia',
          estado: 'pendiente',
          nota: null,
          creado: '2023-01-01T09:00:00Z',
          id_cliente: null,
          duracion: '30m',
          notificacion_barbero: null,
          notificacion_cliente: null,
          ticket: 100,
          nro_factura: null,
          metodo_pago: null,
          id_servicio: null,
          created_at: '2023-01-01T09:00:00Z',
          updated_at: '2023-01-01T09:00:00Z'
        }
      ];

      const result = isTimeSlotOccupied(
        10, 0, citas, 'test-barbero', '2023-01-01', 30
      );
      expect(result).toBe(false);
    });
  });

  describe('isDateInPast', () => {
    it('debe retornar true para fechas pasadas', () => {
      const result = isDateInPast('2020-01-01');
      expect(result).toBe(true);
    });

    it('debe retornar false para fechas futuras', () => {
      // Crear una fecha futura
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      const result = isDateInPast(futureDateString);
      expect(result).toBe(false);
    });
  });

  describe('isDateAvailable', () => {
    it('debe retornar true cuando no hay sucursal seleccionada', () => {
      const result = isDateAvailable('2023-01-01', undefined, undefined);
      expect(result).toBe(true);
    });

    it('debe retornar true cuando hay horario activo', () => {
      const horarios = [
        { id_dia: 1, activo: true }
      ];
      
      // Lunes (día 1)
      const result = isDateAvailable('2023-01-02', 'test-sucursal', horarios);
      expect(result).toBe(true);
    });
  });

  describe('getDisabledDates', () => {
    it('debe retornar array vacío cuando no hay sucursal', () => {
      const result = getDisabledDates(undefined, undefined);
      expect(result).toEqual([]);
    });

    it('debe retornar días inactivos correctamente', () => {
      const horarios = [
        { id_dia: 1, activo: true }, // Lunes activo
        { id_dia: 2, activo: true }  // Martes activo
      ];
      
      const result = getDisabledDates('test-sucursal', horarios);
      // Debería deshabilitar todos excepto lunes y martes
      expect(result).toContain(0); // Domingo
      expect(result).toContain(3); // Miércoles
      expect(result).toContain(4); // Jueves
      expect(result).toContain(5); // Viernes
      expect(result).toContain(6); // Sábado
    });
  });
});