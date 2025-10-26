"use client";

import React, { useState, useEffect } from "react";
import { useCajaRecordsDirect } from "@/hooks/useCajaRecordsDirect";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { formatCurrency } from "@/utils/formatters";
import { WindowLayout } from "@/components/WindowLayout";
import { CustomDatePicker } from "@/components/CustomDatePicker";

interface CajaSummaryDirectProps {
  onEdit?: (record: any) => void;
  onDelete?: (id_movimiento: string) => void;
  sucursalId?: number; // Nueva propiedad para filtrar por sucursal
}

export function CajaSummaryDirect({ onEdit, onDelete, sucursalId }: CajaSummaryDirectProps) {
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [barbero, setBarbero] = useState<number>(0);
  
  // Usar la sucursalId pasada como prop o el estado local
  const effectiveSucursalId = sucursalId;
  
  const { data, isLoading } = useCajaRecordsDirect({ 
    desde: desde || undefined, 
    hasta: hasta || undefined, 
    barberoId: barbero || undefined,
    sucursalId: effectiveSucursalId || undefined
  });
  
  // Obtener la lista de sucursales
  const { sucursalesQuery } = useBarberiaInfo();
  const sucursales = sucursalesQuery.data || [];
  
  // Obtener la lista de barberos filtrados por la sucursal seleccionada
  const barberosQuery = useBarberos(effectiveSucursalId ? String(effectiveSucursalId) : undefined);
  const barberos = barberosQuery.data || [];
  const isLoadingBarberos = barberosQuery.isLoading;

  // Establecer fechas predeterminadas al cargar el componente
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Formatear las fechas como YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    setDesde(formatDate(firstDay));
    setHasta(formatDate(lastDay));
  }, []);

  // Función para obtener el nombre del barbero por ID
  const getBarberoName = (barberoId: number | string | null | undefined) => {
    try {
      // Manejar casos donde barberoId es null, undefined o vacío
      if (barberoId === null || barberoId === undefined || barberoId === "") {
        return "-";
      }
      
      // Convertir a string primero para manejar todos los casos
      const barberoIdStr = String(barberoId).trim();
      
      // Si está vacío después de trim, retornar "-"
      if (barberoIdStr === "") {
        return "-";
      }
      
      // Convertir a número
      const barberoIdNum = parseInt(barberoIdStr, 10);
      
      // Verificar si es un número válido
      if (isNaN(barberoIdNum)) {
        return barberoIdStr;
      }
      
      // Buscar el nombre del barbero si tenemos la lista
      if (barberos && barberos.length > 0) {
        const barbero = barberos.find((b: any) => Number(b.id_barbero) === barberoIdNum);
        return barbero ? barbero.nombre : barberoIdStr;
      }
      
      // Si no tenemos la lista de barberos, retornar el ID como string
      return barberoIdStr;
    } catch (error) {
      console.error("Error en getBarberoName:", error, "barberoId:", barberoId);
      return String(barberoId || "-");
    }
  };

  // Función para verificar si faltan datos en un registro
  const hasMissingData = (record: any) => {
    // Agregar registro de depuración
    console.log("Verificando datos faltantes para registro:", record);
    
    // Verificar que los campos requeridos no estén vacíos
    const missing = 
      (!record.id_cliente || record.id_cliente.trim() === "") ||
      (!record.servicio || record.servicio.trim() === "") ||
      (!record.monto || record.monto <= 0);
    console.log("Registro tiene datos faltantes:", missing);
    return missing;
  };

  return (
    <WindowLayout title="Resumen de Caja">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-qoder-dark-text-secondary">Desde</label>
            <CustomDatePicker
              value={desde}
              onChange={setDesde}
              placeholder="Desde"
            />
          </div>
          <div>
            <label className="text-xs text-qoder-dark-text-secondary">Hasta</label>
            <CustomDatePicker
              value={hasta}
              onChange={setHasta}
              placeholder="Hasta"
            />
          </div>
          <div>
            <label className="text-xs text-qoder-dark-text-secondary">Barbero</label>
            <select
              value={barbero}
              onChange={(e) => setBarbero(Number(e.target.value))}
              className="w-full qoder-dark-input p-2"
              disabled={isLoadingBarberos || !effectiveSucursalId}
            >
              <option value="0">Todos los barberos</option>
              {barberos.map((b: any) => (
                <option key={b.id_barbero} value={b.id_barbero}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          {/* Solo mostrar el selector de sucursal si no se pasa una sucursalId */}
          {!sucursalId && (
            <div>
              <label className="text-xs text-qoder-dark-text-secondary">Sucursal</label>
              <select
                value={effectiveSucursalId || ""}
                onChange={(e) => {
                  // No hacemos nada aquí ya que la sucursal viene de la página principal
                  // En el futuro podríamos manejar esto de otra manera si es necesario
                }}
                className="w-full qoder-dark-input p-2"
                disabled
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.numero_sucursal}>
                    {s.nombre_sucursal || `Sucursal ${s.numero_sucursal}`} #{s.numero_sucursal}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="qoder-dark-window overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-qoder-dark-bg-tertiary">
              <tr>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Fecha</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Cliente</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Servicio</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Barbero</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Monto</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Método de Pago</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">N° factura</th>
                {(onEdit || onDelete) && (
                  <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-3 py-2 text-qoder-dark-text-primary" colSpan={9}>Cargando…</td></tr>
              )}
              {(data?.records || []).map((record: any) => {
                // Agregar registro de depuración
                console.log("Procesando registro:", record);
                
                // Asegurarnos de que cada registro tenga una key única
                const recordKey = record.id_movimiento || record.id_registro || record.id || Math.random();
                const missingData = hasMissingData(record);
                return (
                  <tr 
                    key={recordKey} 
                    className={`border-t border-qoder-dark-border-primary qoder-dark-table-row ${
                      missingData ? "bg-yellow-900/20" : ""
                    }`}
                  >
                    <td className="px-3 py-2">{record.fecha ? record.fecha.split('T')[0] : ""}</td>
                    <td className={`px-3 py-2 ${missingData && !record.cliente_nombre ? "text-red-400" : ""}`}>
                      {record.cliente_nombre || "-"}
                    </td>
                    <td className={`px-3 py-2 ${missingData && !record.servicio ? "text-red-400" : ""}`}>
                      {record.servicio || "-"}
                    </td>
                    <td className="px-3 py-2">
                      {(() => {
                        try {
                          return record.barbero_nombre || getBarberoName(record.barbero_id);
                        } catch (error) {
                          console.error("Error obteniendo nombre de barbero:", error, "record:", record);
                          return "-";
                        }
                      })()}
                    </td>
                    <td className={`px-3 py-2 ${missingData && !record.monto ? "text-red-400" : ""}`}>
                      {record.monto ? formatCurrency(record.monto) : "-"}
                    </td>
                    <td className="px-3 py-2">{record.metodo_pago || "-"}</td>
                    <td className="px-3 py-2">
                      {record.numero_factura || "-"}
                      {!record.numero_factura && (
                        <span className="text-yellow-500 ml-2" title="Falta número de factura">⚠️</span>
                      )}
                    </td>
                    {(onEdit || onDelete) && (
                      <td className="px-3 py-2">
                        <div className="flex space-x-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(record)}
                              className="text-blue-500 hover:text-blue-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(record.id_movimiento)}
                              className="text-red-500 hover:text-red-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {!isLoading && (data?.records.length ?? 0) === 0 && (
                <tr><td className="px-3 py-6 text-center opacity-60 text-qoder-dark-text-primary" colSpan={8}>Sin movimientos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="text-right text-lg font-semibold text-qoder-dark-text-primary">
          Total: {formatCurrency(data?.total || 0)}
        </div>
      </div>
    </WindowLayout>
  );
}