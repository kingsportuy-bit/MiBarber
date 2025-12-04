import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { EstadisticasMes } from '../types'

export function useEstadisticasMes(barberoId: string, barberiaId: string) {
  return useQuery({
    queryKey: ['estadisticas-mes', barberoId, barberiaId],
    queryFn: async (): Promise<EstadisticasMes> => {
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)

      const finMes = new Date()
      finMes.setMonth(finMes.getMonth() + 1)
      finMes.setDate(0)
      finMes.setHours(23, 59, 59, 999)

      // Query para turnos atendidos
      const { count: turnosAtendidos } = await supabase
        .from('mibarber_citas')
        .select('*', { count: 'exact', head: true })
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('estado', 'completado')
        .gte('fecha', inicioMes.toISOString().split('T')[0])
        .lte('fecha', finMes.toISOString().split('T')[0])

      // Query para turnos pendientes
      const hoy = new Date().toISOString().split('T')[0]
      const { count: turnosPendientes } = await supabase
        .from('mibarber_citas')
        .select('*', { count: 'exact', head: true })
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('estado', 'pendiente')
        .gte('fecha', hoy)
        .lte('fecha', finMes.toISOString().split('T')[0])

      // Query para ingresos del mes
      const { data: citasCompletas } = await supabase
        .from('mibarber_citas')
        .select('ticket, duracion')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('estado', 'completado')
        .gte('fecha', inicioMes.toISOString().split('T')[0])
        .lte('fecha', finMes.toISOString().split('T')[0])
        .not('ticket', 'is', null)

      const ingresosMes = citasCompletas?.reduce((sum, cita) => sum + (Number(cita.ticket) || 0), 0) || 0

      // Calcular horas trabajadas
      const horasTrabajadas = citasCompletas?.reduce((sum, cita) => {
        if (!cita.duracion) return sum
        
        // Si es solo número (minutos)
        if (/^\d+$/.test(cita.duracion)) {
          return sum + Number(cita.duracion)
        }
        
        // Si es formato HH:MM
        const [horas, minutos] = cita.duracion.split(':').map(Number)
        return sum + (horas * 60) + minutos
      }, 0) || 0

      return {
        turnosAtendidos: turnosAtendidos || 0,
        turnosPendientes: turnosPendientes || 0,
        ingresosMes,
        horasTrabajadas: horasTrabajadas / 60
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}