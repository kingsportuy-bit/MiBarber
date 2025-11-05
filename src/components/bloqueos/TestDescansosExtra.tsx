// Componente de prueba para verificar el funcionamiento de descansos extra
"use client";

import React, { useState } from "react";
import { useDescansosExtra } from "@/hooks/useDescansosExtra";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { toast } from "sonner";

export function TestDescansosExtra() {
  const { filters } = useGlobalFilters();
  const { useList, create, remove } = useDescansosExtra();
  
  const [horaInicio, setHoraInicio] = useState<string>("12:00");
  const [horaFin, setHoraFin] = useState<string>("13:00");
  const [motivo, setMotivo] = useState<string>("Almuerzo");
  const [diasSemana, setDiasSemana] = useState<boolean[]>([true, true, true, true, true, false, false]); // L-V

  // Obtener descansos extra
  const {
    data: descansosExtra,
    isLoading,
    refetch
  } = useList({
    idSucursal: filters.sucursalId || "",
    idBarbero: filters.barberoId || ""
  });

  const handleCreate = async () => {
    if (!filters.sucursalId) {
      toast.error("Debe seleccionar una sucursal");
      return;
    }

    try {
      const payload = {
        id_barberia: "22221994-1288-40d3-91b5-af611dd92abf", // ID de prueba
        id_sucursal: filters.sucursalId,
        id_barbero: filters.barberoId || "",
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        dias_semana: diasSemana, // Array directo
        motivo: motivo || null,
        creado_por: "f7a5a045-9f5e-4944-9fab-e19cc07e45f7" // ID de barbero de prueba
      };

      console.log("Creando descanso extra con payload:", payload);
      await create.mutateAsync(payload);
      toast.success("Descanso extra creado correctamente");
      refetch();
    } catch (error: any) {
      console.error("Error al crear descanso extra:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Está seguro de eliminar este descanso extra?")) {
      return;
    }
    
    try {
      await remove.mutateAsync(id);
      toast.success("Descanso extra eliminado correctamente");
      refetch();
    } catch (error) {
      console.error("Error al eliminar descanso extra:", error);
      toast.error("Error al eliminar descanso extra");
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

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test Descansos Extra</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Crear Descanso Extra</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1">Hora Inicio</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Hora Fin</label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Motivo</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">Días de la semana</label>
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((selected, index) => (
              <div 
                key={index}
                onClick={() => toggleDiaSemana(index)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded cursor-pointer
                  ${selected ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}
                `}
              >
                <span className="text-xs">{getNombreDia(index).substring(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleCreate}
          disabled={create.isPending}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {create.isPending ? "Creando..." : "Crear Descanso Extra"}
        </button>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Descansos Extra Existentes</h4>
        {isLoading ? (
          <p>Cargando...</p>
        ) : descansosExtra && descansosExtra.length > 0 ? (
          <div className="space-y-2">
            {descansosExtra.map((descanso: any) => (
              <div key={descanso.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div>{descanso.hora_inicio} - {descanso.hora_fin}</div>
                  <div className="text-sm text-gray-400">{descanso.motivo || "Sin motivo"}</div>
                </div>
                <button
                  onClick={() => handleDelete(descanso.id)}
                  disabled={remove.isPending}
                  className="px-2 py-1 bg-red-600 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay descansos extra</p>
        )}
      </div>
    </div>
  );
}