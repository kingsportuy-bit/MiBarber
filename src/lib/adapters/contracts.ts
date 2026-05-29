import type { Appointment } from "@/types/db";

// Respuesta estándar de la API de Barberox
export interface BarberoxResponse<T = any> {
  success: boolean;
  data?: T;
  errors?: any;
  meta?: any;
}

// Payload para acciones del panel (Webhook a n8n)
export interface PanelActionPayload {
  id_cita: string;
  id_sucursal: string;
  id_barbero: string;
  accion: 'cancelar' | 'confirmar_asistencia' | 'reagendar' | 'completar';
  origen: 'panel_barbero';
  datos_extra?: Record<string, unknown>;
}

// Interfaz para el repositorio de acciones del panel
export interface IPanelActionRepository {
  panelAction(payload: PanelActionPayload): Promise<BarberoxResponse>;
}

// Interfaz para el repositorio de lectura de citas (Solo Lectura)
export interface IAppointmentReadRepository {
  listar(params: {
    sucursalId?: string;
    fecha?: string;
    barberoId?: string;
  }): Promise<Appointment[]>;
  
  listarPorRango(params: {
    sucursalId?: string;
    fechaInicio?: string;
    fechaFin?: string;
    barberoId?: string;
  }): Promise<Appointment[]>;
}
