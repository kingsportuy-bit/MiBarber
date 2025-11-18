"use client";

import { useState } from "react";
import { useSucursales } from "@/hooks/useSucursales";
import { EditarSucursalModal } from "@/components/EditarSucursalModal";
import { SucursalInfoCard } from "@/components/SucursalInfoCard";
import { SucursalBarberosSection } from "@/components/SucursalBarberosSection";
import { SucursalServiciosSection } from "@/components/SucursalServiciosSection";
import { SucursalHorariosSection } from "@/components/SucursalHorariosSection";
import { useServicios } from "@/hooks/useServicios";
import { toast } from "sonner";
import type { Sucursal, Service } from "@/types/db";

interface SucursalesManagerProps {
  idBarberia?: string;
  isAdmin: boolean;
}

export function SucursalesManager({ idBarberia, isAdmin }: SucursalesManagerProps) {
  const { 
    sucursales, 
    isLoading, 
    isError, 
    error,
    createSucursal,
    updateSucursal,
    deleteSucursal
  } = useSucursales(idBarberia || undefined);
  
  const { 
    servicios, 
    isLoading: isLoadingServicios, 
    isError: isErrorServicios, 
    error: errorServicios,
    createServicio,
    updateServicio,
    deleteServicio
  } = useServicios(idBarberia);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalToEdit, setSucursalToEdit] = useState<Sucursal | null>(null);
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null);

  const handleAddSucursal = () => {
    setSucursalToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditSucursal = (sucursal: Sucursal) => {
    setSucursalToEdit(sucursal);
    setIsModalOpen(true);
  };

  // Funciones adaptadoras para los servicios
  const handleCreateService = async (service: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo">) => {
    return createServicio.mutateAsync({
      ...service,
      activo: true
    } as Omit<Service, "id_servicio" | "created_at" | "updated_at">);
  };

  const handleUpdateService = async (id: string, service: Partial<Service>) => {
    return updateServicio.mutateAsync({
      id_servicio: id,
      ...service
    } as Partial<Service> & { id_servicio: string });
  };

  const handleDeleteService = async (id: string) => {
    return deleteServicio.mutateAsync(id);
  };

  const handleSaveSucursal = async (values: Partial<Sucursal>) => {
    try {
      if (sucursalToEdit) {
        // Actualizar sucursal existente
        await updateSucursal.mutateAsync({
          id: sucursalToEdit.id,
          ...values,
          updated_at: new Date().toISOString()
        });
        toast.success("Sucursal actualizada correctamente");
      } else {
        // Crear nueva sucursal
        if (!idBarberia) {
          throw new Error("ID de barbería no disponible");
        }
        
        await createSucursal.mutateAsync({
          ...values,
          id_barberia: idBarberia
        } as Omit<Sucursal, "id" | "created_at" | "updated_at" | "numero_sucursal">);
        toast.success("Sucursal creada correctamente");
      }
      setIsModalOpen(false);
      setSucursalToEdit(null);
    } catch (error) {
      console.error("Error saving sucursal:", error);
      toast.error("Error al guardar la sucursal");
    }
  };

  const confirmDeleteSucursal = async () => {
    if (sucursalToDelete) {
      try {
        await deleteSucursal.mutateAsync(sucursalToDelete.id);
        toast.success("Sucursal eliminada correctamente");
      } catch (error) {
        console.error("Error deleting sucursal:", error);
        toast.error("Error al eliminar la sucursal");
      } finally {
        setSucursalToDelete(null);
      }
    }
  };

  if (isError) {
    return (
      <div className="text-red-500">
        Error al cargar sucursales: {error?.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
          Sucursales
        </h3>
        {isAdmin && (
          <button
            onClick={handleAddSucursal}
            className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Agregar Sucursal</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-qoder-dark-text-primary">
          Cargando sucursales...
        </div>
      )}

      {sucursales?.map((sucursal) => (
        <div key={sucursal.id} className="space-y-6">
          <SucursalInfoCard 
            sucursal={sucursal}
            onEdit={() => handleEditSucursal(sucursal)}
            onEditHorarios={() => {
              // Esta función se podría usar para abrir un modal de edición de horarios
              // Por ahora, simplemente mostramos la sección de horarios
            }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SucursalHorariosSection 
              idSucursal={sucursal.id} 
              nombreSucursal={sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
            />
            <SucursalBarberosSection 
              sucursalId={sucursal.numero_sucursal} 
              sucursalUuid={sucursal.id} 
              sucursalNombre={sucursal.nombre_sucursal || undefined}
              isAdmin={isAdmin}
            />
          </div>
          
          <SucursalServiciosSection
            sucursalId={sucursal.id}
            idBarberia={idBarberia || ''}
            servicios={servicios}
            isLoading={isLoadingServicios}
            onCreateService={handleCreateService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
          
          {/* Sección de Información Adicional */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-qoder-dark-accent-primary mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Información Adicional
            </h3>
            <div className="bg-qoder-dark-bg-form rounded-lg p-4">
              <p className="text-qoder-dark-text-primary whitespace-pre-line">
                {sucursal.info || "No se ha proporcionado información adicional para esta sucursal."}
              </p>
            </div>
          </div>
        </div>
      ))}

      {!isLoading && sucursales?.length === 0 && (
        <div className="text-center py-8 bg-qoder-dark-bg-form rounded-lg border border-qoder-dark-border-primary">
          <p className="text-qoder-dark-text-secondary">
            No hay sucursales registradas
          </p>
        </div>
      )}

      {/* Modal para crear/editar sucursal */}
      <EditarSucursalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={sucursalToEdit || undefined}
        onSave={handleSaveSucursal}
      />

      {/* Confirmación de eliminación */}
      {sucursalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="qoder-dark-card w-[90vw] max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-qoder-dark-text-primary">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-qoder-dark-text-secondary mb-4">
              ¿Estás seguro que quieres eliminar la sucursal <strong className="text-qoder-dark-text-primary">#{sucursalToDelete.numero_sucursal} {sucursalToDelete.nombre_sucursal || ""}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSucursalToDelete(null)}
                className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={confirmDeleteSucursal}
                className="qoder-dark-button-danger px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
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