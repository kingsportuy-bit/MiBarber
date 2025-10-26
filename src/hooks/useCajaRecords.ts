"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { CajaRecord } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function useCajaRecords(filters: {
  id_cita?: string;
  id_cliente?: string;
  metodo_pago?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  sucursalId?: number;
} = {}) {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { idBarberia } = useBarberoAuth();

  // Obtener todos los registros de caja
  const getAllRecords = useQuery({
    queryKey: ["cajaRecords", filters, idBarberia],
    queryFn: async () => {
      let query = (supabase as any)
        .from("mibarber_caja")
        .select("*")
        .order("fecha", { ascending: false });

      // Aplicar filtros
      if (filters.id_cita) {
        query = query.ilike("id_cita", `%${filters.id_cita}%`);
      }
      
      if (filters.id_cliente) {
        query = query.ilike("id_cliente", `%${filters.id_cliente}%`);
      }
      
      if (filters.metodo_pago) {
        query = query.ilike("metodo_pago", `%${filters.metodo_pago}%`);
      }
      
      if (filters.fechaDesde) {
        query = query.gte("fecha", filters.fechaDesde);
      }
      
      if (filters.fechaHasta) {
        // Agregar un día a la fecha hasta para incluir todo el día
        const toDate = new Date(filters.fechaHasta);
        toDate.setDate(toDate.getDate() + 1);
        query = query.lt("fecha", toDate.toISOString());
      }
      
      // Filtrar por sucursal si se proporciona
      if (filters.sucursalId) {
        query = query.eq("id_sucursal", filters.sucursalId);
      }
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        query = query.eq("id_barberia", idBarberia);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("❌ Error obteniendo registros de caja:", error);
        throw error;
      }
      
      return data as CajaRecord[];
    },
  });

  // Función para crear un nuevo registro usando el enfoque de API route con manejo de errores mejorado
  const createRecordDirect = async (newRecord: any) => {
    console.log("=== CREACIÓN DE REGISTRO (ENFOQUE API ROUTE MEJORADO) ===");
    console.log("Datos recibidos:", newRecord);
    
    try {
      // Preparar datos para inserción con fecha por defecto si no se proporciona
      const insertData: any = {
        concepto: String(newRecord.concepto || 'Servicio'),
        monto: Number(newRecord.monto) || 0,
        metodo_pago: String(newRecord.metodo_pago || ''),
        fecha: newRecord.fecha || new Date().toISOString(), // Asegurar que siempre haya una fecha
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        id_barberia: idBarberia // Asociar con la barbería actual
      };
      
      // Agregar campos opcionales si están presentes
      if (newRecord.id_cita !== undefined && newRecord.id_cita !== null) {
        insertData.id_cita = newRecord.id_cita;
      }
      
      if (newRecord.id_cliente !== undefined && newRecord.id_cliente !== null) {
        insertData.id_cliente = newRecord.id_cliente;
      }
      
      // Manejar el campo de barbero (puede ser barbero_id o barbero)
      if (newRecord.barbero_id !== undefined && newRecord.barbero_id !== null) {
        insertData.barbero_id = Number(newRecord.barbero_id);
      } else if (newRecord.barbero !== undefined && newRecord.barbero !== null) {
        insertData.barbero = String(newRecord.barbero);
      }
      
      // Agregar asociación con sucursal si está presente
      if (newRecord.id_sucursal !== undefined && newRecord.id_sucursal !== null) {
        insertData.id_sucursal = Number(newRecord.id_sucursal);
      }
      
      console.log("Datos preparados para API:", insertData);
      
      // Usar el API route que creamos
      console.log("Realizando fetch a /api/caja-insert");
      const response = await fetch('/api/caja-insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insertData),
      });
      
      console.log("Respuesta recibida:", response.status, response.statusText);
      
      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      console.log("Content-Type de la respuesta:", contentType);
      
      // Leer el cuerpo de la respuesta como texto primero para depuración
      const responseText = await response.text();
      console.log("Texto de la respuesta:", responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error("❌ Respuesta no es JSON. Contenido completo:", responseText);
        // Verificar si es una página HTML de error
        if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
          throw new Error("El servidor devolvió una página HTML en lugar de una respuesta JSON. Posiblemente un error 404 o 500.");
        }
        throw new Error(`Respuesta no válida del servidor. Código: ${response.status}. Contenido: ${responseText.substring(0, 200)}...`);
      }
      
      // Parsear como JSON solo si es seguro
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error("❌ Error parseando JSON:", parseError);
        throw new Error(`Error parseando respuesta JSON: ${parseError.message || 'Error desconocido'}. Contenido: ${responseText.substring(0, 200)}...`);
      }
      
      console.log("Respuesta de API parseada:", result);
      
      if (!response.ok) {
        console.error("❌ Error en API response:", result);
        // Manejar el caso especial cuando result es un objeto vacío
        if (!result || Object.keys(result).length === 0) {
          throw new Error("El servidor devolvió una respuesta vacía. Posiblemente un error interno del servidor.");
        }
        
        // Proporcionar más detalles del error
        const errorMessage = result.message || result.error || 'Error en la inserción';
        const errorDetails = result.details ? `Detalles: ${result.details}` : '';
        const errorCode = result.code ? `Código: ${result.code}` : '';
        const fullErrorMessage = `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}${errorCode ? ` (${errorCode})` : ''}`;
        throw new Error(fullErrorMessage);
      }
      
      console.log("✅ Registro creado exitosamente via API:", result);
      
      // Invalidar las consultas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ["cajaRecords"] });
      
      return result;
    } catch (error: any) {
      console.error("❌ Error completo en createRecordDirect:", error);
      throw error;
    }
  };

  // Crear un nuevo registro
  const createRecord = useMutation({
    mutationFn: async (newRecord: any) => {
      console.log("=== MUTATION: Creando nuevo registro (API MEJORADO) ===");
      console.log("Datos recibidos:", newRecord);
      
      // Primero crear el registro en caja
      const result = await createRecordDirect(newRecord);
      
      // Si se creó exitosamente y hay un id_cita, actualizar registrado_caja a "2"
      if (result?.data?.id_cita) {
        try {
          const supabase = getSupabaseClient();
          const { error: updateError } = await (supabase as any)
            .from("mibarber_citas")
            .update({ registrado_caja: "2" })
            .eq("id_cita", result.data.id_cita);
          
          if (updateError) {
            console.error("❌ Error actualizando registrado_caja:", updateError);
          } else {
            console.log("✅ Actualizado registrado_caja a 2 para cita:", result.data.id_cita);
          }
        } catch (updateError) {
          console.error("❌ Error actualizando registrado_caja:", updateError);
        }
      }
      
      return result;
    },
    onSuccess: () => {
      console.log("✅ Mutación exitosa, invalidando queries");
      queryClient.invalidateQueries({ queryKey: ["cajaRecords"] });
      queryClient.invalidateQueries({ queryKey: ["cajaRecordsDirect"] }); // Invalidar también caja directa
      queryClient.invalidateQueries({ queryKey: ["citasPendientesCaja"] }); // Invalidar citas pendientes
    },
    onError: (error) => {
      console.error("❌ Error en mutación:", error);
    }
  });

  // Actualizar un registro existente
  const updateRecord = useMutation({
    mutationFn: async (updates: any) => {
      try {
        const { id_movimiento, ...updateData } = updates;
        
        console.log("Actualizando registro:", { id_movimiento, updateData });
        
        // Convertir tipos si es necesario
        if (updateData.monto !== undefined) {
          updateData.monto = Number(updateData.monto);
        }
        if (updateData.barbero_id !== undefined) {
          updateData.barbero_id = Number(updateData.barbero_id);
        }
        if (updateData.id_sucursal !== undefined) {
          updateData.id_sucursal = Number(updateData.id_sucursal);
        }
        
        // Actualizar la fecha de modificación
        updateData.updated_at = new Date().toISOString();
        
        const { error } = await (supabase as any)
          .from("mibarber_caja")
          .update(updateData)
          .eq("id_movimiento", id_movimiento);
        
        if (error) {
          console.error("❌ Error actualizando registro:", error);
          throw error;
        }
        
        return { success: true };
      } catch (error) {
        console.error("❌ Error actualizando registro:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cajaRecords"] });
      queryClient.invalidateQueries({ queryKey: ["cajaRecordsDirect"] }); // Invalidar también caja directa
    },
  });

  // Eliminar un registro
  const deleteRecord = useMutation({
    mutationFn: async (id_movimiento: string) => {
      // Primero obtener el registro que se va a eliminar para obtener el id_cita
      const supabase = getSupabaseClient();
      const { data: recordToDelete, error: fetchError } = await (supabase as any)
        .from("mibarber_caja")
        .select("id_cita")
        .eq("id_movimiento", id_movimiento)
        .single();
      
      if (fetchError) {
        console.error("❌ Error obteniendo registro a eliminar:", fetchError);
        throw fetchError;
      }
      
      // Eliminar el registro de caja
      const { error } = await (supabase as any)
        .from("mibarber_caja")
        .delete()
        .eq("id_movimiento", id_movimiento);
      
      if (error) {
        console.error("❌ Error eliminando registro:", error);
        throw error;
      }
      
      // Si el registro tenía un id_cita, actualizar registrado_caja a "1"
      if (recordToDelete?.id_cita) {
        try {
          const { error: updateError } = await (supabase as any)
            .from("mibarber_citas")
            .update({ registrado_caja: "1" })
            .eq("id_cita", recordToDelete.id_cita);
          
          if (updateError) {
            console.error("❌ Error actualizando registrado_caja:", updateError);
          } else {
            console.log("✅ Actualizado registrado_caja a 1 para cita:", recordToDelete.id_cita);
          }
        } catch (updateError) {
          console.error("❌ Error actualizando registrado_caja:", updateError);
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cajaRecords"] });
      queryClient.invalidateQueries({ queryKey: ["cajaRecordsDirect"] }); // Invalidar también caja directa
      queryClient.invalidateQueries({ queryKey: ["citasPendientesCaja"] }); // Invalidar citas pendientes
    },
  });

  return {
    records: getAllRecords.data,
    isLoading: getAllRecords.isLoading,
    isError: getAllRecords.isError,
    error: getAllRecords.error,
    createRecord,
    createRecordDirect,
    updateRecord,
    deleteRecord,
  };
}