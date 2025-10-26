"use client";

import { useMemo } from "react";
import { getLocalDateString } from "@/utils/dateUtils"; // Importar la utilidad de fecha
import type { Appointment } from "@/types/db";

interface QuickStatsProps {
  appointments: Appointment[];
  fecha?: string; // Agregar prop para filtrar por fecha específica
  barbero?: number; // Agregar prop para filtrar por barbero (ID numérico)
}

export function QuickStats({ appointments, fecha, barbero }: QuickStatsProps) {
  const stats = useMemo(() => {
    // Si se proporciona una fecha específica, filtrar por esa fecha
    // Si no, usar la fecha actual ajustada a la zona horaria de Uruguay
    const targetDate = fecha || getLocalDateString();
    
    // Filtrar citas por fecha y barbero si se proporciona
    let filteredAppointments = appointments.filter(a => a.fecha === targetDate);
    if (barbero) {
      // Convertir el ID numérico del barbero a string para comparar con el campo barbero de la cita
      filteredAppointments = filteredAppointments.filter(a => 
        parseInt(a.barbero || "0", 10) === barbero
      );
    }
    
    const pendientes = filteredAppointments.filter(a => a.estado === "pendiente").length;
    const confirmadas = filteredAppointments.filter(a => a.estado === "confirmado").length;
    const completadas = filteredAppointments.filter(a => a.estado === "completado").length;
    const canceladas = filteredAppointments.filter(a => a.estado === "cancelado").length;
    
    const hoy = filteredAppointments.length;
    
    const totalIngresos = filteredAppointments
      .filter(a => a.estado === "completado" && a.ticket)
      .reduce((sum, a) => sum + (a.ticket || 0), 0);
    
    return {
      pendientes,
      confirmadas,
      completadas,
      canceladas,
      hoy,
      totalIngresos,
      total: hoy
    };
  }, [appointments, fecha, barbero]);

  // Función para obtener el color según el tipo de estadística
  const getStatColor = (type: string) => {
    switch (type) {
      case 'pendientes': return 'text-qoder-dark-status-warning';
      case 'confirmadas': return 'text-qoder-dark-status-info';
      case 'completadas': return 'text-qoder-dark-status-success';
      case 'canceladas': return 'text-qoder-dark-status-error';
      case 'hoy': return 'text-qoder-dark-accent-primary';
      case 'ingresos': return 'text-qoder-dark-status-success';
      default: return 'text-qoder-dark-text-primary';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('pendientes')}`}>{stats.pendientes}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Pendientes</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('confirmadas')}`}>{stats.confirmadas}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Confirmadas</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('completadas')}`}>{stats.completadas}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Completadas</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('canceladas')}`}>{stats.canceladas}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Canceladas</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('hoy')}`}>{stats.hoy}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Hoy</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className={`text-2xl font-bold ${getStatColor('ingresos')} font-mono`}>${stats.totalIngresos}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Ingresos</span>
        </div>
      </div>
      
      <div className="qoder-dark-card text-center hover-lift smooth-transition transform hover:scale-105">
        <div className="text-2xl font-bold text-qoder-dark-text-primary">{stats.total}</div>
        <div className="text-xs text-qoder-dark-text-secondary">
          <span>Total</span>
        </div>
      </div>
    </div>
  );
}