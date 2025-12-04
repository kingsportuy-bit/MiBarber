"use client";

import { Button } from "@/components/ui/Button";

interface ExportarEstadisticasBarberoProps {
  data: any; // En una implementación real, esto sería tipado correctamente
  filename: string;
}

export function ExportarEstadisticasBarbero({ data, filename }: ExportarEstadisticasBarberoProps) {
  const exportToCSV = () => {
    // Convertir los datos a formato CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Agregar encabezados y datos según la estructura de data
    // Esta es una implementación básica, en una implementación real se adaptaría
    // a la estructura específica de los datos
    
    csvContent += "Métrica,Valor\n";
    
    // Agregar datos simples
    if (data.ingresosGenerados !== undefined) {
      csvContent += `Ingresos Generados,$${data.ingresosGenerados.toFixed(2)}\n`;
    }
    
    if (data.turnosCompletados !== undefined) {
      csvContent += `Turnos Completados,${data.turnosCompletados}\n`;
    }
    
    if (data.ticketPromedio !== undefined) {
      csvContent += `Ticket Promedio,$${data.ticketPromedio.toFixed(2)}\n`;
    }
    
    if (data.tasaUtilizacion !== undefined) {
      csvContent += `Tasa de Utilización,${data.tasaUtilizacion.toFixed(2)}%\n`;
    }
    
    if (data.tasaRetencion !== undefined) {
      csvContent += `Tasa de Retención,${data.tasaRetencion.toFixed(2)}%\n`;
    }
    
    // Agregar servicios populares
    if (data.serviciosPopulares) {
      csvContent += "\nServicios Populares,\n";
      Object.entries(data.serviciosPopulares).forEach(([nombre, valor]) => {
        csvContent += `${nombre},${valor}\n`;
      });
    }
    
    // Crear y descargar el archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={exportToCSV}
        className="text-xs"
      >
        Exportar CSV
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={exportToJSON}
        className="text-xs"
      >
        Exportar JSON
      </Button>
    </div>
  );
}