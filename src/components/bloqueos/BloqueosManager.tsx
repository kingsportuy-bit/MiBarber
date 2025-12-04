// Componente para gestionar bloqueos y descansos
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useBloqueosBarbero, useBloqueosPorDia, useTodosLosBloqueos } from "@/hooks/useBloqueosBarbero";
import { useDescansosExtra } from "@/hooks/useDescansosExtra";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { toast } from "sonner";
import type { TipoBloqueo } from "@/types/bloqueos";
import { createBloqueoSchema, createDescansoExtraSchema } from "@/features/bloqueos/utils/validations";
import { GlobalFilters } from "@/components/shared/GlobalFilters";

interface BloqueosManagerProps {
  mode: "admin" | "barbero";
}

// Interfaz para los items de bloqueo
interface BloqueoItem {
  id: string;
  tipo: TipoBloqueo;
  fecha?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  motivo?: string | null;
  dias_semana?: boolean[] | string | null;
  isDescanso: boolean;
  activo: boolean;
  creado_at: string;
  id_barbero: string;
}

// Componente BloqueoForm
interface BloqueoFormProps {
  tipo: TipoBloqueo;
  setTipo: (tipo: TipoBloqueo) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  diasSemana: boolean[];
  toggleDiaSemana: (index: number) => void;
  getNombreDia: (index: number) => string;
  fecha: string;
  setFecha: (fecha: string) => void;
  horaInicio: string;
  setHoraInicio: (hora: string) => void;
  horaFin: string;
  setHoraFin: (hora: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  createBloqueo: { isPending: boolean };
  createDescanso: { isPending: boolean };
}

const BloqueoForm: React.FC<BloqueoFormProps> = ({
  tipo,
  setTipo,
  motivo,
  setMotivo,
  diasSemana,
  toggleDiaSemana,
  getNombreDia,
  fecha,
  setFecha,
  horaInicio,
  setHoraInicio,
  horaFin,
  setHoraFin,
  handleSubmit,
  createBloqueo,
  createDescanso
}) => {
  return (
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
  );
};

// Componente BloqueosTabs
interface BloqueosTabsProps {
  activeTab: "bloqueos" | "descansos";
  setActiveTab: (tab: "bloqueos" | "descansos") => void;
  bloqueosActivos: any[];
  bloqueosInactivos: any[];
  descansosActivos: any[];
  descansosInactivos: any[];
  isLoadingTodosLosBloqueos: boolean;
  isLoadingTodosLosDescansosExtra: boolean;
  handleDelete: (id: string, isDescanso: boolean) => void;
  removeBloqueo: { isPending: boolean };
  removeDescanso: { isPending: boolean };
  getTipoLabel: (tipo: TipoBloqueo) => string;
  getTipoColor: (tipo: TipoBloqueo) => string;
  formatDiasSemana: (diasSemanaStr: string | null | undefined) => string;
  mode: "admin" | "barbero";
  barbero: any;
  filters: any;
  barberos: any[];
}

const BloqueosTabs: React.FC<BloqueosTabsProps> = ({
  activeTab,
  setActiveTab,
  bloqueosActivos,
  bloqueosInactivos,
  descansosActivos,
  descansosInactivos,
  isLoadingTodosLosBloqueos,
  isLoadingTodosLosDescansosExtra,
  handleDelete,
  removeBloqueo,
  removeDescanso,
  getTipoLabel,
  getTipoColor,
  formatDiasSemana,
  mode,
  barbero,
  filters,
  barberos
}) => {
  return (
    <>
      <div className="border-b border-qoder-dark-border mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("bloqueos")}
            className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
              activeTab === "bloqueos"
                ? "bg-qoder-dark-bg-primary text-qoder-dark-primary border-t border-l border-r border-qoder-dark-border"
                : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary hover:bg-qoder-dark-bg-hover"
            }`}
          >
            Bloqueos ({bloqueosActivos.length + bloqueosInactivos.length})
          </button>
          <button
            onClick={() => setActiveTab("descansos")}
            className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
              activeTab === "descansos"
                ? "bg-qoder-dark-bg-primary text-qoder-dark-primary border-t border-l border-r border-qoder-dark-border"
                : "text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary hover:bg-qoder-dark-bg-hover"
            }`}
          >
            Descansos Extra ({descansosActivos.length + descansosInactivos.length})
          </button>
        </nav>
      </div>
      
