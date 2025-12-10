'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import { 
  useCaja, 
  useEstadisticasCaja, 
  useAgregarMovimiento, 
  useEditarMovimiento,
  useEliminarMovimiento,
  useBarberos,
  useRankingBarberos
} from '@/hooks/useCaja';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TarjetaResumen } from '@/components/caja/v2/TarjetaResumen';
import { TablaMovimientos } from '@/components/caja/v2/TablaMovimientos';
import { ResumenMovimientos } from '@/components/caja/v2/ResumenMovimientos';
import { ModalMovimiento } from '@/components/caja/v2/ModalMovimiento';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getFirstDayOfMonth } from '@/shared/utils/dateUtils';
import { formatearMonto } from '@/types/caja';
import type { MovimientoCaja, FormularioMovimiento, TipoMovimiento, FiltrosCaja } from '@/types/caja';
import { useCurrentDate } from '@/components/shared/CurrentDateProvider';

export default function CajaPage() {
  const { barbero, idBarberia, isAdmin } = useAuth();
  const { filters: globalFilters, setFilters: setGlobalFilters } = useGlobalFilters();
  const { currentDate } = useCurrentDate();
  const esAdmin = isAdmin;

  // Estado del tab activo principal
  const [mainTab, setMainTab] = useState<'dashboard' | 'registros'>('dashboard');
  
  // Estado del tab activo de registros
  const [registrosTab, setRegistrosTab] = useState<TipoMovimiento>('ingreso');

  // Estado del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEdicion, setMovimientoEdicion] = useState<MovimientoCaja | null>(null);
  
  // Estado para el modal de confirmación de eliminación
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState<string | null>(null);

  // Convertir filtros globales al formato esperado por el hook de caja
  const filtrosCaja: FiltrosCaja = {
    idbarberia: idBarberia || '',
    fechaInicio: globalFilters.fechaInicio || getFirstDayOfMonth(),
    fechaFin: globalFilters.fechaFin || currentDate,
    idSucursal: globalFilters.sucursalId || undefined,
    idBarbero: globalFilters.barberoId || undefined,
  };

  // Queries
  const { data: movimientos = [], isLoading: loadingMovimientos } = useCaja({
    ...filtrosCaja,
    tipo: registrosTab,
  });

  const { data: estadisticas, isLoading: loadingEstadisticas } = useEstadisticasCaja(filtrosCaja);
  const { data: ranking = [] } = useRankingBarberos(filtrosCaja);

  // Para el select de barberos (admin)
  const { data: barberos = [] } = useBarberos();

  // Mutations
  const agregarMutation = useAgregarMovimiento();
  const editarMutation = useEditarMovimiento();
  const eliminarMutation = useEliminarMovimiento();

  // Handlers
  const handleAbrirModal = (movimiento?: MovimientoCaja) => {
    setMovimientoEdicion(movimiento || null);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setMovimientoEdicion(null);
  };

  const handleSubmitMovimiento = async (datos: FormularioMovimiento) => {
    try {
      if (movimientoEdicion) {
        await editarMutation.mutateAsync({
          idRegistro: movimientoEdicion.idRegistro,
          ...datos,
        });
        // No mostrar alerta de éxito
      } else {
        await agregarMutation.mutateAsync({
          ...datos,
          activo: true
        });
        // No mostrar alerta de éxito
      }
      handleCerrarModal();
    } catch (error: any) {
      console.error('Error guardando movimiento:', error);
      console.error('Datos enviados:', datos);
      
      // Mostrar mensaje de error más detallado
      let mensajeError = 'Error al guardar el movimiento';
      
      // Manejar diferentes tipos de errores
      if (error?.message) {
        mensajeError += `: ${error.message}`;
      } else if (error?.error) {
        mensajeError += `: ${error.error}`;
      } else if (typeof error === 'string') {
        mensajeError += `: ${error}`;
      } else if (error && typeof error === 'object') {
        // Intentar obtener información adicional del error
        try {
          const errorStr = JSON.stringify(error);
          if (errorStr && errorStr !== '{}') {
            mensajeError += `: ${errorStr}`;
          }
        } catch (stringifyError) {
          // Si no se puede convertir a string, mostrar el tipo
          mensajeError += `: Error de tipo ${typeof error}`;
        }
      }
      
      alert(mensajeError);
    }
  };

  const handleEliminar = (idRegistro: string) => {
    // Abrir el modal de confirmación en lugar de usar confirm()
    setMovimientoAEliminar(idRegistro);
    setConfirmModalOpen(true);
  };

  const handleConfirmEliminar = async () => {
    if (!movimientoAEliminar) return;
    
    try {
      await eliminarMutation.mutateAsync(movimientoAEliminar);
      // Cerrar el modal sin mostrar alerta
      setConfirmModalOpen(false);
      setMovimientoAEliminar(null);
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
      // Cerrar el modal incluso si hay error
      setConfirmModalOpen(false);
      setMovimientoAEliminar(null);
    }
  };

  const handleCancelEliminar = () => {
    setConfirmModalOpen(false);
    setMovimientoAEliminar(null);
  };

  const handleEliminarMovimiento = async (idRegistro: string) => {
    try {
      await eliminarMutation.mutateAsync(idRegistro);
      alert('Movimiento eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando movimiento:', error);
      alert('Error al eliminar el movimiento');
    }
  };

  // Definir tabs principales
  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'registros', label: 'Registros' },
  ];

  // Definir tabs de registros
  const registrosTabs = [
    { id: 'ingreso', label: 'Ingresos' },
    { id: 'gasto_barbero', label: 'Mis Gastos' },
    ...(esAdmin ? [{ id: 'gasto_barberia', label: 'Gastos Barbería' }] : []),
  ];

  // Validación de rol para usuarios no admin
  if (!esAdmin) {
    return (
      <Card className="v2-card-large">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[var(--text-primary)]">
            Acceso Denegado
          </h2>
          <p className="text-[var(--text-muted)]">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </Card>
    );
  }

  // Verificación de datos requeridos
  if (!barbero || !idBarberia) {
    return (
      <Card className="v2-card-large">
        <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
          <p>Cargando...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* Filtros globales */}
      {esAdmin && (
        <div className="mb-6">
          <GlobalFilters showBarberoFilter={true} />
        </div>
      )}

      {/* Tabs principales */}
      <div className="mb-6">
        <Tabs
          tabs={mainTabs}
          defaultTab="dashboard"
          onValueChange={(value) => setMainTab(value as 'dashboard' | 'registros')}
        />
      </div>

      {/* Contenido del Dashboard */}
      {mainTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="v2-card-small">
            <TarjetaResumen
              titulo="Total Ingresos"
              monto={estadisticas?.totalIngresos || 0}
              porcentajeCambio={estadisticas?.porcentajeCambio}
              icono=""
              tipo="ingreso"
            />
          </Card>
          <Card className="v2-card-small">
            <TarjetaResumen
              titulo="Total Gastos"
              monto={estadisticas?.totalGastos || 0}
              icono=""
              tipo="gasto"
            />
          </Card>
          <Card className="v2-card-small">
            <TarjetaResumen
              titulo="Balance"
              monto={estadisticas?.balance || 0}
              icono=""
              tipo="balance"
            />
          </Card>

          {/* Insights (solo admin) - Cards small alineadas con las otras */}
          {esAdmin && estadisticas && (
            <>
              {/* Día más rentable */}
              {estadisticas.diaMasRentable && (
                <Card className="v2-card-small hover:border-[#ff7700] hover:-translate-y-0.5 transition-all duration-250">
                  <div className="p-4">
                    <h3 className="text-md font-semibold mb-2">Día Más Rentable</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold capitalize">
                        {estadisticas.diaMasRentable.dia}
                      </span>
                      <span className="text-lg v2-text-success">
                        {formatearMonto(estadisticas.diaMasRentable.monto)}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 mt-1">Promedio de ingresos</p>
                  </div>
                </Card>
              )}

              {/* Distribución por método de pago */}
              <Card className="v2-card-small hover:border-[#ff7700] hover:-translate-y-0.5 transition-all duration-250">
                <div className="p-4">
                  <h3 className="text-md font-semibold mb-2">Métodos de Pago</h3>
                  <div className="space-y-1">
                    {Object.entries(estadisticas.metodosPago)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 2)
                      .map(([metodo, monto]) => (
                        <div key={metodo} className="flex items-center justify-between">
                          <span className="text-xs capitalize">{metodo}</span>
                          <span className="text-xs font-semibold">{formatearMonto(monto)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>

              {/* Ranking de barberos */}
              {ranking.length > 0 && (
                <Card className="v2-card-small hover:border-[#ff7700] hover:-translate-y-0.5 transition-all duration-250">
                  <div className="p-4">
                    <h3 className="text-md font-semibold mb-2">Top Barbero</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate max-w-[120px]">
                        {ranking[0]?.nombreBarbero || 'Barbero desconocido'}
                      </span>
                      <span className="text-lg v2-text-success">
                        {formatearMonto(ranking[0]?.totalIngresos || 0)}
                      </span>
                    </div>
                    <p className="text-xs opacity-60 mt-1">
                      {ranking[0]?.cantidadMovimientos || 0} movimientos
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Contenido de Registros */}
      {mainTab === 'registros' && (
        <>
          {/* Botón para agregar movimiento - encima de las pestañas */}
          <div className="mb-4 flex justify-end">
            <Button 
              variant="primary" 
              onClick={() => handleAbrirModal()}
              className="uppercase text-sm font-semibold px-4 py-2"
            >
              + Agregar Movimiento
            </Button>
          </div>

          {/* Pestañas de registros */}
          <div className="mb-6">
            <Tabs
              tabs={registrosTabs}
              defaultTab="ingreso"
              onValueChange={(value) => setRegistrosTab(value as TipoMovimiento)}
            />
          </div>

          {/* Contenido de las pestañas de registros */}
          <TabContent value="ingreso" activeTab={registrosTab}>
            <Card>
              <div className="p-6">
                <ResumenMovimientos movimientos={movimientos} />
                <TablaMovimientos
                  movimientos={movimientos}
                  isLoading={loadingMovimientos}
                  userRole={esAdmin ? 'admin' : 'barbero'}
                  userId={barbero?.id_barbero || ''}
                  onEditar={handleAbrirModal}
                  onEliminar={handleEliminar}
                />
              </div>
            </Card>
          </TabContent>

          <TabContent value="gasto_barbero" activeTab={registrosTab}>
            <Card>
              <div className="p-6">
                <ResumenMovimientos movimientos={movimientos} />
                <TablaMovimientos
                  movimientos={movimientos}
                  isLoading={loadingMovimientos}
                  userRole={esAdmin ? 'admin' : 'barbero'}
                  userId={barbero?.id_barbero || ''}
                  onEditar={handleAbrirModal}
                  onEliminar={handleEliminar}
                />
              </div>
            </Card>
          </TabContent>

          {esAdmin && (
            <TabContent value="gasto_barberia" activeTab={registrosTab}>
              <Card>
                <div className="p-6">
                  <ResumenMovimientos movimientos={movimientos} />
                  <TablaMovimientos
                    movimientos={movimientos}
                    isLoading={loadingMovimientos}
                    userRole="admin"
                    userId={barbero?.id_barbero || ''}
                    onEditar={handleAbrirModal}
                    onEliminar={handleEliminar}
                  />
                </div>
              </Card>
            </TabContent>
          )}
        </>
      )}

      {/* Modal de agregar/editar */}
      <ModalMovimiento
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitMovimiento}
        movimiento={movimientoEdicion}
        isLoading={agregarMutation.isPending || editarMutation.isPending}
        userInfo={{
          idBarberia: idBarberia || '',
          idSucursal: barbero?.id_sucursal || '',
          idBarbero: barbero?.id_barbero || '',
          isAdmin: esAdmin,
        }}
        barberos={barberos}
      />
      
      {/* Modal de confirmación para eliminar movimiento */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este movimiento?"
        onCancel={handleCancelEliminar}
        onConfirm={handleConfirmEliminar}
      />
    </>
  );
}