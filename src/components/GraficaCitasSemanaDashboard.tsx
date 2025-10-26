"use client";

import type { Appointment } from "@/types/db";
import { GraficaBarras } from "@/components/GraficaBarras";

interface GraficaCitasSemanaDashboardProps {
  citas: Appointment[];
}

export function GraficaCitasSemanaDashboard({ citas }: GraficaCitasSemanaDashboardProps) {
  // Agrupar citas por día de la semana
  const citasPorDia: Record<string, number> = {};
  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Inicializar todos los días con 0
  nombresDias.forEach(dia => {
    citasPorDia[dia] = 0;
  });
  
  // Contar citas por día
  citas.forEach(cita => {
    if (cita.fecha) {
      const fecha = new Date(cita.fecha);
      const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que 0 = Lunes
      const nombreDia = nombresDias[indiceDia];
      citasPorDia[nombreDia] = (citasPorDia[nombreDia] || 0) + 1;
    }
  });
  
  // Formatear datos para la gráfica
  const datosFormateados = nombresDias.map(dia => ({
    nombre: dia,
    valor: citasPorDia[dia] || 0
  }));

  return (
    <GraficaBarras 
      data={datosFormateados} 
      titulo="Citas de la Semana" 
      color="bg-qoder-dark-accent-primary"
    />
  );
}