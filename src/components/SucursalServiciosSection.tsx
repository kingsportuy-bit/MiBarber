"use client";

import { useState } from "react";
import { Service } from "@/types/db";
import { toast } from "sonner";
import { ServicioModal } from "@/components/ServicioModal";

interface SucursalServiciosSectionProps {
  sucursalId: string; // Cambiar de number a string para usar el UUID
  idBarberia: string; // idBarberia es requerido
  servicios: Service[] | undefined;
  isLoading: boolean;
  onCreateService: (service: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo">) => void;
  onUpdateService: (id: string, service: Partial<Service>) => void;
  onDeleteService: (id: string) => void;
}

export function SucursalServiciosSection({ 
  sucursalId,
  idBarberia,
  servicios, 
  isLoading,
  onCreateService,
  onUpdateService,
  onDeleteService
}: SucursalServiciosSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Filtrar servicios por sucursal usando el UUID
  const serviciosDeSucursal = servicios?.filter(servicio => 
    servicio.id_sucursal === sucursalId
  ) || [];

  const handleAddService = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (values: Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo"> | Partial<Service>) => {
    try {
      if (serviceToEdit) {
        // Actualizar servicio existente
        await onUpdateService(serviceToEdit.id_servicio, {
          ...values,
          updated_at: new Date().toISOString()
        });
        toast.success("Servicio actualizado correctamente");
      } else {
        // Crear nuevo servicio
        const serviceData = {
          ...values,
          id_sucursal: sucursalId,
          id_barberia: idBarberia
        } as Omit<Service, "id_servicio" | "created_at" | "updated_at" | "activo">;
        
        await onCreateService(serviceData);
        toast.success("Servicio creado correctamente");
      }
      setIsModalOpen(false);
      setServiceToEdit(null);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Error al guardar el servicio");
    }
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      onDeleteService(serviceToDelete.id_servicio);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
          Servicios de la Sucursal
        </h3>
        <button
          onClick={handleAddService}
          className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Servicio</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-qoder-dark-border-primary">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Duración
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qoder-dark-border-primary">
            {isLoading && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={4}>
                  Cargando servicios...
                </td>
              </tr>
            )}
            {serviciosDeSucursal?.map((servicio) => (
              <tr key={servicio.id_servicio}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {servicio.nombre}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  $ {servicio.precio}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {servicio.duracion_minutos} min
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditService(servicio)}
                      className="text-blue-500 hover:text-blue-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setServiceToDelete(servicio)}
                      className="text-red-500 hover:text-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && serviciosDeSucursal?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={4}>
                  No hay servicios registrados en esta sucursal
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar servicio */}
      <ServicioModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={serviceToEdit || undefined}
        onSave={handleSaveService}
      />

      {/* Confirmación de eliminación */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="qoder-dark-card w-[90vw] max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-qoder-dark-text-primary">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-qoder-dark-text-secondary mb-4">
              ¿Estás seguro que quieres eliminar el servicio <strong className="text-qoder-dark-text-primary">{serviceToDelete.nombre}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setServiceToDelete(null)}
                className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={confirmDeleteService}
                className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
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