'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { formatDate, formatTime } from '../utils/formatters'
import { BloqueoModalForm } from './BloqueoModalForm'
import type { Bloqueo, BloqueoInput } from '../types'

interface Props {
  barberoId: string
  barberiaId: string
  sucursalId: string
}

// Hook personalizado para obtener todos los bloqueos (activos e inactivos)
function useTodosBloqueos(barberoId: string, barberiaId: string) {
  return useQuery({
    queryKey: ['todos-bloqueos', barberoId, barberiaId],
    queryFn: async (): Promise<Bloqueo[]> => {
      // Calcular la fecha de hace 30 días
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      const { data } = await supabase
        .from('mibarber_bloqueos_barbero')
        .select('*')
        .eq('id_barbero', barberoId)
        .eq('id_barberia', barberiaId)
        .gte('fecha', hace30Dias.toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true, nullsFirst: false })

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

// Mutations para crear, actualizar y eliminar bloqueos
function useMutationsBloqueos(barberoId: string, barberiaId: string, sucursalId: string) {
  const queryClient = useQueryClient()
  
  const crearBloqueo = useMutation({
    mutationFn: async (input: BloqueoInput) => {
      const { data, error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .insert({
          id_barbero: barberoId,
          id_barberia: barberiaId,
          id_sucursal: sucursalId,
          fecha: input.fecha,
          hora_inicio: input.hora_inicio || null,
          hora_fin: input.hora_fin || null,
          tipo: input.tipo,
          motivo: input.motivo || null,
          activo: input.activo !== undefined ? input.activo : true,
          creado_por: barberoId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-bloqueos', barberoId, barberiaId] })
    }
  })

  const actualizarBloqueo = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: BloqueoInput }) => {
      // Preparar objeto de actualización excluyendo campos undefined
      const updateData: any = {
        fecha: input.fecha,
        tipo: input.tipo
      };
      
      // Solo incluir campos que no sean undefined
      if (input.hora_inicio !== undefined) {
        updateData.hora_inicio = input.hora_inicio || null;
      }
      if (input.hora_fin !== undefined) {
        updateData.hora_fin = input.hora_fin || null;
      }
      if (input.motivo !== undefined) {
        updateData.motivo = input.motivo || null;
      }
      if (input.activo !== undefined) {
        updateData.activo = input.activo;
      }

      const { data, error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .update(updateData)
        .eq('id', id)
        .eq('id_barbero', barberoId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-bloqueos', barberoId, barberiaId] })
    }
  })

  const eliminarBloqueo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mibarber_bloqueos_barbero')
        .delete()
        .eq('id', id)
        .eq('id_barbero', barberoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-bloqueos', barberoId, barberiaId] })
    }
  })

  return {
    crearBloqueo,
    actualizarBloqueo,
    eliminarBloqueo
  }
}

export function BloqueosTable({ barberoId, barberiaId, sucursalId }: Props) {
  const { data: bloqueos, isLoading } = useTodosBloqueos(barberoId, barberiaId)
  const { eliminarBloqueo, crearBloqueo, actualizarBloqueo } = useMutationsBloqueos(barberoId, barberiaId, sucursalId)
  const [modalOpen, setModalOpen] = useState(false)
  const [bloqueoEditar, setBloqueoEditar] = useState<Bloqueo | null>(null)
  const [inactivosExpandidos, setInactivosExpandidos] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [bloqueoAEliminar, setBloqueoAEliminar] = useState<Bloqueo | null>(null)

  // Separar bloqueos activos e inactivos
  const bloqueosActivos = bloqueos?.filter((b: Bloqueo) => b.activo) || []
  const bloqueosInactivos = bloqueos?.filter((b: Bloqueo) => !b.activo) || []

  const handleNuevo = () => {
    setBloqueoEditar(null)
    setModalOpen(true)
  }

  const handleEditar = (bloqueo: Bloqueo) => {
    setBloqueoEditar(bloqueo)
    setModalOpen(true)
  }

  const handleEliminar = async (bloqueo: Bloqueo) => {
    setBloqueoAEliminar(bloqueo)
    setConfirmModalOpen(true)
  }

  const handleConfirmEliminar = async () => {
    if (bloqueoAEliminar) {
      try {
        await eliminarBloqueo.mutateAsync(bloqueoAEliminar.id)
      } catch (error) {
        console.error('Error al eliminar bloqueo:', error)
      } finally {
        setConfirmModalOpen(false)
        setBloqueoAEliminar(null)
      }
    }
  }

  const handleCancelEliminar = () => {
    setConfirmModalOpen(false)
    setBloqueoAEliminar(null)
  }

  // Nueva función para activar/desactivar bloqueos
  const handleToggleActivo = async (id: string, activo: boolean) => {
    // Encontrar el bloqueo completo para mantener los otros campos
    const bloqueo = [...(bloqueosActivos || []), ...(bloqueosInactivos || [])].find((b: Bloqueo) => b.id === id);
    if (!bloqueo) return;

    await actualizarBloqueo.mutateAsync({ 
      id, 
      input: { 
        fecha: bloqueo.fecha,
        tipo: bloqueo.tipo,
        hora_inicio: bloqueo.hora_inicio || undefined,
        hora_fin: bloqueo.hora_fin || undefined,
        motivo: bloqueo.motivo || undefined,
        activo: !activo // Toggle del estado actual
      }
    });
  }

  const handleGuardarBloqueo = async (bloqueoData: any) => {
    if (bloqueoEditar) {
      await actualizarBloqueo.mutateAsync({ id: bloqueoEditar.id, input: bloqueoData });
    } else {
      await crearBloqueo.mutateAsync(bloqueoData);
    }
    setModalOpen(false);
  };

  // Función para renderizar una sección de bloqueos dentro de la misma tarjeta
  const renderSeccionBloqueos = (bloqueosLista: Bloqueo[], titulo: string, esInactivos: boolean = false) => (
    <div className="mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => esInactivos && setInactivosExpandidos(!inactivosExpandidos)}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {titulo} ({bloqueosLista.length})
        </h3>
        {esInactivos && (
          <span className="transform transition-transform">
            {inactivosExpandidos ? '▲' : '▼'}
          </span>
        )}
      </div>
      
      {(!esInactivos || inactivosExpandidos) && (
        bloqueosLista.length > 0 ? (
          <div className="overflow-x-auto mt-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Fecha</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Tipo</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Horario</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Motivo</th>
                  <th className="text-left p-3 text-sm font-semibold text-[var(--text-secondary)]">Estado</th>
                  <th className="text-center p-3 text-sm font-semibold text-[var(--text-secondary)]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {bloqueosLista.map((bloqueo) => (
                  <tr key={bloqueo.id} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 text-sm text-[var(--text-primary)]">
                      {formatDate(bloqueo.fecha)}
                    </td>
                    <td className="p-3 text-sm">
                      {/* Nuevas etiquetas más visibles */}
                      {bloqueo.tipo === 'bloqueo_dia' ? (
                        <span className="inline-block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          DÍA COMPLETO
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                          HORAS
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">
                      {bloqueo.tipo === 'bloqueo_dia' 
                        ? 'Todo el día' 
                        : `${formatTime(bloqueo.hora_inicio!)} - ${formatTime(bloqueo.hora_fin!)}`
                      }
                    </td>
                    <td className="p-3 text-sm text-[var(--text-muted)]">
                      {bloqueo.motivo || '-'}
                    </td>
                    <td className="p-3 text-sm">
                      {bloqueo.activo ? (
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
                          onClick={() => handleEditar(bloqueo)}
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
                          className={`${bloqueo.activo ? 'text-red-500 hover:text-red-300' : 'text-green-500 hover:text-green-300'} bg-transparent !bg-none border-none p-1`}
                          onClick={() => handleToggleActivo(bloqueo.id, bloqueo.activo)}
                          title={bloqueo.activo ? "Desactivar" : "Activar"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {bloqueo.activo ? (
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
                        
                        {/* Mostrar botón de eliminar solo para bloqueos inactivos */}
                        {!bloqueo.activo && (
                          <button 
                            className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                            onClick={() => handleEliminar(bloqueo)}
                            disabled={eliminarBloqueo.isPending}
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
                ? 'No hay bloqueos activos programados' 
                : 'No hay bloqueos inactivos'}
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
            Bloqueos de Horarios
          </h2>
          <Button variant="primary" onClick={handleNuevo}>
            + Nuevo Bloqueo
          </Button>
        </div>
        
        <div className="p-4">
          {/* Sección de Bloqueos Activos */}
          {renderSeccionBloqueos(bloqueosActivos, 'Bloqueos Activos')}
          
          {/* Separador entre secciones */}
          {bloqueosActivos.length > 0 && bloqueosInactivos.length > 0 && (
            <div className="border-t border-[var(--border-primary)] my-6"></div>
          )}
          
          {/* Sección de Bloqueos Inactivos (colapsable) */}
          {renderSeccionBloqueos(bloqueosInactivos, 'Bloqueos Inactivos', true)}
        </div>
      </Card>
      
      <BloqueoModalForm
        isOpen={modalOpen}
        initialData={bloqueoEditar}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGuardarBloqueo}
      />
      
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar este bloqueo?`}
        onCancel={handleCancelEliminar}
        onConfirm={handleConfirmEliminar}
      />
    </>
  )
}
