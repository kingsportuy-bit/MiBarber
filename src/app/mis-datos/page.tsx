"use client";

import { useState } from "react";
import { WindowLayout } from "@/components/WindowLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useServiciosBarbero } from "@/hooks/useServiciosBarbero";
import { useActualizarBarbero } from "@/hooks/useActualizarBarbero";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { EditarBarberoModal } from "@/components/EditarBarberoModal";

// Componentes para administradores
import { SucursalBarberosSection } from "@/components/SucursalBarberosSection";
import { SucursalServiciosSection } from "@/components/SucursalServiciosSection";
import { SucursalHorarioDisplay } from "@/components/SucursalHorarioDisplay";
import { EditarSucursalModal } from "@/components/EditarSucursalModal";
import { EditarHorariosSucursalModal } from "@/components/EditarHorariosSucursalModal";
import { EditarInfoAdicionalModal } from "@/components/EditarInfoAdicionalModal";

import type { Sucursal } from "@/types/db";
import { BloqueosManager } from "@/components/bloqueos/BloqueosManager";

export default function MisDatosPage() {
  usePageTitle("Barberox | Mis Datos");
  return <MisDatosContent />;
}

function MisDatosContent() {
  // Hook para la autenticación del barbero
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();
  
  // Hook para la información de la barbería y servicios (solo para administradores)
  const {
    barberiaInfoQuery,
    sucursalesQuery,
    serviciosQuery,
    updateBarberiaInfoMutation,
    createSucursalMutation,
    createServiceMutation,
    updateServiceMutation,
    deleteServiceMutation,
  } = useBarberiaInfo();
  
  // Hook para los servicios específicos del barbero
  const { data: serviciosBarberoData = [] } = useServiciosBarbero(barbero?.id_barbero || null);

  // Hook para actualizar datos del barbero
  const { actualizarBarbero, isLoading: isUpdating } = useActualizarBarbero();

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBarberoModalOpen, setIsBarberoModalOpen] = useState(false);
  
  // Estados para el modal de horarios (solo para administradores)
  const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false);
  const [sucursalParaHorarios, setSucursalParaHorarios] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  
  // Estados para el modal de información adicional (solo para administradores)
  const [isInfoAdicionalModalOpen, setIsInfoAdicionalModalOpen] = useState(false);
  const [sucursalParaInfoAdicional, setSucursalParaInfoAdicional] = useState<any>(null);
  
  // Estados para sucursal a editar (solo para administradores)
  const [sucursalToEdit, setSucursalToEdit] = useState<any>(null);

  // Si no hay ID de barbería, redirigir
  if (!idBarberia) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            No tienes acceso a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Funciones para manejar sucursales (solo para administradores)
  const handleAddSucursal = () => {
    setSucursalToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditSucursal = (sucursal: any) => {
    setSucursalToEdit(sucursal);
    setIsModalOpen(true);
  };

  const handleSaveSucursal = async (values: Partial<Sucursal>) => {
    try {
      // Si se proporciona un ID, actualizar la sucursal existente
      if (values.id) {
        const updateData = {
          id: values.id,
          numero_sucursal: values.numero_sucursal,
          nombre_sucursal: values.nombre_sucursal,
          telefono: values.telefono,
          direccion: values.direccion,
          info: values.info,
          updated_at: new Date().toISOString(),
        };
        
        const result = await updateBarberiaInfoMutation.mutateAsync(updateData);
      } else {
        // Crear nueva sucursal
        if (!idBarberia) {
          throw new Error("ID de barbería no disponible");
        }
        
        const newSucursalData: any = {
          nombre_sucursal: values.nombre_sucursal || null,
          telefono: values.telefono || null,
          direccion: values.direccion || null,
          info: values.info || null,
          id_barberia: idBarberia,
        };
        
        const newSucursal = await createSucursalMutation.mutateAsync(newSucursalData);

        // Si se creó una nueva sucursal, establecerla como la sucursal a editar
        if (newSucursal && newSucursal.id) {
          setSucursalToEdit(newSucursal);
        }
      }
      setIsModalOpen(false);
      setIsInfoAdicionalModalOpen(false);
      setSucursalToEdit(null);
      setSucursalParaInfoAdicional(null);
    } catch (error: any) {
      console.error("Error al guardar la sucursal:", error);
      let errorMessage = "Error al guardar la sucursal";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`Error al guardar la sucursal: ${errorMessage}`);
    }
  };

  // Función para abrir el modal de edición de horarios (solo para administradores)
  const handleEditHorarios = (sucursal: Sucursal) => {
    setSucursalParaHorarios({
      id: sucursal.id,
      nombre:
        sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`,
    });
    setIsHorariosModalOpen(true);
  };

  // Función para abrir el modal de edición de información adicional (solo para administradores)
  const handleEditInfoAdicional = (sucursal: any) => {
    setSucursalParaInfoAdicional(sucursal);
    setIsInfoAdicionalModalOpen(true);
  };

  // Si hay barbero, mostrar sus datos
  if (barbero) {
    // Obtener los servicios disponibles para la sucursal del barbero
    const serviciosBarberia = serviciosBarberoData || [];
    
    // Obtener los servicios que este barbero ofrece
    const serviciosBarbero = barbero.especialidades || [];
    
    // Para administradores, mostrar la vista completa de gestión
    if (isAdmin) {
      const sucursales = sucursalesQuery.data || [];
      const servicios = serviciosQuery.data || [];
      
      return (
        <div className="flex flex-col h-full">
          <div className="space-y-8">
            {/* Sección de datos personales - DESACTIVADA PARA ADMINISTRADORES */}
            {/* 
            <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                  Mis Datos Personales
                </h2>
                <button 
                  onClick={() => setIsBarberoModalOpen(true)}
                  className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2"
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
                  <span>Editar</span>
                </button>
              </div>

              <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                      Nombre
                    </label>
                    <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                      {barbero.nombre}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                      Nombre de Usuario
                    </label>
                    <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                      {barbero.username || "No especificado"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                      Email
                    </label>
                    <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                      {barbero.email || "No especificado"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                      Teléfono
                    </label>
                    <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                      {barbero.telefono || "No especificado"}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                      Servicios que Ofrezco
                    </label>
                    <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                      {serviciosBarbero && serviciosBarbero.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {serviciosBarbero.map((servicioId: string) => {
                            const servicio = serviciosBarberia.find((s: any) => s.id === servicioId);
                            return servicio ? (
                              <span 
                                key={`servicio-${servicioId}`} 
                                className="bg-qoder-dark-accent-primary/20 text-qoder-dark-accent-primary px-3 py-1 rounded-full text-sm"
                              >
                                {servicio.nombre}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        "No se han seleccionado servicios"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
            */}

            {/* Sección de gestión de bloqueos */}
            <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                  Gestión de Bloqueos y Descansos
                </h2>
              </div>
              <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
                <BloqueosManager mode={isAdmin ? "admin" : "barbero"} />
              </div>
            </section>
          </div>

          {/* Modal para crear/editar sucursal */}
          <EditarSucursalModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            initial={sucursalToEdit || undefined}
            onSave={handleSaveSucursal}
          />

          {/* Modal para editar horarios de sucursal */}
          {sucursalParaHorarios && (
            <EditarHorariosSucursalModal
              open={isHorariosModalOpen}
              onOpenChange={setIsHorariosModalOpen}
              idSucursal={sucursalParaHorarios.id}
              nombreSucursal={sucursalParaHorarios.nombre}
            />
          )}

          {/* Modal para editar información adicional */}
          <EditarInfoAdicionalModal
            open={isInfoAdicionalModalOpen}
            onOpenChange={(open) => {
              setIsInfoAdicionalModalOpen(open);
              // Limpiar la sucursal seleccionada cuando se cierra el modal
              if (!open) {
                setSucursalParaInfoAdicional(null);
              }
            }}
            initial={sucursalParaInfoAdicional}
            onSave={handleSaveSucursal}
          />

          {/* Modal para editar información del barbero */}
          <EditarBarberoModal
            open={isBarberoModalOpen}
            onOpenChange={setIsBarberoModalOpen}
            barbero={barbero}
            onSave={async (data) => {
              try {
                await actualizarBarbero({
                  id_barbero: barbero.id_barbero,
                  username: data.username !== undefined && data.username !== null ? data.username : undefined,
                  email: data.email !== undefined && data.email !== null ? data.email : undefined,
                  telefono: data.telefono !== undefined && data.telefono !== null ? data.telefono : undefined,
                  especialidades: data.especialidades
                });
                alert("Cambios guardados exitosamente");
              } catch (error) {
                console.error("Error al guardar cambios:", error);
                alert("Error al guardar los cambios");
              }
            }}
          />
        </div>
      );
    }
    
    // Vista para barberos normales
    return (
      <div className="flex flex-col h-full">
        <div className="space-y-6">
          {/* Sección de datos personales */}
          <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                Mis Datos Personales
              </h2>
              <button 
                onClick={() => setIsBarberoModalOpen(true)}
                className="qoder-dark-button-primary px-4 py-2 rounded-lg flex items-center gap-2"
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
                <span>Editar</span>
              </button>
            </div>

            <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Nombre
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {barbero.nombre}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Nombre de Usuario
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {barbero.username || "No especificado"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Email
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {barbero.email || "No especificado"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Teléfono
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {barbero.telefono || "No especificado"}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-2">
                    Servicios que Ofrezco
                  </label>
                  <div className="w-full qoder-dark-bg-form p-3 rounded-lg text-qoder-dark-text-primary">
                    {serviciosBarbero && serviciosBarbero.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {serviciosBarbero.map((servicioId: string) => {
                          const servicio = serviciosBarberia.find((s: any) => s.id === servicioId);
                          return servicio ? (
                            <span 
                              key={`servicio-${servicioId}`} 
                              className="bg-qoder-dark-accent-primary/20 text-qoder-dark-accent-primary px-3 py-1 rounded-full text-sm"
                            >
                              {servicio.nombre}
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      "No se han seleccionado servicios"
                    )}
                  </div>
                </div>
              </div>

              {!isAdmin && (
                <div className="mt-6 p-4 bg-qoder-dark-bg-hover rounded-lg border border-qoder-dark-border-primary">
                  <p className="text-sm text-qoder-dark-text-secondary">
                    <strong className="text-qoder-dark-text-primary">Nota:</strong>{" "}
                    Solo puedes editar tu información personal. Para cambios en
                    servicios, sucursales o agregar nuevos barberos, contacta con un
                    administrador.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Sección de gestión de bloqueos */}
          <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                Gestión de Bloqueos
              </h2>
            </div>
            <div className="bg-qoder-dark-bg-primary rounded-xl p-6 border border-qoder-dark-border-primary">
              <BloqueosManager mode={isAdmin ? "admin" : "barbero"} />
            </div>
          </section>
        </div>

        {/* Modal para editar información del barbero */}
        <EditarBarberoModal
          open={isBarberoModalOpen}
          onOpenChange={setIsBarberoModalOpen}
          barbero={barbero}
          onSave={async (data) => {
            try {
              await actualizarBarbero({
                id_barbero: barbero.id_barbero,
                username: data.username !== undefined && data.username !== null ? data.username : undefined,
                email: data.email !== undefined && data.email !== null ? data.email : undefined,
                telefono: data.telefono !== undefined && data.telefono !== null ? data.telefono : undefined,
                especialidades: data.especialidades
              });
              alert("Cambios guardados exitosamente");
            } catch (error) {
              console.error("Error al guardar cambios:", error);
              alert("Error al guardar los cambios");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
          Cargando datos...
        </h2>
      </div>
    </div>
  );
}