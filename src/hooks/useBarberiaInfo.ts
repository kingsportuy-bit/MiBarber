import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Service, Sucursal } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export interface BarberiaInfo {
  id: string;
  numero_sucursal: number;
  nombre_sucursal: string;
  celular: string;
  telefono: string;
  direccion: string;
  id_barberia?: string;
  // Eliminamos la propiedad 'horario' ya que ahora se maneja en la tabla de horarios
}

export function useBarberiaInfo() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { idBarberia } = useBarberoAuth();

  // Obtener información de la barbería
  const fetchBarberiaInfo = async (): Promise<BarberiaInfo> => {
    try {
      let query = (supabase as any)
        .from("mibarber_sucursales")
        .select("id, numero_sucursal, nombre_sucursal, direccion, telefono, celular, id_barberia")
        .limit(1)
        .single();
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        query = query.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await query;
      
      if (error) {
        // Si no existe registro, devolver valores por defecto
        if (error.code === "PGRST116") {
          return {
            id: "",
            numero_sucursal: 1,
            nombre_sucursal: "",
            celular: "",
            telefono: "",
            direccion: "",
            id_barberia: undefined
          };
        }
        console.error("Error fetching barberia info:", error);
        throw error;
      }
      
      console.log("fetchBarberiaInfo - Datos obtenidos:", data);
      
      return {
        id: data?.id || "",
        numero_sucursal: data?.numero_sucursal || 1,
        nombre_sucursal: data?.nombre_sucursal || "",
        celular: data?.celular || "",
        telefono: data?.telefono || "",
        direccion: data?.direccion || "",
        id_barberia: data?.id_barberia || undefined
      };
    } catch (error) {
      console.error("Exception in fetchBarberiaInfo:", error);
      throw error;
    }
  };

  const fetchSucursales = async (): Promise<Sucursal[]> => {
    try {
      let query = (supabase as any)
        .from("mibarber_sucursales")
        .select("id, numero_sucursal, nombre_sucursal, direccion, telefono, celular, id_barberia")
        .order("numero_sucursal", { ascending: true });
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        console.log("fetchSucursales - Filtrando por idBarberia:", idBarberia);
        query = query.eq("id_barberia", idBarberia);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching sucursales:", error);
        throw error;
      }
      
      console.log("fetchSucursales - Datos obtenidos:", data);
      
      // Mapear los datos para que coincidan con la interfaz Sucursal
      return data.map((sucursal: any) => ({
        id: sucursal.id,
        id_barberia: sucursal.id_barberia,
        numero_sucursal: sucursal.numero_sucursal,
        nombre_sucursal: sucursal.nombre_sucursal,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        celular: sucursal.celular,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as Sucursal[];
    } catch (error) {
      console.error("Exception in fetchSucursales:", error);
      throw error;
    }
  };

  // Actualizar información de la barbería
  const updateBarberiaInfo = async (info: Partial<Sucursal>) => {
    try {
      console.log("Updating sucursal info with data:", info);
      
      // Asegurarse de que siempre se incluya un ID
      const updateData = {
        ...info,
        updated_at: new Date().toISOString()
      };
      
      // Eliminar campos que no pertenecen a la tabla si están presentes
      if ('sucursal' in updateData) {
        delete updateData.sucursal;
      }
      
      console.log("Sending update data:", updateData);
      
      // Para una tabla con ID UUID, usamos upsert
      const { data, error } = await (supabase as any)
        .from("mibarber_sucursales")
        .upsert(updateData as any, { 
          onConflict: "id",
          returning: "representation"
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error updating sucursal info:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log("Sucursal info updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in updateBarberiaInfo:", error);
      throw error;
    }
  };

  // Obtener servicios
  const fetchServicios = async (): Promise<Service[]> => {
    try {
      // Verificar que exista idBarberia antes de continuar
      if (!idBarberia) {
        console.warn("No idBarberia provided, returning empty services array");
        return [];
      }
      
      // Primero obtener las sucursales de la barbería actual
      const { data: sucursales, error: sucursalesError } = await (supabase as any)
        .from("mibarber_sucursales")
        .select("id")
        .eq("id_barberia", idBarberia);
      
      if (sucursalesError) {
        console.error("Error fetching sucursales:", sucursalesError);
        throw sucursalesError;
      }
      
      // Obtener los IDs de las sucursales
      const sucursalIds = sucursales.map((s: any) => s.id);
      
      // Si no hay sucursales, devolver array vacío
      if (sucursalIds.length === 0) {
        return [];
      }
      
      // Obtener servicios filtrados por las sucursales de la barbería
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .in("id_sucursal", sucursalIds)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("Error fetching servicios:", error);
        throw error;
      }
      
      return data as Service[];
    } catch (error) {
      console.error("Exception in fetchServicios:", error);
      throw error;
    }
  };

  // Obtener servicios filtrados por sucursal específica
  const fetchServiciosPorSucursal = async (idSucursal?: string): Promise<Service[]> => {
    try {
      console.log("fetchServiciosPorSucursal - Iniciando consulta con idSucursal:", idSucursal);
      
      // Si no hay ID de sucursal, devolver array vacío
      if (!idSucursal) {
        console.log("fetchServiciosPorSucursal - No hay idSucursal, devolviendo servicios vacíos");
        return [];
      }
      
      // Obtener servicios filtrados por la sucursal específica
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("id_sucursal", idSucursal)
        .eq("activo", true)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("Error fetching servicios por sucursal:", error);
        throw error;
      }
      
      console.log("fetchServiciosPorSucursal - Datos obtenidos:", data);
      
      return data as Service[];
    } catch (error) {
      console.error("Exception in fetchServiciosPorSucursal:", error);
      throw error;
    }
  };

  // Obtener servicios de la sucursal del barbero actual
  const fetchServiciosBarbero = async (): Promise<Service[]> => {
    try {
      // Verificar que exista idBarberia antes de continuar
      if (!idBarberia) {
        console.warn("No idBarberia provided, returning empty services array");
        return [];
      }
      
      // Obtener el ID de sucursal del barbero actual
      const { data: barberoData, error: barberoError } = await (supabase as any)
        .from("mibarber_barberos")
        .select("id_sucursal")
        .eq("id_barbero", idBarberia) // idBarberia en este contexto es el id_barbero
        .single();
      
      if (barberoError) {
        console.error("Error fetching barbero data:", barberoError);
        return [];
      }
      
      // Si el barbero no tiene sucursal asignada, devolver array vacío
      if (!barberoData || !barberoData.id_sucursal) {
        console.warn("Barbero no tiene sucursal asignada");
        return [];
      }
      
      // Obtener servicios filtrados por la sucursal del barbero
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .select("*")
        .eq("id_sucursal", barberoData.id_sucursal)
        .eq("activo", true)
        .order("nombre", { ascending: true });
      
      if (error) {
        console.error("Error fetching servicios del barbero:", error);
        throw error;
      }
      
      return data as Service[];
    } catch (error) {
      console.error("Exception in fetchServiciosBarbero:", error);
      throw error;
    }
  };

  // Crear un nuevo servicio
  const createService = async (service: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo">) => {
    try {
      console.log("Iniciando creación de servicio con datos:", service);
      
      // Validar que se haya proporcionado el id_sucursal
      if (!service.id_sucursal) {
        const error = new Error("El ID de sucursal es requerido para crear un servicio");
        console.error("Error de validación:", error.message);
        throw error;
      }
      
      // Validar campos requeridos
      if (!service.nombre || service.precio === undefined || service.precio < 0) {
        const error = new Error("Nombre y precio válido son requeridos para crear un servicio");
        console.error("Error de validación de campos:", error.message);
        throw error;
      }
      
      const serviceData = {
        ...service as any,
        activo: true,
        duracion_minutos: service.duracion_minutos ? parseInt(service.duracion_minutos as any) || 0 : 0,
        // Conectar el servicio a la sucursal en lugar de la barbería
        id_sucursal: service.id_sucursal, // Asegurarse de que se pase el id_sucursal
        id_barberia: idBarberia, // Mantener la conexión con la barbería también
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Datos del servicio a insertar:", serviceData);
      
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .insert(serviceData)
        .select()
        .single();
    
      if (error) {
        console.error("Error creating service:", error);
        console.error("Detalles del error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
    
      console.log("Servicio creado exitosamente:", data);
      return data;
    } catch (error) {
      console.error("Exception in createService:", error);
      console.error("Tipo de error:", typeof error);
      console.error("Error completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  };

  // Actualizar un servicio
  const updateService = async (id: string, service: Partial<Service>) => {
    try {
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .update({
          ...service as any,
          duracion_minutos: service.duracion_minutos ? parseInt(service.duracion_minutos as any) || 0 : undefined
        })
        .eq("id_servicio", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating service:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Exception in updateService:", error);
      throw error;
    }
  };

  // Eliminar un servicio
  const deleteService = async (id: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from("mibarber_servicios")
        .delete()
        .eq("id_servicio", id);
      
      if (error) {
        console.error("Error deleting service:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Exception in deleteService:", error);
      throw error;
    }
  };

  const createSucursal = async (sucursal: Omit<Sucursal, "id" | "created_at" | "updated_at">) => {
    try {
      // Verificar si ya existe una sucursal principal (número 1)
      let query = (supabase as any)
        .from("mibarber_sucursales")
        .select("numero_sucursal")
        .eq("numero_sucursal", 1);
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        query = query.eq("id_barberia", idBarberia);
      }
      
      const { data: existingPrimary, error: existingError } = await query;
      
      // Si no existe sucursal principal, asignar número 1, de lo contrario obtener siguiente número
      let numeroSucursal;
      if (existingError || !existingPrimary) {
        numeroSucursal = 1;
      } else {
        // Obtener el siguiente número de sucursal
        let nextQuery = (supabase as any)
          .from("mibarber_sucursales")
          .select("numero_sucursal")
          .order("numero_sucursal", { ascending: false })
          .limit(1)
          .single();
        
        // Si tenemos un idBarberia, filtrar por él
        if (idBarberia) {
          nextQuery = nextQuery.eq("id_barberia", idBarberia);
        }
        
        const { data: maxData, error: maxError } = await nextQuery;
        numeroSucursal = maxError ? 1 : (maxData?.numero_sucursal || 0) + 1;
      }
      
      const { data, error } = await (supabase as any)
        .from("mibarber_sucursales")
        .insert({
          ...sucursal,
          numero_sucursal: numeroSucursal,
          id_barberia: idBarberia, // Asociar con la barbería actual
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating sucursal:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Exception in createSucursal:", error);
      throw error;
    }
  };

  return {
    // Queries
    barberiaInfoQuery: useQuery({
      queryKey: ["barberia-info", idBarberia],
      queryFn: fetchBarberiaInfo,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }),
    
    sucursalesQuery: useQuery({
      queryKey: ["sucursales", idBarberia],
      queryFn: fetchSucursales,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }),
    
    serviciosQuery: useQuery({
      queryKey: ["servicios-barberia", idBarberia],
      queryFn: fetchServicios,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }),
    
    // Nueva función para obtener servicios por sucursal
    useServiciosPorSucursal: (idSucursal?: string) => 
      useQuery({
        queryKey: ["servicios-sucursal", idSucursal],
        queryFn: () => fetchServiciosPorSucursal(idSucursal),
        staleTime: 5 * 60 * 1000, // 5 minutos
        enabled: !!idSucursal // Solo ejecutar si hay un ID de sucursal
      }),
    
    // Mutations
    updateBarberiaInfoMutation: useMutation({
      mutationFn: updateBarberiaInfo,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["barberia-info"] });
        queryClient.invalidateQueries({ queryKey: ["sucursales"] });
      },
      onError: (error) => {
        console.error("Error en updateBarberiaInfoMutation:", error);
      }
    }),
    
    createSucursalMutation: useMutation({
      mutationFn: createSucursal,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["sucursales"] });
      },
    }),
    
    createServiceMutation: useMutation({
      mutationFn: createService,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["servicios-barberia"] });
      },
    }),
    
    updateServiceMutation: useMutation({
      mutationFn: ({ id, service }: { id: string; service: Partial<Service> }) => 
        updateService(id, service),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["servicios-barberia"] });
      },
    }),
    
    deleteServiceMutation: useMutation({
      mutationFn: deleteService,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["servicios-barberia"] });
      },
    }),
  };
}