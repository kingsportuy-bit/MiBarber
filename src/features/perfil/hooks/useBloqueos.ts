import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Bloqueo, BloqueoInput } from '../types'

export function useBloqueos(barberoId: string, barberiaId: string, sucursalId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['bloqueos', barberoId, barberiaId],
    queryFn: async (): Promise<Bloqueo[]> => {
      const hoy = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('mibarber_bloqueos_barbero')
        .select('*')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('activo', true)
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true, nullsFirst: false })

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })

  const crearBloqueo = useMutation({
    mutationFn: async (input: BloqueoInput) => {
      const { data, error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .insert({
          id_barbero: barberoId,
          id_barberia: barberiaId,
          id_sucursal: sucursalId,
          fecha: input.fecha,
          hora_inicio: input.hora_inicio || null,
          hora_fin: input.hora_fin || null,
          tipo: input.tipo,
          motivo: input.motivo || null,
          creado_por: barberoId,
          activo: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloqueos', barberoId, barberiaId] })
    }
  })

  const actualizarBloqueo = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BloqueoInput }) => {
      const { data, error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .update({
          fecha: input.fecha,
          hora_inicio: input.hora_inicio || null,
          hora_fin: input.hora_fin || null,
          tipo: input.tipo,
          motivo: input.motivo || null
        })
        .eq('id', id)
        .eq('id_barbero', barberoId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloqueos', barberoId, barberiaId] })
    }
  })

  const eliminarBloqueo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .update({ activo: false })
        .eq('id', id)
        .eq('id_barbero', barberoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bloqueos', barberoId, barberiaId] })
    }
  })

  return {
    ...query,
    crearBloqueo,
    actualizarBloqueo,
    eliminarBloqueo
  }
}