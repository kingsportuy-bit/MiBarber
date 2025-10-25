"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { HistoryLog, ChatConversation, ChatMessage, Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function useChats(idSucursal?: string) {
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

  const listQuery = useQuery({
    queryKey: ["chat_historial", idBarberia, sucursalId],
    queryFn: async (): Promise<HistoryLog[]> => {
      let query = (supabase as any)
        .from("mibarber_historial")
        .select("id, session_id, message, timestamptz")
        .order("id", { ascending: true });
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        // Obtener todos los clientes de la barbería
        let clientesQuery = (supabase as any)
          .from("mibarber_clientes")
          .select("id_cliente, telefono")
          .eq("id_barberia", idBarberia);
        
        // Si tenemos un idSucursal (del barbero o pasado como parámetro), filtrar por él
        // Solo aplicar filtro de sucursal si se ha seleccionado una sucursal específica
        if (sucursalId) {
          clientesQuery = clientesQuery.eq("id_sucursal", sucursalId);
        }
        
        const { data: clientesData, error: clientesError } = await clientesQuery;
        
        if (clientesError) {
          throw clientesError;
        }
        
        const telefonos = clientesData.map((c: any) => c.telefono).filter((t: string | null) => t !== null);
        query = query.in("session_id", telefonos);
      }
      
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as HistoryLog[];
    },
    // Configurar refetch automático
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, // No refetch automático, solo cuando se invalida
    staleTime: 0, // Siempre considerar los datos como "stale" para refetch inmediato
  });

  // Obtener datos de clientes para timestamps
  const clientsQuery = useQuery({
    queryKey: ["clientes", idBarberia, sucursalId],
    queryFn: async (): Promise<Client[]> => {
      let query = (supabase as any)
        .from("mibarber_clientes")
        .select("id_cliente, ultima_interaccion, chat_humano, nombre, id_barberia, id_sucursal, telefono")
        .order("ultima_interaccion", { ascending: false }); // Order by ultima_interaccion descending
      
      // Si tenemos un idBarberia, filtrar por él
      if (idBarberia) {
        query = query.eq("id_barberia", idBarberia);
      }
      
      // Si tenemos un idSucursal (del barbero o pasado como parámetro), filtrar por él
      // Solo aplicar filtro de sucursal si se ha seleccionado una sucursal específica
      if (sucursalId) {
        query = query.eq("id_sucursal", sucursalId);
      }
      
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as Client[];
    },
    // Configurar refetch automático
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, // No refetch automático, solo cuando se invalida
    staleTime: 0, // Siempre considerar los datos como "stale" para refetch inmediato
  });

  // Función para refrescar manualmente los datos
  const refreshChats = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await qc.invalidateQueries({ queryKey: ['chat_historial'] });
      await qc.invalidateQueries({ queryKey: ['clientes'] });
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
      qc.invalidateQueries({ queryKey: ['chat_historial'] });
      qc.invalidateQueries({ queryKey: ['clientes'] });
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
    const channelName = `chat-historial-changes-${Date.now()}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mibarber_historial'
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['chat_historial'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'mibarber_historial'
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['chat_historial'] });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'mibarber_historial'
          },
          (payload) => {
            // Invalidar la consulta para refetch y reordenar
            qc.invalidateQueries({ queryKey: ['chat_historial'] });
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
            qc.invalidateQueries({ queryKey: ['clientes'] });
            qc.invalidateQueries({ queryKey: ['chat_historial'] }); // También refrescar historial para actualizar botones
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
    // Crear mapa de clientes por teléfono para acceso rápido
    const clientPhoneMap = new Map<string, Client>();
    if (clientsQuery.data && Array.isArray(clientsQuery.data)) {
      clientsQuery.data.forEach((client: Client) => {
        if (client.telefono) {
          clientPhoneMap.set(client.telefono, client);
        }
      });
    }
    
    const conversations = new Map<string, ChatMessage[]>();
    
    if (listQuery.data && Array.isArray(listQuery.data)) {
      listQuery.data.forEach((log: HistoryLog) => {
        try {
          const messageData = typeof log.message === 'string' ? JSON.parse(log.message) : log.message;
          
          if (messageData && messageData.content) {
            let sessionId = '';
            let content = messageData.content;
            
            // Extraer ID del cliente del contenido si es tipo "human"
            if (messageData.type === 'human') {
              // Buscar patrón "id del cliente: +número"
              const clientIdMatch = content.match(/id del cliente:\s*(\+\d+)/i);
              if (clientIdMatch) {
                sessionId = clientIdMatch[1];
                
                // Extraer solo el mensaje del cliente (antes de ", id del cliente:")
                const messageMatch = content.match(/mensaje del cliente:\s*([^,]+)/i);
                if (messageMatch) {
                  content = messageMatch[1].trim();
                }
              }
            } else {
              // Para respuestas del agente, usar el session_id de la base de datos (que es el teléfono)
              sessionId = log.session_id;
            }
            
            // Asegurarnos de que siempre tengamos un sessionId válido
            if (!sessionId && log.session_id) {
              sessionId = log.session_id;
            }
            
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
                type: messageData.type || 'message'
              });
              
              conversations.set(sessionId, messages);
            }
          }
        } catch (e) {
          console.warn('Error parseando mensaje del historial:', e, log);
        }
      });
    }
    
    // Convertir a formato de conversaciones
    const conversationList: ChatConversation[] = Array.from(conversations.entries())
      .map(([session_id, messages]) => {
        // Obtener el cliente usando el teléfono (session_id)
        const client = clientPhoneMap.get(session_id);
        // Usar el número de teléfono como session_id para mantener la asociación correcta
        const clientId = session_id; // El session_id ya es el número de teléfono
        
        // Ordenar mensajes por timestamp
        const sortedMessages = messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        
        // Usar el timestamp del último mensaje como lastActivity
        const lastActivity = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].timestamp : '';
        
        return {
          session_id: clientId, // Usar el número de teléfono como session_id
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