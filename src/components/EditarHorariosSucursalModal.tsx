"use client";

import * as Dialog from "@radix-ui/react-dialog";
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
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-2xl -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="qoder-dark-card">
              <div className="p-6 text-qoder-dark-text-primary text-center">Cargando horarios...</div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md md:max-w-2xl -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="qoder-dark-card max-h-[90vh] overflow-y-auto">
            <div className="qoder-dark-window-header">
              <div>
                <Dialog.Title className="text-2xl font-bold text-qoder-dark-text-primary">
                  Horarios de Sucursal
                </Dialog.Title>
                <p className="text-qoder-dark-text-secondary mt-1">
                  {nombreSucursal}
                </p>
              </div>
              <button 
                onClick={() => onOpenChange(false)}
                className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-4">
                {diasSemana.map(dia => {
                  const horario = horariosForm[dia.id];
                  return (
                    <div key={dia.id} className="bg-qoder-dark-bg-form p-4 rounded-lg border border-qoder-dark-border-primary">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-qoder-dark-text-primary">{dia.nombre}</h3>
                        <label className="flex items-center text-qoder-dark-text-primary">
                          <input
                            type="checkbox"
                            checked={horario?.activo ?? true}
                            onChange={(e) => handleInputChange(dia.id, "activo", e.target.checked)}
                            className="mr-2"
                          />
                          Activo
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                            Hora de Apertura
                          </label>
                          <input
                            type="time"
                            value={horario?.hora_apertura?.substring(0, 5) || "08:00"}
                            onChange={(e) => handleInputChange(dia.id, "hora_apertura", `${e.target.value}:00`)}
                            className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-3 py-2 text-qoder-dark-text-primary"
                            disabled={!horario?.activo}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                            Hora de Cierre
                          </label>
                          <input
                            type="time"
                            value={horario?.hora_cierre?.substring(0, 5) || "18:00"}
                            onChange={(e) => handleInputChange(dia.id, "hora_cierre", `${e.target.value}:00`)}
                            className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-3 py-2 text-qoder-dark-text-primary"
                            disabled={!horario?.activo}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-qoder-dark-text-primary">
                              <input
                                type="checkbox"
                                checked={tieneAlmuerzo[dia.id] || false}
                                onChange={() => handleToggleAlmuerzo(dia.id)}
                                className="mr-2"
                                disabled={!horario?.activo}
                              />
                              Tiene hora de almuerzo
                            </label>
                          </div>
                          
                          {tieneAlmuerzo[dia.id] && horario?.activo && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div>
                                <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                                  Inicio de Almuerzo
                                </label>
                                <input
                                  type="time"
                                  value={horario?.hora_inicio_almuerzo?.substring(0, 5) || "12:00"}
                                  onChange={(e) => handleInputChange(dia.id, "hora_inicio_almuerzo", `${e.target.value}:00`)}
                                  className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-3 py-2 text-qoder-dark-text-primary"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-qoder-dark-text-secondary mb-1">
                                  Fin de Almuerzo
                                </label>
                                <input
                                  type="time"
                                  value={horario?.hora_fin_almuerzo?.substring(0, 5) || "13:00"}
                                  onChange={(e) => handleInputChange(dia.id, "hora_fin_almuerzo", `${e.target.value}:00`)}
                                  className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-3 py-2 text-qoder-dark-text-primary"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end space-x-4 p-4 border-t border-qoder-dark-border-primary">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="cancel-button"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="action-button"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar Horarios"}
                </button>
              </div>

            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}