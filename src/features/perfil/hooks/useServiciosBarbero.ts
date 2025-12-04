import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { ServicioBarbero } from '../types'

export function useServiciosBarbero(barberoId: string, barberiaId: string) {
  return useQuery({
    queryKey: ['servicios-barbero', barberoId, barberiaId],
    queryFn: async (): Promise<ServicioBarbero[]> => {
      // Obtener especialidades del barbero
      const { data: barbero } = await supabase
        .from('mibarber_barberos')
        .select('especialidades')
        .eq('id_barbero', barberoId)
        .single()

      if (!barbero?.especialidades || barbero.especialidades.length === 0) {
        return []
      }

      // Obtener servicios usando los UUIDs
      const { data: servicios } = await supabase
        .from('mibarber_servicios')
        .select('id_servicio, nombre, precio, duracion_minutos')
        .eq('id_barberia', barberiaId)
        .eq('activo', true)
        .in('id_servicio', barbero.especialidades)
        .order('nombre')

      return servicios || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  })
}