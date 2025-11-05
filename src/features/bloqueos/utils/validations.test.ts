// Tests para validaciones Zod de bloqueos
import { describe, it, expect } from 'vitest';
import { createBloqueoSchema } from './validations';

describe('Validaciones Zod para Bloqueos', () => {
  it('debería validar correctamente un bloqueo de día completo', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      tipo: 'bloqueo_dia' as const,
      motivo: 'Vacaciones'
    };

    expect(() => createBloqueoSchema.parse(data)).not.toThrow();
  });

  it('debería rechazar un bloqueo de día con horas', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      hora_inicio: '12:00',
      hora_fin: '14:00',
      tipo: 'bloqueo_dia' as const,
      motivo: 'Vacaciones'
    };

    expect(() => createBloqueoSchema.parse(data)).toThrow();
  });

  it('debería validar correctamente un descanso con horas', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      hora_inicio: '12:00',
      hora_fin: '14:00',
      tipo: 'descanso' as const,
      motivo: 'Almuerzo'
    };

    expect(() => createBloqueoSchema.parse(data)).not.toThrow();
  });

  it('debería validar correctamente un bloqueo de horas con horas', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      hora_inicio: '15:00',
      hora_fin: '16:00',
      tipo: 'bloqueo_horas' as const,
      motivo: 'Reunión'
    };

    expect(() => createBloqueoSchema.parse(data)).not.toThrow();
  });

  it('debería rechazar un descanso sin horas', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      tipo: 'descanso' as const,
      motivo: 'Almuerzo'
    };

    expect(() => createBloqueoSchema.parse(data)).toThrow();
  });

  it('debería rechazar horas con formato inválido', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      hora_inicio: '25:00', // Hora inválida
      hora_fin: '26:00', // Hora inválida
      tipo: 'descanso' as const,
      motivo: 'Almuerzo'
    };

    expect(() => createBloqueoSchema.parse(data)).toThrow();
  });

  it('debería rechazar horas con inicio mayor que fin', () => {
    const data = {
      id_sucursal: '123e4567-e89b-12d3-a456-426614174000',
      id_barbero: '123e4567-e89b-12d3-a456-426614174001',
      fecha: '2023-12-25',
      hora_inicio: '14:00',
      hora_fin: '12:00', // Fin antes que inicio
      tipo: 'descanso' as const,
      motivo: 'Almuerzo'
    };

    expect(() => createBloqueoSchema.parse(data)).toThrow();
  });
});