"use client";

import { useState } from "react";
import { WindowLayout } from "@/components/WindowLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useServiciosBarbero } from "@/hooks/useServiciosBarbero";
import { useActualizarBarbero } from "@/hooks/useActualizarBarbero";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { EditarBarberoModal } from "@/components/EditarBarberoModal";

import type { Sucursal } from "@/types/db";
import { SucursalBarberosSection } from "@/components/SucursalBarberosSection";
import { SucursalServiciosSection } from "@/components/SucursalServiciosSection";
import { SucursalHorariosSection } from "@/components/SucursalHorariosSection";
import { SucursalHorarioDisplay } from "@/components/SucursalHorarioDisplay";
import { EditarSucursalModal } from "@/components/EditarSucursalModal";
import { EditarHorariosSucursalModal } from "@/components/EditarHorariosSucursalModal";
import { EditarInfoAdicionalModal } from "@/components/EditarInfoAdicionalModal";

export default function MiBarberiaPage() {
  usePageTitle("Barberox | Mi Barbería");

  return <MiBarberiaContent />;
}

function MiBarberiaContent() {
  // Hook para la autenticación del barbero
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();
  
  // Estado para el modo de edición de datos personales (debe estar aquí para evitar errores de hooks)
  const [isEditing, setIsEditing] = useState(false);

  // Hook para la información de la barbería y servicios
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
  const [sucursalToEdit, setSucursalToEdit] = useState<any>(null);
  
  // Estados para el modal de horarios
  const [isHorariosModalOpen, setIsHorariosModalOpen] = useState(false); // Estado para el modal de horarios
  const [sucursalParaHorarios, setSucursalParaHorarios] = useState<{
    id: string;
    nombre: string;
  } | null>(null); // Sucursal para editar horarios
  
  // Estados para el modal de información adicional
  const [isInfoAdicionalModalOpen, setIsInfoAdicionalModalOpen] = useState(false);
  const [sucursalParaInfoAdicional, setSucursalParaInfoAdicional] = useState<any>(null);
  
  // Funciones para manejar el modo de edición de datos personales
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleSaveChanges = () => {
    // Aquí iría la lógica para guardar los cambios
    // Por ahora solo cerramos el modo de edición
    setIsEditing(false);
    
    // En una implementación real, aquí se recopilarían los datos del formulario
    // y se enviarían al servidor para actualizar el perfil del barbero
    console.log("Guardar cambios del barbero");
  };

  const sucursales = sucursalesQuery.data || [];
  const servicios = serviciosQuery.data || [];

  // Manejar agregar nueva sucursal
  const handleAddSucursal = () => {
    setSucursalToEdit(null);
    setIsModalOpen(true);
  };

  // Manejar edición de sucursal existente
  const handleEditSucursal = (sucursal: any) => {
    setSucursalToEdit(sucursal);
    setIsModalOpen(true);
  };

  // Guardar sucursal (crear o actualizar)
  const handleSaveSucursal = async (values: Partial<Sucursal>) => {
    try {
      console.log("Guardando sucursal con valores:", values);
      
      // Si se proporciona un ID, actualizar la sucursal existente
      if (values.id) {
        // Actualizar sucursal existente
        const updateData = {
          id: values.id,
          numero_sucursal: values.numero_sucursal,
          nombre_sucursal: values.nombre_sucursal,
          telefono: values.telefono,
          direccion: values.direccion,
          info: values.info,
          updated_at: new Date().toISOString(),
        };
        
        console.log("Datos de actualización:", updateData);
        const result = await updateBarberiaInfoMutation.mutateAsync(updateData);
        console.log("Resultado de actualización:", result);
      } else if (sucursalToEdit?.id) {
        // Actualizar sucursal existente (caso cuando se edita desde el modal principal)
        const updateData = {
          id: sucursalToEdit.id,
          numero_sucursal: sucursalToEdit.numero_sucursal,
          nombre_sucursal: values.nombre_sucursal,
          telefono: values.telefono,
          direccion: values.direccion,
          info: values.info,
          updated_at: new Date().toISOString(),
        };
        
        console.log("Datos de actualización:", updateData);
        const result = await updateBarberiaInfoMutation.mutateAsync(updateData);
        console.log("Resultado de actualización:", result);
      } else {
        // Crear nueva sucursal
        // Asegurarse de que se proporcionen todos los campos requeridos
        if (!idBarberia) {
          throw new Error("ID de barbería no disponible");
        }
        
        // Crear un objeto con solo los campos necesarios para la creación
        const newSucursalData: any = {
          nombre_sucursal: values.nombre_sucursal || null,
          telefono: values.telefono || null,
          direccion: values.direccion || null,
          info: values.info || null,
          id_barberia: idBarberia,
        };
        
        console.log("Datos para crear nueva sucursal:", newSucursalData);
        const newSucursal = await createSucursalMutation.mutateAsync(newSucursalData);
        console.log("Resultado de creación:", newSucursal);

        // Si se creó una nueva sucursal, establecerla como la sucursal a editar
        // para que el usuario pueda configurar los horarios inmediatamente
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
      console.error("Detalles del error:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type',
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      
      // Mostrar mensaje de error más específico
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

  // Función para abrir el modal de edición de horarios
  const handleEditHorarios = (sucursal: Sucursal) => {
    setSucursalParaHorarios({
      id: sucursal.id,
      nombre:
        sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`,
    });
    setIsHorariosModalOpen(true);
  };

  // Función para abrir el modal de edición de información adicional
  const handleEditInfoAdicional = (sucursal: any) => {
    setSucursalParaInfoAdicional(sucursal);
    setIsInfoAdicionalModalOpen(true);
  };

  // Verificar si es administrador, si no, redirigir
  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            Esta sección es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  // Si no hay ID de barbería, no mostrar la página
  if (!idBarberia) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
            Acceso Restringido
          </h2>
          <p className="text-qoder-dark-text-secondary">
            No tienes acceso a esta sección. Por favor, inicia sesión con una
            cuenta válida.
          </p>
        </div>
      </div>
    );
  }

  // Vista simplificada para barberos normales (solo pueden editar sus datos)
  if (!isAdmin && barbero) {
    // Obtener los servicios disponibles para la sucursal del barbero
    const serviciosBarberia = serviciosBarberoData || [];
    
    // Obtener los servicios que este barbero ofrece
    const serviciosBarbero = barbero.especialidades || [];
    
    return (
      <div className="flex flex-col h-full">
        <div className="space-y-6">
          <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
                Mis Datos Personales
              </h2>
              <button 
                onClick={() => setIsModalOpen(true)}
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

              <div className="mt-6 p-4 bg-qoder-dark-bg-hover rounded-lg border border-qoder-dark-border-primary">
                <p className="text-sm text-qoder-dark-text-secondary">
                  <strong className="text-qoder-dark-text-primary">Nota:</strong>{" "}
                  Solo puedes editar tu información personal. Para cambios en
                  servicios, sucursales o agregar nuevos barberos, contacta con un
                  administrador.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Modal para editar información del barbero */}
        <EditarBarberoModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
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
      <div className="space-y-8">
        <section className="bg-qoder-dark-bg-secondary p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary">
              Gestión de Sucursales
            </h2>
            <button
              onClick={handleAddSucursal}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Agregar Sucursal</span>
            </button>
          </div>

          {sucursales.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {/* Ordenar las sucursales para que la principal (número 1) aparezca primero */}
              {[...sucursales]
                .sort((a, b) => {
                  // La sucursal número 1 (principal) debe ir primero
                  if (a.numero_sucursal === 1) return -1;
                  if (b.numero_sucursal === 1) return 1;
                  return a.numero_sucursal - b.numero_sucursal;
                })
                .map((sucursal) => (
                  <div
                    key={sucursal.id}
                    className="bg-qoder-dark-bg-primary rounded-xl border border-qoder-dark-border-primary overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Encabezado de la sucursal con mejor diseño visual */}
                    <div className="bg-gradient-to-r from-qoder-dark-bg-secondary to-qoder-dark-bg-hover p-6 border-b border-qoder-dark-border-primary">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="bg-qoder-dark-accent-primary/10 p-3 rounded-lg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-qoder-dark-accent-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-qoder-dark-text-primary">
                              {sucursal.nombre_sucursal || "Sin nombre"}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className="text-qoder-dark-text-secondary">
                                {sucursal.nombre_sucursal
                                  ? "Sucursal"
                                  : "Sin nombre"}
                              </span>
                              {sucursal.numero_sucursal === 1 && (
                                <span className="ml-3 bg-qoder-dark-accent-primary/20 text-qoder-dark-accent-primary text-xs px-3 py-1 rounded-full font-semibold">
                                  Principal
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 items-center">
                          <button
                            onClick={() => handleEditHorarios(sucursal)}
                            className="px-3 py-1 bg-qoder-dark-bg-secondary hover:bg-qoder-dark-accent-primary/20 text-qoder-dark-text-primary rounded-lg transition-colors duration-200 text-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Editar horarios
                          </button>
                          <button
                            onClick={() => handleEditSucursal(sucursal)}
                            className="px-3 py-1 bg-qoder-dark-bg-secondary hover:bg-qoder-dark-accent-primary/20 text-qoder-dark-text-primary rounded-lg transition-colors duration-200 text-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            Editar sucursal
                          </button>

                        </div>
                      </div>
                    </div>

                    {/* Información de contacto y horarios con mejor diseño */}
                    <div className="p-6 bg-qoder-dark-bg-secondary/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Sección de Contacto */}
                        <div className="bg-qoder-dark-bg-primary p-4 rounded-lg border border-qoder-dark-border-primary">
                          <div className="flex items-center mb-3">
                            <div className="bg-qoder-dark-accent-primary/10 p-2 rounded-lg mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-qoder-dark-accent-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-qoder-dark-text-primary">
                              Contacto
                            </h4>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-qoder-dark-text-secondary mr-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span className="text-qoder-dark-text-primary">
                                {sucursal.telefono || "No especificado"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sección de Dirección */}
                        <div className="bg-qoder-dark-bg-primary p-4 rounded-lg border border-qoder-dark-border-primary">
                          <div className="flex items-center mb-3">
                            <div className="bg-qoder-dark-accent-primary/10 p-2 rounded-lg mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-qoder-dark-accent-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-qoder-dark-text-primary">
                              Dirección
                            </h4>
                          </div>
                          <div className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-qoder-dark-text-secondary mr-3 mt-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-qoder-dark-text-primary">
                              {sucursal.direccion || "No especificada"}
                            </span>
                          </div>
                        </div>

                        {/* Sección de Horarios */}
                        <div className="bg-qoder-dark-bg-primary p-4 rounded-lg border border-qoder-dark-border-primary">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="bg-qoder-dark-accent-primary/10 p-2 rounded-lg mr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-qoder-dark-accent-primary"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-qoder-dark-text-primary">
                                Horarios
                              </h4>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <SucursalHorarioDisplay idSucursal={sucursal.id} />
                          </div>
                        </div>

                      </div>

                      {/* Sección de Barberos */}
                      <div className="mb-6">
                        <SucursalBarberosSection
                          sucursalId={sucursal.numero_sucursal}
                          sucursalUuid={sucursal.id}
                          sucursalNombre={sucursal.nombre_sucursal || undefined}
                          isAdmin={isAdmin || false}
                        />
                      </div>

                      {/* Sección de Servicios */}
                      <div className="mb-6">
                        <SucursalServiciosSection
                          sucursalId={sucursal.id}
                          idBarberia={idBarberia}
                          servicios={servicios}
                          isLoading={serviciosQuery.isLoading}
                          onCreateService={createServiceMutation.mutateAsync}
                          onUpdateService={(id, service) =>
                            updateServiceMutation.mutateAsync({ id, service })
                          }
                          onDeleteService={deleteServiceMutation.mutateAsync}
                        />
                      </div>

                      {/* Sección de Bloqueos y Descansos */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="bg-qoder-dark-accent-primary/10 p-2 rounded-lg mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-qoder-dark-accent-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
                              Bloqueos y Descansos
                            </h3>
                          </div>
                        </div>
                        <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                          <p className="text-qoder-dark-text-primary mb-4">
                            Gestiona tus tiempos de descanso, bloqueos de horas y días completos.
                          </p>
                          <button
                            onClick={() => {
                              // Redirigir a la página de bloqueos
                              window.location.href = '/mis-datos/bloqueos';
                            }}
                            className="qoder-dark-button-primary px-4 py-2 rounded-lg"
                          >
                            Gestionar Bloqueos
                          </button>
                        </div>
                      </div>

                      {/* Sección de Información Adicional */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="bg-qoder-dark-accent-primary/10 p-2 rounded-lg mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-qoder-dark-accent-primary"
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
                            </div>
                            <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
                              Información Adicional
                            </h3>
                          </div>
                          <button
                            onClick={() => handleEditInfoAdicional(sucursal)}
                            className="px-3 py-1 bg-qoder-dark-bg-secondary hover:bg-qoder-dark-accent-primary/20 text-qoder-dark-text-primary rounded-lg transition-colors duration-200 text-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            Editar
                          </button>
                        </div>
                        <div className="bg-qoder-dark-bg-form rounded-lg p-4">
                          <p className="text-qoder-dark-text-primary whitespace-pre-line">
                            {sucursal.info || "No se ha proporcionado información adicional para esta sucursal."}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-qoder-dark-text-secondary mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
                No hay sucursales registradas
              </h3>
              <p className="text-qoder-dark-text-secondary mb-6">
                Comienza agregando tu primera sucursal para gestionar barberos y
                servicios.
              </p>
              <button
                onClick={handleAddSucursal}
                className="qoder-dark-button-primary px-4 py-2 rounded-lg"
              >
                Agregar Primera Sucursal
              </button>
            </div>
          )}
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
    </div>
  );
}
