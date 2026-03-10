"use client";

import { useState } from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { toast } from "sonner";
import type { HorarioSucursal } from "@/types/db";
import { EditarHorariosSucursalModal } from "@/components/EditarHorariosSucursalModal";

interface SucursalHorariosSectionProps {
  idSucursal: string;
  nombreSucursal: string;
}

export function SucursalHorariosSection({
  idSucursal,
  nombreSucursal
}: SucursalHorariosSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-[#1a1a1a] p-1.5 rounded mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#C5A059]"
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
          <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-rasputin)] tracking-wide">
            Horarios
          </h3>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#C5A059] border border-[#333] rounded text-xs tracking-widest transition-colors duration-200 flex items-center"
          style={{ fontFamily: 'var(--font-rasputin), serif' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1.5"
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
          Editar horarios
        </button>
      </div>

      <div className="space-y-2 mt-4">
        <SucursalHorarioDisplay idSucursal={idSucursal} />
      </div>

      <EditarHorariosSucursalModal
        open={isEditing}
        onOpenChange={setIsEditing}
        idSucursal={idSucursal}
        nombreSucursal={nombreSucursal}
      />
    </div>
  );
}

function SucursalHorarioDisplay({ idSucursal }: { idSucursal: string }) {
  const { horarios, isLoading, isError } = useHorariosSucursales(idSucursal);

  if (isLoading) {
    return <div className="text-[14px] text-[#8a8a8a] py-2 font-[family-name:var(--font-body)]">Cargando horarios...</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-sm py-2 font-[family-name:var(--font-body)]">Error al cargar los horarios</div>;
  }

  // Si no hay horarios configurados
  if (horarios.length === 0) {
    return (
      <div className="text-left py-2">
        <p className="text-[#8a8a8a] text-[14px] font-[family-name:var(--font-body)]">
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
      const nombreCorto = horario.nombre_corto ||
        (["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][horario.id_dia]) ||
        `Día ${horario.id_dia}`;

      const diaInfo = { id: horario.id_dia, nombre: nombreCorto };

      const almuerzoInfo = horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo ? {
        inicio: formatearHora(horario.hora_inicio_almuerzo),
        fin: formatearHora(horario.hora_fin_almuerzo)
      } : null;

      if (!horario.activo) {
        if (grupoActual) {
          grupos.push(grupoActual);
          grupoActual = null;
        }
        grupos.push({ dias: [diaInfo], horario: horario, almuerzo: null });
      } else {
        if (!grupoActual) {
          grupoActual = { dias: [diaInfo], horario: horario, almuerzo: almuerzoInfo };
        } else {
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
            grupoActual.dias.push(diaInfo);
          } else {
            grupos.push(grupoActual);
            grupoActual = { dias: [diaInfo], horario: horario, almuerzo: almuerzoInfo };
          }
        }
      }
    });

    if (grupoActual) {
      grupos.push(grupoActual);
    }
    return grupos;
  };

  const formatearRangoDias = (dias: { id: number; nombre: string }[]) => {
    if (dias.length === 1) return dias[0].nombre;
    if (dias.length === 2) return `${dias[0].nombre} y ${dias[1].nombre}`;

    const ids = dias.map(d => d.id).sort((a, b) => a - b);
    const esConsecutivo = ids.every((id, index) => index === 0 || id === ids[index - 1] + 1);

    if (esConsecutivo && dias.length > 2) return `${dias[0].nombre} a ${dias[dias.length - 1].nombre}`;
    return dias.map(d => d.nombre).join(", ");
  };

  const grupos = agruparDiasPorHorario();

  return (
    <div className="space-y-4">
      {grupos.map((grupo, index) => {
        const rangoDias = formatearRangoDias(grupo.dias);

        return (
          <div key={index} className="flex justify-between items-start text-[14px] border-b border-[#1a1a1a] pb-3 last:border-0 last:pb-0">
            <span className="text-[#8a8a8a] font-medium font-[family-name:var(--font-body)]">{rangoDias}:</span>
            {grupo.horario.activo ? (
              <div className="text-right font-[family-name:var(--font-body)]">
                <span className="text-white">
                  {formatearHora(grupo.horario.hora_apertura)} - {formatearHora(grupo.horario.hora_cierre)}
                </span>
                {grupo.almuerzo && (
                  <div className="text-[#C5A059] text-[12px] mt-0.5">
                    Descanso: {grupo.almuerzo.inicio} - {grupo.almuerzo.fin}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[#555] font-[family-name:var(--font-body)]">Cerrado</span>
            )}
          </div>
        );
      })}
    </div>
  );
}