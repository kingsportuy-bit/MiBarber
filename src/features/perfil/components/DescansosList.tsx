'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { formatTime, diasSemanaNombres } from '../utils/formatters'
import { DescansoModalForm } from './DescansoModalForm'
import type { Descanso, DescansoInput } from '../types'
import { getLocalDateString } from '@/shared/utils/dateUtils'

interface Props {
  barberoId: string
  barberiaId: string
  sucursalId: string
}

// Hook personalizado para obtener todos los descansos (activos e inactivos)
function useTodosDescansos(barberoId: string, barberiaId: string) {
  return useQuery({
    queryKey: ['todos-descansos', barberoId, barberiaId],
    queryFn: async (): Promise<Descanso[]> => {
      const { data } = await supabase
        .from('mibarber_descansos_extra')
        .select('*')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .order('creado_at', { ascending: false })

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Mutations para crear, actualizar y eliminar descansos
function useMutationsDescansos(barberoId: string, barberiaId: string, sucursalId: string) {
  const queryClient = useQueryClient()
  
  const crearDescanso = useMutation({
    mutationFn: async (input: DescansoInput) => {
      const { data, error } = await supabase
        .from('mibarber_descansos_extra')
        .insert({
          id_barbero: barberoId,
          id_barberia: barberiaId,
          id_sucursal: sucursalId,
          hora_inicio: input.hora_inicio,
          hora_fin: input.hora_fin,
          dias_semana: input.dias_semana.join(','),
          motivo: input.motivo || null,
          activo: input.activo !== undefined ? input.activo : true,
          creado_por: barberoId, // Usar el mismo barbero como creador
          creado_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-descansos', barberoId, barberiaId] })
    }
  })

  const actualizarDescanso = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: DescansoInput }) => {
      // Preparar objeto de actualización excluyendo campos undefined
      const updateData: any = {}
      
      // Solo incluir campos que no sean undefined
      if (input.hora_inicio !== undefined) {
        updateData.hora_inicio = input.hora_inicio
      }
      if (input.hora_fin !== undefined) {
        updateData.hora_fin = input.hora_fin
      }
      if (input.dias_semana !== undefined) {
        updateData.dias_semana = input.dias_semana.join(',')
      }
      if (input.motivo !== undefined) {
        updateData.motivo = input.motivo || null
      }
      if (input.activo !== undefined) {
        updateData.activo = input.activo
      }

      const { data, error } = await supabase
        .from('mibarber_descansos_extra')
        .update(updateData)
        .eq('id', id)
        .eq('id_barbero', barberoId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-descansos', barberoId, barberiaId] })
    }
  })

  const eliminarDescanso = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mibarber_descansos_extra')
        .delete()
        .eq('id', id)
        .eq('id_barbero', barberoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-descansos', barberoId, barberiaId] })
    }
  })

  return {
    crearDescanso,
    actualizarDescanso,
    eliminarDescanso
  }
}

export function DescansosList({ barberoId, barberiaId, sucursalId }: Props) {
  const { data: descansos, isLoading } = useTodosDescansos(barberoId, barberiaId)
  const { eliminarDescanso, crearDescanso, actualizarDescanso } = useMutationsDescansos(barberoId, barberiaId, sucursalId)
  const [modalOpen, setModalOpen] = useState(false)
  const [descansoEditar, setDescansoEditar] = useState<Descanso | null>(null)
  const [inactivosExpandidos, setInactivosExpandidos] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [descansoAEliminar, setDescansoAEliminar] = useState<Descanso | null>(null)

  // Separar descansos activos e inactivos
  const descansosActivos = descansos?.filter((d: Descanso) => d.activo) || []
  const descansosInactivos = descansos?.filter((d: Descanso) => !d.activo) || []

  const handleNuevo = () => {
    setDescansoEditar(null)
    setModalOpen(true)
  }

  const handleEditar = (descanso: Descanso) => {
    setDescansoEditar(descanso)
    setModalOpen(true)
  }

  const handleEliminar = async (descanso: Descanso) => {
    setDescansoAEliminar(descanso)
    setConfirmModalOpen(true)
  }

  const handleConfirmEliminar = async () => {
    if (descansoAEliminar) {
      try {
        await eliminarDescanso.mutateAsync(descansoAEliminar.id)
      } catch (error) {
        console.error('Error al eliminar descanso:', error)
      } finally {
        setConfirmModalOpen(false)
        setDescansoAEliminar(null)
      }
    }
  }

  const handleCancelEliminar = () => {
    setConfirmModalOpen(false)
    setDescansoAEliminar(null)
  }

  // Nueva función para activar/desactivar descansos
  const handleToggleActivo = async (id: string, activo: boolean) => {
    // Encontrar el descanso completo para mantener los otros campos
    const descanso = [...(descansosActivos || []), ...(descansosInactivos || [])].find((d: Descanso) => d.id === id);
    if (!descanso) return;

    await actualizarDescanso.mutateAsync({ 
      id, 
      input: { 
        hora_inicio: descanso.hora_inicio,
        hora_fin: descanso.hora_fin,
        dias_semana: descanso.dias_semana.split(','),
        motivo: descanso.motivo || undefined,
        activo: !activo // Toggle del estado actual
      }
    });
  }

  const handleGuardarDescanso = async (descansoData: any) => {
    if (descansoEditar) {
      await actualizarDescanso.mutateAsync({ id: descansoEditar.id, input: descansoData });
    } else {
      await crearDescanso.mutateAsync(descansoData);
    }
    setModalOpen(false);
  };

  // Función para renderizar una sección de descansos dentro de la misma tarjeta
  const renderSeccionDescansos = (descansosLista: Descanso[], titulo: string, esInactivos: boolean = false) => (
    <div className="mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => esInactivos && setInactivosExpandidos(!inactivosExpandidos)}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {titulo} ({descansosLista.length})
        </h3>
        {esInactivos && (
          <span className="transform transition-transform">
            {inactivosExpandidos ? '▲' : '▼'}
          </span>
        )}
      </div>
      
      {(!esInactivos || inactivosExpandidos) && (
        descansosLista.length > 0 ? (
          <div className="overflow-x-auto mt-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Horario</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Días</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Motivo</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Estado</th>
                  <th className="text-center p-3 text-sm font-semibold text-[var(--text-secondary)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {descansosLista.map((descanso) => (
                  <tr key={descanso.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 text-sm text-[var(--text-primary)]">
                      {formatTime(descanso.hora_inicio)} - {formatTime(descanso.hora_fin)}
                    </td>
                    <td className="p-3 text-sm">
                      <span className="v2-badge v2-badge-info">
                        {diasSemanaNombres(descanso.dias_semana)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-muted)]">
                      {descanso.motivo || '-'}
                    </td>
                    <td className="p-3 text-sm">
                      {descanso.activo ? (
                        <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {/* Botones de acciones estandarizados con SVG como en la pestaña clientes */}
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-300 bg-transparent !bg-none border-none p-1"
                          onClick={() => handleEditar(descanso)}
                          title="Editar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        
                        {/* Mostrar botón de desactivar/activar */}
                        <button 
                          className={`${descanso.activo ? 'text-red-500 hover:text-red-300' : 'text-green-500 hover:text-green-300'} bg-transparent !bg-none border-none p-1`}
                          onClick={() => handleToggleActivo(descanso.id, descanso.activo)}
                          title={descanso.activo ? "Desactivar" : "Activar"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {descanso.activo ? (
                              // Icono de desactivar (X)
                              <>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </>
                            ) : (
                              // Icono de activar (check)
                              <>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                        
                        {/* Mostrar botón de eliminar solo para descansos inactivos */}
                        {!descanso.activo && (
                          <button 
                            className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                            onClick={() => handleEliminar(descanso)}
                            disabled={eliminarDescanso.isPending}
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center bg-[var(--bg-secondary)] rounded-lg mt-3">
            <p className="text-[var(--text-muted)]">
              {titulo.includes('Activos') 
                ? 'No hay descansos activos programados' 
                : 'No hay descansos inactivos'}
            </p>
          </div>
        )
      )}
    </div>
  );

  if (isLoading) {
    return (
      <Card className="mb-6">
        <div className="v2-skeleton h-64" />
      </Card>
    )
  }

  return (
    <>
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Descansos Recurrentes
          </h2>
          <Button variant="primary" onClick={handleNuevo}>
            + Nuevo Descanso
          </Button>
        </div>
        
        <div className="p-4">
          {/* Sección de Descansos Activos */}
          {renderSeccionDescansos(descansosActivos, 'Descansos Activos')}
          
          {/* Separador entre secciones */}
          {descansosActivos.length > 0 && descansosInactivos.length > 0 && (
            <div className="border-t border-[var(--border-primary)] my-6"></div>
          )}
          
          {/* Sección de Descansos Inactivos (colapsable) */}
          {renderSeccionDescansos(descansosInactivos, 'Descansos Inactivos', true)}
        </div>
      </Card>
      
      <DescansoModalForm
        isOpen={modalOpen}
        initialData={descansoEditar}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGuardarDescanso}
      />
      
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar este descanso?`}
        onCancel={handleCancelEliminar}
        onConfirm={handleConfirmEliminar}
      />
    </>
  )
}