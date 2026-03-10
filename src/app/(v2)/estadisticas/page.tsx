'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { GlobalFilters } from '@/components/shared/GlobalFilters';
import {
  useEstadisticasSucursales,
  useEstadisticasCaja,
  useEstadisticasBarberos,
  useEstadisticasServicios,
  useEstadisticasClientes,
  useEstadisticasBotIA
} from '@/hooks/useEstadisticas';
import type { FiltrosEstadisticas } from '@/types/estadisticas';

function convertirFiltrosParaEstadisticas(globalFilters: any): FiltrosEstadisticas {
  return {
    sucursalId: globalFilters.sucursalId,
    barberoId: globalFilters.barberoId,
    fechaInicio: globalFilters.fechaInicio,
    fechaFin: globalFilters.fechaFin
  };
}

/* ── Inline-style helpers ─────────────────────────────────── */
const S = {
  page: { paddingTop: 0, paddingLeft: 20, paddingRight: 20, paddingBottom: 24, width: '100%', margin: '0 auto' } as React.CSSProperties,
  heading: { fontSize: '1.5rem', margin: 0, letterSpacing: '0.04em' } as React.CSSProperties,
  subtitle: { color: '#8A8A8A', fontSize: '0.875rem', margin: '4px 0 0', fontFamily: 'var(--font-body)' } as React.CSSProperties,
  card: { background: '#0a0a0a', border: '1px solid #1a1a1a', padding: '20px', marginBottom: 0 } as React.CSSProperties,
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 } as React.CSSProperties,
  kpiLabel: { fontSize: '0.6875rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#8A8A8A', margin: 0, fontFamily: 'var(--font-body)' } as React.CSSProperties,
  kpiValue: { fontSize: '1.5rem', fontWeight: 600, margin: '4px 0 0' } as React.CSSProperties,
  sectionTitle: { fontSize: '1rem', fontWeight: 600, margin: '0 0 16px', letterSpacing: '0.04em' } as React.CSSProperties,
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' } as React.CSSProperties,
  rowLabel: { fontSize: '0.875rem', color: '#ccc', fontFamily: 'var(--font-body)' } as React.CSSProperties,
  rowValue: { fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-body)' } as React.CSSProperties,
  tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: 24, overflow: 'auto' as const } as React.CSSProperties,
  filtersRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const } as React.CSSProperties,
  rankBadge: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-body)' } as React.CSSProperties,
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

function KPICard({ label, value, color = '#C5A059' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={S.card}>
      <p style={S.kpiLabel}>{label}</p>
      <p style={{ ...S.kpiValue, color }}>{value}</p>
    </div>
  );
}

