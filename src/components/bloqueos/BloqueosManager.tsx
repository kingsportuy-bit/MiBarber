// Componente para gestionar bloqueos y descansos
"use client";

import React, { useState, useEffect } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useBloqueosPorDia, useBloqueosBarbero } from "@/hooks/useBloqueosBarbero";
import { useDescansosExtra } from "@/hooks/useDescansosExtra";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { toast } from "sonner";
import type { TipoBloqueo } from "@/types/bloqueos";
import { createBloqueoSchema, createDescansoExtraSchema } from "@/features/bloqueos/utils/validations";

interface BloqueosManagerProps {
  mode: "admin" | "barbero";
}

export function BloqueosManager({ mode }: BloqueosManagerProps) {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { filters, setFilters } = useGlobalFilters();
  
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState<TipoBloqueo>("descanso");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [diasSemana, setDiasSemana] = useState<boolean[]>([false, false, false, false, false, false, false]); // Lunes a Domingo

  // Obtener bloqueos para la fecha seleccionada
  const {
    data: bloqueos,
    isLoading: isLoadingBloqueos,
    refetch: refetchBloqueos
  } = useBloqueosPorDia({
    idSucursal: filters.sucursalId || "",
    idBarbero: mode === "admin" ? (filters.barberoId || "") : (barbero?.id_barbero || ""),
    fecha
  });

  // Obtener descansos extra
  const {
    data: descansosExtra,
    isLoading: isLoadingDescansosExtra,
    refetch: refetchDescansosExtra
  } = useDescansosExtra().useList({
    idSucursal: filters.sucursalId || "",
    idBarbero: mode === "admin" ? (filters.barberoId || "") : (barbero?.id_barbero || "")
  });

  const { create: createBloqueo, remove: removeBloqueo } = useBloqueosBarbero();
  const { create: createDescanso, remove: removeDescanso } = useDescansosExtra();

  // Efecto para establecer valores por defecto
  useEffect(() => {
    if (mode === "barbero" && barbero?.id_sucursal && !filters.sucursalId) {
      setFilters(prev => ({
        ...prev,
        sucursalId: barbero.id_sucursal
      }));
    }
    
    if (mode === "barbero" && barbero?.id_barbero && !filters.barberoId) {
      setFilters(prev => ({
        ...prev,
        barberoId: barbero.id_barbero
      }));
    }
  }, [mode, barbero, filters.sucursalId, filters.barberoId, setFilters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idBarberia || !filters.sucursalId) {
      toast.error("Faltan datos requeridos");
      return;
    }
    
    try {
      // Validar que se hayan seleccionado sucursal y barbero
      if (!filters.sucursalId) {
        toast.error("Debe seleccionar una sucursal");
        return;
      }
      
      // Para administradores, verificar que se haya seleccionado un barbero
      if (mode === "admin" && !filters.barberoId) {
        toast.error("Debe seleccionar un barbero");
        return;
      }
      
      // Para barberos, verificar que tengan un ID asignado
      if (mode === "barbero" && (!barbero?.id_barbero || barbero.id_barbero.length === 0)) {
        toast.error("No se ha encontrado el ID del barbero");
        return;
      }
      
      // Lógica específica por tipo de bloqueo
      if (tipo === "descanso") {
        // Crear descanso extra en la tabla dedicada
        
        // Validar que se haya seleccionado al menos un día de la semana
        if (!diasSemana.some(dia => dia)) {
          toast.error("Debe seleccionar al menos un día de la semana");
          return;
        }
        
        if (!horaInicio || !horaFin) {
          toast.error("Debe especificar hora de inicio y fin");
          return;
        }
        
        // Validar que la hora de inicio sea menor que la hora de fin
        if (horaInicio >= horaFin) {
          toast.error("La hora de inicio debe ser menor que la hora de fin");
          return;
        }
        
        // Construir payload con tipo incluido
        const payload = {
          id_sucursal: filters.sucursalId,
          id_barbero: mode === "admin" ? (filters.barberoId || "") : (barbero?.id_barbero || ""),
          id_barberia: idBarberia || "", // Agregar id_barberia
          creado_por: barbero?.id_barbero || "", // Agregar creado_por
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          dias_semana: diasSemana,  // Array directo, NO JSON string
          motivo: motivo || null,
        };
        
        console.log("Creando descanso extra con payload:", payload);
        
        // Validar con Zod
        try {
          createDescansoExtraSchema.parse(payload);
        } catch (validationError: any) {
          console.error("Error de validación:", validationError);
          if (validationError.errors) {
            const errorMsg = validationError.errors
              .map((err: any) => `${err.path.join('.')}: ${err.message}`)
              .join(", ");
            toast.error(`Error de validación: ${errorMsg}`);
          }
          return;
        }
        
        // Pasar el payload al hook
        await createDescanso.mutateAsync(payload);
        toast.success("Descanso extra creado correctamente");
        
        // Limpiar el formulario
        setHoraInicio("");
        setHoraFin("");
        setMotivo("");
        setDiasSemana([false, false, false, false, false, false, false]);
      } else {
        // Crear bloqueo normal en la tabla existente
        const payload: any = {
          id_sucursal: filters.sucursalId,
          id_barbero: mode === "admin" ? (filters.barberoId || "") : (barbero?.id_barbero || ""),
          tipo,
          motivo: motivo || null
        };
        
        // Lógica específica por tipo de bloqueo
        if (tipo === "bloqueo_dia") {
          // Bloqueo de día completo: requiere fecha específica
          payload.fecha = fecha;
          payload.hora_inicio = null;
          payload.hora_fin = null;
        } else if (tipo === "bloqueo_horas") {
          // Bloqueo de horas: requiere fecha específica y rango de horas
          payload.fecha = fecha;
          if (!horaInicio || !horaFin) {
            toast.error("Debe especificar hora de inicio y fin");
            return;
          }
          payload.hora_inicio = horaInicio;
          payload.hora_fin = horaFin;
        }
        
        // Validar que los IDs sean válidos antes de enviar
        if (!payload.id_sucursal || payload.id_sucursal.length === 0) {
          toast.error("ID de sucursal inválido");
          return;
        }
        
        if (!payload.id_barbero || payload.id_barbero.length === 0) {
          toast.error("ID de barbero inválido");
          return;
        }
        
        console.log("Payload a validar:", payload);
        
        // Validar con Zod
        try {
          createBloqueoSchema.parse(payload);
        } catch (validationError: any) {
          console.error("Error de validación:", validationError);
          if (validationError.errors) {
            const errorMsg = validationError.errors
              .map((err: any) => `${err.path.join('.')}: ${err.message}`)
              .join(", ");
            toast.error(`Error de validación: ${errorMsg}`);
          }
          return;
        }
        
        await createBloqueo.mutateAsync(payload);
        toast.success("Bloqueo creado correctamente");
        
        // Limpiar el formulario
        if (tipo !== "bloqueo_dia") {
          setHoraInicio("");
          setHoraFin("");
        }
        setMotivo("");
        setDiasSemana([false, false, false, false, false, false, false]);
      }

      // Refetch bloqueos y descansos
      refetchBloqueos();
      refetchDescansosExtra();

    } catch (error: any) {
      console.error("Error al crear bloqueo/descanso:", JSON.stringify({
        message: error.message || 'Error desconocido',
        stack: error.stack,
        name: error.name,
        code: error.code || 'N/A'
      }, null, 2));
      
      console.error("Payload enviado:", JSON.stringify({
        id_sucursal: filters.sucursalId,
        id_barbero: mode === "admin" ? filters.barberoId : barbero?.id_barbero || "",
        fecha: tipo !== "descanso" ? fecha : undefined,
        tipo,
        motivo: motivo || null,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        dias_semana: tipo === "descanso" ? JSON.stringify(diasSemana) : undefined
      }, null, 2));
      
      // Mostrar errores específicos
      const errorMessage = error.message || (error.toString && error.toString()) || 'Error desconocido';
      if (errorMessage) {
        // Verificar si es un error de permisos
        if (errorMessage.includes("Permiso denegado") || errorMessage.includes("row-level security")) {
          toast.error("No tiene permisos para crear bloqueos. Verifique que esté correctamente autenticado y tenga acceso a esta barbería.");
        } 
        // Verificar si es un error de validación de Zod
        else if (error.errors) {
          console.error("Errores de validación:", JSON.stringify(error.errors, null, 2));
          const errorMsg = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(", ");
          toast.error(`Error de validación: ${errorMsg}`);
        } 
        // Otros errores
        else {
          toast.error(`Error: ${errorMessage}`);
        }
      } else {
        toast.error("Error al crear bloqueo. Por favor, revise los datos ingresados.");
      }
    }
  };

  const handleDelete = async (id: string, isDescanso: boolean = false) => {
    if (!window.confirm("¿Está seguro de eliminar este bloqueo?")) {
      return;
    }
    
    try {
      if (isDescanso) {
        await removeDescanso.mutateAsync(id);
        toast.success("Descanso extra eliminado correctamente");
      } else {
        await removeBloqueo.mutateAsync(id);
        toast.success("Bloqueo eliminado correctamente");
      }
      
      // Refetch bloqueos y descansos
      refetchBloqueos();
      refetchDescansosExtra();
    } catch (error) {
      console.error("Error al eliminar bloqueo:", error);
      toast.error("Error al eliminar bloqueo");
    }
  };

  const getTipoLabel = (tipo: TipoBloqueo) => {
    switch (tipo) {
      case "descanso": return "Descanso";
      case "bloqueo_horas": return "Bloqueo de horas";
      case "bloqueo_dia": return "Bloqueo de día completo";
      default: return tipo;
    }
  };

  const getTipoColor = (tipo: TipoBloqueo) => {
    switch (tipo) {
      case "descanso": return "bg-blue-500";
      case "bloqueo_horas": return "bg-yellow-500";
      case "bloqueo_dia": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const toggleDiaSemana = (index: number) => {
    const newDiasSemana = [...diasSemana];
    newDiasSemana[index] = !newDiasSemana[index];
    setDiasSemana(newDiasSemana);
  };

  const getNombreDia = (index: number) => {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return dias[index];
  };

  // Función para formatear los días de la semana seleccionados
  const formatDiasSemana = (diasSemanaStr: string | null | undefined) => {
    if (!diasSemanaStr) return "Sin días seleccionados";
    
    try {
      const diasSemana = JSON.parse(diasSemanaStr);
      if (!Array.isArray(diasSemana)) return "Formato inválido";
      
      const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      const seleccionados = diasSemana
        .map((selected: boolean, index: number) => selected ? nombresDias[index] : null)
        .filter(Boolean);
      
      return seleccionados.length > 0 ? seleccionados.join(", ") : "Sin días seleccionados";
    } catch (e) {
      return "Formato inválido";
    }
  };

  // Combinar bloqueos y descansos extra para mostrar en la lista
  const allItems = [
    ...(bloqueos || []).map((b: any) => ({ ...b, isDescanso: false })),
    ...(descansosExtra || []).map((d: any) => ({ ...d, isDescanso: true, tipo: "descanso" as TipoBloqueo }))
  ].sort((a, b) => {
    // Ordenar por fecha de creación descendente
    return new Date(b.creado_at).getTime() - new Date(a.creado_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Formulario para crear bloqueo */}
      <div className="bg-qoder-dark-bg-form rounded-lg p-4 border border-qoder-dark-border">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Crear bloqueo</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de bloqueo */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Tipo de bloqueo
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoBloqueo)}
                className="qoder-dark-input w-full"
              >
                <option value="descanso">Descanso extra (recurrente)</option>
                <option value="bloqueo_horas">Bloqueo de horas (único día)</option>
                <option value="bloqueo_dia">Bloqueo de día completo (único día)</option>
              </select>
              <p className="mt-1 text-xs text-qoder-dark-text-secondary">
                {tipo === "descanso" && "Se aplica los días seleccionados de forma recurrente"}
                {tipo === "bloqueo_horas" && "Bloquea un rango de horas en una fecha específica"}
                {tipo === "bloqueo_dia" && "Bloquea todo el día en una fecha específica"}
              </p>
            </div>
            
            {/* Motivo */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="qoder-dark-input w-full"
                maxLength={255}
                placeholder="Ej: Almuerzo, reunión, etc."
              />
            </div>
          </div>
          
          {/* Selector de días de la semana para descanso extra */}
          {tipo === "descanso" && (
            <div>
              <label className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Días de la semana
              </label>
              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((selected, index) => (
                  <div 
                    key={index}
                    onClick={() => toggleDiaSemana(index)}
                    className={`
                      flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200
                      ${selected 
                        ? "bg-qoder-dark-primary text-white shadow-md" 
                        : "bg-qoder-dark-bg-secondary text-qoder-dark-text-primary border border-qoder-dark-border hover:bg-qoder-dark-bg-hover"
                      }
                    `}
                  >
                    <span className="text-xs font-medium">{getNombreDia(index).substring(0, 3)}</span>
                    <span className="text-xs mt-1">
                      {selected ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-qoder-dark-text-secondary">
                Seleccione los días de la semana en los que se aplicará este descanso
              </p>
            </div>
          )}
          
          {/* Selector de fecha - solo para bloqueo de horas y día completo */}
          {(tipo === "bloqueo_horas" || tipo === "bloqueo_dia") && (
            <div>
              <label htmlFor="fechaEspecifica" className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                Fecha específica
              </label>
              <CustomDatePicker
                value={fecha}
                onChange={setFecha}
              />
              <p className="mt-1 text-xs text-qoder-dark-text-secondary">
                Seleccione la fecha en la que se aplicará este bloqueo
              </p>
            </div>
          )}
          
          {/* Selector de horas - solo para descanso y bloqueo_horas */}
          {tipo !== "bloqueo_dia" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="horaInicio" className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Hora de inicio
                </label>
                <input
                  type="time"
                  id="horaInicio"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="qoder-dark-input w-full"
                  required={tipo === "descanso" || tipo === "bloqueo_horas"}
                />
              </div>
              
              <div>
                <label htmlFor="horaFin" className="block text-sm font-medium text-qoder-dark-text-primary mb-1">
                  Hora de fin
                </label>
                <input
                  type="time"
                  id="horaFin"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="qoder-dark-input w-full"
                  required={tipo === "descanso" || tipo === "bloqueo_horas"}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="qoder-dark-button-primary px-4 py-2 rounded-lg"
              disabled={createBloqueo.isPending || createDescanso.isPending}
            >
              {(createBloqueo.isPending || createDescanso.isPending) ? "Creando..." : "Crear bloqueo"}
            </button>
          </div>
        </form>
      </div>
      
      {/* Lista de bloqueos y descansos extra */}
      <div className="bg-qoder-dark-bg-form rounded-lg p-4 border border-qoder-dark-border">
        <h3 className="text-lg font-semibold text-qoder-dark-text-primary mb-4">Bloqueos y descansos</h3>
        
        {(isLoadingBloqueos || isLoadingDescansosExtra) ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-qoder-dark-primary"></div>
            <p className="mt-2 text-qoder-dark-text-secondary">Cargando bloqueos...</p>
          </div>
        ) : allItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-qoder-dark-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                    Rango
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                    Motivo
                  </th>
                  {mode === "admin" && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                      Barbero
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-qoder-dark-border">
                {allItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(item.tipo)} text-white`}>
                        {getTipoLabel(item.tipo)}
                        {item.isDescanso && (
                          <span className="ml-1 text-xs">(Recurrente)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                      {item.tipo === "bloqueo_dia" ? (
                        <span>Todo el día</span>
                      ) : item.isDescanso ? (
                        <div>
                          <div>{item.hora_inicio} - {item.hora_fin}</div>
                          <div className="text-xs text-qoder-dark-text-secondary">
                            {(item as any).dias_semana ? formatDiasSemana((item as any).dias_semana) : "Sin días seleccionados"}
                          </div>
                        </div>
                      ) : (
                        <span>{item.hora_inicio} - {item.hora_fin}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                      {item.motivo || "-"}
                    </td>
                    {mode === "admin" && (
                      <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                        {/* Aquí deberías obtener el nombre del barbero */}
                        {item.id_barbero}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(item.id, item.isDescanso)}
                        disabled={removeBloqueo.isPending || removeDescanso.isPending}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-qoder-dark-text-secondary">No hay bloqueos ni descansos</p>
          </div>
        )}
      </div>
    </div>
  );
}