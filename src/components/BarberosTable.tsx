"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberoStats } from "@/hooks/useBarberoStats";
import { Barbero } from "@/types/db";
import { BarberoModal } from "@/components/BarberoModal";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";
import { TableLayout } from "@/components/TableLayout";

interface BarberosTableProps {
  barberos: Barbero[] | undefined;
  isLoading: boolean;
  sucursal?: number; // Nueva prop para la sucursal
}

export function BarberosTable({ barberos, isLoading, sucursal }: BarberosTableProps) {
  const { createBarbero, updateBarbero, deleteBarbero } = useBarberos();
  const { stats: barberoStats, isLoading: statsLoading } = useBarberoStats();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberoToEdit, setBarberoToEdit] = useState<Barbero | null>(null);
  const [barberoToDelete, setBarberoToDelete] = useState<Barbero | null>(null);
  // Estado para el barbero seleccionado (usar nombre en lugar de ID)
  const [selectedBarberoName, setSelectedBarberoName] = useState<string | null>(null);

  // Efecto para seleccionar automáticamente el primer barbero al cargar
  useEffect(() => {
    if (barberos && barberos.length > 0 && !selectedBarberoName) {
      setSelectedBarberoName(barberos[0].nombre);
    }
  }, [barberos, selectedBarberoName]);

  // Efecto para escuchar el evento de apertura del modal
  useEffect(() => {
    const handleOpenModal = () => {
      setBarberoToEdit(null);
      setIsModalOpen(true);
    };

    window.addEventListener('openBarberoModal', handleOpenModal);
    return () => {
      window.removeEventListener('openBarberoModal', handleOpenModal);
    };
  }, []);

  const handleEdit = (barbero: Barbero) => {
    setBarberoToEdit(barbero);
    setIsModalOpen(true);
  };

  const handleDelete = (barbero: Barbero) => {
    setBarberoToDelete(barbero);
  };

  const confirmDelete = async () => {
    if (barberoToDelete) {
      try {
        await deleteBarbero.mutateAsync(barberoToDelete.id_barbero.toString());
        toast.success('Barbero eliminado correctamente');
        setBarberoToDelete(null);
        // refetch no es necesario, se invalida automáticamente
      } catch (error) {
        toast.error('Error al eliminar el barbero');
      }
    }
  };

  const handleSave = async (values: Omit<Barbero, "id_barbero" | "fecha_creacion">) => {
    try {
      if (barberoToEdit) {
        // Editar barbero existente
        await updateBarbero.mutateAsync({
          id_barbero: barberoToEdit.id_barbero.toString(),
          ...values
        } as any);
        toast.success("Barbero actualizado correctamente");
      } else {
        // Crear nuevo barbero
        await createBarbero.mutateAsync(values);
        toast.success("Barbero creado correctamente");
      }
      setIsModalOpen(false);
      setBarberoToEdit(null);
      // refetch no es necesario, se invalida automáticamente
    } catch (error) {
      console.error("Error saving barbero:", error);
      toast.error("Error al guardar el barbero");
    }
  };

  // Filtrar barberos por sucursal si se proporciona
  const filteredBarberos = sucursal 
    ? barberos?.filter(barbero => {
        // En este caso, como no hay una relación directa en la BD,
        // mostramos todos los barberos para todas las sucursales
        // En una implementación futura, se podría agregar un campo sucursal a la tabla barberos
        return true;
      }) 
    : barberos;

  // Filtrar estadísticas por barbero seleccionado (según la especificación)
  const selectedBarberoStats = selectedBarberoName 
    ? barberoStats?.find(stat => stat.nombre === selectedBarberoName)
    : null;

  return (
    <div className="space-y-6">
      {/* Botón para agregar barbero */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            // Disparar evento personalizado para abrir el modal
            window.dispatchEvent(new CustomEvent('openBarberoModal'));
          }}
          className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Barbero</span>
        </button>
      </div>

      {/* Tabla de barberos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-qoder-dark-border-primary">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Nombre</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Teléfono</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Email</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Especialidades</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Estado</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-3 py-2 text-qoder-dark-text-primary" colSpan={6}>Cargando…</td></tr>
            )}
            {filteredBarberos?.map((barbero) => (
              <tr 
                key={barbero.id_barbero} 
                className={`border-t border-qoder-dark-border-primary hover:bg-qoder-dark-bg-hover transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
                  selectedBarberoName === barbero.nombre ? 'bg-qoder-dark-bg-hover' : ''
                }`}
                onClick={() => setSelectedBarberoName(barbero.nombre)}
              >
                <td className="px-3 py-2 font-medium text-qoder-dark-text-primary rounded-l-lg bg-qoder-dark-bg-secondary">{barbero.nombre}</td>
                <td className="px-3 py-2 text-qoder-dark-text-primary bg-qoder-dark-bg-secondary">{barbero.telefono}</td>
                <td className="px-3 py-2 text-qoder-dark-text-primary bg-qoder-dark-bg-secondary">{barbero.email}</td>
                <td className="px-3 py-2 bg-qoder-dark-bg-secondary">
                  <div className="flex flex-wrap gap-1">
                    {barbero.especialidades && barbero.especialidades.map((esp, index) => (
                      <span key={index} className="bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary text-xs px-2 py-1 rounded">
                        {esp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 bg-qoder-dark-bg-secondary">
                  <span className={`px-2 py-1 rounded text-xs ${
                    barbero.activo 
                      ? "bg-green-900 text-green-300" 
                      : "bg-red-900 text-red-300"
                  }`}>
                    {barbero.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3 py-2 bg-qoder-dark-bg-secondary rounded-r-lg">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(barbero); }}
                      className="text-blue-500 hover:text-blue-300 bg-transparent !bg-none border-none p-1"
                      title="Editar barbero"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(barbero); }}
                      className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                      title="Eliminar barbero"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filteredBarberos?.length === 0 && (
              <tr>
                <td className="px-3 py-2 text-qoder-dark-text-primary" colSpan={6}>
                  No hay barberos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Estadísticas del barbero seleccionado (según la especificación) */}
      {selectedBarberoName && selectedBarberoStats && (
        <div className="qoder-dark-card p-4">
          <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">
            Estadísticas de {selectedBarberoName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Turnos Atendidos"
              value={selectedBarberoStats.turnos_atendidos.toString()}
              description="Total de turnos completados"
            />
            <StatCard
              title="Ingresos"
              value={`$${selectedBarberoStats.ingresos_generados.toFixed(2)}`}
              description="Generados desde caja"
            />
            <StatCard
              title="Servicios"
              value={selectedBarberoStats.servicios_realizados.toString()}
              description="Servicios realizados"
            />
            <StatCard
              title="Último Turno"
              value={selectedBarberoStats.ultimo_turno ? selectedBarberoStats.ultimo_turno : "N/A"}
              description="Fecha del último turno"
            />
          </div>
        </div>
      )}

      {/* Modal para crear/editar barbero */}
      <BarberoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={barberoToEdit || undefined}
        onSave={handleSave}
      />

      {/* Confirmación de eliminación */}
      {barberoToDelete && (
        <div className="v2-overlay">
          <div className="v2-modal" style={{ maxWidth: '400px' }}>
            <div className="v2-modal-header">
              <h3 className="v2-modal-title">
                Confirmar eliminación
              </h3>
            </div>
            <div className="v2-modal-body">
              <p className="text-[var(--text-secondary)] mb-4">
                ¿Estás seguro que quieres eliminar al barbero <strong className="text-[var(--text-primary)]">{barberoToDelete.nombre}</strong>?
              </p>
            </div>
            <div className="v2-modal-footer">
              <button
                onClick={() => setBarberoToDelete(null)}
                className="v2-btn v2-btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="v2-btn v2-btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}