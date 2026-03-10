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
import { ResumenMovimientos } from '@/components/caja/v2/ResumenMovimientos';
import { TablaMovimientos } from '@/components/caja/v2/TablaMovimientos';
import { ModalMovimiento } from '@/components/caja/v2/ModalMovimiento';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { formatearMonto } from '@/types/caja';
import { toast } from 'sonner';
import type { MovimientoCaja, FormularioMovimiento, TipoMovimiento, FiltrosCaja } from '@/types/caja';
import { usePageTitle } from '@/hooks/usePageTitle';

/* ── Inline-style helpers ─────────────────────────────────── */
const S = {
  page: { paddingTop: 0, paddingLeft: 20, paddingRight: 20, paddingBottom: 24, width: '100%', margin: '0 auto' } as React.CSSProperties,
  heading: { fontSize: '1.5rem', margin: 0, letterSpacing: '0.04em' } as React.CSSProperties,
  subtitle: { color: '#8A8A8A', fontSize: '0.875rem', margin: '4px 0 0', fontFamily: 'var(--font-body)' } as React.CSSProperties,
  card: { background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px', marginBottom: 16 } as React.CSSProperties,
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 } as React.CSSProperties,
  kpiLabel: { fontSize: '0.6875rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#8A8A8A', margin: 0, fontFamily: 'var(--font-body)' } as React.CSSProperties,
  kpiValue: { fontSize: '1.5rem', fontWeight: 600, margin: '4px 0 0' } as React.CSSProperties,
  sectionTitle: { fontSize: '1rem', fontWeight: 600, margin: '0 0 16px', letterSpacing: '0.04em' } as React.CSSProperties,
  tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: 24, overflow: 'auto' as const } as React.CSSProperties,
  filtersRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const } as React.CSSProperties,
  btn: { background: '#C5A059', color: '#000000', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: 'var(--font-rasputin), serif', textTransform: 'uppercase' as const, letterSpacing: '0.04em', transition: 'all 0.2s', borderRadius: '6px', fontWeight: 600 } as React.CSSProperties,
};

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        background: active ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #C5A059' : '2px solid transparent',
        color: active ? '#C5A059' : '#8A8A8A',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-rasputin), serif',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function KPICard({ label, value, color = '#C5A059', subtitle }: { label: string; value: string | number; color?: string; subtitle?: string }) {
  return (
    <div style={S.card}>
      <p style={S.kpiLabel}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
        <p style={{ ...S.kpiValue, color, margin: 0 }}>{value}</p>
        {subtitle && <p style={{ fontSize: '0.75rem', color: '#8A8A8A', margin: 0, paddingBottom: 4 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default function CajaPage() {
  usePageTitle('Barberox | Caja');
  const { barbero, idBarberia, isAdmin } = useAuth();
  const { filters: globalFilters } = useGlobalFilters();
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
    fechaFin: globalFilters.fechaFin,
    fechaInicio: globalFilters.fechaInicio,
    idBarbero: globalFilters.barberoId !== 'todos' ? globalFilters.barberoId : undefined,
    idSucursal: globalFilters.sucursalId,
    metodoPago: undefined,
    tipo: registrosTab,
  };

  const { data: movimientos = [], isLoading: loadingMovimientos } = useCaja(filtrosCaja);
  const { data: movimientosGlobales = [] } = useCaja({ ...filtrosCaja, tipo: undefined } as unknown as FiltrosCaja);
  const { data: estadisticas } = useEstadisticasCaja({ ...filtrosCaja, tipo: undefined } as unknown as FiltrosCaja);

  const agregarMutation = useAgregarMovimiento();
  const editarMutation = useEditarMovimiento();
  const eliminarMutation = useEliminarMovimiento();

  const { data: barberos = [] } = useBarberos();
  const { data: ranking = [] } = useRankingBarberos(filtrosCaja);

  const handleAbrirModal = (movimiento?: MovimientoCaja) => {
    if (movimiento) {
      setMovimientoEdicion(movimiento);
    } else {
      setMovimientoEdicion(null);
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setMovimientoEdicion(null);
  };

  const handleSubmitMovimiento = async (datos: FormularioMovimiento) => {
    try {
      if (movimientoEdicion?.idRegistro) {
        await editarMutation.mutateAsync({
          idRegistro: movimientoEdicion.idRegistro,
          ...(datos as any)
        });
      } else {
        await agregarMutation.mutateAsync(datos as any);
      }
      handleCerrarModal();
      toast.success(movimientoEdicion ? 'Movimiento actualizado' : 'Movimiento agregado');
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      toast.error('Error al guardar el movimiento');
    }
  };

  const handleEliminar = (idRegistro: string) => {
    setMovimientoAEliminar(idRegistro);
    setConfirmModalOpen(true);
  };

  const handleConfirmEliminar = async () => {
    if (movimientoAEliminar) {
      try {
        await eliminarMutation.mutateAsync(movimientoAEliminar);
        setConfirmModalOpen(false);
        setMovimientoAEliminar(null);
        toast.success('Movimiento eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando movimiento:', error);
        toast.error('Error al eliminar el movimiento');
      }
    }
  };

  const handleCancelEliminar = () => {
    setConfirmModalOpen(false);
    setMovimientoAEliminar(null);
  };

  if (!esAdmin && mainTab === 'dashboard') {
    setMainTab('registros');
  }

  if (!barbero || !idBarberia) {
    return (
      <div style={{ ...S.page, textAlign: 'center', paddingTop: 80 }}>
        <p style={S.subtitle}>Cargando...</p>
      </div>
    );
  }

  const mainTabs = [
    ...(esAdmin ? [{ id: 'dashboard', label: 'Dashboard' }] : []),
    { id: 'registros', label: 'Registros' },
  ];

  const subTabs = [
    { id: 'ingreso', label: 'Ingresos' },
    { id: 'gasto_barbero', label: 'Mis Gastos' },
    ...(esAdmin ? [{ id: 'gasto_barberia', label: 'Gastos Barbería' }] : []),
  ];

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.heading}>Caja</h1>
          <p style={S.subtitle}>Gestión de ingresos y gastos</p>
        </div>
        {mainTab === 'registros' && (
          <button style={S.btn} onClick={() => handleAbrirModal()}>+ Agregar Movimiento</button>
        )}
      </div>

      {esAdmin && (
        <div style={S.filtersRow}>
          <GlobalFilters showSucursalFilter={true} showBarberoFilter={true} showDateFilters={true} />
        </div>
      )}

      <div style={S.tabBar}>
        {mainTabs.map(t => (
          <Tab key={t.id} label={t.label} active={mainTab === t.id} onClick={() => setMainTab(t.id as any)} />
        ))}
      </div>

      {mainTab === 'dashboard' && esAdmin && (
        <>
          <div style={S.kpiGrid}>
            <KPICard label="Total Ingresos" value={formatearMonto(estadisticas?.totalIngresos || 0)} color="#C5A059" />
            <KPICard label="Total Gastos" value={formatearMonto(estadisticas?.totalGastos || 0)} color="#ef4444" />
            <KPICard label="Balance" value={formatearMonto(estadisticas?.balance || 0)} color="#10b981" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {estadisticas?.diaMasRentable && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Día Más Rentable</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize', color: '#fff' }}>{estadisticas.diaMasRentable.dia}</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatearMonto(estadisticas.diaMasRentable.monto)}</span>
                </div>
              </div>
            )}

            {estadisticas?.metodosPago && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Métodos de Pago</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(estadisticas.metodosPago)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 3)
                    .map(([metodo, monto]) => (
                      <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textTransform: 'capitalize', color: '#8A8A8A', fontSize: '0.875rem' }}>{metodo}</span>
                        <span style={{ color: '#fff', fontSize: '0.875rem' }}>{formatearMonto(monto as number)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {ranking && ranking.length > 0 && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Top Barbero</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.875rem' }}>{ranking[0]?.nombreBarbero || 'Desconocido'}</span>
                  <span style={{ color: '#C5A059', fontWeight: 'bold' }}>{formatearMonto(ranking[0]?.totalIngresos || 0)}</span>
                </div>
                <p style={{ color: '#8A8A8A', fontSize: '0.75rem', marginTop: 4 }}>{ranking[0]?.cantidadMovimientos || 0} movimientos</p>
              </div>
            )}
          </div>
        </>
      )}

      {mainTab === 'registros' && (
        <>
          <div style={{ ...S.tabBar, marginBottom: 16, borderBottom: 'none' }}>
            {subTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setRegistrosTab(t.id as TipoMovimiento)}
                style={{
                  padding: '6px 16px',
                  background: registrosTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: registrosTab === t.id ? '#333' : 'transparent',
                  borderRadius: 20,
                  color: registrosTab === t.id ? '#fff' : '#8A8A8A',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  transition: 'all 0.2s',
                  marginRight: 8
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={S.card}>
            <ResumenMovimientos movimientos={movimientosGlobales} />
            <div style={{ marginTop: 20 }}>
              <TablaMovimientos
                movimientos={movimientos}
                isLoading={loadingMovimientos}
                userRole={esAdmin ? 'admin' : 'barbero'}
                userId={barbero?.id_barbero || ''}
                onEditar={handleAbrirModal}
                onEliminar={handleEliminar}
              />
            </div>
          </div>
        </>
      )}

      {/* Modals */}
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

      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este movimiento?"
        onCancel={handleCancelEliminar}
        onConfirm={handleConfirmEliminar}
      />

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}