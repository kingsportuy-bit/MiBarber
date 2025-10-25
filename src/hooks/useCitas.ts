"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Appointment } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth"; // Importar el hook de autenticación

// Definir el tipo de retorno extendido
type UseCitasResult = UseQueryResult<Appointment[], Error> & {
  createMutation: any;
  updateMutation: any;
  deleteMutation: any;
  refetch: () => void;
  useCitasPorRango: (sucursalId?: string, fechaInicio?: string, fechaFin?: string) => UseQueryResult<Appointment[], Error>;
  useHorariosDisponibles: (sucursalId?: string, fecha?: string, barberoId?: string) => UseQueryResult<Appointment[], Error>;
};

export function useCitas(
  sucursalId?: string,
  fecha?: string, // Agregar parámetro de fecha
  barberoId?: string // Agregar parámetro de barbero para filtrar
): UseCitasResult {
  const supabase = getSupabaseClient();
  const qc = useQueryClient();
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth(); // Obtener información del usuario actual

  const listQuery = useQuery({
    queryKey: ["citas", sucursalId, fecha, barberoId, barberoActual?.id_barbero, isAdmin, idBarberia], // Incluir información del usuario en la clave de consulta
    queryFn: async () => {
      let q = (supabase as any).from("mibarber_citas").select("*");
      
      console.log("Consultando citas con filtros:", { sucursalId, fecha, barberoId, isAdmin, barberoActualId: barberoActual?.id_barbero, idBarberia });
      
      // Si se proporciona una sucursal, filtrar por ella
      if (sucursalId) {
        q = q.eq("id_sucursal", sucursalId);
      }
      
      // Si se proporciona una fecha, filtrar por ella
      if (fecha) {
        q = q.eq("fecha", fecha);
      }
      
      // Si se proporciona un barbero específico para filtrar, usarlo
      if (barberoId) {
        q = q.eq("id_barbero", barberoId);
      } 
      // Si el usuario no es administrador y no se especificó un barbero, solo mostrar sus propias citas
      else if (!isAdmin && !barberoId && barberoActual?.id_barbero) {
        q = q.eq("id_barbero", barberoActual.id_barbero);
      }
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        q = q.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await q.order("fecha", { ascending: false });
      if (error) {
        console.error("Error al obtener citas:", error);
        throw error;
      }
      
      console.log("Datos obtenidos de citas:", data?.length);
      return data as Appointment[];
    },
  });

  // Nuevo hook para obtener citas por rango de fechas
  function useCitasPorRango(sucursalId?: string, fechaInicio?: string, fechaFin?: string) {
    return useQuery({
      queryKey: ["citas-rango", sucursalId, fechaInicio, fechaFin, barberoActual?.id_barbero, isAdmin],
      queryFn: async () => {
        if (!fechaInicio || !fechaFin) {
          return [];
        }
        
        let q = (supabase as any).from("mibarber_citas").select("*");
        
        // Si se proporciona una sucursal, filtrar por ella
        if (sucursalId) {
          q = q.eq("id_sucursal", sucursalId);
        }
        
        // Filtrar por rango de fechas
        q = q.gte("fecha", fechaInicio).lte("fecha", fechaFin);
        
        // Si el usuario no es administrador, solo mostrar sus propias citas
        if (!isAdmin && barberoActual?.id_barbero) {
          q = q.eq("id_barbero", barberoActual.id_barbero);
        }
        
        // Si tenemos un idBarberia, filtrar por él
        if (idBarberia) {
          q = q.eq("id_barberia", idBarberia);
        }
        
        const { data, error } = await q.order("fecha", { ascending: true });
        if (error) throw error;
        return data as Appointment[];
      },
    });
  }

  // Nuevo hook para verificar disponibilidad de horarios
  function useHorariosDisponibles(sucursalId?: string, fecha?: string, barberoId?: string) {
    return useQuery({
      queryKey: ["horarios-disponibles", sucursalId, fecha, barberoId],
      queryFn: async () => {
        if (!sucursalId || !fecha) {
          return [];
        }
        
        let q = (supabase as any).from("mibarber_citas").select("*");
        
        // Filtrar por sucursal
        q = q.eq("id_sucursal", sucursalId);
        
        // Filtrar por fecha
        q = q.eq("fecha", fecha);
        
        // Si se especifica un barbero, filtrar por él
        if (barberoId) {
          q = q.eq("id_barbero", barberoId);
        }
        
        const { data, error } = await q.order("hora", { ascending: true });
        if (error) throw error;
        return data as Appointment[];
      },
    });
  }

  const createMutation = useMutation({
    mutationFn: async (newCita: Omit<Appointment, "id_cita">) => {
      console.log("=== INICIO CREACIÓN CITA ===");
      console.log("Datos recibidos para crear cita:", newCita);
      
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
        console.error("Error de validación:", errorMsg);
        throw new Error(errorMsg);
      }
      
      // Asegurar que el estado tenga un valor por defecto
      const citaToInsert = {
        ...newCita,
        estado: newCita.estado || "pendiente"
        // Eliminamos creado, duracion, id_barbero, id_servicio y metodo_pago 
        // ya que pueden no existir en la tabla
      };
      
      // Verificar si los campos existen en el objeto antes de incluirlos
      // Solo incluir campos que existen y tienen valor
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
      
      console.log("Datos a insertar en la base de datos:", cleanedCita);
      
      try {
        const { data, error } = await (supabase as any)
          .from("mibarber_citas")
          .insert([cleanedCita])
          .select()
          .single();
        
        if (error) {
          console.error("Error al insertar cita en Supabase:", error);
          console.error("Detalles del error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          
          // Si el error es por columnas que no existen, intentar de nuevo con solo los campos básicos
          if (error.message && (
            error.message.includes("creado") || 
            error.message.includes("duracion") || 
            error.message.includes("id_barbero") || 
            error.message.includes("id_servicio") || 
            error.message.includes("metodo_pago")
          )) {
            console.log("Reintentando sin campos problemáticos...");
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
            
            console.log("Cita creada exitosamente en reintento:", retryData);
            console.log("=== FIN CREACIÓN CITA ===");
            return retryData as Appointment;
          }
          
          throw error;
        }
        
        console.log("Cita creada exitosamente:", data);
        console.log("=== FIN CREACIÓN CITA ===");
        return data as Appointment;
      } catch (dbError) {
        console.error("Error en la base de datos:", dbError);
        throw dbError;
      }
    },
    onSuccess: () => {
      console.log("Mutación exitosa, invalidando queries");
      qc.invalidateQueries({ queryKey: ["citas"] });
    },
    onError: (error) => {
      console.error("Error en la mutación:", error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id_cita,
      ...updates
    }: Partial<Appointment> & { id_cita: string }) => {
      // Si la cita pasa a estado "completado", crear registro en caja
      if (updates.estado === "completado" && updates.ticket) {
        const { error: cajaError } = await (supabase as any)
          .from("mibarber_caja")
          .insert({
            tipo: "ingreso",
            concepto: `Servicio: ${updates.servicio || "No especificado"}`,
            monto: updates.ticket,
            id_cita: id_cita,
            id_cliente: updates.id_cliente,
            barbero: updates.barbero,
            fecha: new Date().toISOString(),
            metodo_pago: updates.metodo_pago || "",
            id_sucursal: updates.id_sucursal, // Asociar con la sucursal
            id_barberia: idBarberia // Asociar con la barbería
          });
        
        if (cajaError) {
          console.error("❌ Error creando registro en caja:", cajaError);
        }
      }
      
      // Verificar si los campos id_barbero, id_servicio y metodo_pago existen en la tabla
      // Si no existen, los eliminamos para evitar errores
      let cleanedUpdates: any = { ...updates };
      
      // Solo incluir campos opcionales si existen en el objeto
      if (updates.id_barbero === undefined) {
        delete cleanedUpdates.id_barbero;
      }
      
      if (updates.id_servicio === undefined) {
        delete cleanedUpdates.id_servicio;
      }
      
      if (updates.metodo_pago === undefined) {
        delete cleanedUpdates.metodo_pago;
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_citas")
        .update(cleanedUpdates)
        .eq("id_cita", id_cita)
        .select()
        .single();
        
      if (error) {
        console.error("Error al actualizar cita en Supabase:", error);
        console.error("Detalles del error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Si el error es por columnas que no existen, intentar de nuevo sin esos campos
        if (error.message && (
          error.message.includes("id_barbero") || 
          error.message.includes("id_servicio") || 
          error.message.includes("metodo_pago")
        )) {
          console.log("Reintentando actualización sin campos problemáticos...");
          const retryUpdates = { ...cleanedUpdates };
          delete retryUpdates.id_barbero;
          delete retryUpdates.id_servicio;
          delete retryUpdates.metodo_pago;
          
          const { data: retryData, error: retryError } = await (supabase as any)
            .from("mibarber_citas")
            .update(retryUpdates)
            .eq("id_cita", id_cita)
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
    },
    onSuccess: () => {
      console.log("Mutación exitosa, invalidando queries");
      // Invalidar todas las consultas de citas
      qc.invalidateQueries({ queryKey: ["citas"] });
      // También invalidar consultas específicas si es necesario
      qc.invalidateQueries({ queryKey: ["citas-rango"] });
      qc.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id_cita: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_citas")
        .delete()
        .eq("id_cita", id_cita);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      console.log("Mutación de eliminación exitosa, invalidando queries");
      qc.invalidateQueries({ queryKey: ["citas"] });
    },
  });

  return { 
    ...listQuery, 
    createMutation, 
    updateMutation, 
    deleteMutation, 
    refetch: listQuery.refetch,
    useCitasPorRango, // Exportar el nuevo hook
    useHorariosDisponibles // Exportar el nuevo hook
  };
}