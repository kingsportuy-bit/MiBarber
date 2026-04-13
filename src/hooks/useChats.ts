"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData, type InfiniteData } from "@tanstack/react-query";
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
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);
  const { idBarberia, isAdmin, barbero } = useBarberoAuth();

  const [accumulatedHistory, setAccumulatedHistory] = useState<HistoryLog[]>([]);
  const processedClientIdsRef = useRef<Set<string>>(new Set());

  const sucursalId = (idSucursal !== undefined && idSucursal !== "" && idSucursal !== "undefined") ? idSucursal : 
                     (!isAdmin && barbero?.id_sucursal ? barbero.id_sucursal : undefined);

  const clientsQuery = useInfiniteQuery({
    queryKey: ["clientes_paginados", idBarberia, sucursalId],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }): Promise<{ clients: Client[], nextCursor: number | null }> => {
      const pageSize = 20;
      let query = (supabase as any)
        .from("mibarber_clientes")
        .select("id_cliente, ultima_interaccion, chat_humano, nombre, id_barberia, id_sucursal, telefono, foto_perfil, id_conversacion, puntaje")
        .order("ultima_interaccion", { ascending: false })
        .range(pageParam, pageParam + pageSize - 1);
      
      if (idBarberia) query = query.eq("id_barberia", idBarberia);
      if (sucursalId) query = query.eq("id_sucursal", sucursalId);
      
      const { data, error } = await query;
      if (error) {
        console.error('useChats - Error obteniendo clientes:', error);
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

  useEffect(() => {
    if (allLoadedClients.length === 0) return;

    const newClients = allLoadedClients.filter(c => {
      const id = c.id_conversacion?.toString() || c.telefono;
      return id && !processedClientIdsRef.current.has(id);
    });

    if (newClients.length === 0) return;

    const fetchNewHistory = async () => {
      const telefonos = newClients.map((c: any) => c.telefono).filter((t: string | null) => t !== null && t !== '');
      const idsConversacion = newClients
        .map((c: any) => c.id_conversacion)
        .filter((id: number | null) => id !== null && id !== undefined)
        .map(String);
      
      const sessionIdsToFetch = [...new Set([...telefonos, ...idsConversacion])];
      if (sessionIdsToFetch.length === 0) return;

      sessionIdsToFetch.forEach(id => processedClientIdsRef.current.add(id));

      const fetchInChunks = async (sessionIds: string[]) => {
        const chunkSize = 20;
        const chunks = [];
        for (let i = 0; i < sessionIds.length; i += chunkSize) {
          chunks.push(sessionIds.slice(i, i + chunkSize));
        }

        const results = await Promise.all(chunks.map(async (chunk) => {
          const { data, error } = await (supabase as any)
            .from("mibarber_historial")
            .select("id, session_id, message, timestamptz")
            .eq("procesado", 1)
            .in("session_id", chunk)
            .order("id", { ascending: true });

          if (error) return [];
          return data || [];
        }));

        return results.flat();
      };

      try {
        setIsFetchingHistory(true);
        const newHistoryData = await fetchInChunks(sessionIdsToFetch);
        setAccumulatedHistory(prev => {
          const existingIds = new Set(prev.map(h => h.id));
          const filteredNew = newHistoryData.filter((h: any) => !existingIds.has(h.id));
          return [...prev, ...filteredNew].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
        });
      } catch (err) {
        console.error("Error incremental useChats:", err);
      } finally {
        setIsFetchingHistory(false);
      }
    };

    fetchNewHistory();
  }, [allLoadedClients, supabase]);

  const refreshChats = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      processedClientIdsRef.current.clear();
      setAccumulatedHistory([]);
      await qc.invalidateQueries({ queryKey: ['clientes_paginados'] });
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    const channelName = `chat-historial-changes-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mibarber_historial' }, (payload: any) => {
        const newLog = payload.new as HistoryLog;
        setAccumulatedHistory(prev => {
          const exists = prev.some(h => h.id === newLog.id);
          if (exists) return prev;
          return [...prev, newLog].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mibarber_clientes' }, () => {
        qc.invalidateQueries({ queryKey: ['clientes_paginados'] });
      })
      .subscribe();
    subscriptionRef.current = channel;

    return () => { if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current); };
  }, [supabase, qc]);

  const grouped = useMemo(() => {
    const conversations = new Map<string, ChatMessage[]>();
    accumulatedHistory.forEach((log: HistoryLog) => {
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
            type: messageData.type || 'message'
          });
          conversations.set(sessionId, messages);
        }
      } catch (e) {}
    });
    
    // Usar un Map para deduplicar por session_id y asegurar consistencia
    const dedupedMap = new Map<string, any>();
    
    allLoadedClients.forEach(client => {
      const sessionIdOrTelefono = client.id_conversacion?.toString() || client.telefono || "";
      if (!sessionIdOrTelefono || sessionIdOrTelefono === "0") return;
      
      if (!dedupedMap.has(sessionIdOrTelefono)) {
        const messages = conversations.get(sessionIdOrTelefono) || [];
        const sortedMessages = messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        
        const lastActivity = sortedMessages.length > 0 
          ? sortedMessages[sortedMessages.length - 1].timestamp 
          : (client.ultima_interaccion || '');

        dedupedMap.set(sessionIdOrTelefono, {
          session_id: sessionIdOrTelefono,
          messages: sortedMessages,
          lastActivity
        });
      }
    });
    
    const conversationList = Array.from(dedupedMap.values());
    
    // Ordenar por actividad más reciente
    return conversationList.sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }, [accumulatedHistory, allLoadedClients]);

  const isLoadingTotal = clientsQuery.isLoading && grouped.length === 0;

  return { 
    isLoading: isLoadingTotal,
    isError: clientsQuery.isError,
    error: clientsQuery.error,
    grouped, 
    subscriptionError, 
    refreshChats, 
    isRefreshing, 
    clients: allLoadedClients,
    fetchNextPage: clientsQuery.fetchNextPage,
    hasNextPage: clientsQuery.hasNextPage,
    isFetchingNextPage: clientsQuery.isFetchingNextPage,
    isInitialLoading: isLoadingTotal,
    isFetching: clientsQuery.isFetching || isFetchingHistory,
    isFetchingHistory
  };
}