import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { IngresoServicio } from '../types'

export function useIngresosPorServicio(barberoId: string, barberiaId: string) {
  return useQuery({
    queryKey: ['ingresos-por-servicio', barberoId, barberiaId],
    queryFn: async (): Promise<{ ingresos: IngresoServicio[], masRealizados: IngresoServicio[] }> => {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const finMes = new Date()
      finMes.setMonth(finMes.getMonth() + 1)
      finMes.setDate(0)
      finMes.setHours(23, 59, 59, 999)

      // Obtener citas completadas del mes con servicio
      const { data: citas } = await supabase
        .from('mibarber_citas')
        .select('id_servicio, ticket')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('estado', 'completado')
        .gte('fecha', inicioMes.toISOString().split('T')[0])
        .lte('fecha', finMes.toISOString().split('T')[0])
        .not('id_servicio', 'is', null)

      if (!citas || citas.length === 0) {
        return { ingresos: [], masRealizados: [] }
      }

      // Agrupar por servicio
      const serviciosMap = new Map<string, { total: number; cantidad: number }>()
      
      citas.forEach(cita => {
        const current = serviciosMap.get(cita.id_servicio) || { total: 0, cantidad: 0 }
        serviciosMap.set(cita.id_servicio, {
          total: current.total + (Number(cita.ticket) || 0),
          cantidad: current.cantidad + 1
        })
      })

      // Obtener nombres de servicios
      const serviciosIds = Array.from(serviciosMap.keys())
      const { data: servicios } = await supabase
        .from('mibarber_servicios')
        .select('id_servicio, nombre')
        .in('id_servicio', serviciosIds)

      const resultado = servicios?.map(servicio => ({
        servicio: servicio.nombre,
        total_ingresos: serviciosMap.get(servicio.id_servicio)?.total || 0,
        cantidad_veces: serviciosMap.get(servicio.id_servicio)?.cantidad || 0
      })) || []

      return {
        ingresos: resultado.sort((a, b) => b.total_ingresos - a.total_ingresos).slice(0, 10),
        masRealizados: resultado.sort((a, b) => b.cantidad_veces - a.cantidad_veces).slice(0, 10)
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}