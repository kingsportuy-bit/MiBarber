// Hook para gestión de descansos extra
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DescansoExtra, CreateDescansoExtraPayload, ListDescansosExtraParams } from "@/types/bloqueos";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

export function useDescansosExtra() {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const queryClient = useQueryClient();

  // Listar descansos extra
  function useList({ idSucursal, idBarbero }: ListDescansosExtraParams) {
    return useQuery({
      queryKey: ["descansos-extra", idBarberia, idSucursal, idBarbero || "self"],
      queryFn: async () => {
        if (!idBarberia || !idSucursal) {
          return [];
        }

        // Usar fetch para obtener los datos en lugar de Supabase directamente
        const response = await fetch(`/api/bloqueos/list?table=descansos_extra&idSucursal=${idSucursal}&idBarbero=${idBarbero || ''}&idBarberia=${idBarberia}`);
        if (!response.ok) {
          throw new Error('Error al obtener descansos extra');
        }
        return response.json();
      },
      enabled: !!idBarberia && !!idSucursal,
    });
  }

  // Listar todos los descansos extra
  function useListAll({ idSucursal, idBarbero }: { idSucursal?: string; idBarbero?: string }) {
    return useQuery({
      queryKey: ["descansos-extra-all", idBarberia, idSucursal, idBarbero || "self"],
      queryFn: async () => {
        if (!idBarberia) {
          return [];
        }

        // Construir URL con parámetros
        const params = new URLSearchParams({
          table: 'descansos_extra',
          idBarberia
        });
        
        if (idSucursal) {
          params.append('idSucursal', idSucursal);
        }
        
        if (idBarbero) {
          params.append('idBarbero', idBarbero);
        }

        const response = await fetch(`/api/bloqueos?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Error al obtener todos los descansos extra');
        }
        return response.json();
      },
      enabled: !!idBarberia,
    });
  }

  // Crear un descanso extra
  const create = useMutation({
    mutationFn: async (payload: CreateDescansoExtraPayload) => {
      if (!idBarberia) {
        throw new Error("Usuario no autenticado");
      }

      // Construir el body que se enviará
      const bodyToSend = {
        ...payload,
        table: 'descansos_extra', // ← CRÍTICO: este campo es obligatorio
      };

      console.log('🔵 Body completo que se enviará:', bodyToSend);
      console.log('🔵 Body serializado:', JSON.stringify(bodyToSend, null, 2));

      const response = await fetch('/api/bloqueos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyToSend), // ← Usar bodyToSend, no payload
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
        console.error('🔴 Error del servidor:', data);
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Descanso extra creado:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["descansos-extra"] });
      queryClient.invalidateQueries({ queryKey: ["descansos-extra-all"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  // Eliminar un descanso extra
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const url = `/api/bloqueos?id=${id}&table=descansos_extra`;
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
      queryClient.invalidateQueries({ queryKey: ["descansos-extra"] });
      queryClient.invalidateQueries({ queryKey: ["descansos-extra-all"] });
      queryClient.invalidateQueries({ queryKey: ["horarios-disponibles"] });
    },
  });

  return {
    useList,
    useListAll,
    create,
    remove,
  };
}