'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="v2-card-large">
            <div className="v2-skeleton h-40" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {/* Card 1: Servicios Ofrecidos */}
      <Card className="v2-card-large">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Servicios Ofrecidos
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto v2-scrollbar">
          {servicios && servicios.length > 0 ? (
            servicios.map((servicio) => (
              <div key={servicio.id_servicio} className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">{servicio.nombre}</span>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  {formatCurrency(servicio.precio)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No hay servicios configurados</p>
          )}
        </div>
      </Card>

      {/* Card 2: Ingresos por Servicio */}
      <Card className="v2-card-large">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Ingresos por Servicio
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto v2-scrollbar">
          {ingresos?.ingresos && ingresos.ingresos.length > 0 ? (
            ingresos.ingresos.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">{item.servicio}</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {formatCurrency(item.total_ingresos)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No hay datos este mes</p>
          )}
        </div>
      </Card>

      {/* Card 3: Servicios Más Realizados */}
      <Card className="v2-card-large">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Servicios Más Realizados
        </h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto v2-scrollbar">
          {ingresos?.masRealizados && ingresos.masRealizados.length > 0 ? (
            ingresos.masRealizados.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-secondary)]">{item.servicio}</span>
                <span className="text-sm text-[var(--text-muted)]">{item.cantidad_veces}x</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No hay datos este mes</p>
          )}
        </div>
      </Card>
    </div>
  )
}