'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

// Importar el componente CustomDatePicker
import { CustomDatePicker } from '@/components/CustomDatePicker'

import type { Bloqueo } from '../types'

interface Props {
  isOpen: boolean
  initialData: Bloqueo | null
  onClose: () => void
  onSubmit: (bloqueoData: any) => Promise<void>
}

export function BloqueoModalForm({ isOpen, initialData, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
    tipo: initialData?.tipo || 'bloqueo_horas',
    hora_inicio: initialData?.hora_inicio || '',
    hora_fin: initialData?.hora_fin || '',
    motivo: initialData?.motivo || '',
    activo: initialData?.activo !== undefined ? initialData.activo : true
  })
  
  const [errors, setErrors] = useState<{hora_inicio?: string, hora_fin?: string}>({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        fecha: initialData.fecha,
        tipo: initialData.tipo,
        hora_inicio: initialData.hora_inicio || '',
        hora_fin: initialData.hora_fin || '',
        motivo: initialData.motivo || '',
        activo: initialData.activo !== undefined ? initialData.activo : true
      })
    } else {
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'bloqueo_horas',
        hora_inicio: '',
        hora_fin: '',
        motivo: '',
        activo: true
      })
    }
  }, [initialData])

  const validateHorarios = () => {
    const newErrors: typeof errors = {}
    
    if (formData.tipo === 'bloqueo_horas') {
      if (!formData.hora_inicio) {
        newErrors.hora_inicio = 'Hora de inicio es requerida'
      }
      
      if (!formData.hora_fin) {
        newErrors.hora_fin = 'Hora de fin es requerida'
      }
      
      if (formData.hora_inicio && formData.hora_fin) {
        // Convertir horas a minutos para comparar
        const [inicioHoras, inicioMinutos] = formData.hora_inicio.split(':').map(Number)
        const [finHoras, finMinutos] = formData.hora_fin.split(':').map(Number)
        
        const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos
        const finTotalMinutos = finHoras * 60 + finMinutos
        
        if (finTotalMinutos <= inicioTotalMinutos) {
          newErrors.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateHorarios()) {
      await onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Manejar el caso especial del campo activo que ahora es booleano
    if (field === 'activo') {
      setFormData({ 
        ...formData, 
        [field]: value === 'true'
      } as any)
      return
    }
    
    let newData = { ...formData, [field]: value }
    
    // Manejar el cambio de tipo
    if (field === 'tipo') {
      if (value === 'bloqueo_dia') {
        // Limpiar horas cuando se cambia a bloqueo de día completo
        newData.hora_inicio = ''
        newData.hora_fin = ''
      }
    }
    
    // Si se cambia la hora de inicio, limpiar la hora de fin si ya no es válida
    if (field === 'hora_inicio' && newData.hora_fin) {
      const [inicioHoras, inicioMinutos] = value.split(':').map(Number)
      const [finHoras, finMinutos] = newData.hora_fin.split(':').map(Number)
      
      const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos
      const finTotalMinutos = finHoras * 60 + finMinutos
      
      if (finTotalMinutos <= inicioTotalMinutos) {
        newData.hora_fin = ''
      }
    }
    
    setFormData(newData)
    
    // Limpiar error cuando el usuario cambia el valor
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  // Generar opciones de tiempo en intervalos de 15 minutos
  const generateTimeOptions = (currentValue?: string) => {
    const options = []
    const timeValues = new Set<string>()
    
    // Generar tiempos en intervalos de 15 minutos
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        timeValues.add(timeString)
        options.push(
          <option key={timeString} value={timeString}>
            {timeString}
          </option>
        )
      }
    }
    
    // Si hay un valor actual que no está en las opciones, agregarlo
    if (currentValue && !timeValues.has(currentValue)) {
      options.unshift(
        <option key={`current-${currentValue}`} value={currentValue}>
          {currentValue} (actual)
        </option>
      )
    }
    
    return options
  }

  // Filtrar opciones de hora fin basadas en la hora de inicio
  const getFilteredEndTimeOptions = () => {
    if (!formData.hora_inicio) {
      return generateTimeOptions(formData.hora_fin)
    }
    
    // Verificar que la hora de inicio tenga el formato correcto
    if (!formData.hora_inicio.includes(':')) {
      return generateTimeOptions(formData.hora_fin)
    }
    
    const [inicioHoras, inicioMinutos] = formData.hora_inicio.split(':').map(Number)
    const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos
    
    const allOptions = generateTimeOptions(formData.hora_fin)
    
    return allOptions.filter(option => {
      const optionValue = option.props.value
      // Verificar que la opción tenga el formato correcto
      if (!optionValue.includes(':')) {
        return true
      }
      
      const [finHoras, finMinutos] = optionValue.split(':').map(Number)
      const finTotalMinutos = finHoras * 60 + finMinutos
      
      return finTotalMinutos > inicioTotalMinutos
    })
  }

  if (!isOpen) return null

  return (
    <div className="v2-overlay" onClick={onClose}>
      <div className="v2-modal" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">
            {initialData ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
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
              <CustomDatePicker
                value={formData.fecha}
                onChange={(date) => handleInputChange('fecha', date)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="v2-label">Tipo de Bloqueo</label>
              <select
                className="v2-select"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
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
                  <select
                    className={`v2-select ${errors.hora_inicio ? 'v2-input-error' : ''}`}
                    value={formData.hora_inicio}
                    onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    {generateTimeOptions(formData.hora_inicio)}
                  </select>
                  {errors.hora_inicio && (
                    <p className="v2-error-message">{errors.hora_inicio}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Valor actual: "{formData.hora_inicio}"</p>
                </div>
                <div>
                  <label className="v2-label">Hora Fin</label>
                  <select
                    className={`v2-select ${errors.hora_fin ? 'v2-input-error' : ''}`}
                    value={formData.hora_fin}
                    onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                    required
                    disabled={!formData.hora_inicio}
                  >
                    <option value="">Seleccionar hora</option>
                    {getFilteredEndTimeOptions()}
                  </select>
                  {errors.hora_fin && (
                    <p className="v2-error-message">{errors.hora_fin}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Valor actual: "{formData.hora_fin}"</p>
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="v2-label">Motivo (opcional)</label>
              <textarea
                className="v2-textarea"
                value={formData.motivo}
                onChange={(e) => handleInputChange('motivo', e.target.value)}
                rows={3}
                placeholder="Ej: Capacitación, Reunión familiar, etc."
              />
            </div>

            {/* Estado (solo para edición) */}
            {initialData && (
              <div>
                <label className="v2-label">Estado</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="v2-checkbox"
                      checked={formData.activo === true}
                      onChange={(e) => handleInputChange('activo', e.target.checked.toString())}
                    />
                    <span className="ml-2">Activo</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción dentro del formulario */}
          <div className="v2-modal-footer">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
