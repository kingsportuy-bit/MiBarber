"use client";

import React from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import type { HorarioSucursal } from "@/types/db";

interface SucursalHorarioDisplayProps {
  idSucursal: string;
}

export function SucursalHorarioDisplay({ idSucursal }: SucursalHorarioDisplayProps) {
  const { horarios, isLoading, isError } = useHorariosSucursales(idSucursal);

  if (isLoading) {
    return <div className="text-qoder-dark-text-secondary text-sm">Cargando horarios...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-sm">Error al cargar los horarios</div>;
  }

  // Si no hay horarios configurados
  if (horarios.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-qoder-dark-text-secondary text-sm">
          Sin horarios configurados
        </p>
      </div>
    );
  }

  // Ordenar los horarios por día de la semana
  const horariosOrdenados = [...horarios].sort((a, b) => a.id_dia - b.id_dia);

  // Formatear hora (HH:mm:ss -> HH:mm)
  const formatearHora = (hora: string | null | undefined): string => {
    if (!hora) return "--:--";
    return hora.substring(0, 5);
  };

  // Agrupar días consecutivos con el mismo horario
  const agruparDiasPorHorario = () => {
    const grupos: { 
      dias: { id: number; nombre: string }[]; 
      horario: HorarioSucursal;
      almuerzo?: { inicio: string; fin: string } | null;
    }[] = [];
    
    let grupoActual: { 
      dias: { id: number; nombre: string }[]; 
      horario: HorarioSucursal;
      almuerzo?: { inicio: string; fin: string } | null;
    } | null = null;

    horariosOrdenados.forEach((horario) => {
      // Usar el nombre corto del día desde la base de datos, con fallback
      const nombreCorto = horario.nombre_corto || 
        (["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][horario.id_dia - 1]) || 
        `Día ${horario.id_dia}`;
      
      const diaInfo = { id: horario.id_dia, nombre: nombreCorto };
      
      // Información de almuerzo
      const almuerzoInfo = horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo ? {
        inicio: formatearHora(horario.hora_inicio_almuerzo),
        fin: formatearHora(horario.hora_fin_almuerzo)
      } : null;

      if (!horario.activo) {
        // Día cerrado
        if (grupoActual) {
          grupos.push(grupoActual);
          grupoActual = null;
        }
        grupos.push({
          dias: [diaInfo],
          horario: horario,
          almuerzo: null
        });
      } else {
        // Día activo
        if (!grupoActual) {
          // Iniciar nuevo grupo
          grupoActual = {
            dias: [diaInfo],
            horario: horario,
            almuerzo: almuerzoInfo
          };
        } else {
          // Verificar si el horario coincide con el grupo actual
          const mismoHorario = 
            grupoActual.horario.hora_apertura === horario.hora_apertura &&
            grupoActual.horario.hora_cierre === horario.hora_cierre &&
            grupoActual.horario.activo === horario.activo;
          
          const mismoAlmuerzo = 
            (grupoActual.almuerzo === null && almuerzoInfo === null) ||
            (grupoActual.almuerzo && almuerzoInfo &&
             grupoActual.almuerzo.inicio === almuerzoInfo.inicio &&
             grupoActual.almuerzo.fin === almuerzoInfo.fin);
          
          if (mismoHorario && mismoAlmuerzo) {
            // Agregar al grupo existente
            grupoActual.dias.push(diaInfo);
          } else {
            // Finalizar grupo actual e iniciar uno nuevo
            grupos.push(grupoActual);
            grupoActual = {
              dias: [diaInfo],
              horario: horario,
              almuerzo: almuerzoInfo
            };
          }
        }
      }
    });

    // Agregar el último grupo si existe
    if (grupoActual) {
      grupos.push(grupoActual);
    }

    return grupos;
  };

  // Formatear rango de días
  const formatearRangoDias = (dias: { id: number; nombre: string }[]) => {
    if (dias.length === 1) {
      return dias[0].nombre;
    }
    
    if (dias.length === 2) {
      return `${dias[0].nombre} y ${dias[1].nombre}`;
    }
    
    // Para rangos más largos, verificar si son consecutivos
    const ids = dias.map(d => d.id).sort((a, b) => a - b);
    const esConsecutivo = ids.every((id, index) => 
      index === 0 || id === ids[index - 1] + 1
    );
    
    if (esConsecutivo && dias.length > 2) {
      return `${dias[0].nombre} a ${dias[dias.length - 1].nombre}`;
    }
    
    // Si no son consecutivos, listar todos
    return dias.map(d => d.nombre).join(", ");
  };

  const grupos = agruparDiasPorHorario();

  return (
    <div className="space-y-2">
      {grupos.map((grupo, index) => {
        const rangoDias = formatearRangoDias(grupo.dias);
        
        return (
          <div key={index} className="flex justify-between items-start text-sm">
            <span className="text-qoder-dark-text-secondary font-medium">{rangoDias}:</span>
            {grupo.horario.activo ? (
              <div className="text-right">
                <span className="text-qoder-dark-text-primary">
                  {formatearHora(grupo.horario.hora_apertura)} - {formatearHora(grupo.horario.hora_cierre)}
                </span>
                {grupo.almuerzo && (
                  <div className="text-yellow-500 text-xs">
                    Alm: {grupo.almuerzo.inicio} - {grupo.almuerzo.fin}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-qoder-dark-text-disabled">Cerrado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}