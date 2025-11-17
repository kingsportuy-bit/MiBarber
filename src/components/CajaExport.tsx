"use client";

import { formatCurrency } from "@/utils/formatters";
import type { CajaRecord } from "@/types/db";

interface CajaExportProps {
  records: CajaRecord[];
}

export function CajaExport({ records }: CajaExportProps) {
  const exportToCSV = () => {
    // Crear encabezados
    const headers = [
      "Fecha",
      "ID Cita",
      "ID Cliente",
      "Monto",
      "Número de Factura"
    ].join(",");

    // Crear filas de datos
    const rows = records.map(record => [
      `"${new Date(record.fecha).toLocaleDateString('es-UY')}"`,
      `"${record.id_cita}"`,
      `"${record.id_cliente}"`,
      `"${record.monto}"`,
      `""`
    ].join(","));

    // Combinar encabezados y filas
    const csvContent = [headers, ...rows].join("\n");

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `caja-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    
    // Verificar que el elemento aún esté en el DOM antes de intentar eliminarlo
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    
    // Limpiar URL
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToCSV}
      className="qoder-dark-button"
      disabled={records.length === 0}
    >
      Exportar a CSV
    </button>
  );
}