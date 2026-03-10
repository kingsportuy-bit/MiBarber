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
      // Para histórico: buscar todas las citas completadas del barbero sin filtro de fecha
      // Para mes: buscar solo las del mes actual
      console.log('useTopClientes params:', { barberoId, barberiaId, periodo })

      let query = supabase
        .from('mibarber_citas')
        .select('id_cliente, ticket, estado')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .not('id_cliente', 'is', null)
        .limit(1000)

      if (periodo === 'mes') {
        const inicioMes = new Date()
        inicioMes.setDate(1)
        inicioMes.setHours(0, 0, 0, 0)

        const finMes = new Date()
        finMes.setMonth(finMes.getMonth() + 1)
        finMes.setDate(0)
        finMes.setHours(23, 59, 59, 999)

        query = query
          .eq('estado', 'completado')
          .gte('fecha', inicioMes.toISOString().split('T')[0])
          .lte('fecha', finMes.toISOString().split('T')[0])
      }

      const { data: citas, error } = await query

      if (error) {
        console.error('Error fetching citas for top clientes:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        return []
      }

      if (!citas || citas.length === 0) {
        console.log(`No citas found for periodo=${periodo}, barberoId=${barberoId}`)
        return []
      }

      console.log(`Found ${citas.length} citas for periodo=${periodo}`)

      // Agrupar por cliente
      const clientesMap = new Map<string, { cantidad: number; total: number }>()

      citas.forEach(cita => {
        const clienteId = cita.id_cliente
        if (!clienteId) return
        const current = clientesMap.get(clienteId) || { cantidad: 0, total: 0 }
        clientesMap.set(clienteId, {
          cantidad: current.cantidad + 1,
          total: current.total + (Number(cita.ticket) || 0)
        })
      })

      // Obtener datos de clientes - buscar de a lotes para evitar errores
      const clientesIds = Array.from(clientesMap.keys())

      if (clientesIds.length === 0) {
        return []
      }

      // Limitar a los top 20 para la consulta de clientes (luego recortamos a 5)
      const sortedByCount = clientesIds
        .map(id => ({ id, cantidad: clientesMap.get(id)?.cantidad || 0 }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 20)
        .map(item => item.id)
        .filter(id => id && id.trim() !== '')

      if (sortedByCount.length === 0) return []

      const { data: clientes, error: clientesError } = await supabase
        .from('mibarber_clientes')
        .select('id_cliente, nombre, telefono')
        .in('id_cliente', sortedByCount)

      if (clientesError) {
        console.error('Error fetching clientes data:', JSON.stringify(clientesError))
        // Fallback: return data without client names
        return sortedByCount.slice(0, 5).map(id => ({
          id_cliente: id,
          nombre: 'Cliente',
          telefono: null as unknown as string,
          cantidad_servicios: clientesMap.get(id)?.cantidad || 0,
          total_gastado: clientesMap.get(id)?.total || 0
        }))
      }

      const resultado = (clientes || []).map(cliente => ({
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre || 'Sin nombre',
        telefono: cliente.telefono,
        cantidad_servicios: clientesMap.get(cliente.id_cliente)?.cantidad || 0,
        total_gastado: clientesMap.get(cliente.id_cliente)?.total || 0
      }))

      return resultado.sort((a, b) => b.cantidad_servicios - a.cantidad_servicios).slice(0, 5)
    },
    staleTime: 5 * 60 * 1000,
  })
}