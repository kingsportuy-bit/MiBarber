'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/app-checkbox'
import type { Descanso } from '../types'

interface Props {
  isOpen: boolean
  initialData: Descanso | null
  onClose: () => void
  onSubmit: (descansoData: any) => Promise<void>
}

// Corregido el orden para coincidir con: [lunes, martes, ..., domingo]
const DIAS_SEMANA = [
  { value: '0', label: 'Lun' },
  { value: '1', label: 'Mar' },
  { value: '2', label: 'Mié' },
  { value: '3', label: 'Jue' },
  { value: '4', label: 'Vie' },
  { value: '5', label: 'Sáb' },
  { value: '6', label: 'Dom' }
]

export function DescansoModalForm({ isOpen, initialData, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    hora_inicio: '',
    hora_fin: '',
    dias_semana: [] as string[],
    motivo: '',
    activo: true
  })

  const [errors, setErrors] = useState<{ hora_inicio?: string, hora_fin?: string }>({})

  useEffect(() => {
    console.log('initialData changed:', initialData);
    if (initialData) {
      // Procesar dias_semana para manejar ambos formatos
      let diasSeleccionados: string[] = [];

      try {
        // Intentar parsear como JSON (array de booleanos)
        const diasArray = JSON.parse(initialData.dias_semana);

        if (Array.isArray(diasArray) && diasArray.every(item => typeof item === 'boolean')) {
          // Convertir array de booleanos a índices
          diasSeleccionados = diasArray
            .map((activo, index) => activo ? index.toString() : null)
            .filter((index): index is string => index !== null);
        } else {
          // Si no es un array de booleanos, usar el formato de índices separados por comas
          diasSeleccionados = initialData.dias_semana.split(',');
        }
      } catch (e) {
        // Si falla el parseo JSON, usar el formato de índices separados por comas
        diasSeleccionados = initialData.dias_semana.split(',');
      }

      console.log('Setting form data with:', {
        hora_inicio: initialData.hora_inicio,
        hora_fin: initialData.hora_fin,
        dias_semana: diasSeleccionados
      });

      setFormData({
        hora_inicio: initialData.hora_inicio,
        hora_fin: initialData.hora_fin,
        dias_semana: diasSeleccionados,
        motivo: initialData.motivo || '',
        activo: initialData.activo !== undefined ? initialData.activo : true
      })
    } else {
      setFormData({
        hora_inicio: '',
        hora_fin: '',
        dias_semana: [],
        motivo: '',
        activo: true
      })
    }
  }, [initialData])

  const validateHorarios = () => {
    const newErrors: typeof errors = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.dias_semana.length === 0) {
      alert('Debes seleccionar al menos un día')
      return
    }

    if (validateHorarios()) {
      await onSubmit({
        ...formData,
        dias_semana: formData.dias_semana
      })
    }
  }

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

  const handleInputChange = (field: string, value: string | boolean) => {
    // Si se cambia la hora de inicio, limpiar la hora de fin si ya no es válida
    if (field === 'hora_inicio' && formData.hora_fin) {
      const [inicioHoras, inicioMinutos] = (value as string).split(':').map(Number)
      const [finHoras, finMinutos] = formData.hora_fin.split(':').map(Number)

      const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos
      const finTotalMinutos = finHoras * 60 + finMinutos

      if (finTotalMinutos <= inicioTotalMinutos) {
        setFormData({
          ...formData,
          [field]: value,
          hora_fin: ''
        } as any)
      } else {
        setFormData({
          ...formData,
          [field]: value
        } as any)
      }
    } else {
      setFormData({
        ...formData,
        [field]: value
      } as any)
    }

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

  console.log('Rendering modal with formData:', formData);

  return (
    <div className="v2-overlay" onClick={onClose}>
      <div className="v2-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
            {initialData ? 'Editar Descanso' : 'Nuevo Descanso'}
          </h2>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            {/* Horarios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Hora Inicio</label>
                <select
                  className={`app-input ${errors.hora_inicio ? 'border-red-500' : ''}`}
                  value={formData.hora_inicio}
                  onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                  required
                >
                  <option value="" className="bg-black text-white">Seleccionar hora</option>
                  {generateTimeOptions(formData.hora_inicio)}
                </select>
                {errors.hora_inicio && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_inicio}</p>
                )}
                <p className="text-[11px] text-[#555] mt-1">Valor actual: "{formData.hora_inicio}"</p>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Hora Fin</label>
                <select
                  className={`app-input ${errors.hora_fin ? 'border-red-500' : ''}`}
                  value={formData.hora_fin}
                  onChange={(e) => handleInputChange('hora_fin', e.target.value)}
                  required
                  disabled={!formData.hora_inicio}
                >
                  <option value="" className="bg-black text-white">Seleccionar hora</option>
                  {getFilteredEndTimeOptions()}
                </select>
                {errors.hora_fin && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_fin}</p>
                )}
                <p className="text-[11px] text-[#555] mt-1">Valor actual: "{formData.hora_fin}"</p>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Días de la semana</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`
                      px-3 py-2 rounded text-sm font-semibold transition-colors
                      ${formData.dias_semana.includes(dia.value)
                        ? 'bg-[#C5A059] text-black'
                        : 'bg-[#1a1a1a] text-[#8a8a8a] border border-[#333] hover:border-[#C5A059]'
                      }
                    `}
                  >
                    {dia.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Motivo (opcional)</label>
              <textarea
                className="app-input min-h-[80px] resize-none"
                value={formData.motivo}
                onChange={(e) => handleInputChange('motivo', e.target.value)}
                rows={3}
                placeholder="Ej: Almuerzo, Descanso, etc."
              />
            </div>

            {/* Estado (solo para edición) */}
            {initialData && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">Estado</label>
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={formData.activo === true}
                    onChange={(e) => handleInputChange('activo', e.target.checked)}
                    label="Activo"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="app-btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}