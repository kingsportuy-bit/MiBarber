"use client";

import { useState } from "react";
import { usePDF } from "react-to-pdf";
import type { BarberoEstadisticas } from "@/hooks/useEstadisticas";

interface ExportarEstadisticasBarberoProps {
  data: BarberoEstadisticas;
  filename: string;
}

export function ExportarEstadisticasBarbero({ data, filename }: ExportarEstadisticasBarberoProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Configuración para la exportación a PDF
  const { toPDF, targetRef } = usePDF({
    filename: `${filename}-completo.pdf`
  });
  
  const exportToPDF = () => {
    setIsExporting(true);
    // Iniciar la exportación a PDF
    toPDF();
    setIsExporting(false);
  };

  return (
    <div className="flex gap-2">
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
        <div className="p-8 bg-white text-black">
          <h1 className="text-2xl font-bold mb-6">Reporte de Estadísticas - {filename}</h1>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded">
                <h3 className="font-medium">Ingresos Generados</h3>
                <p className="text-2xl font-bold">${data.ingresosGenerados.toFixed(2)}</p>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium">Turnos Completados</h3>
                <p className="text-2xl font-bold">{data.turnosCompletados}</p>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium">Ticket Promedio</h3>
                <p className="text-2xl font-bold">${data.ticketPromedio.toFixed(2)}</p>
              </div>
              
              <div className="border p-4 rounded">
                <h3 className="font-medium">Tasa de Utilización</h3>
                <p className="text-2xl font-bold">{data.tasaUtilizacion}%</p>
              </div>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Servicios Populares</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Servicio</th>
                    <th className="text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.serviciosPopulares).map(([nombre, cantidad], index) => (
                    <tr key={index}>
                      <td>{nombre}</td>
                      <td className="text-right">{cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Horarios Pico</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Hora</th>
                    <th className="text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.horariosPico).map(([hora, cantidad], index) => (
                    <tr key={index}>
                      <td>{hora}</td>
                      <td className="text-right">{cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-2">Tasa de Retención</h3>
              <p className="text-2xl font-bold">{data.tasaRetencion}%</p>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Reporte generado el {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}