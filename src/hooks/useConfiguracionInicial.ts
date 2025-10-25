"use client";

import { useQuery } from "@tanstack/react-query";

export function useConfiguracionInicial() {
  // Siempre devolver que la configuración está completada
  return {
    data: {
      completada: true
    },
    isLoading: false,
    isError: false,
    completada: true
  };
}