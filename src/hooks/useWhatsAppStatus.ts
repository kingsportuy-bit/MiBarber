"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface WhatsAppStatus {
    qrUrl: string | null;
    wppActivo: string | null;
    isLoading: boolean;
}

/**
 * Hook que escucha los cambios en las columnas `qr` y `wpp_activo`
 * de la tabla `mibarber_sucursales` para una sucursal específica.
 * 
 * Usa una combinación de real-time subscription (sin filtro para evitar errores)
 * y polling fallback cada 40 segundos para garantizar actualizaciones.
 */
export function useWhatsAppStatus(sucursalId?: string): WhatsAppStatus {
    const supabase = getSupabaseClient();
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [wppActivo, setWppActivo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const subscriptionRef = useRef<any>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Refs para mantener los valores actuales y evitar actualizaciones innecesarias
    const currentQrRef = useRef<string | null>(null);
    const currentWppRef = useRef<string | null>(null);

    // Función para obtener el estado actual desde la BD
    const fetchStatus = useCallback(async () => {
        if (!sucursalId) return;

        try {
            const { data, error } = await (supabase as any)
                .from("mibarber_sucursales")
                .select("qr, wpp_activo")
                .eq("id", sucursalId)
                .single();

            if (error) {
                console.error("useWhatsAppStatus - Error fetching status:", error);
                return;
            }

            if (data) {
                const newQr = data.qr && data.qr.trim() !== "" ? data.qr : null;
                const newWpp = data.wpp_activo || null;

                // Solo actualizar si los valores realmente cambiaron
                if (currentQrRef.current !== newQr) {
                    currentQrRef.current = newQr;
                    setQrUrl(newQr);
                }

                if (currentWppRef.current !== newWpp) {
                    currentWppRef.current = newWpp;
                    setWppActivo(newWpp);
                }
            }
        } catch (err) {
            console.error("useWhatsAppStatus - Error:", err);
        }
    }, [sucursalId, supabase]);

    // Fetch inicial
    useEffect(() => {
        if (!sucursalId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchStatus().finally(() => setIsLoading(false));
    }, [sucursalId, fetchStatus]);

    // Polling fallback cada 40 segundos para detectar cambios (sincronizado con n8n)
    useEffect(() => {
        if (!sucursalId) return;

        pollingRef.current = setInterval(() => {
            fetchStatus();
        }, 40000); // 40 segundos

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [sucursalId, fetchStatus]);

    // Suscripción en tiempo real (sin filtro para evitar el error de "mismatch")
    useEffect(() => {
        if (!sucursalId || !supabase) return;

        const channelName = `whatsapp-status-${sucursalId}-${Date.now()}`;

        try {
            const channel = supabase
                .channel(channelName)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "mibarber_sucursales",
                    },
                    (payload: any) => {
                        const newData = payload.new;
                        // Verificar que el update sea para nuestra sucursal
                        if (newData && newData.id === sucursalId) {
                            const newQr = newData.qr && newData.qr.trim() !== "" ? newData.qr : null;
                            const newWpp = newData.wpp_activo || null;

                            // Solo actualizar si los valores realmente cambiaron
                            if (currentQrRef.current !== newQr) {
                                currentQrRef.current = newQr;
                                setQrUrl(newQr);
                            }

                            if (currentWppRef.current !== newWpp) {
                                currentWppRef.current = newWpp;
                                setWppActivo(newWpp);
                            }
                        }
                    }
                )
                .subscribe((status: string, error: any) => {
                    if (status === "SUBSCRIBED") {
                        console.log("useWhatsAppStatus - Suscripción activa para sucursal:", sucursalId);
                    } else if (status === "CHANNEL_ERROR") {
                        console.warn("useWhatsAppStatus - Error en suscripción, usando polling como fallback");
                    }
                });

            subscriptionRef.current = channel;
        } catch (err) {
            console.warn("useWhatsAppStatus - Error configurando suscripción, usando polling como fallback");
        }

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, [sucursalId, supabase]);

    return { qrUrl, wppActivo, isLoading };
}
