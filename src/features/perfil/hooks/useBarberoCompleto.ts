import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Barbero } from '@/types/db'

export function useBarberoCompleto(idBarbero: string | null) {
  return useQuery({
    queryKey: ['barbero-completo', idBarbero],
    queryFn: async (): Promise<Barbero | null> => {
      if (!idBarbero) {
        return null
      }

      const { data, error } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('id_barbero', idBarbero)
        .single()

      if (error) {
        console.error('Error al obtener datos del barbero:', error)
        throw error
      }

      return data
    },
    enabled: !!idBarbero,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}