"use client";

import React, { useState, useEffect } from "react";
import { useCaja } from "@/hooks/useCaja";
import { useBarberos } from "@/hooks/useBarberos";
import { useBarberiaInfo } from "@/hooks/useBarberiaInfo";
import { formatCurrency } from "@/utils/formatters";
import { WindowLayout } from "@/components/WindowLayout";
import { CustomDatePicker } from "@/components/CustomDatePicker";

export function CajaSummary() {
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [barbero, setBarbero] = useState<number>(0);
  const [sucursalId, setSucursalId] = useState<number>(1); // Por defecto la primera sucursal
  const { data, isLoading } = useCaja({ 
    desde: desde || undefined, 
    hasta: hasta || undefined, 
    barbero: barbero || undefined,
    sucursalId: sucursalId || undefined
  });
  
  // Obtener la lista de sucursales
  const { sucursalesQuery } = useBarberiaInfo();
  const sucursales = sucursalesQuery.data || [];
  
  // Log para depuración
  useEffect(() => {
    if (data) {
      console.log(`📊 CajaSummary: ${data.rows.length} registros cargados, total: ${data.total}`);
    }
  }, [data]);
  
  // Obtener la lista de barberos para la sucursal seleccionada
  const { data: barberos, isLoading: isLoadingBarberos } = useBarberos(
    sucursalId ? sucursalId.toString() : undefined
  );

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

  // Función para obtener el nombre del barbero
  const getBarberoName = (barberoValue: string | number) => {
    // Si es un número, buscar el nombre del barbero por su ID
    if (typeof barberoValue === 'number') {
      if (barberos) {
        const barbero = barberos.find(b => b.id_barbero === barberoValue.toString());
        return barbero ? barbero.nombre : barberoValue.toString();
      }
      return barberoValue.toString();
    }
    
    // Si es un string, verificar si es un ID numérico
    if (typeof barberoValue === 'string' && !isNaN(Number(barberoValue))) {
      if (barberos) {
        const barbero = barberos.find(b => b.id_barbero === barberoValue);
        return barbero ? barbero.nombre : barberoValue;
      }
      return barberoValue;
    }
    
    // Si es un string que no es un número, asumir que es el nombre
    return barberoValue;
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
              disabled={isLoadingBarberos}
            >
              <option value="0">Todos los barberos</option>
              {barberos?.map((b) => (
                <option key={b.id_barbero} value={b.id_barbero}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-qoder-dark-text-secondary">Sucursal</label>
            <select
              value={sucursalId}
              onChange={(e) => setSucursalId(Number(e.target.value))}
              className="w-full qoder-dark-input p-2"
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.numero_sucursal}>
                  {s.nombre_sucursal || "Sucursal"} #{s.numero_sucursal}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="qoder-dark-window overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-qoder-dark-bg-tertiary">
              <tr>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Fecha</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Hora</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Cliente</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Servicio</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Barbero</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">Monto</th>
                <th className="px-3 py-2 text-left text-qoder-dark-text-primary">N° factura</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="px-3 py-2 text-qoder-dark-text-primary" colSpan={7}>Cargando…</td></tr>
              )}
              {(data?.rows || []).map((r: any) => (
                <tr key={r.id_cita} className="border-t border-qoder-dark-border-primary qoder-dark-table-row">
                  <td className="px-3 py-2">{r.fecha}</td>
                  <td className="px-3 py-2">{r.hora?.slice(0, 5)}</td>
                  <td className="px-3 py-2">{r.cliente_nombre}</td>
                  <td className="px-3 py-2">{r.servicio}</td>
                  <td className="px-3 py-2">{getBarberoName(r.barbero)}</td>
                  <td className="px-3 py-2">{formatCurrency(r.ticket || 0)}</td>
                  <td className="px-3 py-2">{r.nro_factura || "-"}</td>
                </tr>
              ))}
              {!isLoading && (data?.rows.length ?? 0) === 0 && (
                <tr><td className="px-3 py-6 text-center opacity-60 text-qoder-dark-text-primary" colSpan={7}>Sin movimientos</td></tr>
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