import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Descanso, DescansoInput } from '../types'

export function useDescansos(barberoId: string, barberiaId: string, sucursalId: string) {
  const queryClient = useQueryClient()

  // Actualizar para obtener todos los descansos (activos e inactivos)
  const query = useQuery({
    queryKey: ['descansos', barberoId, barberiaId],
    queryFn: async (): Promise<Descanso[]> => {
      const { data } = await supabase
        .from('mibarber_descansos_extra')
        .select('*')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .order('creado_at', { ascending: false })

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })

  const crearDescanso = useMutation({
    mutationFn: async (input: DescansoInput) => {
      const { data, error } = await supabase
        .from('mibarber_descansos_extra')
        .insert({
          id_barbero: barberoId,
          id_barberia: barberiaId,
          id_sucursal: sucursalId,
          hora_inicio: input.hora_inicio,
          hora_fin: input.hora_fin,
          dias_semana: input.dias_semana.join(','),
          motivo: input.motivo || null,
          activo: input.activo !== undefined ? input.activo : true,
          creado_por: barberoId, // Usar el mismo barbero como creador
          creado_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descansos', barberoId, barberiaId] })
    }
  })

  const actualizarDescanso = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: DescansoInput }) => {
      // Preparar objeto de actualización excluyendo campos undefined
      const updateData: any = {}
      
      // Solo incluir campos que no sean undefined
      if (input.hora_inicio !== undefined) {
        updateData.hora_inicio = input.hora_inicio
      }
      if (input.hora_fin !== undefined) {
        updateData.hora_fin = input.hora_fin
      }
      if (input.dias_semana !== undefined) {
        updateData.dias_semana = input.dias_semana.join(',')
      }
      if (input.motivo !== undefined) {
        updateData.motivo = input.motivo || null
      }
      if (input.activo !== undefined) {
        updateData.activo = input.activo
      }

      const { data, error } = await supabase
        .from('mibarber_descansos_extra')
        .update(updateData)
        .eq('id', id)
        .eq('id_barbero', barberoId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descansos', barberoId, barberiaId] })
    }
  })

  const eliminarDescanso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mibarber_descansos_extra')
        .delete()
        .eq('id', id)
        .eq('id_barbero', barberoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['descansos', barberoId, barberiaId] })
    }
  })

  return {
    ...query,
    crearDescanso,
    actualizarDescanso,
    eliminarDescanso
  }
}