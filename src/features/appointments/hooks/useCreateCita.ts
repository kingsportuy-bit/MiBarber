// Hook para crear una nueva cita
// Sincronizado con WEB.md — incluye sync de mibarber_clientes (fase, stats, contexto_turno_id)
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
        "telefono",
        "id_barbero",
        "id_sucursal",
        "id_barberia",
        "duracion"
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
        
        const bloqueoDiaCompleto = bloqueos?.some(bloqueo => bloqueo.tipo === 'bloqueo_dia');
        
        if (bloqueoDiaCompleto) {
          throw new Error("No se puede crear una cita en un día bloqueado completo");
        }
        
        if (bloqueos && bloqueos.length > 0 && newCita.hora) {
          const horaCita = newCita.hora.slice(0, 5);
          
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
      
      // Verificar solapamiento de citas — usar "confirmada" (no "confirmado")
      const { data: citasExistentes, error: errorCitas } = await supabase
        .from("mibarber_citas")
        .select("*")
        .eq("id_barbero", newCita.id_barbero || '')
        .eq("fecha", newCita.fecha)
        .in("estado", ["pendiente", "confirmada"]);
      
      if (!errorCitas && citasExistentes && citasExistentes.length > 0) {
        const [hora, minutos] = newCita.hora.split(":").map(Number);
        const duracion = parseInt(newCita.duracion);
        
        const solapado = isTimeSlotOccupied(
          hora,
          minutos,
          citasExistentes,
          newCita.id_barbero || undefined,
          newCita.fecha,
          duracion,
          false,
          undefined
        );
        
        if (solapado) {
          console.log("⚠️ Se detectó solapamiento pero se permite la creación de la cita");
        }
      }
      
      // Si se proporcionó un id_cliente, obtener el id_conversacion del cliente
      let id_conversacion = null;
      if (newCita.id_cliente) {
        try {
          const { data: clienteData, error: clienteError } = await supabase
            .from("mibarber_clientes")
            .select("id_conversacion")
            .eq("id_cliente", newCita.id_cliente)
            .single();
          
          if (!clienteError && clienteData) {
            id_conversacion = clienteData.id_conversacion;
          }
        } catch (error) {
          console.warn("No se pudo obtener el id_conversacion del cliente:", error);
        }
      }
      
      // Construir el objeto para insertar — sin notificacion_cliente (no existe en DB)
      const citaToInsert: any = {
        // Campos obligatorios básicos
        fecha: newCita.fecha,
        hora: newCita.hora,
        cliente_nombre: newCita.cliente_nombre,
        servicio: newCita.servicio,
        barbero: newCita.barbero,
        estado: newCita.estado || "pendiente",
        
        // Estado de ciclo operativo (requerido por WEB.md)
        estado_ciclo: "pendiente",
        
        // IDs obligatorios
        id_barberia: newCita.id_barberia,
        id_sucursal: newCita.id_sucursal,
        id_barbero: newCita.id_barbero,
        
        // Datos del cliente obligatorios
        telefono: newCita.telefono,
        
        // Servicio obligatorio
        duracion: newCita.duracion,
        id_servicio: newCita.id_servicio || null,
        
        // Pago
        ticket: newCita.ticket || null,
        metodo_pago: newCita.metodo_pago || null,
        
        // Cliente
        id_cliente: newCita.id_cliente || null,
        
        // id_conversacion del cliente
        id_conv: id_conversacion,
        
        // Notificaciones — notificacion_barbero='no' para disparar trigger
        notificacion_barbero: "no",
        
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
          console.error('❌ Error de Supabase al crear cita:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }
        
        console.log('✅ Cita creada exitosamente:', data);
        
        // ── Sync mibarber_clientes (WEB.md §1: Crear turno) ──────────────
        if (newCita.id_cliente) {
          try {
            const clienteUpdate: any = {
              fase: '2',
              fase_anterior: null,
              fase_updated_at: new Date().toISOString(),
              contexto_turno_id: data.id_cita,
              booking_data: {},
              estado_turno: null,
              session_ctx: {},
            };
            
            const { error: clienteError } = await supabase
              .from("mibarber_clientes")
              .update(clienteUpdate)
              .eq("id_cliente", newCita.id_cliente);
            
            if (clienteError) {
              console.error('⚠️ Error actualizando cliente (fase/contexto):', clienteError);
            } else {
              console.log('✅ Cliente sincronizado: fase=2, contexto_turno_id=', data.id_cita);
            }
          } catch (syncError) {
            console.error('⚠️ Error en sync de cliente:', syncError);
            // No lanzar error — la cita ya se creó
          }
        }
        
        return data as Appointment;
      } catch (dbError: any) {
        console.error('💥 Error en la base de datos:', dbError);
        throw new Error(dbError.message || 'Error desconocido al crear la cita');
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["citas"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles-completo"] });
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
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