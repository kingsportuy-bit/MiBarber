"use client";

import { useState, useEffect } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useServiciosList } from "@/hooks/useServiciosList";
import { BarberoModal } from "@/components/BarberoModal";
import { BarberoNivelPermisos } from "@/components/BarberoNivelPermisos";
import { BarberoFichaModal } from "@/components/BarberoFichaModal";
import type { Barbero } from "@/types/db";
import type { Service } from "@/types/db";
import { toast } from "sonner";

interface SucursalBarberosSectionProps {
  sucursalId: number;
  sucursalUuid: string;
  sucursalNombre?: string;
  isAdmin: boolean;
}

export function SucursalBarberosSection({ 
  sucursalId, 
  sucursalUuid, 
  sucursalNombre,
  isAdmin
}: SucursalBarberosSectionProps) {
  const barberosQuery = useBarberos(sucursalUuid);
  const { idBarberia } = useBarberoAuth(); // Obtener el ID de la barbería
  const serviciosQuery = useServiciosList(idBarberia); // Usar idBarberia en lugar de sucursalUuid
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barberoToEdit, setBarberoToEdit] = useState<Barbero | null>(null);
  const [barberoToDelete, setBarberoToDelete] = useState<Barbero | null>(null);
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const [barberoToShow, setBarberoToShow] = useState<Barbero | null>(null);

  // Escuchar evento personalizado para abrir el modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
      setBarberoToEdit(null);
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

  const handleShowFicha = (barbero: Barbero) => {
    setBarberoToShow(barbero);
    setIsFichaModalOpen(true);
  };

  const handleDelete = (barbero: Barbero) => {
    // No permitir eliminar barberos protegidos
    if (isBarberoProtegido(barbero)) {
      toast.error("No se puede eliminar un barbero protegido");
      return;
    }
    setBarberoToDelete(barbero);
  };

  const confirmDelete = async () => {
    if (!barberoToDelete) return;
    
    try {
      await barberosQuery.deleteBarbero.mutateAsync(barberoToDelete.id_barbero);
      toast.success("Barbero eliminado correctamente");
    } catch (error) {
      console.error("Error deleting barbero:", error);
      toast.error("Error al eliminar el barbero");
    } finally {
      setBarberoToDelete(null);
    }
  };

  const handleSave = async (values: Partial<Barbero>) => {
    try {
      if (barberoToEdit) {
        // Actualizar barbero existente
        await barberosQuery.updateBarbero.mutateAsync({
          id_barbero: barberoToEdit.id_barbero,
          ...values
        });
        toast.success("Barbero actualizado correctamente");
      } else {
        // Crear nuevo barbero
        // Asegurarse de incluir id_barberia e id_sucursal en los datos
        const barberoData = {
          ...values,
          id_barberia: idBarberia || undefined,
          id_sucursal: sucursalUuid || undefined
        } as Omit<Barbero, "id_barbero">;
        
        await barberosQuery.createBarbero.mutateAsync(barberoData);
        toast.success("Barbero creado correctamente");
      }
      setIsModalOpen(false);
      setBarberoToEdit(null);
    } catch (error) {
      console.error("Error saving barbero:", error);
      toast.error("Error al guardar el barbero");
    }
  };

  // Verificar si un barbero es el barbero protegido (nivel 1)
  const isBarberoProtegido = (barbero: Barbero) => {
    // Un barbero es protegido si tiene nivel de permisos 1
    return barbero.nivel_permisos === 1;
  };

  // Función para obtener el nombre del servicio por su ID
  const getNombreServicio = (servicioId: string) => {
    if (serviciosQuery.data) {
      const servicio = serviciosQuery.data.find((s: Service) => s.id_servicio === servicioId);
      return servicio ? servicio.nombre : servicioId;
    }
    return servicioId;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
          Barberos
        </h3>
        <button
          onClick={() => {
            // Abrir el modal directamente sin usar eventos personalizados
            setIsModalOpen(true);
            setBarberoToEdit(null);
          }}
          className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Barbero</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-qoder-dark-border-primary">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Teléfono
              </th>
              {/* Columna de Email - ocultar en móvil */}
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider md:table-cell hidden">
                Email
              </th>
              {/* Columna de Especialidades - ocultar en móvil */}
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider md:table-cell hidden">
                Especialidades
              </th>
              {/* Columna de Rol - ocultar en móvil */}
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider md:table-cell hidden">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qoder-dark-border-primary">
            {barberosQuery.isLoading && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={7}>
                  Cargando barberos...
                </td>
              </tr>
            )}
            {barberosQuery.isError && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={7}>
                  Error: {barberosQuery.error?.message}
                </td>
              </tr>
            )}
            {barberosQuery.data?.map((barbero: Barbero) => (
              <tr key={barbero.id_barbero}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.nombre}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.telefono}
                </td>
                {/* Celda de Email - ocultar en móvil */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary md:table-cell hidden">
                  {barbero.email}
                </td>
                {/* Celda de Especialidades - ocultar en móvil */}
                <td className="px-4 py-3 text-sm text-qoder-dark-text-primary md:table-cell hidden">
                  <div className="flex flex-wrap gap-1">
                    {barbero.especialidades && barbero.especialidades.map((esp: string, index: number) => (
                      <span key={index} className="bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary text-xs px-2 py-1 rounded">
                        {getNombreServicio(esp)}
                      </span>
                    ))}
                  </div>
                </td>
                {/* Celda de Rol - ocultar en móvil */}
                <td className="px-4 py-3 text-sm text-qoder-dark-text-primary md:table-cell hidden">
                  <BarberoNivelPermisos 
                    barbero={barbero} 
                    onUpdate={() => {}}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  <span className={`px-2 py-1 rounded text-xs ${
                    barbero.activo 
                      ? "bg-green-900 text-green-300" 
                      : "bg-red-900 text-red-300"
                  }`}>
                    {barbero.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Icono de ojo para ver detalles */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShowFicha(barbero); }}
                      className="text-gray-500 hover:text-gray-300 bg-transparent !bg-none border-none p-1"
                      title="Ver detalles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
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
                      className={`${
                        isBarberoProtegido(barbero) 
                          ? "text-gray-500 cursor-not-allowed bg-transparent !bg-none border-none p-1" 
                          : "text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                      }`}
                      disabled={isBarberoProtegido(barbero)}
                      title={isBarberoProtegido(barbero) ? "No se puede eliminar" : "Eliminar barbero"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!barberosQuery.isLoading && !barberosQuery.isError && barberosQuery.data?.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={7}>
                  No hay barberos registrados en esta sucursal
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar barbero */}
      <BarberoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initial={barberoToEdit || undefined}
        onSave={handleSave}
        isAdminUser={isAdmin} // Pasar si el usuario actual es administrador
        isBarberoPrincipal={barberoToEdit ? isBarberoProtegido(barberoToEdit) : false} // Pasar si es un barbero protegido
        isSucursalPrincipal={sucursalId === 1} // Pasar si es la sucursal principal
        sucursalUuid={sucursalUuid} // Pasar el UUID de la sucursal
        idBarberia={idBarberia || undefined} // Pasar el ID de la barbería
      />

      {/* Confirmación de eliminación */}
      {barberoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="qoder-dark-card w-[90vw] max-w-md">
            <h3 className="text-lg font-semibold mb-2 text-qoder-dark-text-primary">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-qoder-dark-text-secondary mb-4">
              ¿Estás seguro que quieres eliminar al barbero <strong className="text-qoder-dark-text-primary">{barberoToDelete.nombre}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBarberoToDelete(null)}
                className="qoder-dark-button px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={confirmDelete}
                className="qoder-dark-button-danger px-4 py-2 rounded-lg flex items-center gap-2 hover-lift smooth-transition"
              >
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ficha del barbero */}
      <BarberoFichaModal
        open={isFichaModalOpen}
        onOpenChange={setIsFichaModalOpen}
        barbero={barberoToShow}
        idBarberia={idBarberia || undefined}
      />
    </div>
  );
}
