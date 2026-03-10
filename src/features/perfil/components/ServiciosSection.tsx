'use client'

import React from 'react'
import { useServiciosBarbero } from '../hooks/useServiciosBarbero'
import { useIngresosPorServicio } from '../hooks/useIngresosPorServicio'
import { formatCurrency } from '../utils/formatters'

interface Props {
  barberoId: string
  barberiaId: string
}

export function ServiciosSection({ barberoId, barberiaId }: Props) {
  const { data: servicios, isLoading: loadingServicios } = useServiciosBarbero(barberoId, barberiaId)
  const { data: ingresos, isLoading: loadingIngresos } = useIngresosPorServicio(barberoId, barberiaId)

  const isLoading = loadingServicios || loadingIngresos

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {[1, 2].map((i) => (
          <div key={i} className="app-card" style={{ minHeight: 180 }}>
            <div className="v2-skeleton" style={{ height: 160 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
      {/* Card 1: Servicios Ofrecidos */}
      <div className="app-card" style={{ padding: '24px', minHeight: 180 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #fff)', textTransform: 'none' }}>
          Servicios Ofrecidos
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
          {servicios && servicios.length > 0 ? (
            servicios.map((servicio) => (
              <div key={servicio.id_servicio} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary, rgba(255,255,255,0.7))' }}>{servicio.nombre}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary, #C5A059)' }}>
                  {formatCurrency(servicio.precio)}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted, rgba(255,255,255,0.45))' }}>No hay servicios configurados</p>
          )}
        </div>
      </div>

      {/* Card 2: Ingresos por Servicio */}
      <div className="app-card" style={{ padding: '24px', minHeight: 180 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary, #fff)', textTransform: 'none' }}>
          Ingresos por Servicio
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
          {ingresos?.ingresos && ingresos.ingresos.length > 0 ? (
            ingresos.ingresos.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary, rgba(255,255,255,0.7))' }}>{item.servicio}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                  {formatCurrency(item.total_ingresos)}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted, rgba(255,255,255,0.45))' }}>No hay datos este mes</p>
          )}
        </div>
      </div>
    </div>
  )
}