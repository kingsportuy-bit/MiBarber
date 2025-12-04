'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useBloqueos } from '../hooks/useBloqueos'
import type { Bloqueo, BloqueoInput } from '../types'

interface Props {
  barberoId: string
  barberiaId: string
  sucursalId: string
  bloqueo: Bloqueo | null
  onClose: () => void
}

export function BloqueoModal({ barberoId, barberiaId, sucursalId, bloqueo, onClose }: Props) {
  const { crearBloqueo, actualizarBloqueo } = useBloqueos(barberoId, barberiaId, sucursalId)

  const [formData, setFormData] = useState<BloqueoInput>({
    fecha: bloqueo?.fecha || new Date().toISOString().split('T')[0],
    tipo: bloqueo?.tipo || 'bloqueo_horas',
    hora_inicio: bloqueo?.hora_inicio || '',
    hora_fin: bloqueo?.hora_fin || '',
    motivo: bloqueo?.motivo || ''
  })

  useEffect(() => {
    if (bloqueo) {
      setFormData({
        fecha: bloqueo.fecha,
        tipo: bloqueo.tipo,
        hora_inicio: bloqueo.hora_inicio || '',
        hora_fin: bloqueo.hora_fin || '',
        motivo: bloqueo.motivo || ''
      })
    }
  }, [bloqueo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (bloqueo) {
        await actualizarBloqueo.mutateAsync({ id: bloqueo.id, input: formData })
      } else {
        await crearBloqueo.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar bloqueo:', error)
      alert('Error al guardar el bloqueo')
    }
  }

  const isPending = crearBloqueo.isPending || actualizarBloqueo.isPending

  return (
    <div className="v2-overlay" onClick={onClose}>
      <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            {bloqueo ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl" >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            {/* Fecha */}
            <div>
              <label className="v2-label">Fecha</label>
              <input
                type="date"
                className="v2-input"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="v2-label">Tipo de Bloqueo</label>
              <select
                className="v2-select"
                value={formData.tipo}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tipo: e.target.value as 'bloqueo_dia' | 'bloqueo_horas',
                  hora_inicio: e.target.value === 'bloqueo_dia' ? '' : formData.hora_inicio,
                  hora_fin: e.target.value === 'bloqueo_dia' ? '' : formData.hora_fin
                })}
              >
                <option value="bloqueo_horas">Bloqueo de Horas</option>
                <option value="bloqueo_dia">Bloqueo de Día Completo</option>
              </select>
            </div>

            {/* Horarios (solo si es bloqueo_horas) */}
            {formData.tipo === 'bloqueo_horas' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="v2-label">Hora Inicio</label>
                  <input
                    type="time"
                    className="v2-input"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="v2-label">Hora Fin</label>
                  <input
                    type="time"
                    className="v2-input"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="v2-label">Motivo (opcional)</label>
              <textarea
                className="v2-textarea"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={3}
                placeholder="Ej: Capacitación, Reunión familiar, etc."
              />
            </div>
          </div>
        </form>

        <div className="v2-modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit as any} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}