function RankingList({ items, loading, emptyMsg = 'Sin datos' }: { items: { name: string; value: string; sub?: string }[]; loading: boolean; emptyMsg?: string }) {
  if (loading) return <div style={{ padding: 20, color: '#8A8A8A', textAlign: 'center', fontFamily: 'var(--font-body)' }}>Cargando...</div>;
  if (!items.length) return <div style={{ padding: 20, color: '#8A8A8A', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{emptyMsg}</div>;
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ ...S.row, borderBottom: i === items.length - 1 ? 'none' : S.row.borderBottom }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...S.rankBadge, background: i === 0 ? 'rgba(197,160,89,0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#C5A059' : '#ccc' }}>
              {i + 1}
            </span>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#fff', fontFamily: 'var(--font-body)' }}>{item.name}</div>
              {item.sub && <div style={{ fontSize: '0.75rem', color: '#8A8A8A', fontFamily: 'var(--font-body)' }}>{item.sub}</div>}
            </div>
          </div>
          <span style={{ ...S.rowValue, color: '#C5A059' }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function EstadisticasPage() {
  usePageTitle('Barberox | Estadísticas');
  const { isAdmin, idBarberia } = useAuth();
  const { filters, setFilters } = useGlobalFilters();
  const [activeTab, setActiveTab] = useState('resumen');

  // Se eliminó la preselección local de fechas para usar los GlobalFilters estandarizados


  const filtrosEstadisticas = convertirFiltrosParaEstadisticas(filters);
  const { data: sucursales, isLoading: lSuc } = useEstadisticasSucursales(filtrosEstadisticas);
  const { data: caja, isLoading: lCaja } = useEstadisticasCaja(filtrosEstadisticas);
  const { data: barberos, isLoading: lBarb } = useEstadisticasBarberos(filtrosEstadisticas);
  const { data: servicios, isLoading: lServ } = useEstadisticasServicios(filtrosEstadisticas);
  const { data: clientes, isLoading: lCli } = useEstadisticasClientes(filtrosEstadisticas);
  const { data: botIA, isLoading: lBot } = useEstadisticasBotIA(filtrosEstadisticas);

  // Derived KPIs
  const ingresosTotales = useMemo(() => caja?.reduce((s, c) => s + (c.ingresos_totales || 0), 0) || 0, [caja]);
  const totalCitas = useMemo(() => sucursales?.reduce((s, c) => s + (c.total_citas || 0), 0) || 0, [sucursales]);
  const totalBarberos = barberos?.length || 0;
  const totalServicios = servicios?.length || 0;

  if (!isAdmin) {
    return (
      <div style={{ ...S.page, textAlign: 'center', paddingTop: 80 }}>
        <h2 style={S.heading}>Acceso Denegado</h2>
        <p style={S.subtitle}>Solo los administradores pueden acceder a esta sección.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'barberos', label: 'Barberos' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'caja', label: 'Caja' },
    { id: 'clientes', label: 'Clientes' },
  ];

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={S.heading}>Estadísticas</h1>
        <p style={S.subtitle}>Análisis del rendimiento de tu barbería</p>
      </div>

      {/* Filters */}
      <div style={S.filtersRow}>
        <GlobalFilters showSucursalFilter={true} showBarberoFilter={true} showDateFilters={true} />
      </div>

      {/* KPI row */}
      <div style={S.kpiGrid}>
        <KPICard label="Ingresos Totales" value={lCaja ? '...' : `$ ${ingresosTotales.toLocaleString()}`} color="#C5A059" />
        <KPICard label="Total Citas" value={lSuc ? '...' : totalCitas} color="#10b981" />
        <KPICard label="Barberos" value={lBarb ? '...' : totalBarberos} color="#fff" />
        <KPICard label="Servicios" value={lServ ? '...' : totalServicios} color="#fff" />
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {tabs.map(t => (
          <Tab key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Top Barberos por Ingresos</h3>
            <RankingList
              loading={lBarb}
              items={(barberos || [])
                .sort((a, b) => (b.ingresos_generados || 0) - (a.ingresos_generados || 0))
                .slice(0, 5)
                .map(b => ({ name: b.nombre_barbero, value: `$ ${(b.ingresos_generados || 0).toLocaleString()}`, sub: `${b.total_citas_completadas || 0} citas` }))}
            />
          </div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Top Servicios por Popularidad</h3>
            <RankingList
              loading={lServ}
              items={(servicios || [])
                .sort((a, b) => (b.total_solicitudes || 0) - (a.total_solicitudes || 0))
                .slice(0, 5)
                .map(s => ({ name: s.nombre_servicio, value: `${s.total_solicitudes || 0} solic.`, sub: `$ ${(s.ingresos_totales || 0).toLocaleString()}` }))}
            />
          </div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Clientes Frecuentes</h3>
            <RankingList
              loading={lCli}
              items={(clientes?.clientes_frecuentes || [])
                .sort((a: any, b: any) => (b.total_visitas || 0) - (a.total_visitas || 0))
                .slice(0, 5)
                .map((c: any) => ({ name: c.nombre_cliente, value: `${c.total_visitas || 0} visitas` }))}
            />
          </div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Desglose por Sucursal</h3>
            <RankingList
              loading={lSuc}
              items={(sucursales || []).map(s => ({ name: s.nombre_sucursal, value: `$ ${(s.ingresos_totales || 0).toLocaleString()}`, sub: `${s.total_citas} citas · ${s.tasa_ocupacion}% ocupación` }))}
            />
          </div>
        </div>
      )}

      {activeTab === 'barberos' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard label="Total Barberos" value={lBarb ? '...' : totalBarberos} />
            <KPICard label="Citas Completadas" value={lBarb ? '...' : barberos?.reduce((s, b) => s + (b.total_citas_completadas || 0), 0) || 0} color="#10b981" />
            <KPICard label="Ingresos Totales" value={lBarb ? '...' : `$ ${barberos?.reduce((s, b) => s + (b.ingresos_generados || 0), 0)?.toLocaleString() || 0}`} color="#C5A059" />
            <KPICard label="Ticket Promedio" value={lBarb ? '...' : `$ ${barberos && barberos.length > 0 ? (barberos.reduce((s, b) => s + (b.ingresos_generados || 0), 0) / Math.max(1, barberos.reduce((s, b) => s + (b.total_citas_completadas || 0), 0))).toFixed(0) : 0}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Ranking por Ingresos</h3>
              <RankingList
                loading={lBarb}
                items={[...(barberos || [])]
                  .sort((a, b) => (b.ingresos_generados || 0) - (a.ingresos_generados || 0))
                  .map(b => ({ name: b.nombre_barbero, value: `$ ${(b.ingresos_generados || 0).toLocaleString()}`, sub: `${b.total_citas_completadas || 0} citas · ★ ${b.promedio_valoracion || 0}/5` }))}
              />
            </div>
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Ranking por Citas</h3>
              <RankingList
                loading={lBarb}
                items={[...(barberos || [])]
                  .sort((a, b) => (b.total_citas_completadas || 0) - (a.total_citas_completadas || 0))
                  .map(b => ({ name: b.nombre_barbero, value: `${b.total_citas_completadas || 0} citas`, sub: `Cancelación: ${b.tasa_cancelacion || 0}%` }))}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'servicios' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard label="Total Servicios" value={lServ ? '...' : totalServicios} />
            <KPICard label="Solicitudes Totales" value={lServ ? '...' : servicios?.reduce((s, sv) => s + (sv.total_solicitudes || 0), 0) || 0} color="#10b981" />
            <KPICard label="Ingresos Totales" value={lServ ? '...' : `$ ${servicios?.reduce((s, sv) => s + (sv.ingresos_totales || 0), 0)?.toLocaleString() || 0}`} color="#C5A059" />
            <KPICard label="Ticket Promedio" value={lServ ? '...' : `$ ${servicios && servicios.length > 0 ? (servicios.reduce((s, sv) => s + (sv.ingresos_totales || 0), 0) / Math.max(1, servicios.reduce((s, sv) => s + (sv.total_solicitudes || 0), 0))).toFixed(0) : 0}`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Ranking por Ingresos</h3>
              <RankingList
                loading={lServ}
                items={[...(servicios || [])]
                  .sort((a, b) => (b.ingresos_totales || 0) - (a.ingresos_totales || 0))
                  .map(s => ({ name: s.nombre_servicio, value: `$ ${(s.ingresos_totales || 0).toLocaleString()}`, sub: `${s.total_solicitudes || 0} solicitudes` }))}
              />
            </div>
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Ranking por Popularidad</h3>
              <RankingList
                loading={lServ}
                items={[...(servicios || [])]
                  .sort((a, b) => (b.total_solicitudes || 0) - (a.total_solicitudes || 0))
                  .map(s => ({ name: s.nombre_servicio, value: `${s.total_solicitudes || 0} solicitudes`, sub: `$ ${(s.ingresos_totales || 0).toLocaleString()} ingresos` }))}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'caja' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard label="Ingresos Totales" value={lCaja ? '...' : `$ ${ingresosTotales.toLocaleString()}`} color="#C5A059" />
            <KPICard label="Gastos Estimados" value={lCaja ? '...' : `$ ${((caja?.length || 0) * 5000).toLocaleString()}`} color="#ef4444" />
            <KPICard label="Balance" value={lCaja ? '...' : `$ ${Math.max(0, ingresosTotales - ((caja?.length || 0) * 5000)).toLocaleString()}`} color="#10b981" />
          </div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Detalle por Barbero</h3>
            <RankingList
              loading={lCaja}
              items={(caja || []).map(c => ({ name: c.nombre_barbero, value: `$ ${(c.ingresos_totales || 0).toLocaleString()}`, sub: `Ticket prom: $${c.ticket_promedio} · ${c.metodo_pago}` }))}
            />
          </div>
        </div>
      )}

      {activeTab === 'clientes' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <KPICard label="Clientes Totales" value={lCli ? '...' : (clientes as any)?.total_clientes || 0} />
            <KPICard label="Clientes Nuevos" value={lCli ? '...' : (clientes as any)?.clientes_nuevos || 0} color="#10b981" />
            <KPICard label="Tasa Retención" value={lCli ? '...' : `${(clientes as any)?.tasa_retencion || 0}%`} color="#C5A059" />
          </div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Clientes Más Frecuentes</h3>
            <RankingList
              loading={lCli}
              items={(clientes?.clientes_frecuentes || [])
                .sort((a: any, b: any) => (b.total_visitas || 0) - (a.total_visitas || 0))
                .slice(0, 10)
                .map((c: any) => ({ name: c.nombre_cliente, value: `${c.total_visitas || 0} visitas` }))}
            />
          </div>
        </div>
      )}

      {/* Responsive override */}
      <style>{`
        @media (max-width: 768px) {
          [style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          [style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}