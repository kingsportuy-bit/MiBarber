"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useHorariosSucursales } from "@/hooks/useHorariosSucursales";
import type { HorarioSucursal } from "@/types/db";

interface HorariosSucursalFormProps {
  idSucursal: string;
  onClose: () => void;
}

const diasSemana = [
  { id: 0, nombre: "Domingo", corto: "Dom", icon: "📅" },
  { id: 1, nombre: "Lunes", corto: "Lun", icon: "📅" },
  { id: 2, nombre: "Martes", corto: "Mar", icon: "📅" },
  { id: 3, nombre: "Miércoles", corto: "Mié", icon: "📅" },
  { id: 4, nombre: "Jueves", corto: "Jue", icon: "📅" },
  { id: 5, nombre: "Viernes", corto: "Vie", icon: "📅" },
  { id: 6, nombre: "Sábado", corto: "Sáb", icon: "📅" },
];

export function HorariosSucursalForm({ idSucursal, onClose }: HorariosSucursalFormProps) {
  const { horarios, isLoading, upsertHorario } = useHorariosSucursales(idSucursal);
  const [horariosForm, setHorariosForm] = useState<Record<number, HorarioSucursal>>({});
  const [tieneAlmuerzo, setTieneAlmuerzo] = useState<Record<number, boolean>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoizar los valores iniciales para evitar recrearlos en cada render
  const initialValues = useMemo(() => {
    const horariosIniciales: Record<number, HorarioSucursal> = {};
    const almuerzoFlags: Record<number, boolean> = {};
    
    diasSemana.forEach(dia => {
      const horarioExistente = horarios.find(h => h.id_dia === dia.id);
      
      if (horarioExistente) {
        // Usar el horario existente completo
        horariosIniciales[dia.id] = horarioExistente;
        almuerzoFlags[dia.id] = !!(
          horarioExistente.hora_inicio_almuerzo && 
          horarioExistente.hora_fin_almuerzo
        );
      } else {
        // Crear un nuevo horario con valores por defecto
        horariosIniciales[dia.id] = {
          id_sucursal: idSucursal,
          id_dia: dia.id,
          hora_apertura: "08:00:00",
          hora_cierre: "18:00:00",
          hora_inicio_almuerzo: null,
          hora_fin_almuerzo: null,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as HorarioSucursal;
        almuerzoFlags[dia.id] = false;
      }
    });
    
    return { horariosIniciales, almuerzoFlags };
  }, [horarios, idSucursal]);

  // Inicializar horarios del formulario con los datos existentes
  useEffect(() => {
    setHorariosForm(initialValues.horariosIniciales);
    setTieneAlmuerzo(initialValues.almuerzoFlags);
  }, [initialValues]);

  const handleInputChange = (
    idDia: number,
    campo: keyof HorarioSucursal,
    valor: string | boolean | null
  ) => {
    setHorariosForm(prev => ({
      ...prev,
      [idDia]: {
        ...prev[idDia],
        [campo]: valor,
        updated_at: new Date().toISOString()
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
          hora_fin_almuerzo: null,
          updated_at: new Date().toISOString()
        }
      }));
    } else {
      // Si se activa el almuerzo, establecer valores por defecto
      setHorariosForm(prev => ({
        ...prev,
        [idDia]: {
          ...prev[idDia],
          hora_inicio_almuerzo: "12:00:00",
          hora_fin_almuerzo: "13:00:00",
          updated_at: new Date().toISOString()
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    
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
              throw new Error(`La hora de cierre no puede ser antes de la hora de apertura para el día ${diasSemana.find(d => d.id === horario.id_dia)?.nombre}`);
            }
          }
          
          // Validar horas de almuerzo si están activas
          if (tieneAlmuerzo[horario.id_dia] && horario.hora_inicio_almuerzo && horario.hora_fin_almuerzo) {
            const inicioAlmuerzo = horario.hora_inicio_almuerzo;
            const finAlmuerzo = horario.hora_fin_almuerzo;
            
            const [hInicio, mInicio] = inicioAlmuerzo.split(':').map(Number);
            const [hFin, mFin] = finAlmuerzo.split(':').map(Number);
            
            if (hFin < hInicio || (hFin === hInicio && mFin < mInicio)) {
              throw new Error(`La hora de fin de almuerzo no puede ser antes de la hora de inicio para el día ${diasSemana.find(d => d.id === horario.id_dia)?.nombre}`);
            }
          }
        }
      }
      
      // Preparar los horarios para guardar (excluir propiedades calculadas)
      const horariosParaGuardar = Object.values(horariosForm).map(horario => {
        const { 
          nombre_dia, 
          nombre_corto, 
          created_at, 
          updated_at, 
          ...horarioParaGuardar 
        } = horario;
        return horarioParaGuardar;
      });
      
      // Guardar todos los horarios
      const promesas = horariosParaGuardar.map(horario => 
        upsertHorario(horario)
      );
      
      await Promise.all(promesas);
      
      onClose();
    } catch (error: any) {
      console.error("Error al guardar horarios:", error);
      const errorMessage = error.message || "Error desconocido al guardar los horarios";
      setError(errorMessage);
      alert(`Error al guardar los horarios: ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-qoder-dark-bg-secondary rounded-lg p-6 w-full max-w-md">
          <div className="text-qoder-dark-text-primary text-center">Cargando horarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-qoder-dark-bg-secondary rounded-2xl border border-qoder-dark-border-primary p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-qoder-dark-border-primary">
          <div>
            <h2 className="text-2xl font-bold text-qoder-dark-text-primary">Configuración de Horarios</h2>
            <p className="text-qoder-dark-text-secondary text-sm mt-1">Establece los horarios de atención para cada día de la semana</p>
          </div>
          <button 
            onClick={onClose}
            className="text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary text-2xl p-2 rounded-full hover:bg-qoder-dark-bg-primary transition-colors duration-200"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {diasSemana.map(dia => (
              <div 
                key={dia.id} 
                className={`bg-gradient-to-br from-qoder-dark-bg-form to-qoder-dark-bg-secondary p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  horariosForm[dia.id]?.activo 
                    ? "border-qoder-dark-border-primary shadow-sm" 
                    : "border-qoder-dark-border-secondary opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{dia.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-qoder-dark-text-primary">{dia.nombre}</h3>
                      <p className="text-qoder-dark-text-secondary text-sm">{dia.corto}</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={horariosForm[dia.id]?.activo ?? true}
                        onChange={(e) => handleInputChange(dia.id, "activo", e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${
                        horariosForm[dia.id]?.activo 
                          ? "bg-qoder-dark-accent-primary" 
                          : "bg-qoder-dark-bg-primary"
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        horariosForm[dia.id]?.activo ? "transform translate-x-6" : ""
                      }`}></div>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      horariosForm[dia.id]?.activo 
                        ? "text-qoder-dark-text-primary" 
                        : "text-qoder-dark-text-secondary"
                    }`}>
                      {horariosForm[dia.id]?.activo ? "Activo" : "Inactivo"}
                    </span>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-qoder-dark-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <label className="block text-sm font-medium text-qoder-dark-text-secondary">
                        Hora de Apertura
                      </label>
                    </div>
                    <input
                      type="time"
                      value={horariosForm[dia.id]?.hora_apertura?.substring(0, 5) || "08:00"}
                      onChange={(e) => handleInputChange(dia.id, "hora_apertura", `${e.target.value}:00`)}
                      className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-4 py-3 text-qoder-dark-text-primary focus:ring-2 focus:ring-qoder-dark-accent-primary focus:border-transparent transition-all duration-200"
                      disabled={!horariosForm[dia.id]?.activo}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-qoder-dark-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <label className="block text-sm font-medium text-qoder-dark-text-secondary">
                        Hora de Cierre
                      </label>
                    </div>
                    <input
                      type="time"
                      value={horariosForm[dia.id]?.hora_cierre?.substring(0, 5) || "18:00"}
                      onChange={(e) => handleInputChange(dia.id, "hora_cierre", `${e.target.value}:00`)}
                      className="w-full bg-qoder-dark-bg-primary border border-qoder-dark-border-primary rounded-lg px-4 py-3 text-qoder-dark-text-primary focus:ring-2 focus:ring-qoder-dark-accent-primary focus:border-transparent transition-all duration-200"
                      disabled={!horariosForm[dia.id]?.activo}
                    />
                  </div>
                  
                  <div className="md:col-span-2 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-qoder-dark-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={tieneAlmuerzo[dia.id] || false}
                            onChange={() => handleToggleAlmuerzo(dia.id)}
                            className="mr-2 h-4 w-4 text-qoder-dark-accent-primary rounded focus:ring-qoder-dark-accent-primary"
                            disabled={!horariosForm[dia.id]?.activo}
                          />
                          <span className="text-sm font-medium text-qoder-dark-text-primary group-hover:text-qoder-dark-text-secondary transition-colors duration-200">
                            Configurar hora de almuerzo
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {tieneAlmuerzo[dia.id] && horariosForm[dia.id]?.activo && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-4 bg-qoder-dark-bg-primary/50 rounded-xl border border-qoder-dark-border-secondary">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <label className="block text-sm font-medium text-qoder-dark-text-secondary">
                              Inicio de Almuerzo
                            </label>
                          </div>
                          <input
                            type="time"
                            value={horariosForm[dia.id]?.hora_inicio_almuerzo?.substring(0, 5) || "12:00"}
                            onChange={(e) => handleInputChange(dia.id, "hora_inicio_almuerzo", `${e.target.value}:00`)}
                            className="w-full bg-qoder-dark-bg-secondary border border-qoder-dark-border-primary rounded-lg px-4 py-3 text-qoder-dark-text-primary focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <label className="block text-sm font-medium text-qoder-dark-text-secondary">
                              Fin de Almuerzo
                            </label>
                          </div>
                          <input
                            type="time"
                            value={horariosForm[dia.id]?.hora_fin_almuerzo?.substring(0, 5) || "13:00"}
                            onChange={(e) => handleInputChange(dia.id, "hora_fin_almuerzo", `${e.target.value}:00`)}
                            className="w-full bg-qoder-dark-bg-secondary border border-qoder-dark-border-primary rounded-lg px-4 py-3 text-qoder-dark-text-primary focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-qoder-dark-border-primary">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-qoder-dark-bg-primary text-qoder-dark-text-primary rounded-xl hover:bg-qoder-dark-bg-hover border border-qoder-dark-border-primary transition-all duration-200 hover:shadow-md flex items-center justify-center"
              disabled={guardando}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-3 bg-qoder-dark-accent-primary text-white rounded-xl hover:bg-qoder-dark-accent-hover disabled:opacity-50 transition-all duration-200 hover:shadow-lg flex items-center justify-center"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Horarios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}