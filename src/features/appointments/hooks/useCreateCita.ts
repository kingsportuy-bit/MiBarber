// Hook para crear una nueva cita
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import type { CreateCitaData } from '../types';
import { useBloqueosPorDia } from "@/hooks/useBloqueosBarbero";

export interface CreateCitaResult {
  mutate: (newCita: Omit<Appointment, "id_cita">) => void;
  mutateAsync: (newCita: Omit<Appointment, "id_cita">) => Promise<Appointment>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export function useCreateCita(): CreateCitaResult {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newCita: Omit<Appointment, "id_cita">) => {
      // Validar que los campos requeridos estén presentes
      const requiredFields: (keyof Omit<Appointment, "id_cita">)[] = [
        "fecha", 
        "hora", 
        "cliente_nombre", 
        "servicio", 
        "barbero",
        "id_sucursal",
        "id_barberia"
      ];
      
      const missingFields = requiredFields.filter(field => {
        return newCita[field] === undefined || newCita[field] === null || newCita[field] === "";
      });
      
      if (missingFields.length > 0) {
        const errorMsg = `Faltan campos requeridos para crear el turno: ${missingFields.join(", ")}`;
        throw new Error(errorMsg);
      }
      
      // Verificar si la fecha y hora están bloqueadas
      if (newCita.id_sucursal && newCita.fecha) {
        // Obtener los bloqueos para el día
        const { data: bloqueos } = await supabase
          .from("mibarber_bloqueos_barbero")
          .select("*")
          .eq("id_sucursal", newCita.id_sucursal)
          .eq("fecha", newCita.fecha)
          .eq("id_barbero", newCita.id_barbero || '');
        
        // Verificar si hay un bloqueo de día completo
        const bloqueoDiaCompleto = bloqueos?.some(bloqueo => bloqueo.tipo === 'bloqueo_dia');
        
        if (bloqueoDiaCompleto) {
          throw new Error("No se puede crear una cita en un día bloqueado completo");
        }
        
        // Verificar si la hora está dentro de un bloqueo de horas o descanso
        if (bloqueos && bloqueos.length > 0 && newCita.hora) {
          const horaCita = newCita.hora.slice(0, 5); // HH:mm
          
          const bloqueoHorario = bloqueos.some(bloqueo => {
            // Solo considerar bloqueos de horas o descansos
            if (bloqueo.tipo !== 'descanso' && bloqueo.tipo !== 'bloqueo_horas') {
              return false;
            }
            
            // Verificar si la cita cae dentro del rango del bloqueo
            if (bloqueo.hora_inicio && bloqueo.hora_fin) {
              return horaCita >= bloqueo.hora_inicio && horaCita < bloqueo.hora_fin;
            }
            
            return false;
          });
          
          if (bloqueoHorario) {
            throw new Error("No se puede crear una cita en un horario bloqueado");
          }
        }
      }
      
      // Asegurar que el estado tenga un valor por defecto
      const citaToInsert = {
        ...newCita,
        estado: newCita.estado || "pendiente"
      };
      
      // Limpiar campos que pueden no existir en la tabla
      let cleanedCita: any = { ...citaToInsert };
      
      // Eliminar campos que pueden no existir en la tabla
      delete cleanedCita.creado;
      delete cleanedCita.duracion;
      delete cleanedCita.id_barbero;
      delete cleanedCita.id_servicio;
      delete cleanedCita.metodo_pago;
      
      // Solo incluir campos que existen en newCita y tienen valor
      if (newCita.creado) {
        cleanedCita.creado = newCita.creado;
      }
      
      if (newCita.duracion) {
        cleanedCita.duracion = newCita.duracion;
      }
      
      if (newCita.id_barbero) {
        cleanedCita.id_barbero = newCita.id_barbero;
      }
      
      if (newCita.id_servicio) {
        cleanedCita.id_servicio = newCita.id_servicio;
      }
      
      if (newCita.metodo_pago) {
        cleanedCita.metodo_pago = newCita.metodo_pago;
      }
      
      try {
        const { data, error } = await (supabase as any)
          .from("mibarber_citas")
          .insert([cleanedCita])
          .select()
          .single();
        
        if (error) {
          // Si el error es por columnas que no existen, intentar de nuevo con solo los campos básicos
          if (error.message && (
            error.message.includes("creado") || 
            error.message.includes("duracion") || 
            error.message.includes("id_barbero") || 
            error.message.includes("id_servicio") || 
            error.message.includes("metodo_pago")
          )) {
            const basicCita: any = { 
              fecha: cleanedCita.fecha,
              hora: cleanedCita.hora,
              cliente_nombre: cleanedCita.cliente_nombre,
              servicio: cleanedCita.servicio,
              barbero: cleanedCita.barbero,
              estado: cleanedCita.estado || "pendiente"
            };
            
            // Solo incluir campos que existen en cleanedCita
            if (cleanedCita.id_sucursal) basicCita.id_sucursal = cleanedCita.id_sucursal;
            if (cleanedCita.id_barberia) basicCita.id_barberia = cleanedCita.id_barberia;
            if (cleanedCita.id_cliente) basicCita.id_cliente = cleanedCita.id_cliente;
            if (cleanedCita.ticket) basicCita.ticket = cleanedCita.ticket;
            if (cleanedCita.nota) basicCita.nota = cleanedCita.nota;
            
            const { data: retryData, error: retryError } = await (supabase as any)
              .from("mibarber_citas")
              .insert([basicCita])
              .select()
              .single();
              
            if (retryError) {
              throw retryError;
            }
            
            return retryData as Appointment;
          }
          
          throw error;
        }
        
        return data as Appointment;
      } catch (dbError) {
        throw dbError;
      }
    },
    onSuccess: () => {
      // Invalidar todas las consultas de citas
      queryClient.invalidateQueries({ queryKey: ["citas"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error || null,
    isSuccess: mutation.isSuccess,
  };
}