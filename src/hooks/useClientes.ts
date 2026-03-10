"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { AuthService } from "@/features/auth/services/AuthService";

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
  const { idBarberia, idSucursal: authIdSucursal, isAdmin } = useBarberoAuth();

  console.log('🔍 useClientes - idBarberia:', idBarberia);
  console.log('🔍 useClientes - isAdmin:', isAdmin);

  // Determinar la sucursal activa a usar (si se proporciona una explícitamente se usa, si no, para barberos normales se usa su sucursal)
  const activeSucursalId = idSucursal || (!isAdmin ? authIdSucursal : undefined);

  const listQuery = useQuery({
    queryKey: ["clientes", { search, sortBy, idBarberia, activeSucursalId }],
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
      if (activeSucursalId) {
        console.log("🔍 Filtrando por idSucursal activa:", activeSucursalId);
        q = q.eq("id_sucursal", activeSucursalId);
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

        // Primero ejecutar la consulta con los filtros existentes
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
            (cliente: Client) => {
              try {
                // Verificar que cliente tenga los campos necesarios
                if (!cliente) return false;

                // Buscar en nombre (coincidencia parcial)
                if (cliente.nombre && cliente.nombre.toLowerCase().includes(s)) {
                  console.log("✅ Coincidencia en nombre:", cliente.nombre);
                  return true;
                }

                // Buscar en teléfono (solo si la búsqueda contiene números)
                if (cliente.telefono && /\d/.test(s)) {
                  // Normalizar solo si la búsqueda contiene dígitos
                  const normalizedSearch = s.replace(/\D/g, ''); // Eliminar caracteres no numéricos
                  if (normalizedSearch) {
                    const normalizedPhone = cliente.telefono.replace(/\D/g, '');
                    if (normalizedPhone.includes(normalizedSearch)) {
                      console.log("✅ Coincidencia en teléfono:", cliente.telefono);
                      return true;
                    }
                  }
                }

                // Buscar en teléfono (coincidencia parcial para búsquedas que no son solo números)
                if (cliente.telefono && !/\d/.test(s) && cliente.telefono.toLowerCase().includes(s)) {
                  console.log("✅ Coincidencia en teléfono (texto):", cliente.telefono);
                  return true;
                }

                // Buscar en id_cliente
                if (cliente.id_cliente && cliente.id_cliente.toLowerCase().includes(s)) {
                  console.log("✅ Coincidencia en ID:", cliente.id_cliente);
                  return true;
                }

                // Buscar en notas
                if (cliente.notas && cliente.notas.toLowerCase().includes(s)) {
                  console.log("✅ Coincidencia en notas:", cliente.notas);
                  return true;
                }

                return false;
              } catch (filterError) {
                console.error("❌ Error filtrando cliente:", filterError);
                return false;
              }
            }
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

  // ✅ Obtener datos del barbero autenticado (ya obtenidos al inicio del hook)
  const authIdBarberia = idBarberia;

  console.log('🔍 useClientes - authIdBarberia para mutacion:', authIdBarberia);
  console.log('🔍 useClientes - authIdSucursal para mutacion:', authIdSucursal);

  const createMutation = useMutation({
    mutationFn: async (payload: Partial<Client>) => {
      console.log("💾 useClientes.createMutation - Payload recibido:", payload);

      // ✅ Validar que tenemos id_barberia
      let finalIdBarberia = authIdBarberia;

      // ✅ Fallback: Si authIdBarberia es null, intentar obtenerlo
      if (!finalIdBarberia) {
        console.warn('⚠️ authIdBarberia es null, intentando obtenerlo de la sesión...');

        const session = AuthService.loadSession();

        // Intentar múltiples ubicaciones
        finalIdBarberia =
          session?.user.id_barberia ||
          null;

        if (!finalIdBarberia && session?.user.email) {
          // Si aún es null, buscar en la base de datos
          const { data: barberoData, error } = await supabase
            .from('mibarber_barberos')
            .select('id_barberia')
            .eq('email', session.user.email)
            .single();

          if (error) {
            console.error("❌ Error obteniendo barbero por email:", error);
          }

          finalIdBarberia = (barberoData as any)?.id_barberia || null;
        }

        if (!finalIdBarberia) {
          throw new Error('No se pudo obtener id_barberia. Por favor, cierre sesión y vuelva a iniciar.');
        }
      }

      // ✅ Agregar id_barberia al objeto
      const newClient = {
        // Incluimos el teléfono en el campo correcto
        telefono: payload.telefono, // Usar el teléfono del payload
        nombre: payload.nombre,
        notas: payload.notas,
        nivel_cliente: payload.nivel_cliente ?? 2, // Nivel 2 por defecto para clientes agregados desde la app
        puntaje: payload.puntaje ?? 0, // Puntaje inicial 0
        id_barberia: finalIdBarberia, // ✅ Usar finalIdBarberia
        id_sucursal: payload.id_sucursal || idSucursal || authIdSucursal, // ✅ Usar authIdSucursal
        // Omitir id_conversacion para que use null por defecto
        fecha_creacion: new Date().toISOString(),
        ultima_interaccion: new Date().toISOString(),
      };

      console.log(
        "💾 useClientes.createMutation - Datos a insertar:",
        newClient,
      );
      console.log(
        "💾 Tipos de datos:",
        Object.entries(newClient).map(
          ([k, v]) => `${k}: ${typeof v} = ${v}`,
        ),
      );

      const { data, error } = await (supabase as any)
        .from("mibarber_clientes")
        .insert(newClient)
        .select();

      if (error) {
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
      console.log("📝 useClientes.updateMutation - Payload original:", partial);

      // Separar el ID de los datos a actualizar
      const { id_cliente, ...updateData } = partial;

      console.log("📝 useClientes.updateMutation - ID:", id_cliente);
      console.log("📝 useClientes.updateMutation - Datos a enviar:", updateData);

      const { data, error } = await (supabase as any)
        .from("mibarber_clientes")
        .update(updateData)
        .eq("id_cliente", id_cliente)
        .select();

      if (error) {
        console.error("❌ useClientes.updateMutation - Error de Supabase:", error);
        throw error;
      }
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

// Hook para obtener un cliente por su ID
export function useCliente(id_cliente: string | null) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["cliente", id_cliente],
    queryFn: async () => {
      if (!id_cliente) {
        return null;
      }

      const { data, error } = await supabase
        .from("mibarber_clientes")
        .select("*")
        .eq("id_cliente", id_cliente)
        .single();

      if (error) {
        throw error;
      }

      return data as Client;
    },
    enabled: !!id_cliente
  });
}

// Hook para obtener múltiples clientes por sus IDs
export function useClientesByIds(ids: string[]) {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["clientes", "byIds", ids],
    queryFn: async () => {
      if (ids.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("mibarber_clientes")
        .select("*")
        .in("id_cliente", ids);

      if (error) {
        throw error;
      }

      return data as Client[];
    },
    enabled: ids.length > 0
  });
}
