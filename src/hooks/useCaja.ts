import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { MovimientoCaja, FiltrosCaja, EstadisticasCaja, FormularioMovimiento, RankingBarbero } from "@/types/caja";
import type { Barbero } from "@/types/db";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useCaja(filtros: FiltrosCaja) {
  const supabase = getSupabaseClient();
  const { idBarberia, barbero, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['caja', filtros.tipo, idBarberia, filtros.idSucursal, filtros.idBarbero, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async (): Promise<MovimientoCaja[]> => {
      if (!idBarberia) return [];

      // Usar una consulta más simple primero para evitar problemas con joins
      let query = supabase
        .from('mibarber_caja')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true);

      // Aplicar filtros
      if (filtros.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      
      if (filtros.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }
      
      if (filtros.metodoPago) {
        query = query.eq('metodo_pago', filtros.metodoPago);
      }
      
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      
      // Filtro por barbero (común) o por barbero seleccionado (admin)
      if (!isAdmin && barbero?.id_barbero) {
        query = query.eq('id_barbero', barbero.id_barbero);
      } else if (isAdmin && filtros.idBarbero) {
        query = query.eq('id_barbero', filtros.idBarbero);
      }
      
      // Filtro por sucursal (solo admin)
      if (isAdmin && filtros.idSucursal) {
        query = query.eq('id_sucursal', filtros.idSucursal);
      }

      query = query
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error obteniendo movimientos de caja:", error);
        throw error;
      }

      // Para depuración - mostrar los datos obtenidos
      console.log('Datos obtenidos de mibarber_caja:', data);

      // Mapear los campos de snake_case a camelCase
      const movimientosMapeados = data.map((movimiento: any) => ({
        // IDs y referencias
        idRegistro: movimiento.idRegistro || movimiento.id_registro,
        idBarberia: movimiento.idBarberia || movimiento.id_barberia,
        idSucursal: movimiento.idSucursal || movimiento.id_sucursal,
        idBarbero: movimiento.idBarbero || movimiento.id_barbero,
        idCita: movimiento.idCita || movimiento.id_cita,
        
        // Información del movimiento
        tipo: movimiento.tipo,
        fecha: movimiento.fecha,
        hora: movimiento.hora,
        concepto: movimiento.concepto,
        monto: movimiento.monto,
        metodoPago: movimiento.metodoPago || movimiento.metodo_pago,
        
        // Facturación
        nroFactura: movimiento.nroFactura || movimiento.nro_factura,
        tipoFactura: movimiento.tipoFactura || movimiento.tipo_factura,
        
        // Propinas
        propina: movimiento.propina,
        
        // Metadata
        notas: movimiento.notas,
        adjuntoUrl: movimiento.adjuntoUrl || movimiento.adjunto_url,
        activo: movimiento.activo,
        
        // Auditoría
        idBarberoRegistro: movimiento.idBarberoRegistro || movimiento.id_barbero_registro,
        nombreBarberoRegistro: movimiento.nombreBarberoRegistro || movimiento.nombre_barbero_registro,
        
        // Timestamps
        createdAt: movimiento.createdAt || movimiento.created_at,
        updatedAt: movimiento.updatedAt || movimiento.updated_at,
        deletedAt: movimiento.deletedAt || movimiento.deleted_at,
        
        // Relaciones (joins)
        nombreBarbero: movimiento.nombreBarbero || movimiento.nombre_barbero,
        nombreSucursal: movimiento.nombreSucursal || movimiento.nombre_sucursal,
        citaInfo: movimiento.citaInfo || movimiento.cita_info,
      }));

      // Retornar los datos mapeados
      return movimientosMapeados as MovimientoCaja[];
    },
    enabled: !!idBarberia,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useAgregarMovimiento() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { idBarberia, barbero } = useAuth();

  return useMutation({
    mutationFn: async (newMovimiento: Omit<MovimientoCaja, 'idRegistro' | 'idBarberia' | 'createdAt' | 'updatedAt' | 'idBarberoRegistro' | 'nombreBarberoRegistro'>) => {
      console.log('Iniciando creación de movimiento con datos:', newMovimiento);
      
      if (!idBarberia || !barbero?.id_barbero) {
        throw new Error('No se puede crear movimiento sin datos de autenticación');
      }

      // Validar que los campos requeridos estén presentes
      if (!newMovimiento.tipo || !newMovimiento.fecha || !newMovimiento.hora || !newMovimiento.concepto) {
        const missingFields = [];
        if (!newMovimiento.tipo) missingFields.push('tipo');
        if (!newMovimiento.fecha) missingFields.push('fecha');
        if (!newMovimiento.hora) missingFields.push('hora');
        if (!newMovimiento.concepto) missingFields.push('concepto');
        
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')} son obligatorios`);
      }

      if (!newMovimiento.monto || newMovimiento.monto <= 0) {
        throw new Error('El monto debe ser mayor a 0');
      }

      // Mapear campos de camelCase a snake_case para la base de datos
      const movimientoConIds = {
        id_barberia: idBarberia,
        id_sucursal: newMovimiento.idSucursal,
        id_barbero: newMovimiento.idBarbero || barbero.id_barbero,
        id_cita: newMovimiento.idCita,
        tipo: newMovimiento.tipo,
        fecha: newMovimiento.fecha,
        hora: newMovimiento.hora,
        concepto: newMovimiento.concepto,
        monto: newMovimiento.monto,
        metodo_pago: newMovimiento.metodoPago,
        nro_factura: newMovimiento.nroFactura,
        tipo_factura: newMovimiento.tipoFactura,
        propina: newMovimiento.propina,
        notas: newMovimiento.notas,
        adjunto_url: newMovimiento.adjuntoUrl,
        activo: true,
        id_barbero_registro: barbero.id_barbero,
        nombre_barbero_registro: barbero.nombre,
      };
      
      // Registrar los datos que se van a insertar para debugging
      console.log('Datos a insertar en mibarber_caja:', movimientoConIds);

      const { data, error } = await supabase
        .from('mibarber_caja')
        .insert([movimientoConIds])
        .select();

      if (error) {
        console.error('Error de Supabase al insertar movimiento:', error);
        // Mejorar el manejo de errores para obtener más detalles
        let errorMessage = 'Error al guardar el movimiento';
        
        if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        
        if (error.details) {
          errorMessage += ` - Detalles: ${error.details}`;
        }
        
        if (error.hint) {
          errorMessage += ` - Sugerencia: ${error.hint}`;
        }
        
        // Registrar también el código de error si existe
        if (error.code) {
          errorMessage += ` - Código: ${error.code}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Movimiento creado exitosamente:', data);
      return data[0] as MovimientoCaja;
    },
    onSuccess: () => {
      // Invalidar todas las queries de caja para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['caja'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-caja'] });
    },
    onError: (error) => {
      console.error('Error en la mutación de agregar movimiento:', error);
    }
  });
}

export function useEditarMovimiento() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { barbero } = useAuth();

  return useMutation({
    mutationFn: async ({ idRegistro, ...updates }: Partial<MovimientoCaja> & { idRegistro: string }) => {
      if (!barbero?.id_barbero) {
        throw new Error('No se puede editar movimiento sin datos de autenticación');
      }

      // Mapear campos de camelCase a snake_case para la base de datos
      const updatesDb: any = {};
      
      // Mapear solo los campos que existen en updates
      if (updates.idSucursal !== undefined) updatesDb.id_sucursal = updates.idSucursal;
      if (updates.idBarbero !== undefined) updatesDb.id_barbero = updates.idBarbero;
      if (updates.idCita !== undefined) updatesDb.id_cita = updates.idCita;
      if (updates.tipo !== undefined) updatesDb.tipo = updates.tipo;
      if (updates.fecha !== undefined) updatesDb.fecha = updates.fecha;
      if (updates.hora !== undefined) updatesDb.hora = updates.hora;
      if (updates.concepto !== undefined) updatesDb.concepto = updates.concepto;
      if (updates.monto !== undefined) updatesDb.monto = updates.monto;
      if (updates.metodoPago !== undefined) updatesDb.metodo_pago = updates.metodoPago;
      if (updates.nroFactura !== undefined) updatesDb.nro_factura = updates.nroFactura;
      if (updates.tipoFactura !== undefined) updatesDb.tipo_factura = updates.tipoFactura;
      if (updates.propina !== undefined) updatesDb.propina = updates.propina;
      if (updates.notas !== undefined) updatesDb.notas = updates.notas;
      if (updates.adjuntoUrl !== undefined) updatesDb.adjunto_url = updates.adjuntoUrl;
      if (updates.activo !== undefined) updatesDb.activo = updates.activo;
      
      // Campos de auditoría
      updatesDb.updated_at = new Date().toISOString();
      updatesDb.id_barbero_registro = barbero.id_barbero;

      const { data, error } = await supabase
        .from('mibarber_caja')
        .update(updatesDb)
        .eq('id_registro', idRegistro)
        .select();

      if (error) {
        throw error;
      }

      return data[0] as MovimientoCaja;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-caja'] });
    },
  });
}

export function useEliminarMovimiento() {
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { barbero } = useAuth();

  return useMutation({
    mutationFn: async (idRegistro: string) => {
      if (!barbero?.id_barbero) {
        throw new Error('No se puede eliminar movimiento sin datos de autenticación');
      }

      // Soft delete - cambiar activo a false y registrar deleted_at
      const { data, error } = await supabase
        .from('mibarber_caja')
        .update({
          activo: false,
          updated_at: new Date().toISOString(),
          id_barbero_registro: barbero.id_barbero, // Auditoría
        })
        .eq('id_registro', idRegistro)
        .select();

      if (error) {
        throw error;
      }

      return data[0] as MovimientoCaja;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caja'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas-caja'] });
    },
  });
}

export function useEstadisticasCaja(filtros: FiltrosCaja) {
  const supabase = getSupabaseClient();
  const { idBarberia, barbero, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['estadisticas-caja', idBarberia, filtros.idSucursal, filtros.idBarbero, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async (): Promise<EstadisticasCaja> => {
      if (!idBarberia) {
        return {
          totalIngresos: 0,
          totalGastos: 0,
          balance: 0,
          totalPropinas: 0,
          metodosPago: {},
          ingresosPorDia: {},
          diaMasRentable: null,
          porcentajeCambio: 0,
          totalMovimientos: 0
        };
      }

      // Calcular fechas para comparar con el período anterior
      const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : new Date();
      
      // Calcular período anterior
      const diffTime = fechaFin.getTime() - fechaInicio.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const fechaInicioAnterior = new Date(fechaInicio);
      fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - Math.round(diffDays));
      const fechaFinAnterior = new Date(fechaInicio);
      fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);

      // Obtener movimientos del período actual
      let queryActual = supabase
        .from('mibarber_caja')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true)
        .gte('fecha', filtros.fechaInicio || fechaInicio.toISOString().split('T')[0])
        .lte('fecha', filtros.fechaFin || fechaFin.toISOString().split('T')[0]);

      // Aplicar filtros adicionales
      if (!isAdmin && barbero?.id_barbero) {
        queryActual = queryActual.eq('id_barbero', barbero.id_barbero);
      } else if (isAdmin && filtros.idBarbero) {
        queryActual = queryActual.eq('id_barbero', filtros.idBarbero);
      }
      
      if (isAdmin && filtros.idSucursal) {
        queryActual = queryActual.eq('id_sucursal', filtros.idSucursal);
      }

      const { data: movimientosActuales, error: errorActual } = await queryActual;

      if (errorActual) {
        console.error("❌ Error obteniendo movimientos para estadísticas:", errorActual);
        throw errorActual;
      }

      // Obtener movimientos del período anterior
      let queryAnterior = supabase
        .from('mibarber_caja')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true)
        .gte('fecha', fechaInicioAnterior.toISOString().split('T')[0])
        .lte('fecha', fechaFinAnterior.toISOString().split('T')[0]);

      // Aplicar mismos filtros
      if (!isAdmin && barbero?.id_barbero) {
        queryAnterior = queryAnterior.eq('id_barbero', barbero.id_barbero);
      } else if (isAdmin && filtros.idBarbero) {
        queryAnterior = queryAnterior.eq('id_barbero', filtros.idBarbero);
      }
      
      if (isAdmin && filtros.idSucursal) {
        queryAnterior = queryAnterior.eq('id_sucursal', filtros.idSucursal);
      }

      const { data: movimientosAnteriores, error: errorAnterior } = await queryAnterior;

      if (errorAnterior) {
        console.error("❌ Error obteniendo movimientos anteriores para estadísticas:", errorAnterior);
        throw errorAnterior;
      }

      // Calcular estadísticas del período actual
      let totalIngresos = 0;
      let totalGastos = 0;
      let totalPropinas = 0;
      let totalMovimientos = movimientosActuales.length;
      
      // Inicializar acumuladores
      const metodosPago: Record<string, number> = {};
      const ingresosPorDia: Record<string, number> = {};

      movimientosActuales.forEach(movimiento => {
        const monto = parseFloat(movimiento.monto.toString()) || 0;
        const propina = parseFloat(movimiento.propina?.toString() || '0') || 0;
        
        if (movimiento.tipo === 'ingreso') {
          totalIngresos += monto;
          totalPropinas += propina;
          
          // Acumular por método de pago
          const metodo = movimiento.metodo_pago || 'otro';
          metodosPago[metodo] = (metodosPago[metodo] || 0) + monto;
          
          // Acumular por día de la semana
          if (movimiento.fecha) {
            const fecha = new Date(movimiento.fecha);
            const dia = fecha.toLocaleDateString('es-UY', { weekday: 'long' });
            ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + monto;
          }
        } else if (movimiento.tipo === 'gasto_barbero' || movimiento.tipo === 'gasto_barberia') {
          totalGastos += monto;
        }
      });

      // Encontrar el día más rentable
      let diaMasRentable = null;
      let maxIngresosDia = 0;
      for (const [dia, monto] of Object.entries(ingresosPorDia)) {
        if (monto > maxIngresosDia) {
          maxIngresosDia = monto;
          diaMasRentable = {
            dia,
            monto
          };
        }
      }

      const balance = totalIngresos - totalGastos;

      // Calcular estadísticas del período anterior
      let totalIngresosAnterior = 0;
      movimientosAnteriores.forEach(movimiento => {
        const monto = parseFloat(movimiento.monto.toString()) || 0;
        if (movimiento.tipo === 'ingreso') {
          totalIngresosAnterior += monto;
        }
      });

      // Calcular porcentaje de cambio
      let porcentajeCambio = 0;
      if (totalIngresosAnterior > 0) {
        porcentajeCambio = ((totalIngresos - totalIngresosAnterior) / totalIngresosAnterior) * 100;
      } else if (totalIngresos > 0) {
        porcentajeCambio = 100; // Si antes era 0 y ahora hay ingresos, es un 100% de aumento
      }

      return {
        totalIngresos,
        totalGastos,
        balance,
        totalPropinas,
        metodosPago,
        ingresosPorDia,
        diaMasRentable,
        porcentajeCambio,
        totalMovimientos
      };
    },
    enabled: !!idBarberia,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener barberos (para filtros admin)
export function useBarberos() {
  const supabase = getSupabaseClient();
  const { idBarberia, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['barberos', idBarberia],
    queryFn: async (): Promise<Barbero[]> => {
      if (!idBarberia || !isAdmin) return [];

      const { data, error } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        console.error("❌ Error obteniendo barberos:", error);
        throw error;
      }

      return data as Barbero[];
    },
    enabled: !!idBarberia && isAdmin,
  });
}

/**
 * Hook para obtener insights de caja
 */
export function useInsightsCaja(filtros: FiltrosCaja) {
  const supabase = getSupabaseClient();
  const { idBarberia, barbero, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['insights-caja', idBarberia, filtros.idSucursal, filtros.idBarbero, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async () => {
      if (!idBarberia) {
        return {
          rankingBarberos: [],
          comparativaSucursales: [],
          analisisInteligente: {
            diaMasRentable: null,
            horarioMasRentable: null,
            servicioMasFacturado: null
          }
        };
      }

      // Obtener movimientos para análisis
      let query = supabase
        .from('mibarber_caja')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true)
        .eq('tipo', 'ingreso');

      // Aplicar filtros
      if (filtros.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      
      if (filtros.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }
      
      // Filtro por barbero (común) o por barbero seleccionado (admin)
      if (!isAdmin && barbero?.id_barbero) {
        query = query.eq('id_barbero', barbero.id_barbero);
      } else if (isAdmin && filtros.idBarbero) {
        query = query.eq('id_barbero', filtros.idBarbero);
      }
      
      // Filtro por sucursal (solo admin)
      if (isAdmin && filtros.idSucursal) {
        query = query.eq('id_sucursal', filtros.idSucursal);
      }

      const { data: movimientos, error } = await query;

      if (error) {
        console.error("❌ Error obteniendo movimientos para insights:", error);
        throw error;
      }

      // Calcular ranking de barberos
      const ingresosPorBarbero: Record<string, { nombre: string; total: number; cantidad: number }> = {};
      
      movimientos.forEach(movimiento => {
        const monto = parseFloat(movimiento.monto.toString()) || 0;
        const idBarbero = movimiento.id_barbero;
        const nombreBarbero = movimiento.nombreBarbero || 'Barbero desconocido';
        
        if (!ingresosPorBarbero[idBarbero]) {
          ingresosPorBarbero[idBarbero] = {
            nombre: nombreBarbero,
            total: 0,
            cantidad: 0
          };
        }
        
        ingresosPorBarbero[idBarbero].total += monto;
        ingresosPorBarbero[idBarbero].cantidad += 1;
      });

      // Convertir a array y ordenar por total descendente
      const rankingBarberos = Object.values(ingresosPorBarbero)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((barbero, index) => ({
          posicion: index + 1,
          nombre: barbero.nombre,
          total: barbero.total,
          cantidad: barbero.cantidad
        }));

      // Calcular ingresos por día de la semana
      const ingresosPorDia: Record<string, number> = {};
      movimientos.forEach(movimiento => {
        if (movimiento.fecha) {
          const fecha = new Date(movimiento.fecha);
          const dia = fecha.toLocaleDateString('es-UY', { weekday: 'long' });
          const monto = parseFloat(movimiento.monto.toString()) || 0;
          ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + monto;
        }
      });

      // Encontrar día más rentable
      let diaMasRentable = null;
      let maxIngresosDia = 0;
      for (const [dia, monto] of Object.entries(ingresosPorDia)) {
        if (monto > maxIngresosDia) {
          maxIngresosDia = monto;
          diaMasRentable = dia;
        }
      }

      // Calcular ingresos por hora (aproximado)
      const ingresosPorHora: Record<string, number> = {};
      movimientos.forEach(movimiento => {
        if (movimiento.hora) {
          const hora = movimiento.hora.substring(0, 2); // Tomar solo la hora
          const monto = parseFloat(movimiento.monto.toString()) || 0;
          ingresosPorHora[hora] = (ingresosPorHora[hora] || 0) + monto;
        }
      });

      // Encontrar horario más rentable
      let horarioMasRentable = null;
      let maxIngresosHora = 0;
      for (const [hora, monto] of Object.entries(ingresosPorHora)) {
        if (monto > maxIngresosHora) {
          maxIngresosHora = monto;
          horarioMasRentable = `${hora}:00 - ${parseInt(hora) + 1}:00`;
        }
      }

      // Para la comparativa de sucursales, necesitaríamos otra consulta
      // Por ahora dejamos un array vacío ya que no tenemos esa información
      const comparativaSucursales: { nombre: string; ingresos: number }[] = [];

      return {
        rankingBarberos,
        comparativaSucursales,
        analisisInteligente: {
          diaMasRentable,
          horarioMasRentable,
          servicioMasFacturado: null // No tenemos esta información en la tabla actual
        }
      };
    },
    enabled: !!idBarberia,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener ranking de barberos
 */
export function useRankingBarberos(filtros: FiltrosCaja) {
  const supabase = getSupabaseClient();
  const { idBarberia, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['ranking-barberos', idBarberia, filtros.fechaInicio, filtros.fechaFin],
    queryFn: async (): Promise<RankingBarbero[]> => {
      if (!idBarberia) {
        return [];
      }

      // Obtener movimientos de ingresos para calcular el ranking
      let query = supabase
        .from('mibarber_caja')
        .select('*')
        .eq('id_barberia', idBarberia)
        .eq('activo', true)
        .eq('tipo', 'ingreso');

      // Aplicar filtros de fecha
      if (filtros.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      
      if (filtros.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }

      const { data: movimientos, error } = await query;

      if (error) {
        console.error("❌ Error obteniendo movimientos para ranking:", error);
        throw error;
      }

      // Calcular ranking
      const rankingMap: Record<string, RankingBarbero> = {};
      
      movimientos.forEach((movimiento: any) => {
        const idBarbero = movimiento.id_barbero;
        const nombreBarbero = movimiento.nombre_barbero_registro || 'Barbero desconocido';
        const monto = parseFloat(movimiento.monto.toString()) || 0;
        
        if (!rankingMap[idBarbero]) {
          rankingMap[idBarbero] = {
            idBarbero: idBarbero,
            nombreBarbero: nombreBarbero,
            totalIngresos: 0,
            cantidadMovimientos: 0
          };
        }
        
        rankingMap[idBarbero].totalIngresos += monto;
        rankingMap[idBarbero].cantidadMovimientos += 1;
      });

      // Convertir a array y ordenar por ingresos
      const ranking = Object.values(rankingMap)
        .sort((a, b) => b.totalIngresos - a.totalIngresos)
        .map((barbero, index) => ({
          ...barbero,
          porcentajeDelTotal: 0 // Se calculará después
        }));

      // Calcular porcentajes
      const totalGeneral = ranking.reduce((sum, barbero) => sum + barbero.totalIngresos, 0);
      
      if (totalGeneral > 0) {
        return ranking.map(barbero => ({
          ...barbero,
          porcentajeDelTotal: (barbero.totalIngresos / totalGeneral) * 100
        }));
      }

      return ranking;
    },
    enabled: !!idBarberia && isAdmin, // Solo para admins
  });
}
