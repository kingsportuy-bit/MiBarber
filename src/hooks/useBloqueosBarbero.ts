// Hook para gestión de bloqueos de barbero
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Bloqueo, CreateBloqueoPayload, ListBloqueosParams, ListBloqueosRangoParams } from "@/types/bloqueos";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { createBloqueoSchema } from "@/features/bloqueos/utils/validations";

export function useBloqueosBarbero() {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const queryClient = useQueryClient();

  // Listar bloqueos por día
  function useList({ idSucursal, idBarbero, fecha }: ListBloqueosParams) {
    return useQuery({
      queryKey: ["bloqueos", idBarberia, idSucursal, idBarbero || "self", fecha],
      queryFn: async () => {
        if (!idBarberia || !idSucursal || !fecha) {
          return [];
        }

        // Usar fetch para obtener los datos en lugar de Supabase directamente
        const response = await fetch(`/api/bloqueos/list?table=bloqueos&idSucursal=${idSucursal}&idBarbero=${idBarbero || ''}&idBarberia=${idBarberia}&fecha=${fecha}`);
        if (!response.ok) {
          throw new Error('Error al obtener bloqueos');
        }
        return response.json();
      },
      enabled: !!idBarberia && !!idSucursal && !!fecha,
    });
  }

  // Listar bloqueos por rango
  function useListRango({ idSucursal, idBarbero, fechaInicio, fechaFin }: ListBloqueosRangoParams) {
    return useQuery({
      queryKey: ["bloqueos-rango", idBarberia, idSucursal, idBarbero || "self", fechaInicio, fechaFin],
      queryFn: async () => {
        if (!idBarberia || !idSucursal || !fechaInicio || !fechaFin) {
          return [];
        }

        // Usar fetch para obtener los datos en lugar de Supabase directamente
        const response = await fetch(`/api/bloqueos/list-rango?table=bloqueos&idSucursal=${idSucursal}&idBarbero=${idBarbero || ''}&idBarberia=${idBarberia}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        if (!response.ok) {
          throw new Error('Error al obtener bloqueos por rango');
        }
        return response.json();
      },
      enabled: !!idBarberia && !!idSucursal && !!fechaInicio && !!fechaFin,
    });
  }

  // Crear un bloqueo
  const create = useMutation({
    mutationFn: async (payload: CreateBloqueoPayload) => {
      if (!idBarberia) {
        throw new Error("Usuario no autenticado");
      }

      const url = '/api/bloqueos';
      console.log('🔵 Llamando a:', url);
      console.log('🔵 Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          table: 'bloqueos',
        }),
        credentials: 'include',
      });

      console.log('🔵 Response status:', response.status);

      const text = await response.text();
      console.log('🔵 Response body (raw):', text);

      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Si falla el parseo, SÍ es HTML
        console.error('🔴 No es JSON válido, es HTML:', text.substring(0, 500));
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API Route existe.');
      }

      // Si llegamos aquí, el parseo funcionó, pero puede ser un error HTTP
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["bloqueos"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  // Eliminar un bloqueo
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const url = `/api/bloqueos?id=${id}&table=bloqueos`;
      console.log('🔵 Llamando a DELETE:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      console.log('🔵 DELETE Response status:', response.status);

      const text = await response.text();
      console.log('🔵 DELETE Response body (raw):', text);

      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Si falla el parseo, SÍ es HTML
        console.error('🔴 No es JSON válido, es HTML:', text.substring(0, 500));
        throw new Error('El servidor devolvió HTML en lugar de JSON. Verifica que la API Route existe.');
      }

      // Si llegamos aquí, el parseo funcionó, pero puede ser un error HTTP
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["bloqueos"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  return {
    list: useList,
    listRango: useListRango,
    create,
    remove,
  };
}

// Hook específico para listar bloqueos por día
export function useBloqueosPorDia({ idSucursal, idBarbero, fecha }: ListBloqueosParams) {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();

  return useQuery({
    queryKey: ["bloqueos", idBarberia, idSucursal, idBarbero || "self", fecha],
    queryFn: async () => {
      if (!idBarberia || !idSucursal || !fecha) {
        return [];
      }

      // Usar fetch para obtener los datos en lugar de Supabase directamente
      const response = await fetch(`/api/bloqueos/list?table=bloqueos&idSucursal=${idSucursal}&idBarbero=${idBarbero || ''}&idBarberia=${idBarberia}&fecha=${fecha}`);
      if (!response.ok) {
        throw new Error('Error al obtener bloqueos');
      }
      return response.json();
    },
    enabled: !!idBarberia && !!idSucursal && !!fecha,
  });
}

// Hook específico para listar bloqueos por rango
export function useBloqueosPorRango({ idSucursal, idBarbero, fechaInicio, fechaFin }: ListBloqueosRangoParams) {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();

  return useQuery({
    queryKey: ["bloqueos-rango", idBarberia, idSucursal, idBarbero || "self", fechaInicio, fechaFin],
    queryFn: async () => {
      if (!idBarberia || !idSucursal || !fechaInicio || !fechaFin) {
        return [];
      }

      // Usar fetch para obtener los datos en lugar de Supabase directamente
      const response = await fetch(`/api/bloqueos/list-rango?table=bloqueos&idSucursal=${idSucursal}&idBarbero=${idBarbero || ''}&idBarberia=${idBarberia}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      if (!response.ok) {
        throw new Error('Error al obtener bloqueos por rango');
      }
      return response.json();
    },
    enabled: !!idBarberia && !!idSucursal && !!fechaInicio && !!fechaFin,
  });
}