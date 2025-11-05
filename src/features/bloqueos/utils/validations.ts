// Validaciones Zod para el sistema de bloqueos

import { z } from 'zod';

// Validación para crear un bloqueo
export const createBloqueoSchema = z.object({
  id_sucursal: z.string().uuid(),
  id_barbero: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)').nullable().optional(),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)').nullable().optional(),
  tipo: z.enum(['descanso', 'bloqueo_horas', 'bloqueo_dia']),
  motivo: z.string().max(255).nullable().optional(),
  dias_semana: z.string().optional().nullable(), // Para descanso extra, array de booleanos en formato JSON
}).refine((data) => {
  // Validaciones específicas por tipo de bloqueo
  if (data.tipo === 'bloqueo_dia') {
    // Para bloqueo_dia, hora_inicio y hora_fin deben ser null o no estar presentes
    return (!data.hora_inicio || data.hora_inicio === null) && 
           (!data.hora_fin || data.hora_fin === null);
  } else {
    // Para descanso y bloqueo_horas, hora_inicio y hora_fin son requeridos
    if (!data.hora_inicio || !data.hora_fin) {
      return false;
    }
    // Comparar horas como strings en formato HH:mm
    return data.hora_inicio < data.hora_fin;
  }
}, {
  message: 'Para bloqueo_dia, hora_inicio y hora_fin deben ser null. Para otros tipos, ambos deben estar presentes y hora_inicio < hora_fin',
  path: ['hora_inicio'],
});

// Validación para crear un descanso extra
export const createDescansoExtraSchema = z.object({
  id_sucursal: z.string().uuid(),
  id_barbero: z.string().uuid(),
  // tipo: z.literal('descanso'),  ← ELIMINA O COMENTA ESTA LÍNEA
  hora_inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
  hora_fin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)'),
  dias_semana: z.array(z.boolean()).length(7),
  motivo: z.string().max(255).nullable().optional(),
}).refine((data) => {
  return data.hora_inicio < data.hora_fin;
}, {
  message: 'La hora de inicio debe ser menor que la hora de fin',
  path: ['hora_inicio'],
});
