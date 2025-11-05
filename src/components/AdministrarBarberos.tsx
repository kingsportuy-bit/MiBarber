import { useState } from "react";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { CrearBarberoModal } from "@/components/CrearBarberoModal";
import { toast } from "sonner";
import type { Barbero } from "@/types/db";

interface AdministrarBarberosProps {
  idBarberia: string;
  id_sucursal?: string; // Agregar id_sucursal como prop opcional
}

export function AdministrarBarberos({ idBarberia, id_sucursal }: AdministrarBarberosProps) {
  const barberosQuery = useBarberos(id_sucursal);
  const { serviciosQuery } = useBarberiaInfo();
  const [modalOpen, setModalOpen] = useState(false);

  const handleBarberoCreado = () => {
    toast.success("Barbero creado correctamente");
  };

  // Filtrar barberos por la barbería actual
  const barberosDeBarberia = barberosQuery.data?.filter((barbero: Barbero) => barbero.id_barberia === idBarberia) || [];

  // Función para obtener el nombre del servicio por su ID
  const getNombreServicio = (servicioId: string) => {
    if (serviciosQuery.data) {
      const servicio = serviciosQuery.data.find(s => s.id_servicio === servicioId);
      return servicio ? servicio.nombre : servicioId;
    }
    return servicioId;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">
          Administrar Barberos
        </h3>
        <button
          onClick={() => setModalOpen(true)}
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
                Usuario
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Especialidades
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-qoder-dark-border-primary">
            {barberosQuery.isLoading && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={6}>
                  Cargando barberos...
                </td>
              </tr>
            )}
            {barberosQuery.isError && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={6}>
                  Error: {barberosQuery.error?.message}
                </td>
              </tr>
            )}
            {barberosDeBarberia.map((barbero: Barbero) => (
              <tr key={barbero.id_barbero} className="hover:bg-qoder-dark-bg-hover transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.nombre}
                  {barbero.admin && (
                    <span className="ml-2 bg-qoder-dark-accent-primary/20 text-qoder-dark-accent-primary text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.username || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.telefono || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                  {barbero.email || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                  <div className="flex flex-wrap gap-1">
                    {barbero.especialidades?.map((esp: string, index: number) => (
                      <span key={index} className="bg-qoder-dark-bg-secondary text-qoder-dark-text-secondary text-xs px-2 py-1 rounded">
                        {getNombreServicio(esp)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    barbero.activo 
                      ? "bg-green-900 text-green-300" 
                      : "bg-red-900 text-red-300"
                  }`}>
                    {barbero.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
            {!barberosQuery.isLoading && !barberosQuery.isError && barberosDeBarberia.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-qoder-dark-text-primary" colSpan={6}>
                  No hay barberos registrados en esta barbería
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CrearBarberoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        idBarberia={idBarberia}
        id_sucursal={id_sucursal} // Pasar id_sucursal al modal
        onBarberoCreado={handleBarberoCreado}
      />
    </div>
  );
}