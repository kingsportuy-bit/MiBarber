"use client";

import React from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import type { HorarioSucursal } from "@/types/db";

interface HorarioDisplayProps {
  idSucursal: string;
}

export function HorarioDisplay({ idSucursal }: HorarioDisplayProps) {
  const { horarios, isLoading, isError } = useHorariosSucursales(idSucursal);

  if (isLoading) {
    return <div className="text-qoder-dark-text-secondary">Cargando horarios...</div>;
  }

  if (isError) {
    return <div className="text-red-500">Error al cargar los horarios</div>;
  }

  // Ordenar los horarios por día de la semana
  const horariosOrdenados = [...horarios].sort((a, b) => a.id_dia - b.id_dia);

  // Formatear hora (HH:mm:ss -> HH:mm)
  const formatearHora = (hora: string | null | undefined): string => {
    if (!hora) return "--:--";
    return hora.substring(0, 5);
  };

  return (
    <div className="bg-qoder-dark-bg-form rounded-lg p-4">
      <div className="grid grid-cols-7 gap-1 text-center">
        {horariosOrdenados.map((horario) => {
          // Usar el nombre corto del día desde la base de datos, con fallback al nombre por defecto
          // Corregido el esquema de días (0=Domingo, 1=Lunes, ..., 6=Sábado)
          const nombresCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
          const nombreCorto = horario.nombre_corto || nombresCortos[horario.id_dia] || `Día ${horario.id_dia}`;
          
          return (
            <div key={horario.id_dia} className="border border-qoder-dark-border-primary rounded">
              <div className="font-medium text-xs text-qoder-dark-text-secondary p-1">{nombreCorto}</div>
              {horario.activo ? (
                <div className="text-xs p-1">
                  <div>{formatearHora(horario.hora_apertura)}-{formatearHora(horario.hora_cierre)}</div>
                  {horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo && (
                    <div className="text-yellow-500 text-xs">
                      ({formatearHora(horario.hora_inicio_almuerzo)}-{formatearHora(horario.hora_fin_almuerzo)})
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs p-1 text-qoder-dark-text-disabled">Cerrado</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}