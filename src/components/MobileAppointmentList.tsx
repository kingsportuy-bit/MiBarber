"use client";

import { useState, useEffect, useMemo } from "react";
import type { Appointment } from "@/types/db";
import { useCitas } from "@/hooks/useCitas";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { getLocalDateString, getLocalDateTime } from "@/shared/utils/dateUtils";
import { useClientesByIds } from "@/hooks/useClientes";
import { Client } from "@/types/db";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";

// Función para convertir puntaje a estrellas con borde dorado y sin relleno
const getStarsFromScore = (puntaje: number) => {
  // Para puntaje 0 y 1, mostrar 1 estrella
  // Para puntajes mayores, mostrar la cantidad correspondiente
  const starCount =
    puntaje <= 1 ? 1 : Math.min(5, Math.max(0, Math.floor(puntaje)));

  // Añadir solo estrellas vacías con borde dorado según el puntaje
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push(
      <span key={`star-${i}`} className="text-amber-400 text-sm">
        ☆
      </span>,
    );
  }

  return <span className="tracking-wide">{stars}</span>;
};

interface Task {
  id: string;
  content: string;
  cita?: Appointment;
}

interface MobileAppointmentListProps {
  onEdit?: (cita: Appointment) => void;
}

export function MobileAppointmentList({ onEdit }: MobileAppointmentListProps) {
  const { filters } = useGlobalFilters();
  const { barbero: barberoActual, isAdmin } = useBarberoAuth();
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Usar la fecha ajustada a la zona horaria local
    const localDate = getLocalDateTime();
    return localDate;
  });

  // Obtener citas para la fecha actual
  // Para la página de inicio, siempre mostrar las citas del barbero logueado
  const { data: citas = [], isLoading, isError, refetch } = useCitas({
    sucursalId: barberoActual?.id_sucursal || undefined,
    fecha: getLocalDateString(currentDate), // Usar nuestra función unificada
    barberoId: barberoActual?.id_barbero || undefined,
  });

  // Filtrar citas para mostrar solo pendientes y completadas (excluir canceladas)
  const citasFiltradas = useMemo(() => {
    return citas.filter(cita => 
      cita.estado === "pendiente" || cita.estado === "completado"
    );
  }, [citas]);

  // Obtener IDs únicos de clientes de las citas
  const clienteIds = useMemo(() => {
    return Array.from(
      new Set(
        citasFiltradas
          .map(cita => cita.id_cliente)
          .filter((id): id is string => id !== null && id !== undefined)
      )
    );
  }, [citasFiltradas]);

  // Obtener información de todos los clientes necesarios
  const { data: clientesData } = useClientesByIds(clienteIds);

  // Crear un mapa de clientes por ID para acceso rápido
  const clientesMap = useMemo(() => {
    if (!clientesData) return {};
    return clientesData.reduce((acc, cliente) => {
      acc[cliente.id_cliente] = cliente;
      return acc;
    }, {} as Record<string, Client>);
  }, [clientesData]);

  // Handlers de navegación
  const goToPreviousDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(getLocalDateTime());
  };

  // Función para manejar la edición de una cita
  const handleEditAppointment = (cita: Appointment) => {
    if (onEdit) {
      onEdit(cita);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qoder-dark-accent-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="qoder-dark-card p-6 text-center">
        <h3 className="text-lg font-medium text-red-500">Error al cargar las citas</h3>
        <p className="text-qoder-dark-text-secondary">No se pudieron cargar las citas. Intente refrescar la página.</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 qoder-dark-button-primary px-4 py-2 rounded-lg hover-lift smooth-transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Navegación de fechas */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={goToPreviousDay}
              className="p-2 rounded-full qoder-dark-button"
              title="Día anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {getLocalDateString(currentDate) !== getLocalDateString(new Date()) && (
              <button 
                onClick={goToToday}
                className="px-3 py-2 rounded-lg qoder-dark-button text-sm font-medium"
              >
                Hoy
              </button>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-qoder-dark-text-primary">
              {currentDate.toLocaleDateString('es-UY', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <p className="text-qoder-dark-text-secondary text-sm">
              {citasFiltradas?.length || 0} citas programadas
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={goToNextDay}
              className="p-2 rounded-full qoder-dark-button"
              title="Día siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de citas en formato de tarjetas */}
      <div className="space-y-3 w-full">
        {citasFiltradas.length > 0 ? (
          citasFiltradas
            .sort((a, b) => {
              // Ordenar por hora
              return a.hora.localeCompare(b.hora);
            })
            .map((cita) => {
            // Obtener información del cliente del mapa
            const clientData = cita.id_cliente ? clientesMap[cita.id_cliente] : undefined;
            
            return (
              <div
                key={cita.id_cita}
                className="p-3 rounded-lg shadow-md bg-qoder-dark-bg-form cursor-pointer"
                onClick={() => handleEditAppointment(cita)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    {/* Hora y nombre - tamaño y color blanco */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {cita.hora?.slice(0, 5) || 'Sin hora'}
                      </span>
                      <span className="text-white font-medium truncate flex items-center">
                        {cita.cliente_nombre || 'Cliente'}
                        {clientData && clientData.puntaje !== null && clientData.puntaje !== undefined && (
                          <span className="ml-2">
                            {getStarsFromScore(clientData.puntaje)}
                          </span>
                        )}
                      </span>
                    </div>
                    
                    {/* Servicio y duración - 50% opacidad */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white text-opacity-50 truncate">
                        {cita.servicio || 'Sin servicio'}
                      </span>
                      {cita.duracion && (
                        <span className="text-white text-opacity-50">
                          {cita.duracion}min
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Precio al extremo derecho - menor tamaño, 50% opacidad */}
                  <div className="text-right ml-2">
                    <span className="text-white text-opacity-50 text-sm font-medium">
                      ${cita.ticket || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-qoder-dark-text-secondary">
            No hay citas programadas para este día
          </div>
        )}
      </div>
    </div>
  );
}