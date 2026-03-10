'use client'

import React from 'react'
import { useTopClientes } from '../hooks/useTopClientes'
import { formatCurrency } from '../utils/formatters'
import { ClienteStars } from './ClienteStars'

interface Props {
  barberoId: string
  barberiaId: string
}

export function ClientesSection({ barberoId, barberiaId }: Props) {
  const { data: topHistorico, isLoading: loadingHistorico } = useTopClientes(barberoId, barberiaId, 'historico')
  const { data: topMes, isLoading: loadingMes } = useTopClientes(barberoId, barberiaId, 'mes')

  const isLoading = loadingHistorico || loadingMes

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {[1, 2].map((i) => (
          <div key={i} className="app-card" style={{ minHeight: 240 }}>
            <div className="v2-skeleton" style={{ height: 200 }} />
          </div>
        ))}
      </div>
    )
  }

  const renderCliente = (cliente: any, index: number) => (
    <div
      key={cliente.id_cliente}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 8,
        borderRadius: 4,
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted, rgba(255,255,255,0.45))', width: 32 }}>
        #{index + 1}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary, #fff)', margin: 0 }}>{cliente.nombre}</p>
          <ClienteStars idCliente={cliente.id_cliente} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted, rgba(255,255,255,0.45))', margin: 0 }}>
          {cliente.cantidad_servicios} servicios - {formatCurrency(cliente.total_gastado)}
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
      {/* Top 5 Histórico */}
      <div className="app-card" style={{ padding: '24px', minHeight: 240 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #fff)', textTransform: 'none' }}>
          Top 5 Clientes (Histórico)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topHistorico && topHistorico.length > 0 ? (
            topHistorico.map((cliente, index) => renderCliente(cliente, index))
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted, rgba(255,255,255,0.45))', textAlign: 'center', padding: '32px 0' }}>
              No hay datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Top 5 del Mes */}
      <div className="app-card" style={{ padding: '24px', minHeight: 240 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #fff)', textTransform: 'none' }}>
          Top 5 Clientes del Mes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topMes && topMes.length > 0 ? (
            topMes.map((cliente, index) => renderCliente(cliente, index))
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted, rgba(255,255,255,0.45))', textAlign: 'center', padding: '32px 0' }}>
              No hay datos este mes
            </p>
          )}
        </div>
      </div>
    </div>
  )
}