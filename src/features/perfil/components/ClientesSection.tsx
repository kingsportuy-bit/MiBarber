'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="v2-card-large">
            <div className="v2-skeleton h-60" />
          </Card>
        ))}
      </div>
    )
  }

  const renderCliente = (cliente: any, index: number) => (
    <div key={cliente.id_cliente} className="flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded transition-colors">
      <span className="text-2xl font-bold text-[var(--text-muted)] w-8">
        #{index + 1}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[var(--text-primary)]">{cliente.nombre}</p>
          <ClienteStars idCliente={cliente.id_cliente} />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {cliente.cantidad_servicios} servicios - {formatCurrency(cliente.total_gastado)}
        </p>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Top 5 Histórico */}
      <Card className="v2-card-large">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Top 5 Clientes (Histórico)
        </h3>
        <div className="space-y-2">
          {topHistorico && topHistorico.length > 0 ? (
            topHistorico.map((cliente, index) => renderCliente(cliente, index))
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No hay datos disponibles
            </p>
          )}
        </div>
      </Card>

      {/* Top 5 del Mes */}
      <Card className="v2-card-large">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Top 5 Clientes del Mes
        </h3>
        <div className="space-y-2">
          {topMes && topMes.length > 0 ? (
            topMes.map((cliente, index) => renderCliente(cliente, index))
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No hay datos este mes
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}