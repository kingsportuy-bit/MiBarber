// Tipos para el sistema de citas
import type { Appointment } from '@/types/db';

// Tipo para crear una cita
export interface CreateCitaData {
  // Campos requeridos
  fecha: string;
  hora: string;
  cliente_nombre: string;
  servicio: string;
  barbero: string;
  id_sucursal: string;
  id_barberia: string;
  
  // Campos opcionales
  estado?: "pendiente" | "confirmado" | "cancelado" | "completado";
  nota?: string | null;
  id_cliente?: string | null;
  ticket?: number | null;
  nro_factura?: string | null;
  duracion?: string | null;
  id_barbero?: string | null;
  id_servicio?: string | null;
  creado?: string;
  notificacion_barbero?: string | null;
  notificacion_cliente?: string | null;
}

// Tipo para actualizar una cita
export interface UpdateCitaData {
  id_cita: string;
  // Todos los campos son opcionales excepto el ID
  fecha?: string;
  hora?: string;
  cliente_nombre?: string;
  servicio?: string;
  barbero?: string;
  id_sucursal?: string;
  id_barberia?: string;
  estado?: "pendiente" | "confirmado" | "cancelado" | "completado";
  nota?: string | null;
  id_cliente?: string | null;
  ticket?: number | null;
  nro_factura?: string | null;
  duracion?: string | null;
  id_barbero?: string | null;
  id_servicio?: string | null;
  creado?: string;
  notificacion_barbero?: string | null;
  notificacion_cliente?: string | null;
}

// Tipo para datos de rango de fechas
export interface CitasPorRangoParams {
  sucursalId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// Tipo para horarios disponibles
export interface HorariosDisponiblesParams {
  sucursalId?: string;
  fecha?: string;
  barberoId?: string;
}

// Reexportar el tipo Appointment
export type { Appointment };