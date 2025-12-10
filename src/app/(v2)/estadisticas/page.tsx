'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { 
  useEstadisticasSucursales, 
  useEstadisticasCaja, 
  useEstadisticasBarberos, 
  useEstadisticasServicios, 
  useEstadisticasClientes, 
  useEstadisticasBotIA 
} from '@/hooks/useEstadisticas';
import type { FiltrosEstadisticas } from '@/types/estadisticas';

// Función para convertir los filtros globales al formato esperado por los hooks de estadísticas
function convertirFiltrosParaEstadisticas(globalFilters: any): FiltrosEstadisticas {
  return {
    sucursalId: globalFilters.sucursalId,
    barberoId: globalFilters.barberoId,
    fechaInicio: globalFilters.fechaInicio,
    fechaFin: globalFilters.fechaFin
  };
}

export default function EstadisticasPage() {
  const { isAdmin, idBarberia } = useAuth();
  const { filters, setFilters } = useGlobalFilters();
  const [activeTab, setActiveTab] = useState('sucursales');

  // Función para validar que las fechas estén en orden correcto
  const fechasSonValidas = (): boolean => {
    if (filters.fechaInicio && filters.fechaFin) {
      const startDate = new Date(filters.fechaInicio);
      const endDate = new Date(filters.fechaFin);
      return startDate <= endDate;
    }
    return true;
  };

  // Función para corregir fechas invertidas
  const corregirFechas = () => {
    if (filters.fechaInicio && filters.fechaFin) {
      const startDate = new Date(filters.fechaInicio);
      const endDate = new Date(filters.fechaFin);
      
      if (startDate > endDate) {
        // Intercambiar las fechas
        setFilters(prev => ({
          ...prev,
          fechaInicio: filters.fechaFin,
          fechaFin: filters.fechaInicio
        }));
      }
    }
  };

  // Convertir filtros al formato esperado
  const filtrosEstadisticas = convertirFiltrosParaEstadisticas(filters);

  // Efecto para depurar los datos
  useEffect(() => {
    console.log('=== DEBUG ESTADÍSTICAS ===');
    console.log('Usuario es admin:', isAdmin);
    console.log('ID Barbería:', idBarberia);
    console.log('Filtros globales:', filters);
    console.log('Filtros convertidos:', filtrosEstadisticas);
    
    // Validar fechas
    if (filters.fechaInicio && filters.fechaFin) {
      const startDate = new Date(filters.fechaInicio);
      const endDate = new Date(filters.fechaFin);
      console.log('Validación de fechas:', {
        fechaInicio: filters.fechaInicio,
        fechaFin: filters.fechaFin,
        startDate,
        endDate,
        fechasCorrectas: startDate <= endDate
      });
      
      if (startDate > endDate) {
        console.warn('⚠️ ¡Advertencia! Las fechas están invertidas');
      }
    }
  }, [isAdmin, idBarberia, filters, filtrosEstadisticas]);

  // Hooks para obtener estadísticas - Siempre se llaman en el mismo orden
  const { 
    data: estadisticasSucursales, 
    isLoading: loadingSucursales, 
    error: errorSucursales,
    isFetching: fetchingSucursales
  } = useEstadisticasSucursales(filtrosEstadisticas);
  
  const { 
    data: estadisticasCaja, 
    isLoading: loadingCaja, 
    error: errorCaja,
    isFetching: fetchingCaja
  } = useEstadisticasCaja(filtrosEstadisticas);
  
  const { 
    data: estadisticasBarberos, 
    isLoading: loadingBarberos, 
    error: errorBarberos,
    isFetching: fetchingBarberos
  } = useEstadisticasBarberos(filtrosEstadisticas);
  
  const { 
    data: estadisticasServicios, 
    isLoading: loadingServicios, 
    error: errorServicios,
    isFetching: fetchingServicios
  } = useEstadisticasServicios(filtrosEstadisticas);
  
  const { 
    data: estadisticasClientes, 
    isLoading: loadingClientes, 
    error: errorClientes,
    isFetching: fetchingClientes
  } = useEstadisticasClientes(filtrosEstadisticas);
  
  const { 
    data: estadisticasBotIA, 
    isLoading: loadingBotIA, 
    error: errorBotIA,
    isFetching: fetchingBotIA
  } = useEstadisticasBotIA(filtrosEstadisticas);

  // Efecto para depurar resultados de las estadísticas
  useEffect(() => {
    console.log('=== RESULTADOS ESTADÍSTICAS ===');
    console.log('Sucursales - Loading:', loadingSucursales, 'Fetching:', fetchingSucursales, 'Data:', estadisticasSucursales, 'Error:', errorSucursales);
    console.log('Caja - Loading:', loadingCaja, 'Fetching:', fetchingCaja, 'Data:', estadisticasCaja, 'Error:', errorCaja);
    console.log('Barberos - Loading:', loadingBarberos, 'Fetching:', fetchingBarberos, 'Data:', estadisticasBarberos, 'Error:', errorBarberos);
    console.log('Servicios - Loading:', loadingServicios, 'Fetching:', fetchingServicios, 'Data:', estadisticasServicios, 'Error:', errorServicios);
    console.log('Clientes - Loading:', loadingClientes, 'Fetching:', fetchingClientes, 'Data:', estadisticasClientes, 'Error:', errorClientes);
    console.log('Bot IA - Loading:', loadingBotIA, 'Fetching:', fetchingBotIA, 'Data:', estadisticasBotIA, 'Error:', errorBotIA);
  }, [
    loadingSucursales, fetchingSucursales, estadisticasSucursales, errorSucursales,
    loadingCaja, fetchingCaja, estadisticasCaja, errorCaja,
    loadingBarberos, fetchingBarberos, estadisticasBarberos, errorBarberos,
    loadingServicios, fetchingServicios, estadisticasServicios, errorServicios,
    loadingClientes, fetchingClientes, estadisticasClientes, errorClientes,
    loadingBotIA, fetchingBotIA, estadisticasBotIA, errorBotIA
  ]);

  // Validación de rol
  if (!isAdmin) {
    return (
      <div className="v2-container v2-main">
        <Card className="v2-card-large text-center">
          <h2 className="v2-heading mb-4">Acceso Denegado</h2>
          <p className="v2-text-body text-[var(--text-muted)]">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </Card>
      </div>
    );
  }

  // Validación de fechas
  if (!fechasSonValidas()) {
    return (
      <div className="v2-container v2-main">
        <Card className="v2-card-large text-center">
          <h2 className="v2-heading mb-4">Fechas Incorrectas</h2>
          <p className="v2-text-body text-[var(--text-muted)] mb-4">
            La fecha de inicio ({filters.fechaInicio}) es posterior a la fecha de fin ({filters.fechaFin}).
          </p>
          <div className="flex flex-col gap-2">
            <p className="v2-text-body text-[var(--text-muted)]">
              ¿Deseas corregir automáticamente las fechas?
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Button 
                variant="primary" 
                onClick={corregirFechas}
              >
                Corregir Fechas
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Resetear a valores por defecto
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  setFilters(prev => ({
                    ...prev,
                    fechaInicio: firstDayOfMonth.toISOString().split('T')[0],
                    fechaFin: today.toISOString().split('T')[0]
                  }));
                }}
              >
                Restablecer
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Mostrar errores si los hay
  if (errorSucursales || errorCaja || errorBarberos || errorServicios || errorClientes || errorBotIA) {
    return (
      <div className="v2-container v2-main">
        <Card className="v2-card-large text-center">
          <h2 className="v2-heading mb-4">Error al cargar estadísticas</h2>
          <p className="v2-text-body text-[var(--text-muted)]">
            {errorSucursales?.message || 
             errorCaja?.message || 
             errorBarberos?.message || 
             errorServicios?.message || 
             errorClientes?.message || 
             errorBotIA?.message ||
             'Error desconocido'}
          </p>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'sucursales', label: 'Sucursales' },
    { id: 'caja', label: 'Caja' },
    { id: 'barberos', label: 'Barberos' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'bot-ia', label: 'Bot IA' }
  ];

  // Renderizado condicional de contenido basado en la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sucursales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingSucursales ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="v2-card">
                    <div className="v2-skeleton h-24 rounded-lg"></div>
                  </Card>
                ))
              ) : errorSucursales ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500">Error al cargar estadísticas de sucursales: {(errorSucursales as Error).message || 'Error desconocido'}</p>
                </div>
              ) : !estadisticasSucursales || estadisticasSucursales.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-[var(--text-muted)]">No hay datos disponibles para las sucursales seleccionadas</p>
                </div>
              ) : (
                estadisticasSucursales.map((sucursal) => (
                  <Card key={sucursal.id_sucursal} className="v2-card">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="v2-subheading">{sucursal.nombre_sucursal}</h3>
                      <Badge variant={sucursal.ranking === 1 ? 'success' : 'secondary'}>
                        #{sucursal.ranking}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Citas:</span>
                        <span className="v2-text-body font-semibold">{sucursal.total_citas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ingresos:</span>
                        <span className="v2-text-body font-semibold">${sucursal.ingresos_totales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ocupación:</span>
                        <span className="v2-text-body font-semibold">{sucursal.tasa_ocupacion}%</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'caja':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingCaja ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="v2-card">
                    <div className="v2-skeleton h-24 rounded-lg"></div>
                  </Card>
                ))
              ) : errorCaja ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500">Error al cargar estadísticas de caja: {(errorCaja as Error).message || 'Error desconocido'}</p>
                </div>
              ) : !estadisticasCaja || estadisticasCaja.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-[var(--text-muted)]">No hay datos disponibles para la caja</p>
                </div>
              ) : (
                estadisticasCaja.map((caja) => (
                  <Card key={caja.id_barbero} className="v2-card">
                    <h3 className="v2-subheading mb-3">{caja.nombre_barbero}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ingresos Totales:</span>
                        <span className="v2-text-body font-semibold">${caja.ingresos_totales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ticket Promedio:</span>
                        <span className="v2-text-body font-semibold">${caja.ticket_promedio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Método Predominante:</span>
                        <Badge variant="info">{caja.metodo_pago}</Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'barberos':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingBarberos ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="v2-card">
                    <div className="v2-skeleton h-24 rounded-lg"></div>
                  </Card>
                ))
              ) : errorBarberos ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500">Error al cargar estadísticas de barberos: {(errorBarberos as Error).message || 'Error desconocido'}</p>
                </div>
              ) : !estadisticasBarberos || estadisticasBarberos.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-[var(--text-muted)]">No hay datos disponibles para los barberos</p>
                </div>
              ) : (
                estadisticasBarberos.map((barbero) => (
                  <Card key={barbero.id_barbero} className="v2-card">
                    <h3 className="v2-subheading mb-3">{barbero.nombre_barbero}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Citas Completadas:</span>
                        <span className="v2-text-body font-semibold">{barbero.total_citas_completadas}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ingresos Generados:</span>
                        <span className="v2-text-body font-semibold">${barbero.ingresos_generados.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Valoración:</span>
                        <Badge variant="success">{barbero.promedio_valoracion}/5</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Tasa Cancelación:</span>
                        <Badge variant={barbero.tasa_cancelacion > 10 ? 'danger' : 'success'}>
                          {barbero.tasa_cancelacion}%
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'servicios':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingServicios ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="v2-card">
                    <div className="v2-skeleton h-24 rounded-lg"></div>
                  </Card>
                ))
              ) : errorServicios ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-red-500">Error al cargar estadísticas de servicios: {(errorServicios as Error).message || 'Error desconocido'}</p>
                </div>
              ) : !estadisticasServicios || estadisticasServicios.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-[var(--text-muted)]">No hay datos disponibles para los servicios</p>
                </div>
              ) : (
                estadisticasServicios.map((servicio) => (
                  <Card key={servicio.id_servicio} className="v2-card">
                    <h3 className="v2-subheading mb-3">{servicio.nombre_servicio}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Solicitudes:</span>
                        <span className="v2-text-body font-semibold">{servicio.total_solicitudes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Ingresos Totales:</span>
                        <span className="v2-text-body font-semibold">${servicio.ingresos_totales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Duración Promedio:</span>
                        <span className="v2-text-body font-semibold">{servicio.duracion_promedio} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="v2-text-small text-[var(--text-muted)]">Tasa Cancelación:</span>
                        <Badge variant={servicio.tasa_cancelacion > 5 ? 'danger' : 'success'}>
                          {servicio.tasa_cancelacion}%
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'clientes':
        return (
          <div className="space-y-6">
            {/* Resumen de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Clientes Únicos</h3>
                <p className="v2-heading">
                  {loadingClientes ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasClientes?.total_clientes_unicos || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Nuevos</h3>
                <p className="v2-heading">
                  {loadingClientes ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasClientes?.clientes_nuevos || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Recurrentes</h3>
                <p className="v2-heading">
                  {loadingClientes ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasClientes?.clientes_recurrentes || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Retención</h3>
                <p className="v2-heading">
                  {loadingClientes ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : `${estadisticasClientes?.tasa_retencion || 0}%`}
                </p>
              </Card>
            </div>

            {/* Clientes frecuentes */}
            <Card className="v2-card">
              <h3 className="v2-subheading mb-4">Clientes Más Frecuentes</h3>
              {loadingClientes ? (
                <div className="v2-skeleton h-32 rounded-lg"></div>
              ) : errorClientes ? (
                <div className="text-center py-4 text-red-500">
                  Error al cargar clientes frecuentes: {(errorClientes as Error).message || 'Error desconocido'}
                </div>
              ) : (
                <div className="space-y-3">
                  {estadisticasClientes?.clientes_frecuentes && estadisticasClientes.clientes_frecuentes.length > 0 ? (
                    estadisticasClientes.clientes_frecuentes.map((cliente, index) => (
                      <div key={cliente.id_cliente} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <span className="v2-text-body">{cliente.nombre_cliente}</span>
                        </div>
                        <Badge variant="primary">{cliente.total_visitas} visitas</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-[var(--text-muted)]">
                      No hay datos de clientes frecuentes
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        );

      case 'bot-ia':
        return (
          <div className="space-y-6">
            {/* Resumen de Bot IA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Interacciones</h3>
                <p className="v2-heading">
                  {loadingBotIA ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasBotIA?.total_interacciones || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Citas por Bot</h3>
                <p className="v2-heading">
                  {loadingBotIA ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasBotIA?.citas_agendadas_bot || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Citas Manuales</h3>
                <p className="v2-heading">
                  {loadingBotIA ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : estadisticasBotIA?.citas_agendadas_manual || 0}
                </p>
              </Card>
              <Card className="v2-card text-center">
                <h3 className="v2-text-small text-[var(--text-muted)] mb-1">Conversión</h3>
                <p className="v2-heading">
                  {loadingBotIA ? <div className="v2-skeleton h-8 mx-auto w-16"></div> : `${estadisticasBotIA?.tasa_conversion.toFixed(1) || 0}%`}
                </p>
              </Card>
            </div>

            {/* Consultas frecuentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="v2-card">
                <h3 className="v2-subheading mb-4">Consultas Más Frecuentes</h3>
                {loadingBotIA ? (
                  <div className="v2-skeleton h-32 rounded-lg"></div>
                ) : errorBotIA ? (
                  <div className="text-center py-4 text-red-500">
                    Error al cargar consultas frecuentes: {(errorBotIA as Error).message || 'Error desconocido'}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {estadisticasBotIA?.consultas_frecuentes && estadisticasBotIA.consultas_frecuentes.length > 0 ? (
                      estadisticasBotIA.consultas_frecuentes.map((consulta, index) => (
                        <Badge key={index} variant="primary" className="px-3 py-1">
                          {consulta}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-[var(--text-muted)]">No hay datos de consultas frecuentes</div>
                    )}
                  </div>
                )}
              </Card>

              <Card className="v2-card">
                <h3 className="v2-subheading mb-4">Horarios de Uso del Bot</h3>
                {loadingBotIA ? (
                  <div className="v2-skeleton h-32 rounded-lg"></div>
                ) : errorBotIA ? (
                  <div className="text-center py-4 text-red-500">
                    Error al cargar horarios de uso: {(errorBotIA as Error).message || 'Error desconocido'}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {estadisticasBotIA?.horarios_uso_bot && estadisticasBotIA.horarios_uso_bot.length > 0 ? (
                      estadisticasBotIA.horarios_uso_bot.map((horario, index) => (
                        <Badge key={index} variant="info" className="px-3 py-1">
                          {horario}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-[var(--text-muted)]">No hay datos de horarios de uso</div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="v2-container v2-main">
      {/* Card principal con título */}
      <Card className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-6">
          <div>
            <h1 className="v2-heading mb-2">Estadísticas</h1>
            <p className="v2-text-body text-[var(--text-muted)]">
              Métricas y análisis de rendimiento de tu barbería
            </p>
          </div>
          <Button 
            variant="primary" 
            className="w-full md:w-auto uppercase text-sm font-semibold px-6"
          >
            Exportar Reporte
          </Button>
        </div>
      </Card>

      {/* Filtros globales */}
      <div className="mb-6">
        <GlobalFilters />
      </div>

      {/* Pestañas */}
      <div className="mb-6">
        <Tabs
          tabs={tabs}
          defaultTab="sucursales"
          onValueChange={setActiveTab}
        />
      </div>

      {/* Contenido de las pestañas */}
      {renderTabContent()}
    </div>
  );
}