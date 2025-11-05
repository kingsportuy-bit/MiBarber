"use client";

import { useState } from "react";
import { WindowLayout } from "@/components/WindowLayout";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useServiciosBarbero } from "@/hooks/useServiciosBarbero";
import { useActualizarBarbero } from "@/hooks/useActualizarBarbero";
import { EditarBarberoModal } from "@/components/EditarBarberoModal";
import { BloqueosManager } from "@/components/bloqueos/BloqueosManager";

export default function MisDatosPage() {
  usePageTitle("Barberox | Mis Datos");
  return <MisDatosContent />;
}

function MisDatosContent() {
  // Hook para la autenticación del barbero
  const { isAdmin, idBarberia, barbero } = useBarberoAuth();
  
  // Hook para los servicios específicos del barbero
  const { data: serviciosBarberoData = [] } = useServiciosBarbero(barbero?.id_barbero || null);

  // Hook para actualizar datos del barbero
  const { actualizarBarbero, isLoading: isUpdating } = useActualizarBarbero();

  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Si hay barbero, mostrar sus datos
  if (barbero) {
    // Obtener los servicios disponibles para la sucursal del barbero
    const serviciosBarberia = serviciosBarberoData || [];
    
    // Obtener los servicios que este barbero ofrece
    const serviciosBarbero = barbero.especialidades || [];
    
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
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-qoder-dark-text-primary mb-4">
          Cargando datos...
        </h2>
      </div>
    </div>
  );
}