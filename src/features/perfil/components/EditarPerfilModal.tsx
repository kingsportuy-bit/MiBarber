'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Barbero } from '@/types/db'

interface Servicio {
  id_servicio: string
  nombre: string
  precio: number
}

interface EditarPerfilModalProps {
  barbero: Barbero
  onClose: () => void
}

interface FormData {
  telefono: string
  email: string
  username: string
  password: string
  confirmPassword: string
  servicios: string[]
}

export function EditarPerfilModal({ barbero, onClose }: EditarPerfilModalProps) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<FormData>({
    telefono: barbero.telefono || '',
    email: barbero.email || '',
    username: barbero.username || '',
    password: '',
    confirmPassword: '',
    servicios: Array.isArray(barbero.especialidades) ? barbero.especialidades : []
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Obtener servicios de la sucursal
  const { data: serviciosDisponibles } = useQuery({
    queryKey: ['servicios-sucursal', barbero.id_sucursal],
    queryFn: async () => {
      const { data } = await supabase
        .from('mibarber_servicios')
        .select('id_servicio, nombre, precio')
        .eq('id_barberia', barbero.id_barberia || '')
        .eq('id_sucursal', barbero.id_sucursal || '')
        .eq('activo', true)
        .order('nombre')

      return data || []
    },
    enabled: !!barbero.id_sucursal
  })

  // Obtener datos actualizados del barbero para asegurar que tenemos las especialidades correctas
  const { data: barberoActualizado } = useQuery({
    queryKey: ['barbero-actualizado', barbero.id_barbero],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mibarber_barberos')
        .select('*')
        .eq('id_barbero', barbero.id_barbero)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!barbero.id_barbero
  })

  // Actualizar formData cuando se carguen los datos del barbero actualizado
  useEffect(() => {
    if (barberoActualizado) {
      setFormData(prev => ({
        ...prev,
        telefono: barberoActualizado.telefono || prev.telefono,
        email: barberoActualizado.email || prev.email,
        username: barberoActualizado.username || prev.username,
        servicios: Array.isArray(barberoActualizado.especialidades) 
          ? barberoActualizado.especialidades 
          : prev.servicios
      }))
    }
  }, [barberoActualizado])

  const actualizarPerfil = useMutation({
    mutationFn: async (data: FormData) => {
      // Validaciones
      const newErrors: Partial<FormData> = {}

      if (!data.telefono.trim()) {
        newErrors.telefono = 'El teléfono es requerido'
      }

      if (!data.email.trim()) {
        newErrors.email = 'El email es requerido'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Email inválido'
      }

      if (!data.username.trim()) {
        newErrors.username = 'El usuario es requerido'
      }

      if (data.password && data.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (data.password && data.password !== data.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        throw new Error('Errores de validación')
      }

      setErrors({})

      // Actualizar datos del barbero
      const updateData: any = {
        telefono: data.telefono,
        email: data.email,
        username: data.username,
        especialidades: data.servicios
      }

      // Solo actualizar password si se proporcionó uno nuevo
      if (data.password) {
        // Aquí deberías hashear la contraseña
        // updateData.password_hash = await hashPassword(data.password)
        updateData.password_hash = data.password // TEMPORAL: En producción usar bcrypt
      }

      const { error } = await supabase
        .from('mibarber_barberos')
        .update(updateData)
        .eq('id_barbero', barbero.id_barbero)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barbero'] })
      queryClient.invalidateQueries({ queryKey: ['servicios-barbero'] })
      queryClient.invalidateQueries({ queryKey: ['barbero-completo'] })
      queryClient.invalidateQueries({ queryKey: ['barbero-actualizado'] })
      // Eliminar la alerta y simplemente cerrar el modal
      onClose()
    },
    onError: (error) => {
      console.error('Error al actualizar perfil:', error)
      if (error.message !== 'Errores de validación') {
        alert('Error al actualizar el perfil')
      }
    }
  })

  const toggleServicio = (servicioId: string) => {
    if (formData.servicios.includes(servicioId)) {
      setFormData({
        ...formData,
        servicios: formData.servicios.filter(id => id !== servicioId)
      })
    } else {
      setFormData({
        ...formData,
        servicios: [...formData.servicios, servicioId]
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    actualizarPerfil.mutate(formData)
  }

  return (
    <div className="v2-overlay" onClick={onClose}>
      <div
        className="v2-modal"
        style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="v2-modal-header">
          <h2 className="v2-modal-title">Editar Perfil</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl" >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4">
            {/* Teléfono */}
            <div>
              <label className="v2-label">Teléfono *</label>
              <input
                type="tel"
                className="v2-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+598 99 123 456"
              />
              {errors.telefono && (
                <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="v2-label">Email *</label>
              <input
                type="email"
                className="v2-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="barbero@ejemplo.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Usuario */}
            <div>
              <label className="v2-label">Usuario *</label>
              <input
                type="text"
                className="v2-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario123"
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="v2-label">Nueva Contraseña (dejar vacío para no cambiar)</label>
              <input
                type="password"
                className="v2-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="- - - - - - - - "
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            {formData.password && (
              <div>
                <label className="v2-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="v2-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="- - - - - - - - "
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Servicios */}
            <div>
              <label className="v2-label">Servicios que ofreces</label>
              <div className="max-h-[200px] overflow-y-auto v2-scrollbar border border-[var(--border-primary)] rounded-lg p-3 mt-2">
                {serviciosDisponibles && serviciosDisponibles.length > 0 ? (
                  <div className="space-y-2">
                    {serviciosDisponibles.map((servicio) => (
                      <label 
                        key={servicio.id_servicio}
                        className="flex items-center gap-3 p-2 hover:bg-[var(--bg-hover)] rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.servicios.includes(servicio.id_servicio)}
                          onChange={() => toggleServicio(servicio.id_servicio)}
                          className="v2-checkbox"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-[var(--text-primary)]">
                            {servicio.nombre}
                          </span>
                          <span className="text-sm text-[var(--text-muted)]">
                            ${servicio.precio}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] text-center py-4">
                    No hay servicios disponibles en esta sucursal
                  </p>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Seleccionados: {formData.servicios.length}
              </p>
            </div>
          </div>
        </form>

        <div className="v2-modal-footer">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={actualizarPerfil.isPending}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit as any}
            disabled={actualizarPerfil.isPending}
          >
            {actualizarPerfil.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}