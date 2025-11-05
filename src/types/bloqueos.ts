// Tipos para el sistema de bloqueos y descansos

export type TipoBloqueo = 'descanso' | 'bloqueo_horas' | 'bloqueo_dia';

export interface Bloqueo {
  id: string;
  id_barberia: string;
  id_sucursal: string;
  id_barbero: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio?: string | null; // HH:mm
  hora_fin?: string | null; // HH:mm
  tipo: TipoBloqueo;
  motivo?: string | null;
  creado_por: string;
  creado_at: string; // timestamptz ISO
}

// Tipos para descansos extra
export interface DescansoExtra {
  id: string;
  id_barberia: string;
  id_sucursal: string;
  id_barbero: string;
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
  dias_semana: boolean[]; // Array de booleanos
  motivo?: string | null;
  creado_por: string;
  creado_at: string; // timestamptz ISO
}

// Payload para crear un bloqueo
export interface CreateBloqueoPayload {
  id_sucursal: string;
  id_barbero: string;
  fecha?: string; // YYYY-MM-DD (requerido para bloqueo_horas y bloqueo_dia)
  hora_inicio?: string | null; // HH:mm (requerido para bloqueo_horas y bloqueo_dia)
  hora_fin?: string | null; // HH:mm (requerido para bloqueo_horas y bloqueo_dia)
  tipo: TipoBloqueo;
  motivo?: string | null;
}

// Payload para crear un descanso extra
export interface CreateDescansoExtraPayload {
  id_sucursal: string;
  id_barbero: string;
  id_barberia: string;
  hora_inicio: string; // HH:mm
  hora_fin: string; // HH:mm
  dias_semana: boolean[]; // Array de booleanos
  motivo?: string | null;
  creado_por: string;
}

// Payload para listar bloqueos por día
export interface ListBloqueosParams {
  idSucursal: string;
  idBarbero?: string;
  fecha: string; // YYYY-MM-DD
}

// Payload para listar bloqueos por rango
export interface ListBloqueosRangoParams {
  idSucursal: string;
  idBarbero?: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
}

// Payload para listar descansos extra
export interface ListDescansosExtraParams {
  idSucursal: string;
  idBarbero?: string;
}