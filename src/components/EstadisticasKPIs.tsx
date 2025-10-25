"use client";

import { StatCard } from "@/components/StatCard";

// Definir la interfaz para las estadísticas
interface EstadisticasKPIs {
  totalCitas: number;
  totalClientes: number;
  ticketPromedio: number;
  serviciosPopulares: Record<string, number>;
  clientesFrecuentes: Record<string, number>;
  ingresosTotales: number;
  citasPorDia: Record<string, number>;
  horasPico: Record<string, number>;
}

interface EstadisticasKPIsProps {
  estadisticas: EstadisticasKPIs | null;
}

export function EstadisticasKPIs({ estadisticas }: EstadisticasKPIsProps) {
  if (!estadisticas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="qoder-dark-card h-32 animate-pulse bg-qoder-dark-bg-secondary" />
        ))}
      </div>
    );
  }

  // Calcular porcentaje de cambio para algunos KPIs (simulado)
  const calcularPorcentajeCambio = (actual: number, anterior: number) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  // Extraer los datos necesarios de las estadísticas
  const totalCitas = estadisticas.totalCitas || 0;
  const totalClientes = estadisticas.totalClientes || 0;
  const ticketPromedio = estadisticas.ticketPromedio || 0;
  const serviciosPopulares = estadisticas.serviciosPopulares || {};
  const clientesFrecuentes = estadisticas.clientesFrecuentes || {};
  const ingresosTotales = estadisticas.ingresosTotales || 0;
  const citasPorDia = estadisticas.citasPorDia || {};
  const horasPico = estadisticas.horasPico || {};

  // Valores simulados para comparación (en una implementación real, vendrían de datos históricos)
  const ingresosAnteriores = ingresosTotales * 0.85;
  const ticketAnterior = ticketPromedio * 0.9;

  const porcentajeIngresos = calcularPorcentajeCambio(ingresosTotales, ingresosAnteriores);
  const porcentajeTicket = calcularPorcentajeCambio(ticketPromedio, ticketAnterior);

  // Encontrar el servicio más popular
  let servicioMasPopular = "N/A";
  let maxServicioCount = 0;
  for (const [servicio, count] of Object.entries(serviciosPopulares)) {
    if (count > maxServicioCount) {
      maxServicioCount = count;
      servicioMasPopular = servicio;
    }
  }

  // Encontrar el cliente más frecuente
  let clienteMasFrecuente = "N/A";
  let maxClienteCount = 0;
  for (const [cliente, count] of Object.entries(clientesFrecuentes)) {
    if (count > maxClienteCount) {
      maxClienteCount = count;
      clienteMasFrecuente = cliente;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total de Citas"
        value={totalCitas.toString()}
        description="Citas completadas"
      />
      
      <StatCard
        title="Clientes Únicos"
        value={totalClientes.toString()}
        description="Clientes atendidos"
      />
      
      <StatCard
        title="Ticket Promedio"
        value={`$${ticketPromedio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        description="Promedio por cita"
        trend={porcentajeTicket > 0 ? 'up' : 'down'}
        trendValue={`${Math.abs(porcentajeTicket).toFixed(1)}%`}
      />
      
      <StatCard
        title="Ingresos Totales"
        value={`$${ingresosTotales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        description="Ingresos generados"
        trend={porcentajeIngresos > 0 ? 'up' : 'down'}
        trendValue={`${Math.abs(porcentajeIngresos).toFixed(1)}%`}
      />
      
      <StatCard
        title="Servicio Popular"
        value={servicioMasPopular}
        description={`${maxServicioCount} veces solicitado`}
      />
      
      <StatCard
        title="Cliente Frecuente"
        value={clienteMasFrecuente}
        description={`${maxClienteCount} citas`}
      />
    </div>
  );
}