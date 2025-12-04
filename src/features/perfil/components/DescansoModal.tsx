'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useDescansos } from '../hooks/useDescansos'
import type { Descanso, DescansoInput } from '../types'

interface Props {
  barberoId: string
  barberiaId: string
  sucursalId: string
  descanso: Descanso | null
  onClose: () => void
}

const DIAS_SEMANA = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' }
]

export function DescansoModal({ barberoId, barberiaId, sucursalId, descanso, onClose }: Props) {
  const { crearDescanso, actualizarDescanso } = useDescansos(barberoId, barberiaId, sucursalId)

  const [formData, setFormData] = useState<DescansoInput>({
    hora_inicio: descanso?.hora_inicio || '',
    hora_fin: descanso?.hora_fin || '',
    dias_semana: descanso?.dias_semana.split(',') || [],
    motivo: descanso?.motivo || ''
  })

  const toggleDia = (dia: string) => {
    if (formData.dias_semana.includes(dia)) {
      setFormData({
        ...formData,
        dias_semana: formData.dias_semana.filter(d => d !== dia)
      })
    } else {
      setFormData({
        ...formData,
        dias_semana: [...formData.dias_semana, dia]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.dias_semana.length === 0) {
      alert('Debes seleccionar al menos un día')
      return
    }

    try {
      if (descanso) {
        await actualizarDescanso.mutateAsync({ id: descanso.id, input: formData })
      } else {
        await crearDescanso.mutateAsync(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar descanso:', error)
      alert('Error al guardar el descanso')
    }
  }

  const isPending = crearDescanso.isPending || actualizarDescanso.isPending

  return (
    <div className="v2-overlay" onClick={onClose}>
      <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            {descanso ? 'Editar Descanso' : 'Nuevo Descanso'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl" >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            {/* Horarios */}
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

            {/* Días de la semana */}
            <div>
              <label className="v2-label">Días de la semana</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`
                      px-3 py-2 rounded text-sm font-semibold transition-colors
                      ${formData.dias_semana.includes(dia.value)
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }
                    `}
                  >
                    {dia.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="v2-label">Motivo (opcional)</label>
              <textarea
                className="v2-textarea"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={3}
                placeholder="Ej: Almuerzo, Descanso, etc."
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