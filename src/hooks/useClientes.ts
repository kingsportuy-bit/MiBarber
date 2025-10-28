"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export type SortOption =
  | "ultimo_agregado"
  | "primero_agregado"
  | "mayor_puntaje"
  | "menor_puntaje"
  | "ultima_interaccion";

export function useClientes(
  search?: string,
  sortBy: SortOption = "ultimo_agregado",
  idSucursal?: string,
) {
  const supabase = getSupabaseClient();
  const qc = useQueryClient();
  const { idBarberia, isAdmin } = useBarberoAuth();

  const listQuery = useQuery({
    queryKey: ["clientes", { search, sortBy, idBarberia, idSucursal }],
    queryFn: async (): Promise<Client[]> => {
      let q = (supabase as any).from("mibarber_clientes").select("*");
      
      console.log("🔍 Consulta de clientes:", {
        idBarberia,
        idSucursal,
        search,
        sortBy
      });

      // Filtrar por barbería - siempre aplicar si está disponible
      if (idBarberia) {
        console.log("🔍 Filtrando por idBarberia:", idBarberia);
        q = q.eq("id_barberia", idBarberia);
      }

      // Filtrar por sucursal - siempre aplicar si está disponible
      if (idSucursal) {
        console.log("🔍 Filtrando por idSucursal:", idSucursal);
        q = q.eq("id_sucursal", idSucursal);
      }

      // Aplicar ordenamiento
      console.log("🔍 Aplicando ordenamiento:", sortBy);
      switch (sortBy) {
        case "ultimo_agregado":
          q = q.order("fecha_creacion", { ascending: false });
          break;
        case "primero_agregado":
          q = q.order("fecha_creacion", { ascending: true });
          break;
        case "mayor_puntaje":
          q = q.order("puntaje", { ascending: false, nullsFirst: false });
          break;
        case "menor_puntaje":
          q = q.order("puntaje", { ascending: true, nullsFirst: true });
          break;
        case "ultima_interaccion":
          q = q.order("ultima_interaccion", {
            ascending: false,
            nullsFirst: false,
          });
          break;
      }

      // Solo aplicar búsqueda si hay texto
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        console.log("🔍 Aplicando búsqueda:", s);
        
        // Usar la misma lógica que en el modal de citas
        // Filtrar clientes localmente después de obtener todos los datos
        // Esto es más confiable que las consultas OR complejas
        const { data, error } = await q;
        
        if (error) {
          console.error("❌ Error consultando clientes:", error);
          console.error("❌ Detalles del error:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        // Filtrar los resultados localmente
        if (data && data.length > 0) {
          const filteredData = data.filter(
            (cliente: Client) =>
              cliente.nombre.toLowerCase().includes(s) ||
              (cliente.telefono && cliente.telefono.toLowerCase().includes(s)) ||
              (cliente.id_cliente && cliente.id_cliente.toLowerCase().includes(s)) ||
              (cliente.notas && cliente.notas.toLowerCase().includes(s))
          );
          console.log("✅ Clientes obtenidos y filtrados:", filteredData.length);
          return filteredData as Client[];
        }
        
        console.log("✅ Clientes obtenidos:", data?.length || 0);
        return data as Client[];
      }

      console.log("🔍 Ejecutando query sin búsqueda");
      const { data, error } = await q;

      if (error) {
        console.error("❌ Error consultando clientes:", error);
        console.error("❌ Detalles del error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log("✅ Clientes obtenidos:", data?.length || 0);
      return data as Client[];
    },
  });

  // Activar suscripción en tiempo real para clientes
  useEffect(() => {
    const channel = supabase
      .channel("clientes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mibarber_clientes" },
        () => {
          // Invalidar todas las posibles claves de consulta de clientes
          qc.invalidateQueries({ queryKey: ["clientes"] });
          qc.invalidateQueries({ queryKey: ["clientes_basic"] });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Suscripción a clientes en tiempo real activa");
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, supabase]);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Client>) => {
      console.log("💾 useClientes.createMutation - Payload recibido:", payload);

      // Establecer valores por defecto para nuevos clientes
      // No incluimos id_cliente ya que se genera automáticamente en la base de datos
      const newClient = {
        // Incluimos el teléfono en el campo correcto
        telefono: payload.telefono, // Usar el teléfono del payload
        nombre: payload.nombre,
        notas: payload.notas,
        nivel_cliente: payload.nivel_cliente ?? 2, // Nivel 2 por defecto para clientes agregados desde la app
        puntaje: payload.puntaje ?? 0, // Puntaje inicial 0
        id_barberia: payload.id_barberia || idBarberia, // Usar del payload o de la barbería actual
        id_sucursal: payload.id_sucursal || idSucursal, // Usar del payload o de la sucursal actual
        // Omitir id_conversacion para que use null por defecto
        fecha_creacion: new Date().toISOString(),
        ultima_interaccion: new Date().toISOString(),
      };

      // Limpiar el objeto cliente para eliminar campos que no existen en la tabla
      const cleanedClient = { ...newClient };

      // Solo incluir id_barberia e id_sucursal si existen en el objeto
      // y si el esquema ya ha sido actualizado
      if (!cleanedClient.id_barberia) {
        // @ts-ignore - Suppress TypeScript error for delete operator on optional property
        delete cleanedClient.id_barberia;
      }

      if (!cleanedClient.id_sucursal) {
        // @ts-ignore - Suppress TypeScript error for delete operator on optional property
        delete cleanedClient.id_sucursal;
      }

      console.log(
        "💾 useClientes.createMutation - Datos a insertar (limpios):",
        cleanedClient,
      );
      console.log(
        "💾 Tipos de datos (limpios):",
        Object.entries(cleanedClient).map(
          ([k, v]) => `${k}: ${typeof v} = ${v}`,
        ),
      );

      // Intentar insertar directamente primero
      const { data, error } = await (supabase as any)
        .from("mibarber_clientes")
        .insert(cleanedClient)
        .select();

      if (error) {
        // Si el error es por columnas que no existen, intentar de nuevo sin esas columnas
        if (
          error.message &&
          (error.message.includes("id_barberia") ||
            error.message.includes("id_sucursal"))
        ) {
          console.log("Reintentando sin columnas id_barberia e id_sucursal...");
          const retryClient = { ...cleanedClient };
          // @ts-ignore - Suppress TypeScript error for delete operator on optional property
          delete retryClient.id_barberia;
          // @ts-ignore - Suppress TypeScript error for delete operator on optional property
          delete retryClient.id_sucursal;

          const { data: retryData, error: retryError } = await (supabase as any)
            .from("mibarber_clientes")
            .insert(retryClient)
            .select();

          if (retryError) {
            console.error(
              "❌ useClientes.createMutation - Error de Supabase (reintento fallido):",
              retryError,
            );
            console.error("❌ Error code:", retryError.code);
            console.error("❌ Error message:", retryError.message);
            console.error("❌ Error details:", retryError.details);
            console.error("❌ Error hint:", retryError.hint);
            throw new Error(
              `Database error: ${retryError.message || retryError.code || "Unknown error"}`,
            );
          }

          console.log(
            "✅ useClientes.createMutation - Resultado exitoso en reintento:",
            retryData,
          );
          return retryData as Client[];
        }

        // Para otros errores, mostrar el error y lanzar la excepción
        console.error(
          "❌ useClientes.createMutation - Error de Supabase:",
          error,
        );
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error details:", error.details);
        console.error("❌ Error hint:", error.hint);
        throw new Error(
          `Database error: ${error.message || error.code || "Unknown error"}`,
        );
      }

      console.log("✅ useClientes.createMutation - Resultado exitoso:", data);
      return data as Client[];
    },
    onSuccess: (data) => {
      console.log("✅ useClientes.createMutation - onSuccess ejecutado:", data);
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (error) => {
      console.error(
        "❌ useClientes.createMutation - onError ejecutado:",
        error,
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (partial: Partial<Client> & { id_cliente: string }) => {
      const { data, error } = await (supabase as any)
        .from("mibarber_clientes")
        .update(partial)
        .eq("id_cliente", partial.id_cliente)
        .select();
      if (error) throw error;
      return data as Client[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id_cliente: string) => {
      const { error } = await (supabase as any)
        .from("mibarber_clientes")
        .delete()
        .eq("id_cliente", id_cliente);
      if (error) throw error;
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });

  return { ...listQuery, createMutation, updateMutation, deleteMutation };
}