      {/* Contenido de los tabs */}
      <div className="mt-4">
        {activeTab === "bloqueos" ? (
          <div className="space-y-6">
            {/* Bloqueos Activos */}
            <div>
              <h4 className="text-md font-semibold text-qoder-dark-text-primary mb-3">Bloqueos Activos ({bloqueosActivos.length})</h4>
              {isLoadingTodosLosBloqueos ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-qoder-dark-primary"></div>
                  <p className="mt-2 text-qoder-dark-text-secondary">Cargando bloqueos activos...</p>
                </div>
              ) : bloqueosActivos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-qoder-dark-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Fecha
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
                      {bloqueosActivos.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(item.tipo)} text-white`}>
                              {getTipoLabel(item.tipo)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.fecha || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.tipo === "bloqueo_dia" ? (
                              <span>Todo el día</span>
                            ) : (
                              <span>{item.hora_inicio} - {item.hora_fin}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {item.motivo || "-"}
                          </td>
                          {mode === "admin" && (
                            <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                              {/* Mostrar el nombre del barbero en lugar del ID */}
                              {filters.barberoId === item.id_barbero 
                                ? barbero?.nombre 
                                : barberos?.find((b: any) => b.id_barbero === item.id_barbero)?.nombre || item.id_barbero}
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.id, item.isDescanso)}
                              disabled={removeBloqueo.isPending || removeDescanso.isPending}
                              className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                              style={{ backgroundColor: 'transparent', border: 'none', padding: '4px' }}
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-qoder-dark-text-secondary">No hay bloqueos activos</p>
                </div>
              )}
            </div>
            
            {/* Bloqueos Inactivos */}
            {bloqueosInactivos.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-qoder-dark-text-primary mb-3">Bloqueos Inactivos ({bloqueosInactivos.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-qoder-dark-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Fecha
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
                      {bloqueosInactivos.map((item) => (
                        <tr key={item.id} className="opacity-70">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(item.tipo)} text-white`}>
                              {getTipoLabel(item.tipo)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.fecha || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.tipo === "bloqueo_dia" ? (
                              <span>Todo el día</span>
                            ) : (
                              <span>{item.hora_inicio} - {item.hora_fin}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {item.motivo || "-"}
                          </td>
                          {mode === "admin" && (
                            <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                              {/* Mostrar el nombre del barbero en lugar del ID */}
                              {filters.barberoId === item.id_barbero 
                                ? barbero?.nombre 
                                : barberos?.find((b: any) => b.id_barbero === item.id_barbero)?.nombre || item.id_barbero}
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.id, item.isDescanso)}
                              disabled={removeBloqueo.isPending || removeDescanso.isPending}
                              className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                              style={{ backgroundColor: 'transparent', border: 'none', padding: '4px' }}
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Descansos Activos */}
            <div>
              <h4 className="text-md font-semibold text-qoder-dark-text-primary mb-3">Descansos Activos ({descansosActivos.length})</h4>
              {isLoadingTodosLosDescansosExtra ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-qoder-dark-primary"></div>
                  <p className="mt-2 text-qoder-dark-text-secondary">Cargando descansos activos...</p>
                </div>
              ) : descansosActivos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-qoder-dark-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Horario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Días
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
                      {descansosActivos.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.hora_inicio} - {item.hora_fin}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {(item as any).dias_semana ? formatDiasSemana((item as any).dias_semana) : "Sin días seleccionados"}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {item.motivo || "-"}
                          </td>
                          {mode === "admin" && (
                            <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                              {/* Mostrar el nombre del barbero en lugar del ID */}
                              {filters.barberoId === item.id_barbero 
                                ? barbero?.nombre 
                                : barberos?.find((b: any) => b.id_barbero === item.id_barbero)?.nombre || item.id_barbero}
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.id, item.isDescanso)}
                              disabled={removeBloqueo.isPending || removeDescanso.isPending}
                              className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                              style={{ backgroundColor: 'transparent', border: 'none', padding: '4px' }}
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-qoder-dark-text-secondary">No hay descansos activos</p>
                </div>
              )}
            </div>
            
