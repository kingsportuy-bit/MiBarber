"use client";

import { useState } from "react";
import { usePDF } from "react-to-pdf";

interface ExportarEstadisticasProps {
  data: any;
  filename: string;
}

export function ExportarEstadisticas({ data, filename }: ExportarEstadisticasProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Configuración para la exportación a PDF
  const { toPDF, targetRef } = usePDF({
    filename: `${filename}.pdf`,
  });
  
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Convertir datos a CSV
      const csvContent = convertToCSV(data);
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar los datos");
    } finally {
      setIsExporting(false);
    }
  };
  
  const exportToPDF = () => {
    setIsExporting(true);
    // Iniciar la exportación a PDF
    toPDF();
    setIsExporting(false);
  };
  
  // Función auxiliar para convertir objeto a CSV
  const convertToCSV = (objArray: any) => {
    if (!objArray || objArray.length === 0) return "";
    
    // Si es un array de objetos
    if (Array.isArray(objArray)) {
      const headers = Object.keys(objArray[0]).join(',');
      const rows = objArray.map(obj => 
        Object.values(obj).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');
      
      return `${headers}\n${rows}`;
    }
    
    // Si es un objeto simple
    const headers = Object.keys(objArray).join(',');
    const values = Object.values(objArray).map(value => 
      `"${String(value).replace(/"/g, '""')}"`
    ).join(',');
    
    return `${headers}\n${values}`;
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        disabled={isExporting}
        className="qoder-dark-button-secondary px-3 py-2 rounded-lg text-sm flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
            Exportando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </>
        )}
      </button>
      
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="qoder-dark-button-secondary px-3 py-2 rounded-lg text-sm flex items-center gap-2"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
            Exportando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar PDF
          </>
        )}
      </button>
      
      {/* Elemento oculto para la exportación a PDF */}
      <div ref={targetRef} className="hidden">
        <h1>Reporte de Estadísticas - {filename}</h1>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}