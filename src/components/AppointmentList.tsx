"use client";

import { useMemo, useState, useEffect } from "react";
import type { Appointment } from "@/types/db";
import { useCitas } from "@/hooks/useCitas";
import { useBarberoAuth } from "@/hooks/useBarberoAuth"; // Importar hook de autenticación
import { useBarberosList } from "@/hooks/useBarberosList"; // Importar hook para obtener barberos
import { useSucursales } from "@/hooks/useSucursales"; // Importar hook para obtener sucursales
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha

interface AppointmentListProps {
  barbero?: number;
  fecha?: string;
}

export function AppointmentList({ fecha }: AppointmentListProps) {
  const { barbero: barberoActual, isAdmin, idBarberia } = useBarberoAuth(); // Obtener información del usuario
  const { sucursales } = useSucursales(idBarberia || undefined); // Obtener lista de sucursales
  const [barberoFiltro, setBarberoFiltro] = useState<string | null>(null); // Estado para el filtro de barbero
  const [sucursalFiltro, setSucursalFiltro] = useState<string | null>(null); // Estado para el filtro de sucursal
  const { data: barberos } = useBarberosList(idBarberia || undefined, sucursalFiltro); // Obtener lista de barberos filtrados por sucursal
  
  // Cuando cambia la sucursal, resetear el filtro de barbero
  useEffect(() => {
    setBarberoFiltro(null);
  }, [sucursalFiltro]);
  
  // Obtener citas con los filtros aplicados
  const { data: citas, isLoading } = useCitas({
    sucursalId: isAdmin && sucursalFiltro ? sucursalFiltro : undefined, // Aplicar filtro de sucursal si es admin
    fecha: undefined, // No filtrar por fecha específica (lo haremos después)
    barberoId: isAdmin && barberoFiltro ? barberoFiltro : undefined // Aplicar filtro de barbero si es admin
  });
  
  // Formatear la fecha para mostrar
  const formatDisplayDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Verificar si es hoy
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return "Turnos de Hoy";
    }
    
    // Formato para otros días: "Turnos del martes, 25 de setiembre" (sin año)
    const weekday = date.toLocaleDateString('es-UY', { weekday: 'long' });
    const dayOfMonth = date.getDate();
    const monthName = date.toLocaleDateString('es-UY', { month: 'long' });
    
    return `Turnos del ${weekday}, ${dayOfMonth} de ${monthName}`;
  };
  
  // Filtrar citas para mostrar solo las del día especificado
  const citasDelDia = useMemo(() => {
    if (!citas) return [];
    
    // Usar la utilidad de fecha corregida
    const targetDate = fecha || getLocalDateString();
    return citas.filter(cita => cita.fecha === targetDate);
  }, [citas, fecha]);

  // Ordenar citas por hora
  const citasOrdenadas = useMemo(() => {
    return [...citasDelDia].sort((a, b) => a.hora.localeCompare(b.hora));
  }, [citasDelDia]);

  if (isLoading) {
    return (
      <div className="qoder-dark-window p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-qoder-dark-accent-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-window">
      <div className="v2-window-header">
        <h3 className="font-semibold text-[var(--text-primary)]">{fecha ? formatDisplayDate(fecha) : "Turnos de Hoy"}</h3>
        <span className="cursor-button px-2 py-1 text-xs font-mono bg-[var(--bg-tertiary)] rounded text-[var(--text-primary)]">
          {citasOrdenadas.length}
        </span>
      </div>
      
      {/* Filtros para administradores */}
      {isAdmin && (
        <div className="p-4 border-b border-[var(--border-primary)] flex flex-wrap gap-2">
          <select 
            value={sucursalFiltro || ""}
            onChange={(e) => setSucursalFiltro(e.target.value || null)}
            className="v2-select"
          >
            <option value="">Todas las sucursales</option>
            {sucursales?.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
              </option>
            ))}
          </select>
          <select 
            value={barberoFiltro || ""}
            onChange={(e) => setBarberoFiltro(e.target.value || null)}
            className="v2-select"
          >
            <option value="">Todos los barberos</option>
            {barberos?.map((barbero) => (
              <option key={barbero.id_barbero} value={barbero.id_barbero}>
                {barbero.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="p-4">
        {citasOrdenadas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">No hay turnos programados para hoy</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citasOrdenadas.map((cita) => (
              <div 
                key={cita.id_cita} 
                className="v2-card p-4 hover-lift smooth-transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">{cita.cliente_nombre}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{cita.servicio}</p>
                  </div>
                  <span className="text-sm font-mono text-[var(--text-secondary)]">{cita.hora.slice(0, 5)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {cita.barbero}
                  </span>
                  {cita.ticket && (
                    <span className="text-xs font-medium text-[var(--status-success)]">
                      ${cita.ticket}
                    </span>
                  )}
                </div>
                
                {cita.nota && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-primary)]">
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2" title={cita.nota}>
                      {cita.nota}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}