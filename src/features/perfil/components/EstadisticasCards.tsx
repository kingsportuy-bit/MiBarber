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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="app-card" style={{ minHeight: 120 }}>
            <div className="v2-skeleton" style={{ height: 80 }} />
          </div>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="app-card"
          style={{ padding: '16px 24px', minHeight: 120 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted, rgba(255,255,255,0.45))', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
              {stat.label}
            </p>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary, #fff)', margin: 0, textTransform: 'none' }}>
              {stat.format(stat.value)}
            </h2>
          </div>
        </div>
      ))}
    </div>
  )
}