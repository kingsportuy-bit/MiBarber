// Hook para obtener datos del barbero actual
import { useQuery } from '@tanstack/react-query';
import type { Barbero } from '@/types/db';
import { useAuth } from './useAuth';
import { getSupabaseClient } from '@/lib/supabaseClient';

export function useBarberoData() {
  const { session } = useAuth();
  const supabase = getSupabaseClient();

  const {
    data: barbero,
    isLoading,
    isError,
    error,
  } = useQuery<Barbero>({
    queryKey: ['barbero', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        throw new Error('No hay sesión activa');
      }

      const { data, error } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('id_barbero', session.user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Barbero no encontrado');

      return data as Barbero;
    },
    enabled: !!session?.user.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    barbero,
    isLoading,
    isError,
    error,
    isAdmin: session?.user.admin || false,
    idBarberia: session?.user.id_barberia || null,
    idSucursal: session?.user.id_sucursal || null,
  };
}