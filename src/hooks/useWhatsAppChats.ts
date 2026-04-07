"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData, type InfiniteData } from "@tanstack/react-query";
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

  // Determinar la sucursal a usar
  const sucursalId = (idSucursal !== undefined && idSucursal !== "" && idSucursal !== "undefined") ? idSucursal :
    (!isAdmin && barbero?.id_sucursal ? barbero.id_sucursal : undefined);

  // Obtener datos de clientes paginados
  const clientsQuery = useInfiniteQuery({
    queryKey: ["whatsapp_clientes", idBarberia, sucursalId, showAllSucursales],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<{ clients: Client[], nextCursor: number | null }> => {
      const pageSize = 10;
      let query = (supabase as any)
        .from("mibarber_clientes")
        .select("id_cliente, ultima_interaccion, chat_humano, nombre, id_barberia, id_sucursal, telefono, foto_perfil, id_conversacion")
        .order("ultima_interaccion", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);

      if (idBarberia) {
        query = query.eq("id_barberia", idBarberia);
      }

      if (!showAllSucursales && sucursalId) {
        query = query.eq("id_sucursal", sucursalId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('useWhatsAppChats - Error obteniendo clientes:', error);
        return { clients: [], nextCursor: null };
      }

      const nextCursorCount = data.length === pageSize ? pageParam + pageSize : null;
      return { clients: data as Client[], nextCursor: nextCursorCount };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!idBarberia,
  });

  const allLoadedClients = useMemo(() => {
    const data = clientsQuery.data as InfiniteData<{ clients: Client[], nextCursor: number | null }> | undefined;
    return data?.pages.flatMap(page => page.clients) || [];
  }, [clientsQuery.data]);

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

  const listQuery = useQuery({
    queryKey: ["whatsapp_historial", idBarberia, sucursalId, showAllSucursales, allLoadedClients.length],
    queryFn: async (): Promise<HistoryLog[]> => {
      if (allLoadedClients.length === 0) return [];

      const idsConversacion = allLoadedClients
        .map((c: any) => c.id_conversacion)
        .filter((id: number | null) => id !== null && id !== undefined);

      const telefonos = allLoadedClients
        .map((c: any) => c.telefono)
        .filter((t: string | null) => t !== null && t !== undefined && t !== '');

      if (idsConversacion.length === 0 && telefonos.length === 0) return [];

      const allSessionIds = [...new Set([...idsConversacion.map(String), ...telefonos])];

      const fetchInChunks = async (sessionIds: string[]) => {
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < sessionIds.length; i += chunkSize) {
          chunks.push(sessionIds.slice(i, i + chunkSize));
        }

        const results = await Promise.all(chunks.map(async (chunk) => {
          const { data, error } = await (supabase as any)
            .from("mibarber_historial")
            .select("id, session_id, message, timestamptz, id_sucursal")
            .eq("procesado", 1)
            .in("session_id", chunk)
            .order("id", { ascending: true });

          if (error) return [];
          return data || [];
        }));

        return results.flat();
      };

      const historyData = await fetchInChunks(allSessionIds);
      return historyData.sort((a: any, b: any) => a.id - b.id) as HistoryLog[];
    },
    enabled: !!idBarberia && allLoadedClients.length > 0,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    fallbackIntervalRef.current = setInterval(() => {
      qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
      qc.invalidateQueries({ queryKey: ['whatsapp_clientes'] });
    }, 10000);
    return () => {
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    };
  }, [qc]);

  useEffect(() => {
    if (!supabase) return;
    const channelName = `whatsapp-historial-changes-${Date.now()}`;
    try {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mibarber_historial' }, () => {
          qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mibarber_clientes' }, () => {
          qc.invalidateQueries({ queryKey: ['whatsapp_clientes'] });
          qc.invalidateQueries({ queryKey: ['whatsapp_historial'] });
        })
        .subscribe();
      subscriptionRef.current = channel;
    } catch (e) { console.error(e); }

    return () => {
      if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);
    };
  }, [supabase, qc]);

  const grouped = useMemo(() => {
    const clientMap = new Map<string, Client>();
    allLoadedClients.forEach((client: Client) => {
      if (client.id_conversacion) clientMap.set(client.id_conversacion.toString(), client);
      if (client.telefono) clientMap.set(client.telefono, client);
    });

    const conversations = new Map<string, ChatMessage[]>();
    if (listQuery.data) {
      listQuery.data.forEach((log: HistoryLog) => {
        try {
          const messageData = typeof log.message === 'string' ? JSON.parse(log.message) : log.message;
          if (messageData && messageData.content) {
            const sessionId = log.session_id;
            const messages = conversations.get(sessionId) || [];
            const timestamp = log.timestamptz || messageData.timestamp || new Date().toISOString();

            messages.push({
              timestamp,
              sender: messageData.type === 'human' ? 'client' : 'agent',
              content: typeof messageData.content === 'object' ? JSON.stringify(messageData.content) : messageData.content,
              type: messageData.type || 'message',
              source: messageData.source
            });
            conversations.set(sessionId, messages);
          }
        } catch (e) {}
      });
    }

    const conversationList = Array.from(conversations.entries())
      .map(([session_id, messages]) => {
        const sortedMessages = messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        return {
          session_id,
          messages: sortedMessages,
          lastActivity: sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1].timestamp : ''
        };
      })
      .filter(conv => conv.messages.length > 0);

    return conversationList.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }, [listQuery.data, allLoadedClients]);

  return { 
    isLoading: (listQuery.isLoading || clientsQuery.isLoading) && grouped.length === 0,
    isError: listQuery.isError || clientsQuery.isError,
    error: listQuery.error || clientsQuery.error,
    grouped, 
    subscriptionError, 
    refreshChats, 
    isRefreshing, 
    clients: allLoadedClients,
    fetchNextPage: clientsQuery.fetchNextPage,
    hasNextPage: clientsQuery.hasNextPage,
    isFetchingNextPage: clientsQuery.isFetchingNextPage,
    isInitialLoading: (listQuery.isLoading || clientsQuery.isLoading) && grouped.length === 0,
    isFetching: listQuery.isFetching || clientsQuery.isFetching
  };
}