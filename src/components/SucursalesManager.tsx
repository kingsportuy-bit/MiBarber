"use client";

import { useState } from "react";
import { useSucursales } from "@/hooks/useSucursales";
import { EditarSucursalModal } from "@/components/EditarSucursalModal";
import { toast } from "sonner";
import type { Sucursal } from "@/types/db";

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
    <div className="space-y-4">
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-qoder-dark-border-primary">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Número
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Contacto
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-qoder-dark-border-primary">
            {isLoading && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={isAdmin ? 5 : 4}>
                  Cargando sucursales...
                </td>
              </tr>
            )}
            {sucursales?.map((sucursal) => (
              <tr key={sucursal.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  #{sucursal.numero_sucursal}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {sucursal.nombre_sucursal || "Sin nombre"}
                </td>
                <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                  {sucursal.direccion || "Sin dirección"}
                </td>
                <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                  <div>
                    {sucursal.celular && <div>Cel: {sucursal.celular}</div>}
                    {sucursal.telefono && <div>Tel: {sucursal.telefono}</div>}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditSucursal(sucursal)}
                        className="text-blue-500 hover:text-blue-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSucursalToDelete(sucursal)}
                        className="text-red-500 hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!isLoading && sucursales?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={isAdmin ? 5 : 4}>
                  No hay sucursales registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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