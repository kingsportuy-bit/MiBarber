// Hook para crear una nueva cita
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from '@/types/db';
import { isTimeSlotOccupied } from "@/features/appointments/utils/citasHelpers";

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
      // TODOS los campos son requeridos EXCEPTO 'nota'
      const requiredFields: (keyof Omit<Appointment, "id_cita" | "nota">)[] = [
        "fecha", 
        "hora", 
        "cliente_nombre", 
        "servicio", 
        "barbero",
        "telefono",        // ✅ OBLIGATORIO
        "id_barbero",      // ✅ OBLIGATORIO
        "id_sucursal",     // ✅ OBLIGATORIO
        "id_barberia",     // ✅ OBLIGATORIO
        "duracion"         // ✅ OBLIGATORIO
      ];
      
      const missingFields = requiredFields.filter(field => {
        const value = newCita[field];
        return value === undefined || value === null || value === "";
      });
      
      if (missingFields.length > 0) {
        const errorMsg = `Faltan campos requeridos para crear el turno: ${missingFields.join(", ")}`;
        console.error('❌ Campos faltantes:', missingFields);
        console.error('📋 Datos recibidos:', newCita);
        throw new Error(errorMsg);
      }
      
      // Verificar si la fecha y hora están bloqueadas
      if (newCita.id_sucursal && newCita.fecha && newCita.id_barbero) {
        const { data: bloqueos } = await supabase
          .from("mibarber_bloqueos_barbero")
          .select("*")
          .eq("id_sucursal", newCita.id_sucursal)
          .eq("fecha", newCita.fecha)
          .eq("id_barbero", newCita.id_barbero);
        
        // Verificar bloqueo de día completo
        const bloqueoDiaCompleto = bloqueos?.some(bloqueo => bloqueo.tipo === 'bloqueo_dia');
        
        if (bloqueoDiaCompleto) {
          throw new Error("No se puede crear una cita en un día bloqueado completo");
        }
        
        // Verificar bloqueo de horario
        if (bloqueos && bloqueos.length > 0 && newCita.hora) {
          const horaCita = newCita.hora.slice(0, 5); // HH:mm
          
          const bloqueoHorario = bloqueos.some(bloqueo => {
            if (bloqueo.tipo !== 'descanso' && bloqueo.tipo !== 'bloqueo_horas') {
              return false;
            }
            
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
      
      // Verificar solapamiento de citas
      const { data: citasExistentes, error: errorCitas } = await supabase
        .from("mibarber_citas")
        .select("*")
        .eq("id_barbero", newCita.id_barbero || '')
        .eq("fecha", newCita.fecha)
        .in("estado", ["pendiente", "confirmado"]);
      
      if (!errorCitas && citasExistentes && citasExistentes.length > 0) {
        // Extraer la hora y minutos de la nueva cita
        const [hora, minutos] = newCita.hora.split(":").map(Number);
        const duracion = parseInt(newCita.duracion);
        
        // Verificar si hay solapamiento
        const solapado = isTimeSlotOccupied(
          hora,
          minutos,
          citasExistentes,
          newCita.id_barbero || undefined,
          newCita.fecha,
          duracion,
          false, // No es edición
          undefined // No hay ID de cita inicial
        );
        
        if (solapado) {
          // Permitir la creación de citas solapadas (requerimiento específico)
          console.log("⚠️ Se detectó solapamiento pero se permite la creación de la cita");
        }
      }
      
      // Construir el objeto para insertar - TODOS los campos menos 'nota'
      const citaToInsert: any = {
        // Campos obligatorios básicos
        fecha: newCita.fecha,
        hora: newCita.hora,
        cliente_nombre: newCita.cliente_nombre,
        servicio: newCita.servicio,
        barbero: newCita.barbero,
        estado: newCita.estado || "pendiente",
        
        // IDs obligatorios
        id_barberia: newCita.id_barberia,
        id_sucursal: newCita.id_sucursal,
        id_barbero: newCita.id_barbero,
        
        // Datos del cliente obligatorios
        telefono: newCita.telefono,
        
        // Servicio obligatorio
        duracion: newCita.duracion,
        id_servicio: newCita.id_servicio || null,
        
        // Pago (si viene)
        ticket: newCita.ticket || null,
        metodo_pago: newCita.metodo_pago || null,
        
        // Cliente (si existe)
        id_cliente: newCita.id_cliente || null,
        
        // Notificaciones
        notificacion_barbero: newCita.notificacion_barbero || "no",
        notificacion_cliente: newCita.notificacion_cliente || "no",
        
        // ÚNICO CAMPO OPCIONAL
        nota: newCita.nota || null
      };
      
      console.log('📤 Datos a insertar en BD:', citaToInsert);
      
      try {
        const { data, error } = await supabase
          .from("mibarber_citas")
          .insert([citaToInsert])
          .select()
          .single();
        
        if (error) {
          console.error('❌ Error de Supabase:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }
        
        console.log('✅ Cita creada exitosamente:', data);
        return data as Appointment;
      } catch (dbError: any) {
        console.error('💥 Error en la base de datos:', dbError);
        throw new Error(dbError.message || 'Error desconocido al crear la cita');
      }
    },
    onSuccess: (data) => {
      // Invalidar todas las consultas de citas
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      
      // Invalidar también las consultas de horarios disponibles
      // Esto asegura que los horarios se actualicen después de crear una cita
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles-completo"] });
    },
    onError: (error: Error) => {
      console.error('🔴 Error en mutation:', error.message);
    }
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