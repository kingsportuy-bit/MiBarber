'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { useEstadisticasMes } from '../hooks/useEstadisticasMes'
import { formatCurrency, formatHours } from '../utils/formatters'

interface Props {
  barberoId: string
  barberiaId: string
}

export function EstadisticasCards({ barberoId, barberiaId }: Props) {
  const { data, isLoading } = useEstadisticasMes(barberoId, barberiaId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="v2-card-small">
            <div className="v2-skeleton h-20" />
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      label: 'Turnos Atendidos',
      value: data?.turnosAtendidos || 0,
      format: (v: number) => v.toString()
    },
    {
      label: 'Turnos Pendientes',
      value: data?.turnosPendientes || 0,
      format: (v: number) => v.toString()
    },
    {
      label: 'Ingresos del Mes',
      value: data?.ingresosMes || 0,
      format: formatCurrency
    },
    {
      label: 'Horas Trabajadas',
      value: data?.horasTrabajadas || 0,
      format: formatHours
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="v2-card-small">
          <div className="flex flex-col h-full justify-center">
            <p className="text-xs text-[var(--text-muted)] uppercase font-semibold mb-2">
              {stat.label}
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {stat.format(stat.value)}
            </h2>
          </div>
        </Card>
      ))}
    </div>
  )
}