            {/* Descansos Inactivos */}
            {descansosInactivos.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-qoder-dark-text-primary mb-3">Descansos Inactivos ({descansosInactivos.length})</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-qoder-dark-border">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Horario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-qoder-dark-text-secondary uppercase tracking-wider">
                          Días
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
                      {descansosInactivos.map((item) => (
                        <tr key={item.id} className="opacity-70">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-qoder-dark-text-primary">
                            {item.hora_inicio} - {item.hora_fin}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {(item as any).dias_semana ? formatDiasSemana((item as any).dias_semana) : "Sin días seleccionados"}
                          </td>
                          <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                            {item.motivo || "-"}
                          </td>
                          {mode === "admin" && (
                            <td className="px-4 py-3 text-sm text-qoder-dark-text-primary">
                              {/* Mostrar el nombre del barbero en lugar del ID */}
                              {filters.barberoId === item.id_barbero 
                                ? barbero?.nombre 
                                : barberos?.find((b: any) => b.id_barbero === item.id_barbero)?.nombre || item.id_barbero}
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(item.id, item.isDescanso)}
                              disabled={removeBloqueo.isPending || removeDescanso.isPending}
                              className="text-red-500 hover:text-red-300 bg-transparent !bg-none border-none p-1"
                              style={{ backgroundColor: 'transparent', border: 'none', padding: '4px' }}
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export function BloqueosManager({ mode }: BloqueosManagerProps) {
  const { idBarberia, barbero, isAdmin } = useBarberoAuth();
  const { filters, setFilters, barberos } = useGlobalFilters();
  
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState<TipoBloqueo>("descanso");
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [diasSemana, setDiasSemana] = useState<boolean[]>([false, false, false, false, false, false, false]); // Lunes a Domingo
  const [activeTab, setActiveTab] = useState<"bloqueos" | "descansos">("bloqueos");

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

  // Obtener todos los bloqueos (sin filtrar por fecha)
  const {
    data: todosLosBloqueos,
    isLoading: isLoadingTodosLosBloqueos,
    refetch: refetchTodosLosBloqueos
  } = useTodosLosBloqueos({
    idSucursal: mode === "admin" ? (filters.sucursalId || undefined) : (barbero?.id_sucursal || undefined),
    idBarbero: mode === "admin" ? (filters.barberoId || undefined) : (barbero?.id_barbero || undefined)
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

  // Obtener todos los descansos extra (sin filtrar)
  const {
    data: todosLosDescansosExtra,
    isLoading: isLoadingTodosLosDescansosExtra,
    refetch: refetchTodosLosDescansosExtra
  } = useDescansosExtra().useListAll({
    idSucursal: mode === "admin" ? (filters.sucursalId || undefined) : (barbero?.id_sucursal || undefined),
    idBarbero: mode === "admin" ? (filters.barberoId || undefined) : (barbero?.id_barbero || undefined)
  });

  const { create: createBloqueo, remove: removeBloqueo } = useBloqueosBarbero();
  const { create: createDescanso, remove: removeDescanso } = useDescansosExtra();

  // Ref para rastrear si ya se inicializaron los filtros
  const initializedFromBarberoRef = useRef(false);

  // Efecto para establecer valores por defecto
  useEffect(() => {
    if (mode !== 'barbero') return;
    if (!barbero?.id_barbero || !barbero?.id_sucursal) return;
    if (initializedFromBarberoRef.current) return;

    setFilters(prev => ({
      ...prev,
      sucursalId: prev.sucursalId ?? barbero.id_sucursal,
      barberoId: prev.barberoId ?? barbero.id_barbero,
    }));

    initializedFromBarberoRef.current = true;
    
    // Resetear la bandera cuando cambia el barbero
    return () => {
      initializedFromBarberoRef.current = false;
    };
  }, [mode, barbero?.id_barbero, barbero?.id_sucursal, setFilters]);

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
      refetchTodosLosBloqueos();
      refetchTodosLosDescansosExtra();

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
      refetchTodosLosBloqueos();
      refetchTodosLosDescansosExtra();
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

  // Combinar todos los bloqueos y descansos extra para mostrar en la lista
  const allItems: BloqueoItem[] = [
    ...(todosLosBloqueos || []).map((b: any) => ({ 
      ...b, 
      isDescanso: false,
      activo: b.activo !== undefined ? b.activo : true // Asumir activo si no existe el campo
    })),
    ...(todosLosDescansosExtra || []).map((d: any) => ({ 
      ...d, 
      isDescanso: true, 
      tipo: "descanso" as TipoBloqueo,
      activo: d.activo !== undefined ? d.activo : true // Asumir activo si no existe el campo
    }))
  ].sort((a, b) => {
    // Ordenar por fecha de creación descendente
    return new Date(b.creado_at).getTime() - new Date(a.creado_at).getTime();
  });

  // Separar bloqueos y descansos
  const bloqueosItems = allItems.filter(item => !item.isDescanso);
  const descansosItems = allItems.filter(item => item.isDescanso);

  // Separar activos e inactivos
  const bloqueosActivos = bloqueosItems.filter(item => item.activo);
  const bloqueosInactivos = bloqueosItems.filter(item => !item.activo);
  const descansosActivos = descansosItems.filter(item => item.activo);
  const descansosInactivos = descansosItems.filter(item => !item.activo);

  return (
    <div className="space-y-6 w-full">
      {/* Filtros globales (solo para administradores) */}
      {mode === "admin" && (
        <div className="rounded-lg bg-transparent p-3">
          <GlobalFilters showDateFilters={false} />
        </div>
      )}

      {/* Formulario para crear bloqueo */}
      <BloqueoForm
        tipo={tipo}
        setTipo={setTipo}
        motivo={motivo}
        setMotivo={setMotivo}
        diasSemana={diasSemana}
        toggleDiaSemana={toggleDiaSemana}
        getNombreDia={getNombreDia}
        fecha={fecha}
        setFecha={setFecha}
        horaInicio={horaInicio}
        setHoraInicio={setHoraInicio}
        horaFin={horaFin}
        setHoraFin={setHoraFin}
        handleSubmit={handleSubmit}
        createBloqueo={createBloqueo}
        createDescanso={createDescanso}
      />
      
      {/* Tabs para separar bloqueos y descansos */}
      <BloqueosTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bloqueosActivos={bloqueosActivos}
        bloqueosInactivos={bloqueosInactivos}
        descansosActivos={descansosActivos}
        descansosInactivos={descansosInactivos}
        isLoadingTodosLosBloqueos={isLoadingTodosLosBloqueos}
        isLoadingTodosLosDescansosExtra={isLoadingTodosLosDescansosExtra}
        handleDelete={handleDelete}
        removeBloqueo={removeBloqueo}
        removeDescanso={removeDescanso}
        getTipoLabel={getTipoLabel}
        getTipoColor={getTipoColor}
        formatDiasSemana={formatDiasSemana}
        mode={mode}
        barbero={barbero}
        filters={filters}
        barberos={barberos}
      />
    </div>
  );
}