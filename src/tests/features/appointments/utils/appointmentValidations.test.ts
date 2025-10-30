import { describe, it, expect } from 'vitest';
import { validateClientStep, validateServiceStep, validateDateTimeStep } from '@/features/appointments/utils/appointmentValidations';
import type { Appointment } from '@/types/db';

describe('appointmentValidations', () => {
  describe('validateClientStep', () => {
    it('debe retornar true cuando cliente_nombre está presente', () => {
      const formData = { cliente_nombre: 'Juan Pérez' };
      expect(validateClientStep(formData)).toBe(true);
    });

    it('debe retornar false cuando cliente_nombre está ausente', () => {
      const formData = {};
      expect(validateClientStep(formData)).toBe(false);
    });

    it('debe retornar false cuando cliente_nombre es vacío', () => {
      const formData = { cliente_nombre: '' };
      expect(validateClientStep(formData)).toBe(false);
    });
  });

  describe('validateServiceStep', () => {
    it('debe retornar true cuando servicio y barbero están presentes', () => {
      const formData = { servicio: 'Corte de cabello', barbero: 'Carlos' };
      expect(validateServiceStep(formData)).toBe(true);
    });

    it('debe retornar false cuando servicio está ausente', () => {
      const formData = { barbero: 'Carlos' };
      expect(validateServiceStep(formData)).toBe(false);
    });

    it('debe retornar false cuando barbero está ausente', () => {
      const formData = { servicio: 'Corte de cabello' };
      expect(validateServiceStep(formData)).toBe(false);
    });

    it('debe retornar false cuando ambos servicio y barbero están ausentes', () => {
      const formData = {};
      expect(validateServiceStep(formData)).toBe(false);
    });
  });

  describe('validateDateTimeStep', () => {
    it('debe retornar true cuando fecha y hora están presentes', () => {
      const formData = { fecha: '2023-01-01', hora: '10:00' };
      expect(validateDateTimeStep(formData)).toBe(true);
    });

    it('debe retornar false cuando fecha está ausente', () => {
      const formData = { hora: '10:00' };
      expect(validateDateTimeStep(formData)).toBe(false);
    });

    it('debe retornar false cuando hora está ausente', () => {
      const formData = { fecha: '2023-01-01' };
      expect(validateDateTimeStep(formData)).toBe(false);
    });

    it('debe retornar false cuando ambos fecha y hora están ausentes', () => {
      const formData = {};
      expect(validateDateTimeStep(formData)).toBe(false);
    });
  });
});