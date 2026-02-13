"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { HistoryLog, ChatConversation, ChatMessage, Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function useWhatsAppChats(idSucursal?: string, showAllSucursales: boolean = false) {
  const supabase = getSupabaseClient();
  const qc = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { idBarberia, isAdmin, barbero } = useBarberoAuth();

  // Determinar la sucursal a usar: 
  // 1. Si se pasa idSucursal como parámetro y no es cadena vacía, usar ese
  // 2. Si no es admin y el barbero tiene id_sucursal, usar el del barbero
  // 3. Si no, usar el idSucursal pasado como parámetro (puede ser undefined)
  // Nota: Si idSucursal es "undefined" como string, lo tratamos como undefined
  const sucursalId = (idSucursal !== undefined && idSucursal !== "" && idSucursal !== "undefined") ? idSucursal :
    (!isAdmin && barbero?.id_sucursal ? barbero.id_sucursal : undefined);

  // Mostrar información de depuración
  console.log('useWhatsAppChats - Parámetros:', { idBarberia, isAdmin, barbero, idSucursal, showAllSucursales, sucursalId });

  const listQuery = useQuery({
    queryKey: ["whatsapp_historial", idBarberia, sucursalId, showAllSucursales],
    queryFn: async (): Promise<HistoryLog[]> => {
      console.log('useWhatsAppChats - Iniciando consulta de historial:', { idBarberia, sucursalId, showAllSucursales });

      let query = (supabase as any)
        .from("mibarber_historial")
        .select("id, session_id, message, timestamptz, id_sucursal")
        .order("id", { ascending: true });

      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        console.log('useWhatsAppChats - Filtrando por idBarberia:', idBarberia);

        // Obtener todos los clientes de la barbería
        let clientesQuery = (supabase as any)
          .from("mibarber_clientes")
          .select("id_cliente, telefono, id_sucursal, id_conversacion")
          .eq("id_barberia", idBarberia);

        // Si no se muestran todas las sucursales y tenemos un idSucursal, filtrar por él
        // Si se muestran todas las sucursales, usar el id_sucursal del barbero logueado
        if (!showAllSucursales && sucursalId) {
          console.log('useWhatsAppChats - Filtrando por sucursalId:', sucursalId);
          clientesQuery = clientesQuery.eq("id_sucursal", sucursalId);
          // También filtrar el historial por id_sucursal
          query = query.eq("id_sucursal", sucursalId);
        } else if (showAllSucursales && barbero?.id_sucursal) {
          console.log('useWhatsAppChats - Filtrando por id_sucursal del barbero:', barbero.id_sucursal);
          // También filtrar el historial por id_sucursal del barbero
          query = query.eq("id_sucursal", barbero.id_sucursal);
        }

        const { data: clientesData, error: clientesError } = await clientesQuery;

        if (clientesError) {
          console.error('useWhatsAppChats - Error obteniendo clientes:', clientesError);
          throw clientesError;
        }

        console.log('useWhatsAppChats - Clientes obtenidos:', clientesData?.length);

        // Filtrar id_conversacion válidos y teléfonos válidos
        const idsConversacion = clientesData
          .map((c: any) => c.id_conversacion)
          .filter((id: number | null) => id !== null && id !== undefined);

        const telefonos = clientesData
          .map((c: any) => c.telefono)
          .filter((t: string | null) => t !== null && t !== undefined && t !== '');

        console.log('useWhatsAppChats - IDs de conversación filtrados:', idsConversacion);
        console.log('useWhatsAppChats - Teléfonos filtrados:', telefonos);

        // Combinar ambos arrays para filtrar
        if (idsConversacion.length > 0 || telefonos.length > 0) {
          // Convertir los IDs numéricos a strings para la comparación
          const idsAsString = idsConversacion.map(String);
          const allSessionIds = [...idsAsString, ...telefonos];
          query = query.in("session_id", allSessionIds);
        } else {
          // Si no hay IDs de conversación ni teléfonos válidos, devolver array vacío
          console.log('useWhatsAppChats - No hay IDs de conversación ni teléfonos válidos, devolviendo array vacío');
          return [];
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('useWhatsAppChats - Error obteniendo historial:', JSON.stringify(error, null, 2));
        // En lugar de lanzar error, devolvemos array vacío para no romper la UI
        return [];
      }

      console.log('useWhatsAppChats - Historial obtenido:', data?.length);
      return data as HistoryLog[];
    },
    // Configurar refetch automático
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, // No refetch automático, solo cuando se invalida
    staleTime: 0, // Siempre considerar los datos como "stale" para refetch inmediato
    enabled: !!idBarberia, // Solo ejecutar si tenemos idBarberia
  });

  // Obtener datos de clientes para timestamps
  const clientsQuery = useQuery({
    queryKey: ["whatsapp_clientes", idBarberia, sucursalId, showAllSucursales],
    queryFn: async (): Promise<Client[]> => {
      console.log('useWhatsAppChats - Iniciando consulta de clientes:', { idBarberia, sucursalId, showAllSucursales });

      let query = (supabase as any)
        .from("mibarber_clientes")
        .select("id_cliente, ultima_interaccion, chat_humano, nombre, id_barberia, id_sucursal, telefono, foto_perfil, id_conversacion")
        .order("ultima_interaccion", { ascending: false }); // Order by ultima_interaccion descending

      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        console.log('useWhatsAppChats - Filtrando clientes por idBarberia:', idBarberia);
        query = query.eq("id_barberia", idBarberia);
      }

      // Si no se muestran todas las sucursales y tenemos un idSucursal, filtrar por él
      if (!showAllSucursales && sucursalId) {
        console.log('useWhatsAppChats - Filtrando clientes por sucursalId:', sucursalId);
        query = query.eq("id_sucursal", sucursalId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('useWhatsAppChats - Error obteniendo clientes:', JSON.stringify(error, null, 2));
        // Devolver array vacío en caso de error para no romper la UI
        return [];
      }

      console.log('useWhatsAppChats - Clientes obtenidos para WhatsApp:', data?.length);
      return data as Client[];
    },
    // Configurar refetch automático
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, // No refetch automático, solo cuando se invalida
    staleTime: 0, // Siempre considerar los datos como "stale" para refetch inmediato
    enabled: !!idBarberia, // Solo ejecutar si tenemos idBarberia
  });

  // Función para refrescar manualmente los datos
  const refreshChats = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
      await qc.invalidateQueries({ queryKey: ['whatsapp_clientes'] });
    } catch (error) {
      console.error("Error refrescando chats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fallback polling mechanism in case real-time subscription fails
  useEffect(() => {
    // Configurar polling fallback cada 10 segundos si la suscripción falla
    fallbackIntervalRef.current = setInterval(() => {
      qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
      qc.invalidateQueries({ queryKey: ['whatsapp_clientes'] });
    }, 10000); // 10 segundos

    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [qc]);

  // Suscripción en tiempo real a cambios en el historial
  useEffect(() => {
    // Verificar que el cliente Supabase esté correctamente configurado
    if (!supabase) {
      setSubscriptionError("Cliente Supabase no disponible");
      return;
    }

    // Crear un nombre de canal único
    const channelName = `whatsapp-historial-changes-${Date.now()}`;

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mibarber_historial',
            filter: showAllSucursales && barbero?.id_sucursal ? `id_sucursal=eq.${barbero.id_sucursal}` : (sucursalId ? `id_sucursal=eq.${sucursalId}` : undefined)
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'mibarber_historial',
            filter: showAllSucursales && barbero?.id_sucursal ? `id_sucursal=eq.${barbero.id_sucursal}` : (sucursalId ? `id_sucursal=eq.${sucursalId}` : undefined)
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'mibarber_historial',
            filter: showAllSucursales && barbero?.id_sucursal ? `id_sucursal=eq.${barbero.id_sucursal}` : (sucursalId ? `id_sucursal=eq.${sucursalId}` : undefined)
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'mibarber_clientes'
          },
          (payload) => {
            // Invalidar la consulta de clientes cuando se actualiza ultima_interaccion o chat_humano
            qc.invalidateQueries({ queryKey: ['whatsapp_clientes'] });
            qc.invalidateQueries({ queryKey: ['whatsapp_historial'] }); // También refrescar historial para actualizar botones
          }
        )
        .subscribe(async (status, error) => {
          if (status === 'SUBSCRIBED') {
            setSubscriptionError(null);
            // Detener el fallback polling cuando la suscripción funciona
            if (fallbackIntervalRef.current) {
              clearInterval(fallbackIntervalRef.current);
              fallbackIntervalRef.current = null;
            }
          } else if (status === 'CHANNEL_ERROR') {
            const errorMessage = error?.message || "Error en suscripción";
            setSubscriptionError(errorMessage);
          } else if (status === 'CLOSED') {
            setSubscriptionError("Suscripción cerrada");
          }
        });

      subscriptionRef.current = channel;
    } catch (subscriptionSetupError) {
      setSubscriptionError(subscriptionSetupError instanceof Error ? subscriptionSetupError.message : "Error configurando suscripción");
    }

    // Limpiar la suscripción al desmontar
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [supabase, qc]);

  // Procesar datos del historial para formato de chat
  const grouped = useMemo(() => {
    // Crear mapa de clientes por id_conversacion y por teléfono para acceso rápido
    const clientMap = new Map<string, Client>();
    if (clientsQuery.data && Array.isArray(clientsQuery.data)) {
      clientsQuery.data.forEach((client: Client) => {
        // Mapear por id_conversacion si está disponible
        if (client.id_conversacion) {
          clientMap.set(client.id_conversacion.toString(), client);
        }
        // Mapear también por teléfono si está disponible
        if (client.telefono) {
          clientMap.set(client.telefono, client);
        }
      });
    }

    const conversations = new Map<string, ChatMessage[]>();

    if (listQuery.data && Array.isArray(listQuery.data)) {
      listQuery.data.forEach((log: HistoryLog) => {
        try {
          const messageData = typeof log.message === 'string' ? JSON.parse(log.message) : log.message;

          // Verificar que messageData tenga la estructura esperada
          if (messageData && (typeof messageData.content === 'string' || typeof messageData.content === 'object')) {
            let sessionId = '';
            let content = typeof messageData.content === 'object' ? JSON.stringify(messageData.content) : messageData.content;

            // Debug: Mostrar información del mensaje
            console.log("Procesando mensaje:", {
              type: messageData.type,
              originalContent: content,
              logSessionId: log.session_id,
              sessionIdType: isNaN(Number(log.session_id)) ? 'phone' : 'conversation_id'
            });

            // Para todos los mensajes, usar el session_id de la base de datos (que ahora es el id_conversacion)
            sessionId = log.session_id;

            // Solo procesar mensajes con sessionId válido
            if (sessionId) {
              const messages = conversations.get(sessionId) || [];

              // Usar timestamptz del registro de historial o fallback al timestamp del mensaje
              const recordTimestamp = log.timestamptz ? new Date(log.timestamptz).toISOString() : null;
              const messageTimestamp = messageData.timestamp || (log.id ? new Date(log.id * 1000).toISOString() : new Date().toISOString());
              const timestamp = recordTimestamp || messageTimestamp;

              messages.push({
                timestamp,
                sender: messageData.type === 'human' ? 'client' : 'agent',
                content: content,
                type: messageData.type || 'message',
                source: messageData.source
              });

              conversations.set(sessionId, messages);
            } else {
              console.log("Mensaje ignorado por falta de sessionId válido:", { log, messageData });
            }
          } else {
            console.log("Mensaje ignorado por estructura inválida:", { log, messageData });
          }
        } catch (e) {
          console.warn('Error parseando mensaje del historial:', e, log);
        }
      });
    }

    // Convertir a formato de conversaciones
    const conversationList: ChatConversation[] = Array.from(conversations.entries())
      .map(([session_id, messages]) => {
        // Obtener el cliente usando el session_id (puede ser id_conversacion o número de teléfono)
        const client = clientMap.get(session_id);
        // Usar el session_id tal como viene para mantener la asociación correcta
        const clientId = session_id;

        // Ordenar mensajes por timestamp
        const sortedMessages = messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // Usar el timestamp del último mensaje como lastActivity
        const lastActivity = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].timestamp : '';

        return {
          session_id: clientId, // Usar el session_id tal como viene
          messages: sortedMessages,
          lastActivity
        }
      })
      .filter(conv => conv.messages.length > 0); // Solo conversaciones con mensajes

    // Ordenar por última actividad descendente (más recientes primero)
    conversationList.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

    return conversationList;
  }, [listQuery.data, clientsQuery.data]);

  return { ...listQuery, grouped, subscriptionError, refreshChats, isRefreshing, clients: clientsQuery.data };
}