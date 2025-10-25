"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";
import type { Appointment, CajaRecord, Client } from "@/types/db";

interface KPIsAvanzadosProps {
  citas: Appointment[];
  cajaRecords: CajaRecord[];
  clientes: Client[];
}

export function KPIsAvanzados({ citas, cajaRecords, clientes }: KPIsAvanzadosProps) {
  const kpis = useMemo(() => {
    // Ingresos totales (basados en la tabla mibarber_caja)
    const ingresosTotales = cajaRecords.reduce((sum, record) => sum + record.monto, 0);
    
    // Ingresos por barbero (ranking)
    const ingresosPorBarbero: Record<string, number> = {};
    cajaRecords.forEach(record => {
      // Encontrar la cita asociada para obtener el barbero
      const cita = citas.find(c => c.id_cita === record.id_cita);
      if (cita && cita.barbero) {
        ingresosPorBarbero[cita.barbero] = (ingresosPorBarbero[cita.barbero] || 0) + record.monto;
      }
    });
    
    // Top 5 clientes por facturación
    const gastoPorCliente: Record<string, number> = {};
    cajaRecords.forEach(record => {
      if (record.id_cliente) {
        gastoPorCliente[record.id_cliente] = (gastoPorCliente[record.id_cliente] || 0) + record.monto;
      }
    });
    
    const top5Clientes = Object.entries(gastoPorCliente)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id, monto]) => {
        const cliente = clientes.find(c => c.id_cliente === id);
        return {
          id,
          nombre: cliente ? cliente.nombre : id,
          monto
        };
      });
    
    // Duración promedio de citas
    let duracionTotal = 0;
    let citasConDuracion = 0;
    
    citas.forEach(cita => {
      if (cita.duracion) {
        // Convertir duración a minutos (ej: "30m" -> 30)
        const match = cita.duracion.match(/(\d+)m/);
        if (match) {
          duracionTotal += parseInt(match[1]);
          citasConDuracion++;
        }
      }
    });
    
    const duracionPromedio = citasConDuracion > 0 ? Math.round(duracionTotal / citasConDuracion) : 0;
    
    // Tasa de cancelación de citas (canceladas vs totales)
    const totalCitas = citas.length;
    const citasCanceladas = citas.filter(cita => cita.estado === "cancelado").length;
    const tasaCancelacion = totalCitas > 0 ? Math.round((citasCanceladas / totalCitas) * 10000) / 100 : 0;
    
    // Ticket promedio (ya existente)
    let sumaTicket = 0;
    let conTicket = 0;
    
    citas.forEach(cita => {
      if (cita.ticket != null) {
        sumaTicket += cita.ticket;
        conTicket++;
      }
    });
    
    const ticketPromedio = conTicket > 0 ? Math.round((sumaTicket / conTicket) * 100) / 100 : 0;
    
    return {
      ingresosTotales,
      ingresosPorBarbero,
      top5Clientes,
      duracionPromedio,
      tasaCancelacion,
      ticketPromedio
    };
  }, [citas, cajaRecords, clientes]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <Card title="Ingresos totales" value={formatCurrency(kpis.ingresosTotales)} />
      <Card title="Duración promedio" value={`${kpis.duracionPromedio} min`} />
      <Card title="Tasa cancelación" value={`${kpis.tasaCancelacion}%`} />
      <Card title="Ticket promedio" value={formatCurrency(kpis.ticketPromedio)} />
      <Card title="Citas totales" value={String(citas.length)} />
      <Card title="Clientes" value={String(clientes.length)} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="qoder-dark-card">
      <div className="text-xs text-qoder-dark-text-secondary">{title}</div>
      <div className="text-xl font-semibold text-qoder-dark-text-primary">{value}</div>
    </div>
  );
}