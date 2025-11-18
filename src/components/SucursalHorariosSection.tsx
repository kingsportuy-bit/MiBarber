"use client";

import { useState, useEffect } from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { toast } from "sonner";
import type { HorarioSucursal } from "@/types/db";

interface HorarioForm {
  id_horario?: string;
  id_dia: number;
  hora_apertura: string;
  hora_cierre: string;
  hora_inicio_almuerzo: string | null;
  hora_fin_almuerzo: string | null;
  activo: boolean;
}

interface SucursalHorariosSectionProps {
  idSucursal: string;
  nombreSucursal: string;
}

export function SucursalHorariosSection({ 
  idSucursal,
  nombreSucursal
}: SucursalHorariosSectionProps) {
  const { horarios, isLoading, upsertHorario } = useHorariosSucursales(idSucursal);
  const [horariosForm, setHorariosForm] = useState<Record<number, HorarioForm>>({});
  const [tieneAlmuerzo, setTieneAlmuerzo] = useState<Record<number, boolean>>({});
  const [guardando, setGuardando] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Inicializar horarios del formulario con los datos existentes
  useEffect(() => {
    if (!isLoading && horarios) {
      const horariosIniciales: Record<number, HorarioForm> = {};
      const almuerzoFlags: Record<number, boolean> = {};
      
      // Días de la semana con sus IDs y nombres
      const diasSemana = [
        { id: 0, nombre: "Domingo" },
        { id: 1, nombre: "Lunes" },
        { id: 2, nombre: "Martes" },
        { id: 3, nombre: "Miércoles" },
        { id: 4, nombre: "Jueves" },
        { id: 5, nombre: "Viernes" },
        { id: 6, nombre: "Sábado" },
      ];
      
      diasSemana.forEach(dia => {
        const horarioExistente = horarios.find(h => h.id_dia === dia.id);
        
        if (horarioExistente) {
          // Usar el horario existente
          horariosIniciales[dia.id] = {
            id_horario: horarioExistente.id_horario,
            id_dia: horarioExistente.id_dia,
            hora_apertura: horarioExistente.hora_apertura,
            hora_cierre: horarioExistente.hora_cierre,
            hora_inicio_almuerzo: horarioExistente.hora_inicio_almuerzo || null,
            hora_fin_almuerzo: horarioExistente.hora_fin_almuerzo || null,
            activo: horarioExistente.activo
          };
          almuerzoFlags[dia.id] = !!(
            horarioExistente.hora_inicio_almuerzo && 
            horarioExistente.hora_fin_almuerzo
          );
        } else {
          // Crear un nuevo horario con valores por defecto
          horariosIniciales[dia.id] = {
            id_dia: dia.id,
            hora_apertura: "08:00:00",
            hora_cierre: "18:00:00",
            hora_inicio_almuerzo: null,
            hora_fin_almuerzo: null,
            activo: true
          };
          almuerzoFlags[dia.id] = false;
        }
      });
      
      setHorariosForm(horariosIniciales);
      setTieneAlmuerzo(almuerzoFlags);
    }
  }, [isLoading, horarios]);

  const handleInputChange = (
    idDia: number,
    campo: keyof HorarioForm,
    valor: string | boolean | null
  ) => {
    setHorariosForm(prev => ({
      ...prev,
      [idDia]: {
        ...prev[idDia],
        [campo]: valor
      }
    }));
  };

  const handleToggleAlmuerzo = (idDia: number) => {
    const nuevoEstado = !tieneAlmuerzo[idDia];
    setTieneAlmuerzo(prev => ({
      ...prev,
      [idDia]: nuevoEstado
    }));
    
    // Si se desactiva el almuerzo, limpiar los valores
    if (!nuevoEstado) {
      setHorariosForm(prev => ({
        ...prev,
        [idDia]: {
          ...prev[idDia],
          hora_inicio_almuerzo: null,
          hora_fin_almuerzo: null
        }
      }));
    } else {
      // Si se activa el almuerzo, establecer valores por defecto
      setHorariosForm(prev => ({
        ...prev,
        [idDia]: {
          ...prev[idDia],
          hora_inicio_almuerzo: "12:00:00",
          hora_fin_almuerzo: "13:00:00"
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      // Validar que las horas de cierre no sean antes que las de apertura
      for (const horario of Object.values(horariosForm)) {
        if (horario.activo) {
          const apertura = horario.hora_apertura;
          const cierre = horario.hora_cierre;
          
          if (apertura && cierre) {
            // Convertir a objetos Date para comparar
            const [hApertura, mApertura] = apertura.split(':').map(Number);
            const [hCierre, mCierre] = cierre.split(':').map(Number);
            
            if (hCierre < hApertura || (hCierre === hApertura && mCierre < mApertura)) {
              throw new Error(`La hora de cierre no puede ser antes de la hora de apertura para el día ${["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][horario.id_dia]}`);
            }
          }
          
          // Validar horas de almuerzo si están activas
          if (tieneAlmuerzo[horario.id_dia] && horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo) {
            const inicioAlmuerzo = horario.hora_inicio_almuerzo;
            const finAlmuerzo = horario.hora_fin_almuerzo;
            
            const [hInicio, mInicio] = inicioAlmuerzo.split(':').map(Number);
            const [hFin, mFin] = finAlmuerzo.split(':').map(Number);
            
            if (hFin < hInicio || (hFin === hInicio && mFin < mInicio)) {
              throw new Error(`La hora de fin de almuerzo no puede ser antes de la hora de inicio para el día ${["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][horario.id_dia]}`);
            }
          }
        }
      }
      
      // Guardar todos los horarios
      const promesas = Object.values(horariosForm).map(horario => 
        upsertHorario({
          ...horario,
          id_sucursal: idSucursal
        } as Omit<HorarioSucursal, "created_at" | "updated_at">)
      );
      
      await Promise.all(promesas);
      
      toast.success("Horarios guardados correctamente");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error al guardar horarios:", error);
      const errorMessage = error.message || "Error desconocido al guardar los horarios";
      toast.error(`Error al guardar los horarios: ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-0 text-qoder-dark-text-primary text-center">Cargando horarios...</div>
    );
  }

  // Días de la semana con sus IDs y nombres
  const diasSemana = [
    { id: 0, nombre: "Domingo" },
    { id: 1, nombre: "Lunes" },
    { id: 2, nombre: "Martes" },
    { id: 3, nombre: "Miércoles" },
    { id: 4, nombre: "Jueves" },
    { id: 5, nombre: "Viernes" },
    { id: 6, nombre: "Sábado" },
  ];

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="bg-qoder-dark-accent-primary/10 p-0 rounded-lg mr-3">
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
            Horarios
          </h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
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
            Editar horarios
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-qoder-dark-bg-secondary hover:bg-gray-600 text-qoder-dark-text-primary rounded-lg transition-colors duration-200 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-qoder-dark-accent-primary hover:bg-qoder-dark-accent-primary/80 text-white rounded-lg transition-colors duration-200 text-sm"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-2">
          <SucursalHorarioDisplay idSucursal={idSucursal} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-0 border-b border-qoder-dark-border-primary">
            <nav className="flex space-x-5 overflow-x-auto">
              {diasSemana.map((dia) => (
                <button
                  key={dia.id}
                  type="button"
                  onClick={() => setActiveTab(dia.id)}
                  className={`pest-simple ${activeTab === dia.id ? 'active' : ''}`}
                >
                  {dia.nombre.substring(0, 3)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-0">
            {diasSemana.map((dia) => (
              <div 
                key={dia.id} 
                className={`${activeTab === dia.id ? 'block' : 'hidden'}`}
              >
                <div className="bg-qoder-dark-bg-primary p-0 rounded-lg">
                  <div className="flex items-center justify-between mb-0">
                    <h4 className="text-md font-semibold text-qoder-dark-text-primary">{dia.nombre}</h4>
                    <label className="flex items-center text-qoder-dark-text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={horariosForm[dia.id]?.activo ?? true}
                        onChange={(e) => handleInputChange(dia.id, "activo", e.target.checked)}
                        className="form-check-input h-3 w-3 mr-1 accent-qoder-dark-accent-primary"
                      />
                      <span className="text-xs">Activo</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="block text-xs font-medium text-qoder-dark-text-secondary mb-1">
                        Apertura
                      </label>
                      <input
                        type="time"
                        value={horariosForm[dia.id]?.hora_apertura?.substring(0, 5) || "08:00"}
                        onChange={(e) => handleInputChange(dia.id, "hora_apertura", `${e.target.value}:00`)}
                        className="w-full bg-qoder-dark-bg-form border border-qoder-dark-border-primary rounded px-2 py-1 text-qoder-dark-text-primary text-xs"
                        disabled={!horariosForm[dia.id]?.activo}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-qoder-dark-text-secondary mb-1">
                        Cierre
                      </label>
                      <input
                        type="time"
                        value={horariosForm[dia.id]?.hora_cierre?.substring(0, 5) || "18:00"}
                        onChange={(e) => handleInputChange(dia.id, "hora_cierre", `${e.target.value}:00`)}
                        className="w-full bg-qoder-dark-bg-form border border-qoder-dark-border-primary rounded px-2 py-1 text-qoder-dark-text-primary text-xs"
                        disabled={!horariosForm[dia.id]?.activo}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="flex items-center text-qoder-dark-text-primary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tieneAlmuerzo[dia.id] || false}
                            onChange={() => handleToggleAlmuerzo(dia.id)}
                            className="form-check-input h-3 w-3 mr-1 accent-qoder-dark-accent-primary"
                            disabled={!horariosForm[dia.id]?.activo}
                          />
                          <span className="text-xs">Almuerzo</span>
                        </label>
                      </div>
                      
                      {tieneAlmuerzo[dia.id] && horariosForm[dia.id]?.activo && (
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div>
                            <label className="block text-xs font-medium text-qoder-dark-text-secondary mb-1">
                              Inicio
                            </label>
                            <input
                              type="time"
                              value={horariosForm[dia.id]?.hora_inicio_almuerzo?.substring(0, 5) || "12:00"}
                              onChange={(e) => handleInputChange(dia.id, "hora_inicio_almuerzo", `${e.target.value}:00`)}
                              className="w-full bg-qoder-dark-bg-form border border-qoder-dark-border-primary rounded px-2 py-1 text-qoder-dark-text-primary text-xs"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-qoder-dark-text-secondary mb-1">
                              Fin
                            </label>
                            <input
                              type="time"
                              value={horariosForm[dia.id]?.hora_fin_almuerzo?.substring(0, 5) || "13:00"}
                              onChange={(e) => handleInputChange(dia.id, "hora_fin_almuerzo", `${e.target.value}:00`)}
                              className="w-full bg-qoder-dark-bg-form border border-qoder-dark-border-primary rounded px-2 py-1 text-qoder-dark-text-primary text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      )}
    </div>
  );
}

function SucursalHorarioDisplay({ idSucursal }: { idSucursal: string }) {
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
        (["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][horario.id_dia]) || 
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