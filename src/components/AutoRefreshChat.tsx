"use client";

import { useEffect } from "react";
import { useChats } from "@/hooks/useChats";

export default function AutoRefreshChat() {
  const { refreshChats, subscriptionError } = useChats();

  // Efecto para refrescar automáticamente cada 10 segundos
  useEffect(() => {
    if (!subscriptionError) return;

    const interval = setInterval(() => {
      refreshChats();
    }, 10000); // 10 segundos

    return () => {
      clearInterval(interval);
    };
  }, [refreshChats, subscriptionError]);

  return null; // No mostrar nada en la UI
}
