"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
  type InfiniteData,
} from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { HistoryLog, ChatConversation, ChatMessage, Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

// ─── Constantes ──────────────────────────────────────────────────────
const HISTORY_BATCH_SIZE = 400;
const CLIENT_SELECT =
  "id_cliente, ultima_interaccion, chat_humano, nombre, id_barberia, id_sucursal, telefono, foto_perfil, id_conversacion, puntaje";

// ─── Helpers ─────────────────────────────────────────────────────────

/** Parsea un row de mibarber_historial en un ChatMessage */
function parseHistoryMessage(row: any): ChatMessage | null {
  try {
    const msg =
      typeof row.message === "string" ? JSON.parse(row.message) : row.message;
    const content = msg?.content || msg?.text;
    if (!content) return null;
    return {
      timestamp: row.timestamptz || msg.timestamp || new Date().toISOString(),
      sender: msg.type === "human" ? "client" : "agent",
      content:
        typeof content === "object" ? JSON.stringify(content) : content,
      type: msg.type || "message",
      source: msg.source,
    };
  } catch {
    return null;
  }
}

/** Obtiene clientes en lotes para evitar URLs largas */
async function fetchClientsBatched(
  supabase: any,
  sessionIds: string[]
): Promise<Client[]> {
  if (sessionIds.length === 0) return [];

  const numericIds: number[] = [];
  const phoneIds: string[] = [];
  for (const sid of sessionIds) {
    const num = Number(sid);
    if (!isNaN(num) && num > 0) numericIds.push(num);
    else if (sid) phoneIds.push(sid);
  }

  const results: Client[] = [];
  const BATCH = 30;

  // Por id_conversacion
  for (let i = 0; i < numericIds.length; i += BATCH) {
    const batch = numericIds.slice(i, i + BATCH);
    const { data } = await supabase
      .from("mibarber_clientes")
      .select(CLIENT_SELECT)
      .in("id_conversacion", batch);
    if (data) results.push(...data);
  }

  // Por telefono
  for (let i = 0; i < phoneIds.length; i += BATCH) {
    const batch = phoneIds.slice(i, i + BATCH);
    const { data } = await supabase
      .from("mibarber_clientes")
      .select(CLIENT_SELECT)
      .in("telefono", batch);
    if (data) results.push(...data);
  }

  // Deduplicar por id_cliente
  const seen = new Set<string>();
  return results.filter((c) => {
    if (!c.id_cliente || seen.has(c.id_cliente)) return false;
    seen.add(c.id_cliente);
    return true;
  });
}

// ─── Hook Principal ──────────────────────────────────────────────────

export function useWhatsAppChats(
  idSucursal?: string,
  showAllSucursales: boolean = false,
  activeSessionId?: string | null
) {
  const supabase = getSupabaseClient();
  const qc = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { idBarberia, isAdmin, barbero } = useBarberoAuth();

  // Refs para valores usados en el handler del realtime (evita recrear suscripción)
  const activeSessionIdRef = useRef(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const sucursalId =
    idSucursal !== undefined && idSucursal !== "" && idSucursal !== "undefined"
      ? idSucursal
      : !isAdmin && barbero?.id_sucursal
        ? barbero.id_sucursal
        : undefined;

  // ─── 1. Query paginado al historial (fuente de verdad del orden) ───
  const sessionsQuery = useInfiniteQuery({
    queryKey: ["whatsapp_sessions", idBarberia, sucursalId, showAllSucursales],
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam: cursor }): Promise<{ rows: any[]; lastId: number | null }> => {
      let query = (supabase as any)
        .from("mibarber_historial")
        .select("id, session_id, message, timestamptz")
        .eq("procesado", 1)
        .order("id", { ascending: false })
        .limit(HISTORY_BATCH_SIZE);

      if (cursor !== undefined) query = query.lt("id", cursor);
      if (!showAllSucursales && sucursalId)
        query = query.eq("id_sucursal", sucursalId);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return { rows: [], lastId: null };
      }

      return {
        rows: data,
        lastId: data[data.length - 1].id,
      };
    },
    getNextPageParam: (lastPage) => {
      if (
        !lastPage.rows ||
        lastPage.rows.length < HISTORY_BATCH_SIZE ||
        lastPage.lastId === null
      )
        return undefined;
      return lastPage.lastId;
    },
    enabled: !!idBarberia,
    staleTime: 30_000,
  });

  // ─── 2. Derivar sesiones únicas con último mensaje ─────────────────
  const { conversationList, allSessionIds } = useMemo(() => {
    const allRows =
      sessionsQuery.data?.pages.flatMap((p: any) => p.rows) || [];

    const sessionMap = new Map<
      string,
      {
        session_id: string;
        lastMessage: ChatMessage | null;
        lastTimestamp: string;
        lastId: number;
      }
    >();

    for (const row of allRows) {
      if (!row.session_id || row.session_id === "0") continue;

      // Solo guardar la primera ocurrencia (más reciente por ORDER BY id DESC)
      if (!sessionMap.has(row.session_id)) {
        sessionMap.set(row.session_id, {
          session_id: row.session_id,
          lastMessage: parseHistoryMessage(row),
          lastTimestamp: row.timestamptz || new Date(0).toISOString(),
          lastId: row.id,
        });
      }
    }

    // Ya están en orden por lastId DESC (heredado del ORDER BY del query)
    const list = Array.from(sessionMap.values());
    return {
      conversationList: list,
      allSessionIds: list.map((s) => s.session_id),
    };
  }, [sessionsQuery.data]);

  // ─── 3. Hidratar datos de cliente para sesiones visibles ───────────
  const { data: clientsData } = useQuery({
    queryKey: ["whatsapp_session_clients", allSessionIds],
    queryFn: () => fetchClientsBatched(supabase, allSessionIds),
    enabled: allSessionIds.length > 0,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  // ─── 4. Mensajes completos del chat activo (bajo demanda) ──────────
  const { data: activeMessagesRaw } = useQuery({
    queryKey: ["whatsapp_chat_messages", activeSessionId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("mibarber_historial")
        .select("id, session_id, message, timestamptz")
        .eq("procesado", 1)
        .eq("session_id", activeSessionId!)
        .order("id", { ascending: true });
      if (error) return [];
      return data || [];
    },
    enabled: !!activeSessionId,
    staleTime: 10_000,
  });

  const activeMessages = useMemo(() => {
    if (!activeMessagesRaw) return null;
    return activeMessagesRaw
      .map(parseHistoryMessage)
      .filter((m: ChatMessage | null): m is ChatMessage => m !== null);
  }, [activeMessagesRaw]);

  // ─── 5. Mapa de clientes por session_id ────────────────────────────
  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clientsData?.forEach((c: Client) => {
      if (c.id_conversacion) map.set(c.id_conversacion.toString(), c);
      if (c.telefono) map.set(c.telefono, c);
    });
    return map;
  }, [clientsData]);

  // Ref para usar en el handler de realtime sin recrear suscripción
  const clientMapRef = useRef(clientMap);
  clientMapRef.current = clientMap;

  // ─── 6. Construir resultado: grouped ───────────────────────────────
  const grouped: ChatConversation[] = useMemo(() => {
    return conversationList.map((session) => {
      const client = clientMap.get(session.session_id);
      const isActive = activeSessionId === session.session_id;

      let messages: ChatMessage[];
      if (isActive && activeMessages) {
        messages = activeMessages;
      } else {
        messages = session.lastMessage ? [session.lastMessage] : [];
      }

      return {
        session_id: session.session_id,
        messages,
        lastActivity: session.lastTimestamp,
        client_info: client,
      } as any;
    });
  }, [conversationList, clientMap, activeSessionId, activeMessages]);

  // ─── 7. Suscripción en tiempo real ─────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const channelName = `whatsapp-sessions-${sucursalId || "all"}-${Date.now()}`;
    const queryKey = [
      "whatsapp_sessions",
      idBarberia,
      sucursalId,
      showAllSucursales,
    ];

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mibarber_historial" },
        (payload: any) => {
          const newRow = payload.new;
          if (!newRow?.session_id) return;

          // Inyectar optimistamente al inicio de la primera página
          qc.setQueryData(queryKey, (oldData: any) => {
            if (!oldData?.pages?.[0]) return oldData;
            return {
              ...oldData,
              pages: [
                {
                  ...oldData.pages[0],
                  rows: [newRow, ...oldData.pages[0].rows],
                },
                ...oldData.pages.slice(1),
              ],
            };
          });

          // Si es del chat activo, inyectar en sus mensajes
          const currentActive = activeSessionIdRef.current;
          if (newRow.session_id === currentActive) {
            qc.setQueryData(
              ["whatsapp_chat_messages", currentActive],
              (old: any[] | undefined) => {
                if (!old) return [newRow];
                if (old.some((r: any) => r.id === newRow.id)) return old;
                return [...old, newRow];
              }
            );
          }

          // Si es una sesión nueva, refrescar datos de clientes
          if (!clientMapRef.current.has(newRow.session_id)) {
            qc.invalidateQueries({
              queryKey: ["whatsapp_session_clients"],
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mibarber_clientes" },
        () => {
          qc.invalidateQueries({
            queryKey: ["whatsapp_session_clients"],
          });
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          setSubscriptionError(null);
        } else if (status === "CHANNEL_ERROR") {
          setSubscriptionError("Error en la suscripción de mensajes");
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [supabase, qc, idBarberia, sucursalId, showAllSucursales]);

  // ─── 8. Refresh manual ─────────────────────────────────────────────
  const refreshChats = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await qc.invalidateQueries({ queryKey: ["whatsapp_sessions"] });
      await qc.invalidateQueries({ queryKey: ["whatsapp_session_clients"] });
      if (activeSessionId) {
        await qc.invalidateQueries({
          queryKey: ["whatsapp_chat_messages", activeSessionId],
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // ─── 9. Retorno ────────────────────────────────────────────────────
  const isLoadingInitial = sessionsQuery.isLoading && grouped.length === 0;

  return {
    grouped,
    clients: clientsData || [],
    isLoading: isLoadingInitial,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
    subscriptionError,
    refreshChats,
    isRefreshing,
    fetchNextPage: sessionsQuery.fetchNextPage,
    hasNextPage: sessionsQuery.hasNextPage ?? false,
    isFetchingNextPage: sessionsQuery.isFetchingNextPage,
    isInitialLoading: isLoadingInitial,
    isFetching: sessionsQuery.isFetching,
    isFetchingHistory: sessionsQuery.isFetching,
  };
}