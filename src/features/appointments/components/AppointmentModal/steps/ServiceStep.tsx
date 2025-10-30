"use client";

import { useMemo } from "react";
import type { Appointment } from "@/types/db";
import { useServiciosListPorSucursal } from "@/hooks/useServiciosListPorSucursal";
import { useBarberosList } from "@/hooks/useBarberosList";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

interface ServiceStepProps {
  formData: Partial<Appointment>;
  updateFormData: (updates: Partial<Appointment>) => void;
  nextStep: () => void;
  prevStep: () => void;
  sucursalId?: string;
  idBarberia?: string;
}

/**
 * Paso 2 del wizard: Selección de servicio y barbero
 */
export function ServiceStep({ 
  formData, 
  updateFormData, 
  nextStep,
  prevStep,
  sucursalId,
  idBarberia
}: ServiceStepProps) {
  const { isAdmin, barbero: barberoActual } = useBarberoAuth();
  const { data: serviciosData, isLoading: isLoadingServicios } = useServiciosListPorSucursal(sucursalId);
  const { data: allBarberos, isLoading: isLoadingBarberos } = useBarberosList(idBarberia, sucursalId);

  // Filtrar barberos según el servicio seleccionado
  const barberos = useMemo(() => {
    if (!allBarberos || !formData.servicio || !serviciosData)
      return allBarberos || [];

    // Encontrar el servicio seleccionado
    const servicioSeleccionado = serviciosData.find(
      (s) => s.nombre === formData.servicio,
    );
    if (!servicioSeleccionado) return allBarberos;

    // Si el servicio tiene barberos específicos asignados, filtrar por ellos
    // De lo contrario, mostrar todos los barberos
    if (servicioSeleccionado.id_servicio) {
      // Verificar si hay barberos con esta especialidad
      const barberosConEspecialidad = allBarberos.filter((barbero) =>
        barbero.especialidades?.includes(servicioSeleccionado.id_servicio),
      );

      // Si hay barberos con la especialidad, mostrar solo ellos
      // Si no hay barberos con la especialidad, mostrar todos los barberos
      return barberosConEspecialidad.length > 0
        ? barberosConEspecialidad
        : allBarberos;
    }

    return allBarberos;
  }, [allBarberos, formData.servicio, serviciosData]);

  // Encontrar el ID del servicio seleccionado
  const selectedServicio = useMemo(() => {
    if (!formData.servicio || !serviciosData) return null;
    return serviciosData.find((s) => s.nombre === formData.servicio);
  }, [formData.servicio, serviciosData]);

  // Encontrar el ID del barbero seleccionado
  const selectedBarbero = useMemo(() => {
    if (!formData.barbero || !allBarberos) return null;
    // Para barberos no administradores, usar el barbero actual si no hay uno seleccionado
    if (!isAdmin && barberoActual?.id_barbero) {
      // Verificar si el barbero actual está en la lista de barberos
      const barberoEnLista = allBarberos.find(
        (b) => b.id_barbero === barberoActual.id_barbero,
      );
      if (barberoEnLista) {
        return barberoEnLista;
      }
    }

    // Para administradores o cuando no hay barbero actual, buscar por ID o nombre
    return allBarberos.find(
      (b) => b.id_barbero === formData.barbero || b.nombre === formData.barbero,
    );
  }, [formData.barbero, allBarberos, isAdmin, barberoActual?.id_barbero]);

  const handleServiceChange = (serviceName: string) => {
    const servicio = serviciosData?.find(s => s.nombre === serviceName);
    
    updateFormData({
      servicio: serviceName,
      ticket: servicio?.precio || undefined,
      duracion: servicio ? servicio.duracion_minutos.toString() : undefined,
      id_servicio: servicio?.id_servicio || undefined
    });
  };

  const handleBarberoChange = (barberoNombre: string) => {
    const barbero = allBarberos?.find(b => b.nombre === barberoNombre);
    
    updateFormData({
      barbero: barberoNombre,
      id_barbero: barbero?.id_barbero || undefined
    });
  };

  const handleNext = () => {
    if (!formData.servicio) {
      alert("Por favor seleccione un servicio");
      return;
    }
    
    if (!formData.barbero && !(isAdmin && !barberoActual?.id_barbero)) {
      alert("Por favor seleccione un barbero");
      return;
    }
    
    nextStep();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-qoder-dark-text-primary mb-2">
          Seleccionar Servicio y Barbero
        </h3>
        
        {/* Selector de servicio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
            Servicio
          </label>
          <select
            value={formData.servicio || ""}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="qoder-dark-select w-full px-3 py-2 rounded-lg"
          >
            <option value="">Seleccione un servicio</option>
            {serviciosData?.map((servicio) => (
              <option key={servicio.nombre} value={servicio.nombre}>
                {servicio.nombre} - ${servicio.precio} ({servicio.duracion_minutos} min)
              </option>
            ))}
          </select>
          
          {/* Mostrar información del servicio seleccionado */}
          {selectedServicio && (
            <div className="mt-2 p-2 bg-qoder-dark-bg-secondary rounded text-sm text-qoder-dark-text-primary">
              <div>Precio: ${selectedServicio.precio}</div>
              <div>Duración: {selectedServicio.duracion_minutos} minutos</div>
            </div>
          )}
        </div>
        
        {/* Selector de barbero */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
            Barbero
          </label>
          
          {/* Para barberos no administradores, mostrar el nombre del barbero actual como campo de solo lectura */}
          {!isAdmin && barberoActual?.id_barbero ? (
            <div className="qoder-dark-input w-full px-3 py-2 rounded-lg bg-qoder-dark-bg-secondary flex items-center">
              <span>{barberoActual.nombre}</span>
              <input
                type="hidden"
                value={barberoActual.nombre}
                onChange={(e) => handleBarberoChange(e.target.value)}
              />
            </div>
          ) : (
            <select
              value={formData.barbero || ""}
              onChange={(e) => handleBarberoChange(e.target.value)}
              className="qoder-dark-select w-full px-3 py-2 rounded-lg"
            >
              <option value="">Seleccione un barbero</option>
              {barberos?.map((barberoItem: any) => (
                <option key={barberoItem.id_barbero} value={barberoItem.nombre}>
                  {barberoItem.nombre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="cancel-button px-4 py-2 rounded-lg"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="action-button px-4 py-2 rounded-lg"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}