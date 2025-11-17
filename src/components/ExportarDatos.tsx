"use client";

import { useState } from "react";

interface ExportarDatosProps {
  datos: any[];
  nombreArchivo: string;
  columnas?: { key: string; label: string }[];
}

export function ExportarDatos({ datos, nombreArchivo, columnas }: ExportarDatosProps) {
  const [exportando, setExportando] = useState(false);

  const exportarCSV = () => {
    setExportando(true);
    
    try {
      // Si no se especifican columnas, usar todas las keys del primer objeto
      let cols = columnas;
      if (!cols && datos.length > 0) {
        cols = Object.keys(datos[0]).map(key => ({ key, label: key }));
      }
      
      if (!cols || cols.length === 0) {
        throw new Error("No hay columnas para exportar");
      }
      
      // Crear encabezado
      const encabezado = cols.map(col => `"${col.label}"`).join(",");
      
      // Crear filas
      const filas = datos.map(item => {
        return cols!.map(col => {
          const valor = item[col.key];
          // Escapar comillas y envolver en comillas
          if (typeof valor === "string") {
            return `"${valor.replace(/"/g, '""')}"`;
          }
          return `"${valor}"`;
        }).join(",");
      });
      
      // Combinar todo
      const csv = [encabezado, ...filas].join("\n");
      
      // Crear y descargar archivo
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${nombreArchivo}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      
      // Verificar que el elemento aún esté en el DOM antes de intentar eliminarlo
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      
      // Limpiar URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando datos:", error);
      alert("Error al exportar datos");
    } finally {
      setExportando(false);
    }
  };

  return (
    <button
      onClick={exportarCSV}
      disabled={exportando || datos.length === 0}
      className={`qoder-dark-button ${exportando || datos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover-lift'}`}
    >
      {exportando ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2">↻</span>
          Exportando...
        </span>
      ) : (
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </span>
      )}
    </button>
  );
}