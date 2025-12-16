"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { Barbero } from "@/types/db";
import { BarberoModal } from "@/components/BarberoModal";
import { BarberoNivelPermisos } from "@/components/BarberoNivelPermisos";
import { toast } from "sonner";
import { TableLayout } from "@/components/TableLayout";

export function BarberosTableSimple() {
  const { data: barberos, isLoading, createBarbero, updateBarbero, deleteBarbero } = useBarberos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberoToEdit, setBarberoToEdit] = useState<Barbero | null>(null);
  const [barberoToDelete, setBarberoToDelete] = useState<Barbero | null>(null);

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
    } catch (error) {
      toast.error("Error al guardar el barbero");
    }
  };

  // Mostrar todos los barberos sin filtro de búsqueda
  const displayedBarberos = barberos || [];

  return (
    <>
      <TableLayout>
        <table className="min-w-full text-sm">
          <thead className="bg-qoder-dark-bg-tertiary rounded-t-lg overflow-hidden">
            <tr>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Nombre</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Teléfono</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Email</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Especialidades</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Permisos</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Estado</th>
              <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-3 py-2 text-qoder-dark-text-primary" colSpan={6}>Cargando…</td></tr>
            )}
            {displayedBarberos.map((barbero) => (
              <tr 
                key={barbero.id_barbero} 
                className="border-t border-qoder-dark-border-primary hover:bg-qoder-dark-bg-hover transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg"
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
                  <BarberoNivelPermisos 
                    barbero={barbero} 
                    onUpdate={() => {}} // En este contexto no necesitamos hacer nada especial al actualizar
                  />
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
          </tbody>
        </table>
      </TableLayout>

      {/* Modal de confirmación de eliminación */}
      {barberoToDelete && (
        <div className="v2-overlay">
          <div className="v2-modal" style={{ maxWidth: '400px' }}>
            <div className="v2-modal-header">
              <h3 className="v2-modal-title">Confirmar eliminación</h3>
            </div>
            <div className="v2-modal-body">
              <p className="text-[var(--text-secondary)]">
                ¿Estás seguro de que quieres eliminar al barbero {barberoToDelete.nombre}? Esta acción no se puede deshacer.
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

      {/* Modal de edición/creación */}
      <BarberoModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setBarberoToEdit(null);
        }}
        onSave={handleSave}
        initial={barberoToEdit || undefined}
      />
    </>
  );
}