import type { Appointment } from '@/types/db';

/**
 * Valida el paso de selección de cliente
 * @param formData - Datos del formulario
 * @returns true si el cliente es válido, false en caso contrario
 */
export function validateClientStep(formData: Partial<Appointment>): boolean {
  return !!formData.cliente_nombre;
}

/**
 * Valida el paso de selección de servicio
 * @param formData - Datos del formulario
 * @returns true si el servicio y barbero son válidos, false en caso contrario
 */
export function validateServiceStep(formData: Partial<Appointment>): boolean {
  return !!formData.servicio && !!formData.barbero;
}

/**
 * Valida el paso de selección de fecha y hora
 * @param formData - Datos del formulario
 * @returns true si la fecha y hora son válidas, false en caso contrario
 */
export function validateDateTimeStep(formData: Partial<Appointment>): boolean {
  return !!formData.fecha && !!formData.hora;
}