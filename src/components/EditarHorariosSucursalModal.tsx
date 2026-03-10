"use client";

import { useState, useEffect } from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import { toast } from "sonner";
import type { HorarioSucursal } from "@/types/db";
import { Checkbox } from "./ui/app-checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface HorarioForm {
  id_horario?: string;
  id_dia: number;
  hora_apertura: string;
  hora_cierre: string;
  hora_inicio_almuerzo: string | null;
  hora_fin_almuerzo: string | null;
  activo: boolean;
}

interface EditarHorariosSucursalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idSucursal: string;
  nombreSucursal: string;
}

export function EditarHorariosSucursalModal({
  open,
  onOpenChange,
  idSucursal,
  nombreSucursal
}: EditarHorariosSucursalModalProps) {
  const { horarios, isLoading, upsertHorario } = useHorariosSucursales(idSucursal);
  const [horariosForm, setHorariosForm] = useState<Record<number, HorarioForm>>({});
  const [tieneAlmuerzo, setTieneAlmuerzo] = useState<Record<number, boolean>>({});
  const [guardando, setGuardando] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    // Por defecto, expandir solo el primer día (o todos, según preferencia, pero uno es más limpio)
    // El usuario pidió que se pueda expandir y comprimir, así que lo manejaremos como un toggle.
    return { 1: true }; // Lunes expandido por defecto
  });

  const toggleDayExpansion = (idDia: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [idDia]: !prev[idDia]
    }));
  };

  // Inicializar horarios del formulario con los datos existentes
  useEffect(() => {
    if (open && !isLoading && horarios) {
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
  }, [open, isLoading, horarios]);

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

      // Eliminar el mensaje de éxito según las preferencias del usuario
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al guardar horarios:", error);
      const errorMessage = error.message || "Error desconocido al guardar los horarios";
      toast.error(`Error al guardar los horarios: ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  if (isLoading) {
    if (!open) return null;
    return (
      <div className="v2-overlay">
        <div className="v2-modal max-w-lg w-full">
          <div className="v2-modal-body p-6 text-white text-center font-[family-name:var(--font-body)]">
            Cargando horarios...
          </div>
        </div>
      </div>
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

  if (!open) return null;

  return (
    <div className="v2-overlay" onClick={() => onOpenChange(false)}>
      <div className="v2-modal max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="v2-modal-header border-b border-[#1a1a1a] pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold font-[family-name:var(--font-rasputin)] text-[#F5F0EB] tracking-wide">
              Horarios de Sucursal
            </h2>
            <p className="text-[11px] text-[#8a8a8a] mt-1 font-[family-name:var(--font-body)]">
              {nombreSucursal}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#8a8a8a] hover:text-[#C5A059] transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="v2-modal-body">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {diasSemana.map(dia => {
              const horario = horariosForm[dia.id];
              return (
                <div key={dia.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden transition duration-200">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#111] transition-colors"
                    onClick={() => toggleDayExpansion(dia.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded-md transition-colors ${expandedDays[dia.id] ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-[#8A8A8A]'}`}>
                        {expandedDays[dia.id] ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </div>
                      <h3 className="text-[14px] font-semibold text-white font-[family-name:var(--font-body)]">
                        {dia.nombre}
                      </h3>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={horario?.activo ?? true}
                        onChange={(e) => handleInputChange(dia.id, "activo", e.target.checked)}
                        label="Activo"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedDays[dia.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="p-4 pt-0 border-t border-[#1a1a1a]/50">
                          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ${!horario?.activo ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                                Hora de Apertura
                              </label>
                              <input
                                type="time"
                                value={horario?.hora_apertura?.substring(0, 5) || "08:00"}
                                onChange={(e) => handleInputChange(dia.id, "hora_apertura", `${e.target.value}:00`)}
                                className="app-input"
                                disabled={!horario?.activo}
                              />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                              <label className="text-[13px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                                Hora de Cierre
                              </label>
                              <input
                                type="time"
                                value={horario?.hora_cierre?.substring(0, 5) || "18:00"}
                                onChange={(e) => handleInputChange(dia.id, "hora_cierre", `${e.target.value}:00`)}
                                className="app-input"
                                disabled={!horario?.activo}
                              />
                            </div>

                            <div className="md:col-span-2 pt-2 border-t border-[#1a1a1a] border-dashed">
                              <div className="flex items-center justify-between mb-2">
                                <Checkbox
                                  checked={tieneAlmuerzo[dia.id] || false}
                                  onChange={() => handleToggleAlmuerzo(dia.id)}
                                  disabled={!horario?.activo}
                                  label="Tiene hora de descanso/almuerzo"
                                />
                              </div>

                              {tieneAlmuerzo[dia.id] && horario?.activo && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 bg-[#111] p-3 rounded border border-[#1a1a1a]">
                                  <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[12px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                                      Inicio de Descanso
                                    </label>
                                    <input
                                      type="time"
                                      value={horario?.hora_inicio_almuerzo?.substring(0, 5) || "12:00"}
                                      onChange={(e) => handleInputChange(dia.id, "hora_inicio_almuerzo", `${e.target.value}:00`)}
                                      className="app-input"
                                    />
                                  </div>

                                  <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[12px] font-medium text-[#8A8A8A] font-[family-name:var(--font-body)] tracking-wide">
                                      Fin de Descanso
                                    </label>
                                    <input
                                      type="time"
                                      value={horario?.hora_fin_almuerzo?.substring(0, 5) || "13:00"}
                                      onChange={(e) => handleInputChange(dia.id, "hora_fin_almuerzo", `${e.target.value}:00`)}
                                      className="app-input"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="v2-modal-footer flex gap-3 justify-end items-center mt-6 pt-4 border-t border-[#1a1a1a]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-[14px] font-medium text-[#8a8a8a] hover:text-[#C5A059] transition-colors"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="app-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar Horarios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}