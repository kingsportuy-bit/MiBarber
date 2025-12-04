import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { TopCliente } from '../types'

export function useTopClientes(
  barberoId: string,
  barberiaId: string,
  periodo: 'mes' | 'historico'
) {
  return useQuery({
    queryKey: ['top-clientes', barberoId, barberiaId, periodo],
    queryFn: async (): Promise<TopCliente[]> => {
      let query = supabase
        .from('mibarber_citas')
        .select('id_cliente, ticket')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .eq('estado', 'completado')
        .not('id_cliente', 'is', null)

      if (periodo === 'mes') {
        const inicioMes = new Date()
        inicioMes.setDate(1)
        const finMes = new Date()
        finMes.setMonth(finMes.getMonth() + 1)
        finMes.setDate(0)
        
        query = query
          .gte('fecha', inicioMes.toISOString().split('T')[0])
          .lte('fecha', finMes.toISOString().split('T')[0])
      }

      const { data: citas } = await query

      if (!citas || citas.length === 0) {
        return []
      }

      // Agrupar por cliente
      const clientesMap = new Map<string, { cantidad: number; total: number }>()
      
      citas.forEach(cita => {
        const current = clientesMap.get(cita.id_cliente) || { cantidad: 0, total: 0 }
        clientesMap.set(cita.id_cliente, {
          cantidad: current.cantidad + 1,
          total: current.total + (Number(cita.ticket) || 0)
        })
      })

      // Obtener datos de clientes
      const clientesIds = Array.from(clientesMap.keys())
      const { data: clientes } = await supabase
        .from('mibarber_clientes')
        .select('id_cliente, nombre, telefono')
        .in('id_cliente', clientesIds)

      const resultado = clientes?.map(cliente => ({
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre || 'Sin nombre',
        telefono: cliente.telefono,
        cantidad_servicios: clientesMap.get(cliente.id_cliente)?.cantidad || 0,
        total_gastado: clientesMap.get(cliente.id_cliente)?.total || 0
      })) || []

      return resultado.sort((a, b) => b.cantidad_servicios - a.cantidad_servicios).slice(0, 5)
    },
    staleTime: 5 * 60 * 1000,
  })
}